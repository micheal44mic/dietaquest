export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  life: number
  ttl: number
  r: number
  g: number
  b: number
  gravity: number
  drag: number
}

export const FLOATS_PER_PARTICLE = 8
export const MAX_PARTICLES = 4096

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export const PALETTES = {
  leaf: ['#58cc02', '#8ee000', '#ffc800', '#ffffff'],
  sky: ['#1cb0f6', '#84d8ff', '#ffffff', '#ce82ff'],
  tang: ['#ff9600', '#ffc800', '#ff4b4b', '#ffffff'],
  party: ['#58cc02', '#1cb0f6', '#ff9600', '#ce82ff', '#ffc800', '#ff4b4b'],
} as const

export type PaletteName = keyof typeof PALETTES

export class ParticleSim {
  particles: Particle[] = []
  private ambientTimer = 0

  burst(x: number, y: number, palette: PaletteName, count = 26, power = 1) {
    const colors = PALETTES[palette]
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break
      const angle = Math.random() * Math.PI * 2
      const speed = (90 + Math.random() * 260) * power
      const [r, g, b] = hexToRgb(colors[Math.floor(Math.random() * colors.length)])
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80 * power,
        size: 3 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 6,
        life: 0,
        ttl: 0.7 + Math.random() * 0.7,
        r,
        g,
        b,
        gravity: 350,
        drag: 0.99,
      })
    }
  }

  /** Anello che si espande: usato per il level-up */
  ring(x: number, y: number, palette: PaletteName, count = 40) {
    const colors = PALETTES[palette]
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= MAX_PARTICLES) break
      const angle = (i / count) * Math.PI * 2
      const speed = 260 + Math.random() * 60
      const [r, g, b] = hexToRgb(colors[i % colors.length])
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        rot: 0,
        vr: 0,
        life: 0,
        ttl: 0.9,
        r,
        g,
        b,
        gravity: 40,
        drag: 0.96,
      })
    }
  }

  fireworks(w: number, h: number) {
    for (let i = 0; i < 5; i++) {
      const x = w * (0.15 + Math.random() * 0.7)
      const y = h * (0.15 + Math.random() * 0.4)
      setTimeout(() => this.burst(x, y, 'party', 34, 1.2), i * 220)
    }
  }

  /** Scintille ambientali che salgono dolcemente dal fondo */
  ambient(dt: number, w: number, h: number) {
    this.ambientTimer -= dt
    if (this.ambientTimer <= 0 && this.particles.length < MAX_PARTICLES - 10) {
      this.ambientTimer = 0.55 + Math.random() * 0.6
      const golden = Math.random() < 0.6
      this.particles.push({
        x: Math.random() * w,
        y: h + 10,
        vx: (Math.random() - 0.5) * 12,
        vy: -(18 + Math.random() * 30),
        size: 1.5 + Math.random() * 2.5,
        rot: 0,
        vr: 0,
        life: 0,
        ttl: 6 + Math.random() * 4,
        r: golden ? 1 : 0.65,
        g: golden ? 0.85 : 0.85,
        b: golden ? 0.3 : 1,
        gravity: 0,
        drag: 1,
      })
    }
  }

  update(dt: number) {
    const next: Particle[] = []
    for (const p of this.particles) {
      p.life += dt
      if (p.life >= p.ttl) continue
      p.vy += p.gravity * dt
      p.vx *= p.drag
      p.vy *= p.drag
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt
      next.push(p)
    }
    this.particles = next
  }

  /** Scrive i dati istanza nel buffer: ritorna il numero di particelle */
  writeTo(out: Float32Array): number {
    const count = Math.min(this.particles.length, MAX_PARTICLES)
    for (let i = 0; i < count; i++) {
      const p = this.particles[i]
      const t = p.life / p.ttl
      // Fade-in veloce, fade-out morbido
      const alpha = Math.min(1, t * 8) * (1 - t * t)
      const o = i * FLOATS_PER_PARTICLE
      out[o] = p.x
      out[o + 1] = p.y
      out[o + 2] = p.size
      out[o + 3] = p.rot
      out[o + 4] = p.r
      out[o + 5] = p.g
      out[o + 6] = p.b
      out[o + 7] = alpha
    }
    return count
  }
}
