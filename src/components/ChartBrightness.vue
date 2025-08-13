<template>
  <div class="chart-wrap" ref="wrap"
       @mousemove="onMouseMove" @mouseleave="onMouseLeave"
       @touchmove.prevent="onTouchMove" @touchend="onMouseLeave">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

type Channel = { name: string; color: string }
type Schedule = { enabled: boolean; from: string; brightness: number[] }

const props = defineProps<{
  channels: Channel[]
  schedules: Schedule[]
  height?: number
  background?: string
  showNow?: boolean
  leftGutter?: number
  hover?: boolean
  hoverTolerance?: number // для сортировки по близости (визуально)
}>()

const wrap = ref<HTMLDivElement|null>(null)
const canvas = ref<HTMLCanvasElement|null>(null)

const dpi = window.devicePixelRatio || 1
const basePad = 20
const gridX = 6
const gridY = 4

const cssH = computed(() => props.height ?? 300)
const bg   = computed(() => props.background ?? '#16213e')
const showNow = computed(() => props.showNow !== false)
const leftGutter = computed(() => Math.max(44, props.leftGutter ?? 48))
const hoverEnabled = computed(() => props.hover !== false)

let ro: ResizeObserver | null = null
let raf = 0, rafWatch = 0, stopTicks = false
let lastW = 0, lastH = 0

const hoverOn = ref(false)
const hoverT  = ref(12)     // время в часах (0..24)
const hoverY  = ref(0)      // y курсора (css px)

// ==== helpers ====
function clamp(x:number,a:number,b:number){ return Math.max(a, Math.min(b, x)) }
function parseHM(hm:string){ const [h,m]=hm.split(':').map(Number); return (h||0)+ (m||0)/60 }

function buildPointsFromSchedules(schedules: Schedule[], channelsCount: number){
  const enabled = (schedules||[]).filter(s=>s && s.enabled)
      .slice().sort((a,b)=>parseHM(a.from)-parseHM(b.from))
  if (enabled.length===0){
    return Array.from({length:channelsCount}, ()=>[
      {t:0,b:0},{t:24,b:0}
    ])
  }
  const first = enabled[0], last = enabled[enabled.length-1]
  const pts: {t:number;b:number}[][] = Array.from({length:channelsCount},()=>[])
  for(let ch=0; ch<channelsCount; ch++){
    pts[ch].push({t:0,  b: clamp((last.brightness?.[ch] ?? 0)|0, 0,100)})
    for(const s of enabled){
      pts[ch].push({t:parseHM(s.from), b: clamp((s.brightness?.[ch] ?? 0)|0, 0,100)})
    }
    pts[ch].push({t:24, b: clamp((first.brightness?.[ch] ?? 0)|0, 0,100)})

    // dedup t
    const uniq: {t:number;b:number}[] = []
    let prevT = -1
    for(const p of pts[ch]){
      if (p.t !== prevT) uniq.push(p)
      else uniq[uniq.length-1] = p
      prevT = p.t
    }
    pts[ch]=uniq
  }
  return pts
}

function sampleChannel(points:{t:number;b:number}[], t:number){
  if (points.length===0) return 0
  if (t<=points[0].t) return points[0].b
  if (t>=points[points.length-1].t) return points[points.length-1].b
  for(let i=1;i<points.length;i++){
    const a=points[i-1], c=points[i]
    if (t<=c.t){
      const k=(t-a.t)/(c.t-a.t)
      return Math.round(a.b + (c.b-a.b)*k)
    }
  }
  return points[points.length-1].b
}

function curveTo(ctx:CanvasRenderingContext2D, pts:{x:number;y:number}[]){
  if (pts.length<2) return
  ctx.moveTo(pts[0].x, pts[0].y)
  if (pts.length===2){ ctx.lineTo(pts[1].x, pts[1].y); return }
  for(let i=0;i<pts.length-1;i++){
    const p0 = pts[i-1]||pts[i]
    const p1 = pts[i]
    const p2 = pts[i+1]
    const p3 = pts[i+2]||p2
    const c1x = p1.x + (p2.x - p0.x)/6
    const c1y = p1.y + (p2.y - p0.y)/6
    const c2x = p2.x - (p3.x - p1.x)/6
    const c2y = p2.y - (p3.y - p1.y)/6
    ctx.bezierCurveTo(c1x,c1y,c2x,c2y,p2.x,p2.y)
  }
}

