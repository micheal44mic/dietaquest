import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { MOBILITY, SEDENTARY_TIP, type RoutineItem } from '../data/routine'
import { XP } from '../game/derive'
import { ProgressRing } from './ProgressRing'
import { fx } from '../fx/FxLayer'
import { sfx } from '../fx/sound'

interface Props {
  date: string
  items: RoutineItem[]
}

/**
 * La routine è ~9 voci identiche ogni giorno: raggruppate in una card sola
 * per non trasformare la schermata Oggi in una lista infinita.
 */
export function RoutineCard({ date, items }: Props) {
  const routine = useAppStore((s) => s.logs[date]?.routine)
  const toggleRoutine = useAppStore((s) => s.toggleRoutine)
  const [open, setOpen] = useState(false)
  const [showMobility, setShowMobility] = useState(false)

  const done = items.filter((i) => routine?.[i.id]).length
  const all = done === items.length

  const tap = (item: RoutineItem, e: React.MouseEvent) => {
    const wasDone = Boolean(routine?.[item.id])
    toggleRoutine(date, item.id)
    if (!wasDone) {
      sfx.drop()
      fx.burstFromElement(e.currentTarget as Element, 'sky', 12, 0.6)
      if (done + 1 === items.length) {
        sfx.badge()
        fx.fireworks()
      }
    }
  }

  return (
    <div className={`card overflow-hidden ${all ? 'border-sky! bg-sky-soft!' : ''}`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 p-4">
        <ProgressRing
          pct={done / items.length}
          size={44}
          stroke={5}
          color="var(--color-sky)"
          track={all ? 'white' : 'var(--color-line)'}
        >
          <span className="text-[11px] font-extrabold text-sky-dark">
            {done}/{items.length}
          </span>
        </ProgressRing>
        <div className="flex-1 text-left">
          <h3 className="text-base font-extrabold">🔁 Routine del giorno</h3>
          <p className="text-xs font-bold text-mute">
            {all ? 'Tutta fatta! +40 XP bonus 🎉' : 'Pesata, camminate, mobilità, creatina, sonno'}
          </p>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-lg text-mute">
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 px-4 pb-4">
              {items.map((item) => {
                const checked = Boolean(routine?.[item.id])
                return (
                  <div key={item.id}>
                    <button
                      onClick={(e) => tap(item, e)}
                      className={`flex w-full items-center gap-2.5 rounded-2xl border-2 p-2.5 text-left transition-colors ${
                        checked ? 'border-sky bg-white' : 'border-line bg-cream'
                      }`}
                    >
                      <motion.span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-sm ${
                          checked ? 'bg-sky text-white' : 'bg-white text-transparent'
                        }`}
                        animate={checked ? { scale: [1, 1.3, 1] } : {}}
                      >
                        ✓
                      </motion.span>
                      <span className="text-lg">{item.emoji}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-extrabold">
                          {item.time} · {item.label}
                        </span>
                        {item.detail && (
                          <span className="block text-[11px] leading-tight font-bold text-mute">
                            {item.detail}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-[10px] font-extrabold text-mute">
                        +{XP.routineItem}
                      </span>
                    </button>

                    {item.id.startsWith('mobilita') && (
                      <button
                        onClick={() => setShowMobility((v) => !v)}
                        className="mt-1 ml-9 text-[11px] font-extrabold text-sky-dark underline"
                      >
                        {showMobility ? 'nascondi esercizi' : 'vedi i 9 esercizi'}
                      </button>
                    )}
                    {item.id.startsWith('mobilita') && showMobility && (
                      <ul className="mt-1 ml-9 space-y-0.5">
                        {MOBILITY.map((m) => (
                          <li key={m} className="text-[11px] font-semibold text-ink/70">
                            • {m}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}

              <p className="mt-2 rounded-xl bg-sun-soft px-2.5 py-1.5 text-[11px] font-bold text-sun-dark">
                💡 {SEDENTARY_TIP}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
