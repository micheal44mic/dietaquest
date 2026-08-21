import { motion } from 'framer-motion'
import type { Exercise, ProgramDay } from '../types'
import { MOBILITY } from '../data/routine'
import { thousands } from '../lib/format'

interface Props {
  program: ProgramDay
  exercises: Exercise[] | undefined
}

/**
 * Giorni futuri: sola lettura. Non si può spuntare un pasto non ancora
 * mangiato senza falsare XP, streak e medie — qui serve solo per prepararsi.
 */
export function DayPreview({ program, exercises }: Props) {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-grape! bg-grape-soft! p-3 text-center"
      >
        <div className="text-sm font-extrabold text-grape-dark">🔮 Anteprima</div>
        <div className="text-xs font-bold text-mute">
          Qui non si spunta niente: serve per fare la spesa e prepararti
        </div>
      </motion.div>

      {program.notes?.map((n) => (
        <div key={n} className="card border-sun! bg-sun-soft! p-3 text-sm font-extrabold text-sun-dark">
          📌 {n}
        </div>
      ))}

      {/* Pasti */}
      <h2 className="pt-1 text-lg font-extrabold">
        Cosa mangerai 🍽️ · modello {program.dietModel}
      </h2>
      <p className="-mt-2 text-xs font-bold text-mute">
        {program.targets.kcal} · {program.targets.protein} P · {program.targets.carbs} C ·{' '}
        {program.targets.fat} G
      </p>
      {program.meals.map((meal) => (
        <div key={meal.id} className="card p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meal.emoji}</span>
            <h3 className="flex-1 text-base font-extrabold">{meal.name}</h3>
            <span className="text-xs font-bold text-mute">🕐 {meal.time}</span>
          </div>
          {meal.intro && <p className="mt-1 text-xs font-extrabold text-mute">{meal.intro}</p>}
          <ul className="mt-1 space-y-0.5">
            {meal.items.map((f) => (
              <li key={f} className="text-sm font-semibold text-ink/80">
                • {f}
              </li>
            ))}
          </ul>
          {meal.extra && (
            <>
              <p className="mt-1.5 text-xs font-extrabold text-mute">Aggiungi:</p>
              <ul className="space-y-0.5">
                {meal.extra.map((f) => (
                  <li key={f} className="text-sm font-semibold text-ink/80">
                    • {f}
                  </li>
                ))}
              </ul>
            </>
          )}
          {meal.note && (
            <p className="mt-2 rounded-xl bg-sky-soft px-2 py-1 text-xs font-bold text-sky-dark">
              ☕ {meal.note}
            </p>
          )}
        </div>
      ))}

      {/* Allenamento o cardio */}
      <h2 className="pt-1 text-lg font-extrabold">Cosa farai 💪</h2>
      {exercises ? (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold">{program.title} · 16:30</h3>
            <span className="rounded-full bg-tang-soft px-2 py-0.5 text-[11px] font-extrabold text-tang-dark">
              {exercises.reduce((n, e) => n + e.sets, 0)} serie
            </span>
          </div>
          {program.rirNote && <p className="text-xs font-bold text-mute">{program.rirNote}</p>}
          <div className="mt-2 space-y-1">
            {exercises.map((e, i) => (
              <div key={`${e.id}-${i}`} className="flex items-baseline gap-2 text-sm">
                {e.superset && (
                  <span className="shrink-0 rounded-md bg-grape px-1 text-[10px] font-extrabold text-white">
                    {e.superset}
                  </span>
                )}
                <span className="min-w-0 flex-1 font-bold">{e.name}</span>
                <span className="shrink-0 text-[11px] font-extrabold text-mute">
                  {e.sets} × {e.repsMin}-{e.repsMax}
                  {e.perSide ? '/lato' : ''} · RIR {e.rir}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        program.cardio && (
          <div className="card p-4">
            <h3 className="text-base font-extrabold">
              🚲 {program.cardio.title} · {program.cardio.time}
            </h3>
            <ul className="mt-1 space-y-0.5">
              {program.cardio.steps.map((s) => (
                <li key={s} className="text-sm font-semibold text-ink/80">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* Routine e passi */}
      <div className="card p-4">
        <h3 className="text-base font-extrabold">🔁 Routine di sempre</h3>
        <p className="mt-0.5 text-sm font-semibold text-ink/80">
          Pesata 07:30 · camminata 07:35 · mobilità 07:55 · creatina 5 g con la colazione ·
          camminate 13:30 e 21:00 · a letto 23:00
          {program.kind === 'riposo' && ' · secondo giro di mobilità alle 17:15'}
        </p>
        <p className="mt-2 text-sm font-extrabold">
          👟 Obiettivo passi: {thousands(program.steps)}
        </p>
      </div>

      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-extrabold">
          🧘 I 9 esercizi di mobilità
        </summary>
        <ul className="mt-2 space-y-0.5">
          {MOBILITY.map((m) => (
            <li key={m} className="text-sm font-semibold text-ink/80">
              • {m}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
