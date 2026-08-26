import { motion } from 'framer-motion'
import { useMemo } from 'react'
import type { Meal, MealStatus } from '../types'
import { useAppStore } from '../store/useAppStore'
import { XP } from '../game/derive'
import { resolveMeal, somma } from '../game/nutrition'
import { num } from '../lib/format'
import { FoodRow } from './FoodRow'
import { fx } from '../fx/FxLayer'
import { sfx } from '../fx/sound'

interface Props {
  meal: Meal
  status: MealStatus | undefined
  onChange: (status: MealStatus | undefined) => void
}

export function MealQuestCard({ meal, status, onChange }: Props) {
  const overrides = useAppStore((s) => s.overrides)
  const items = useMemo(() => resolveMeal(meal, overrides), [meal, overrides])
  const tot = useMemo(() => somma(items.map((i) => i.actual)), [items])

  const eaten = status === 'eaten'
  const skipped = status === 'skipped'

  const handleEat = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (eaten) {
      onChange(undefined)
      return
    }
    fx.burstFromElement(e.currentTarget, 'leaf', 30)
    sfx.pop()
    onChange('eaten')
  }

  const handleSkip = () => {
    if (skipped) {
      onChange(undefined)
      return
    }
    sfx.skip()
    onChange('skipped')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card overflow-hidden p-4 transition-colors ${
        eaten ? 'border-leaf! bg-leaf-soft! shadow-[0_3px_0_var(--color-leaf)]!' : ''
      } ${skipped ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl"
          animate={eaten ? { rotate: [0, -12, 12, 0], scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {meal.emoji}
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className={`text-base font-extrabold ${skipped ? 'line-through' : ''}`}>
              {meal.name}
            </h3>
            <span className="shrink-0 rounded-full bg-sun-soft px-2 py-0.5 text-xs font-extrabold text-sun-dark">
              +{XP.meal} XP
            </span>
          </div>
          <div className="text-xs font-bold text-mute">🕐 {meal.time}</div>
        </div>
      </div>

      {/* Alimenti: tocca una riga per registrare il tuo prodotto */}
      <div className="mt-2">
        {items.map((i, k) => (
          <FoodRow key={`${i.id}-${k}`} item={i} />
        ))}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 rounded-xl bg-cream px-3 py-1.5">
        <span className="text-xs font-extrabold text-mute">Totale pasto</span>
        <span className="text-sm font-extrabold">
          {tot.kcal} kcal · {num(tot.p)} P · {num(tot.c)} C · {num(tot.g)} G · {num(tot.fiber)} fibre
        </span>
      </div>

      {meal.note && (
        <p className="mt-2 rounded-xl bg-sky-soft px-2 py-1 text-xs font-bold text-sky-dark">
          🥚 {meal.note}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleEat}
          className="btn3d flex-1 rounded-2xl bg-leaf py-2.5 text-sm font-extrabold text-white [--btn-shadow:var(--color-leaf-dark)]"
        >
          {eaten ? '✓ Mangiato!' : 'Mangiato 😋'}
        </button>
        <button
          onClick={handleSkip}
          className={`btn3d flex-1 rounded-2xl border-2 py-2.5 text-sm font-extrabold ${
            skipped
              ? 'border-berry bg-berry text-white [--btn-shadow:var(--color-berry-dark)]'
              : 'border-line bg-white text-mute [--btn-shadow:var(--color-line)]'
          }`}
        >
          {skipped ? '✗ Saltato' : 'Saltato 😴'}
        </button>
      </div>
    </motion.div>
  )
}
