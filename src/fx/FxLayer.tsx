import { useEffect, useRef } from 'react'
import { FLOATS_PER_PARTICLE, MAX_PARTICLES, ParticleSim, type PaletteName } from './particles'
import { createGpuFx, type GpuFx } from './webgpu'

const sim = new ParticleSim()
let viewport = { w: 0, h: 0 }

/**
 * Bus degli effetti: qualsiasi componente può lanciare particelle
 * senza passare per props o context. Coordinate in pixel CSS.
 */
export const fx = {
  burst(x: number, y: number, palette: PaletteName = 'leaf', count = 26, power = 1) {
    sim.burst(x, y, palette, count, power)
  },
  burstFromElement(el: Element, palette: PaletteName = 'leaf', count = 26, power = 1) {
    const r = el.getBoundingClientRect()
    sim.burst(r.left + r.width / 2, r.top + r.height / 2, palette, count, power)
  },
  ring(x: number, y: number, palette: PaletteName = 'party') {
    sim.ring(x, y, palette)
  },
  fireworks() {
    sim.fireworks(viewport.w || window.innerWidth, viewport.h || window.innerHeight)
  },
  levelUp() {
    const w = viewport.w || window.innerWidth
    const h = viewport.h || window.innerHeight
    sim.ring(w / 2, h / 2, 'party')
    sim.fireworks(w, h)
  },
}

/** Canvas WebGPU a schermo intero, sopra la UI, trasparente ai tocchi. */
export function FxLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let gpu: GpuFx | null = null
    let raf = 0
    let last = performance.now()
    let alive = true
    const data = new Float32Array(MAX_PARTICLES * FLOATS_PER_PARTICLE)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      viewport = { w: window.innerWidth, h: window.innerHeight }
      canvas.width = Math.max(1, Math.round(viewport.w * dpr))
      canvas.height = Math.max(1, Math.round(viewport.h * dpr))
    }
    resize()
    window.addEventListener('resize', resize)

    // Ricreare il device a ogni fotogramma brucerebbe batteria e memoria:
    // si riprova poche volte, e solo con l'app davvero in primo piano.
    const MAX_RETRY = 5
    let retries = 0
    let pendingRestart = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (gpu?.lost) {
        // iOS ha reclamato il processo GPU mentre l'app era in background
        gpu = null
        scheduleRestart()
        return // niente rAF: riparte solo dopo un tentativo riuscito
      }

      sim.ambient(dt, viewport.w, viewport.h)
      sim.update(dt)
      const count = sim.writeTo(data)
      gpu?.render(data, count, viewport.w, viewport.h)
      raf = requestAnimationFrame(frame)
    }

    const scheduleRestart = () => {
      if (!alive || pendingRestart || retries >= MAX_RETRY) return
      pendingRestart = true
      timer = setTimeout(() => {
        pendingRestart = false
        if (!alive) return
        // In background il device tornerebbe subito perso: si aspetta il rientro
        if (document.visibilityState !== 'visible') return
        retries += 1
        void start()
      }, 700)
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible' && alive && !gpu) scheduleRestart()
    }
    document.addEventListener('visibilitychange', onVisible)

    const start = async () => {
      const created = await createGpuFx(canvas)
      if (!alive) {
        created?.destroy()
        return
      }
      gpu = created
      if (!gpu) return // Niente WebGPU: l'app funziona, senza effetti
      retries = 0
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    void start()

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      clearTimeout(timer)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisible)
      gpu?.destroy()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
      aria-hidden
    />
  )
}
