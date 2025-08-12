// composables/useResourceLoader.ts
import { ref, computed } from 'vue'
import { makeApiCall, deepClone } from '@/utils/api'

const deepEqual = (a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)

type Initial<T> = T | (() => T)

export function useResourceLoader<S = any, T = S, P = T>(opts: {
  getUrl: string
  initial: Initial<T>,
  postUrl?: string
  ttlMs?: number
  mapIn?: (server:S)=>T
  mapOut?: (current:T, snapshot:T)=>P
  selectDirty?: (v:T)=>unknown
  saveFn?: (payload:P)=>Promise<void>
}) {
  const { getUrl, postUrl = getUrl, ttlMs, mapIn, mapOut, selectDirty, saveFn, initial } = opts

  const makeInitial = (): T => deepClone(typeof initial === 'function' ? (initial as any)() : initial)

  const data   = ref<T>(makeInitial())
  const snap   = ref<T | null>(data.value ? deepClone(data.value) : null)
  const loading = ref(false)
  const loaded  = ref(false)
  const error   = ref<unknown>(null)
  const lastLoadedAt = ref<number | null>(null)

  let inflight: Promise<void> | null = null
  let abortCtl: AbortController | null = null

  const isDirty = computed(() => {
    if (!data.value || !snap.value) return false
    const A = selectDirty ? selectDirty(data.value) : data.value
    const B = selectDirty ? selectDirty(snap.value) : snap.value
    return !deepEqual(A, B)
  })

  const isStale = computed(() => !!ttlMs && !!lastLoadedAt.value && (Date.now() - lastLoadedAt.value > ttlMs))

  async function load(force = false) {
    if (loaded.value && !force && !isStale.value) return
    if (inflight) return inflight

    loading.value = true
    error.value = null
    abortCtl?.abort()
    abortCtl = new AbortController()

    inflight = (async () => {
      try {
        const raw = await makeApiCall<S>(getUrl, { signal: abortCtl!.signal })
        const mapped = mapIn ? mapIn(raw) : (raw as unknown as T)
        data.value = deepClone(mapped)
        snap.value = deepClone(mapped)
        loaded.value = true
        lastLoadedAt.value = Date.now()
      } catch (e:any) {
        if (e?.name !== 'AbortError') error.value = e
      } finally {
        loading.value = false
        inflight = null
      }
    })()
    return inflight
  }

  async function save() {
    if (!data.value || !snap.value) return
    const current  = deepClone(data.value)
    const snapshot = deepClone(snap.value)
    const payload  = mapOut ? mapOut(current, snapshot) : (current as unknown as P)

    if (saveFn) {
      await saveFn(payload)
    } else {
      await makeApiCall(postUrl, { method: 'POST', body: JSON.stringify(payload), expectJson: false })
    }
    snap.value = deepClone(current)
    lastLoadedAt.value = Date.now()
  }

  function resetToSnapshot() {
    if (snap.value) data.value = deepClone(snap.value)
  }

  function accept(newData: T) {
    data.value = deepClone(newData)
    snap.value = deepClone(newData)
    loaded.value = true
    lastLoadedAt.value = Date.now()
  }

  return { data, snap, loading, loaded, error, lastLoadedAt, isDirty, isStale, load, save, resetToSnapshot, accept }
}
