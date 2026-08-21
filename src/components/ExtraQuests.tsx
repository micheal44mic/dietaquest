import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Cardio } from '../types'
import { XP } from '../game/derive'
import { thousands } from '../lib/format'
import { fx } from '../fx/FxLayer'
import { sfx } from '../fx/sound'

export function WaterTracker({ date }: { date: string }) {
  const water = useAppStore((s) => s.logs[date]?.water ?? 0)
  const goal = useAppStore((s) => s.settings.waterGoal)
  const setWater = useAppStore((s) => s.setWater)

  const tap = (i: number, e: React.MouseEvent) => {
    if (i < water) {
      setWater(date, i)
    } else {
      setWater(date, i + 1)
      sfx.drop()
      fx.burstFromElement(e.currentTarget as Element, 'sky', 10, 0.5)
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold">💧 Acqua</h3>
        <span className="rounded-full bg-sky-soft px-2 py-0.5 text-xs font-extrabold text-sky-dark">
          {water}/{goal} · +{XP.waterGlass} XP a bicchiere
        </span>
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {Array.from({ length: goal }, (_, i) => (
          <motion.button
            key={i}
            onClick={(e) => tap(i, e)}
            whileTap={{ scale: 0.8 }}
            animate={i < water ? { scale: [1, 1.25, 1] } : {}}
            className="flex-1 py-1 text-2xl"
            style={{ filter: i < water ? 'none' : 'grayscale(1) opacity(0.35)' }}
          >
            💧
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export function StepsCard({ date, goal }: { date: string; goal: number }) {
  const steps = useAppStore((s) => s.logs[date]?.steps ?? null)
  const setSteps = useAppStore((s) => s.setSteps)
  const [draft, setDraft] = useState('')

  const reached = steps !== null && steps >= goal
  const pct = Math.min(100, ((steps ?? 0) / goal) * 100)

  const save = () => {
    const n = parseInt(draft, 10)
    if (Number.isNaN(n)) return
    const wasReached = reached
    setSteps(date, n)
    setDraft('')
    if (n >= goal && !wasReached) {
      sfx.badge()
      fx.fireworks()
    }
  }

  return (
    <div className={`card p-4 ${reached ? 'border-grape! bg-grape-soft!' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold">👟 Passi</h3>
        <span className="rounded-full bg-grape-soft px-2 py-0.5 text-xs font-extrabold text-grape-dark">
          obiettivo {thousands(goal)} · +{XP.stepsGoal} XP
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-grape-soft">
          <motion.div className="h-full rounded-full bg-grape" initial={false} animate={{ width: `${pct}%` }} />
        </div>
        <span className="w-16 text-right text-sm font-extrabold text-grape-dark">
          {steps === null ? '—' : thousands(steps)}
        </span>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Quanti passi oggi?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border-2 border-line bg-cream px-3 py-2 font-bold outline-none focus:border-grape"
        />
        <button
          onClick={save}
          className="btn3d rounded-xl bg-grape px-4 text-sm font-extrabold text-white [--btn-shadow:var(--color-grape-dark)]"
        >
          OK
        </button>
      </div>
    </div>
  )
}

export function WeightCard({ date }: { date: string }) {
  const weight = useAppStore((s) => s.body[date]?.weight)
  const setBody = useAppStore((s) => s.setBody)
  const [draft, setDraft] = useState('')

  const save = (e: React.MouseEvent<HTMLButtonElement>) => {
    const n = parseFloat(draft.replace(',', '.'))
    if (Number.isNaN(n) || n <= 0) return
    setBody(date, { weight: Math.round(n * 10) / 10 })
    setDraft('')
    sfx.pop()
    fx.burstFromElement(e.currentTarget, 'sky', 20)
  }

  return (
    <div className={`card p-4 ${weight !== undefined ? 'border-sky! bg-sky-soft!' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold">⚖️ Peso di stamattina</h3>
        <span className="rounded-full bg-sky-soft px-2 py-0.5 text-xs font-extrabold text-sky-dark">
          +{XP.weightLog} XP
        </span>
      </div>
      {weight !== undefined ? (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-extrabold text-sky-dark">{weight} kg</span>
          <button
            onClick={() => setBody(date, { weight: undefined })}
            className="text-xs font-extrabold text-mute underline"
          >
            correggi
          </button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          {/* type="text": su iOS un input number scarta il valore se scrivi la virgola */}
          <input
            type="text"
            inputMode="decimal"
            placeholder="es. 78,5"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border-2 border-line bg-cream px-3 py-2 font-bold outline-none focus:border-sky"
          />
          <button
            onClick={save}
            className="btn3d rounded-xl bg-sky px-4 text-sm font-extrabold text-white [--btn-shadow:var(--color-sky-dark)]"
          >
            OK
          </button>
        </div>
      )}
    </div>
  )
}

export function CardioCard({ date, cardio }: { date: string; cardio: Cardio }) {
  const done = useAppStore((s) => s.logs[date]?.cardio ?? false)
  const setCardio = useAppStore((s) => s.setCardio)

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!done) {
      fx.burstFromElement(e.currentTarget, 'sky', 34)
      sfx.levelUp()
    }
    setCardio(date, !done)
  }

  return (
    <div className={`card p-4 ${done ? 'border-sky! bg-sky-soft!' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold">
          🚲 {cardio.title} · {cardio.time}
        </h3>
        <span className="rounded-full bg-sky-soft px-2 py-0.5 text-xs font-extrabold text-sky-dark">
          +{XP.cardio} XP
        </span>
      </div>
      <ul className="mt-2 space-y-0.5">
        {cardio.steps.map((s) => (
          <li key={s} className="text-sm font-semibold text-ink/80">
            • {s}
          </li>
        ))}
      </ul>
      <button
        onClick={toggle}
        className={`btn3d mt-3 w-full rounded-2xl py-2.5 text-sm font-extrabold ${
          done
            ? 'bg-sky text-white [--btn-shadow:var(--color-sky-dark)]'
            : 'border-2 border-sky bg-white text-sky-dark [--btn-shadow:var(--color-sky-soft)]'
        }`}
      >
        {done ? '✓ Cardio fatto!' : 'Segna come fatto'}
      </button>
    </div>
  )
}
