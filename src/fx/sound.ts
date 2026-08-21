import { useAppStore } from '../store/useAppStore'

let ctx: AudioContext | null = null

const audio = (): AudioContext | null => {
  if (!useAppStore.getState().settings.sound) return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const tone = (
  ac: AudioContext,
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
) => {
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, ac.currentTime + start)
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.015)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur)
  osc.connect(g).connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + dur + 0.05)
}

export const sfx = {
  pop() {
    const ac = audio()
    if (!ac) return
    tone(ac, 520, 0, 0.12, 'triangle', 0.15)
    tone(ac, 780, 0.05, 0.15, 'triangle', 0.12)
  },
  skip() {
    const ac = audio()
    if (!ac) return
    tone(ac, 300, 0, 0.15, 'sawtooth', 0.06)
    tone(ac, 220, 0.08, 0.2, 'sawtooth', 0.05)
  },
  drop() {
    const ac = audio()
    if (!ac) return
    tone(ac, 900, 0, 0.08, 'sine', 0.1)
    tone(ac, 1300, 0.04, 0.1, 'sine', 0.08)
  },
  badge() {
    const ac = audio()
    if (!ac) return
    ;[660, 880, 1100].forEach((f, i) => tone(ac, f, i * 0.09, 0.18, 'triangle', 0.11))
  },
  levelUp() {
    const ac = audio()
    if (!ac) return
    ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(ac, f, i * 0.11, 0.3, 'triangle', 0.12))
  },
}