// размеры и рисование
function drawCanvas(){
  const cvs = canvas.value, host = wrap.value ?? canvas.value
  if (!cvs || !host) return
  const ctx = cvs.getContext('2d'); if(!ctx) return

  const hostRect = host.getBoundingClientRect()
  const Wcss = Math.max(1, Math.round(hostRect.width))
  const Hcss = cssH.value
  const W = Math.round(Wcss*dpi), H=Math.round(Hcss*dpi)
  cvs.width=W; cvs.height=H
  cvs.style.width=Wcss+'px'; cvs.style.height=Hcss+'px'

  const L = (basePad - 20 + leftGutter.value)*dpi
  const T = basePad*dpi
  const R = W - basePad*dpi
  const B = H - basePad*dpi
  const innerW = Math.max(1, R-L)
  const innerH = Math.max(1, B-T)

  // фон
  ctx.clearRect(0,0,W,H)
  ctx.fillStyle = bg.value
  ctx.fillRect(0,0,W,H)

  // сетка
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1*dpi
  for(let i=0;i<=gridY;i++){
    const y = T + (innerH/gridY)*i
    ctx.beginPath(); ctx.moveTo(L,y); ctx.lineTo(R,y); ctx.stroke()
  }
  for(let i=0;i<=gridX;i++){
    const x = L + (innerW/gridX)*i
    ctx.beginPath(); ctx.moveTo(x,T); ctx.lineTo(x,B); ctx.stroke()
  }

  // подписи
  ctx.fillStyle='rgba(255,255,255,0.9)'
  ctx.font = `${12*dpi}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
  ctx.textAlign='center'; ctx.textBaseline='top'
  for(let i=0;i<=gridX;i++){
    const hr = String(i*4).padStart(2,'0')
    const x = L + (innerW/gridX)*i
    ctx.fillText(`${hr}:00`, x, B+6*dpi)
  }
  ctx.textAlign='right'; ctx.textBaseline='middle'
  for(let i=0;i<=gridY;i++){
    const y = T + (innerH/gridY)*i
    const val = 100 - i*25
    ctx.fillText(val+'%', L-6*dpi, y)
  }

  // вертикаль «сейчас»
  if (showNow.value){
    const now=new Date()
    const t= now.getHours()+now.getMinutes()/60
    const x = L + innerW*(t/24)
    ctx.strokeStyle='#ff6b6b'
    ctx.lineWidth=2*dpi
    ctx.setLineDash([4*dpi,4*dpi])
    ctx.beginPath(); ctx.moveTo(x,T); ctx.lineTo(x,B); ctx.stroke()
    ctx.setLineDash([])
  }

  // данные
  const channelsCount = props.channels.length
  const perChannel = buildPointsFromSchedules(props.schedules||[], channelsCount)
  const samples = 240
  for(let ch=0; ch<channelsCount; ch++){
    const pts:{x:number;y:number}[] = []
    for(let i=0;i<=samples;i++){
      const t = (i/samples)*24
      const b = sampleChannel(perChannel[ch], t)
      const x = L + innerW*(t/24)
      const y = T + innerH*(1 - b/100)
      pts.push({x,y})
    }
    ctx.lineWidth = 2*dpi
    ctx.strokeStyle = props.channels[ch].color
    ctx.beginPath(); curveTo(ctx, pts); ctx.stroke()

    // ключевые узлы
    for(const p of perChannel[ch]){
      const x = L + innerW*(p.t/24)
      const y = T + innerH*(1 - p.b/100)
      ctx.fillStyle = props.channels[ch].color
      ctx.beginPath(); ctx.arc(x,y,2.5*dpi,0,Math.PI*2); ctx.fill()
    }
  }

  // HOVER на canvas
  if (hoverEnabled.value && hoverOn.value){
    const t = clamp(hoverT.value, 0, 24)
    const hx = L + innerW*(t/24)

    // вертикальная линия
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.lineWidth = 2*dpi
    ctx.setLineDash([])
    ctx.beginPath(); ctx.moveTo(hx,T); ctx.lineTo(hx,B); ctx.stroke()

    // значения каналов в этом времени
    const values = perChannel.map(chPts => sampleChannel(chPts, t))
    const ys = values.map(v => T + innerH*(1 - v/100))

    // отсортировать по близости к курсору (визуально приятнее)
    const tol = Math.max(4, (props.hoverTolerance ?? 12))*dpi
    const hy = clamp(hoverY.value*dpi, T, B)
    const hits = values.map((v, i)=>({i, name: props.channels[i].name, v, d: Math.abs(ys[i]-hy)}))
        .sort((a,b)=>a.d-b.d)

    // маркеры на линиях
    for(const h of hits){
      ctx.fillStyle = props.channels[h.i].color
      ctx.beginPath(); ctx.arc(hx, ys[h.i], 3*dpi, 0, Math.PI*2); ctx.fill()
    }

    // тултип simple rect
    ctx.font = `${12*dpi}px system-ui, -apple-system, Segoe UI, Roboto, Arial`
    ctx.textAlign='left'; ctx.textBaseline='top'
    const timeH = Math.floor(t), timeM = Math.round((t-timeH)*60)
    const timeTxt = `${String(timeH).padStart(2,'0')}:${String(timeM).padStart(2,'0')}`
    const lines = [`Time  ${timeTxt}`, ...hits.map(h=>`${h.name}: ${h.v}%`)]
    let tw = 0
    for(const ln of lines) tw = Math.max(tw, ctx.measureText(ln).width)
    const pad = 8*dpi
    const boxW = Math.max(140*dpi, tw + pad*2)
    const lineH = 16*dpi
    const boxH = lineH*lines.length + pad

    let bx = hx + 10*dpi
    if (bx + boxW > R) bx = hx - 10*dpi - boxW
    let by = ys[hits[0].i] - boxH/2
    if (by < T) by = T + 6*dpi
    if (by + boxH > B) by = B - boxH - 6*dpi

    ctx.fillStyle = 'rgba(20,20,30,0.95)'
    ctx.fillRect(bx, by, boxW, boxH)
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1*dpi
    ctx.strokeRect(bx, by, boxW, boxH)
    ctx.fillStyle = '#fff'
    let ty = by + pad/2
    for(const ln of lines){ ctx.fillText(ln, bx + pad, ty); ty += lineH }
  }
}

// события
function updateHover(clientX:number, clientY:number){
  if (!hoverEnabled.value || !wrap.value) return
  const host = wrap.value
  const rc = host.getBoundingClientRect()
  const Wcss = Math.max(1, Math.round(rc.width))
  const Hcss = cssH.value
  const Lcss = basePad + leftGutter.value
  const Tcss = basePad
  const Rcss = Wcss - basePad
  const Bcss = Hcss - basePad
  const innerWcss = Math.max(1, Rcss - Lcss)

  const xCss = clamp(clientX - rc.left, 0, Wcss)
  const yCss = clamp(clientY - rc.top,  0, Hcss)

  const hxCss = clamp(xCss, Lcss, Rcss)
  const t = ((hxCss - Lcss)/innerWcss)*24

  hoverT.value = t
  hoverY.value = yCss
  hoverOn.value = true
  requestDraw()
}
function onMouseMove(e:MouseEvent){ updateHover(e.clientX, e.clientY) }
function onTouchMove(e:TouchEvent){ const t = e.touches[0]; if(t) updateHover(t.clientX, t.clientY) }
function onMouseLeave(){ hoverOn.value = false; requestDraw() }

// RAF/resize
function requestDraw(){ if(!raf) raf = requestAnimationFrame(()=>{ raf=0; drawCanvas() }) }
function currentCssSize(el: HTMLElement | null) {
  if (!el) return { w: 0, h: 0 }
  const r = el.getBoundingClientRect()
  return { w: Math.round(r.width), h: Math.round(r.height) }
}

function startRafWatcher(){
  const host = wrap.value; if(!host) return
  const tick = () => {
    if (stopTicks) return
    const {w,h} = currentCssSize(host)
    if (w!==lastW || h!==lastH){ lastW=w; lastH=h; requestDraw() }
    rafWatch = requestAnimationFrame(tick)
  }
  rafWatch = requestAnimationFrame(tick)
}

onMounted(async ()=>{
  await nextTick()

  const ensureHost = (): HTMLElement | null => {
    return wrap.value ?? canvas.value ?? null
  }

  const boot = () => {
    const host = ensureHost()
    if (!host) {                // реф ещё не прикрепился → подождём кадр
      requestAnimationFrame(boot)
      return
    }

    // стартовые размеры
    const { w, h } = currentCssSize(host)
    lastW = w; lastH = h

    // ResizeObserver – только если есть host
    ro = new ResizeObserver(() => {
      const { w, h } = currentCssSize(host)
      if (w !== lastW || h !== lastH) { lastW = w; lastH = h; requestDraw() }
    })
    ro.observe(host)

    // подстрахуемся: наблюдать ближайшие контейнеры, если есть
    const maybe = (sel: string) => (host.closest(sel) as HTMLElement | null)
    for (const sel of ['.v-col', '.v-row', '.v-card', '.v-container']) {
      const n = maybe(sel)
      if (n) ro.observe(n)
    }

    window.addEventListener('resize', requestDraw)
    window.addEventListener('orientationchange', requestDraw)

    startRafWatcher()  // если у тебя была функция с RAF-пулсом
    drawCanvas()

    // «сейчас» раз в минуту (если осталось в коде — второй раз не добавляй)
    if (showNow.value) setInterval(() => requestDraw(), 60_000)
    const tick = () => {
      if (stopTicks) return
      if (showNow.value) requestDraw()
      setTimeout(tick, 60_000)
    }
    tick()
  }

  boot()
})

onBeforeUnmount(()=>{
  stopTicks = true
  if (ro) ro.disconnect()
  if (raf) cancelAnimationFrame(raf)
  if (rafWatch) cancelAnimationFrame(rafWatch)
  window.removeEventListener('resize', requestDraw)
  window.removeEventListener('orientationchange', requestDraw)
})

watch(()=>[props.schedules, props.channels, cssH.value, bg.value, showNow.value, leftGutter.value],
    ()=>requestDraw(), {deep:true})
</script>

<style scoped>
.chart-wrap{
  position: relative;
  width: 100%;
  height: v-bind('cssH + 20 + "px"'); /* + место под подписи */
  user-select: none;
  -webkit-user-select: none;
}
canvas{
  width: 100%;
  height: v-bind('cssH + "px"');
  display: block;
  background: transparent;
  border-radius: 8px;
  cursor: crosshair;
}
</style>
