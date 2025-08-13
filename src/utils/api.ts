import { computed, toRaw } from 'vue'

export const apiBaseUrl = computed(() => {
  return 'http://192.168.1.167'
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location
    const std = (protocol === 'http:'  && port === '80') ||
      (protocol === 'https:' && port === '443') || !port
    return std ? `${protocol}//${hostname}` : `${protocol}//${hostname}:${port}`
  }
  return 'http://192.168.4.1'
})

type JsonLike = Record<string, unknown> | unknown[] | null

function composeSignal(timeoutMs: number, external?: AbortSignal) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  if (external) {
    external.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

export const makeApiCall = async <T = JsonLike>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number; expectJson?: boolean } = {}
): Promise<T> => {
  const baseUrl = apiBaseUrl.value
  const url = `${baseUrl}${endpoint}`

  const { timeoutMs = 30_000, expectJson = true, signal: extSignal, headers, ...rest } = options
  const { signal, clear } = composeSignal(timeoutMs, extSignal as AbortSignal | undefined)

  try {
    const response = await fetch(url, {
      signal,
      headers: { 'Content-Type': 'application/json', ...headers },
      ...rest,
    })
    clear()

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`)
    }

    if (!expectJson) return undefined as unknown as T

    // есть ли что-то и это JSON?
    const ct = response.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
      // может быть пустой ответ
      const text = await response.text()
      return (text ? (JSON.parse(text) as T) : (undefined as unknown as T))
    }
    return (await response.json()) as T
  } catch (e) {
    clear()
    console.error('API call failed:', e)
    throw e
  }
}

export const deepClone = <T>(x: T): T =>
  (globalThis as any).structuredClone
    ? structuredClone(toRaw(x))
    : JSON.parse(JSON.stringify(toRaw(x)))
