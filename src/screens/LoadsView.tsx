import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { loadSeries, readyToProgress, summarize, trainedExercises } from '../game/loads'
import { LineChart } from '../components/LineChart'
import { fmtShort } from '../lib/dates'
import { num, signed } from '../lib/format'

export function LoadsView() {
  const logs = useAppStore((s) => s.logs)
  const body = useAppStore((s) => s.body)
  const settings = useAppStore((s) => s.settings)
  const overrides = useAppStore((s) => s.overrides)
  const data = useMemo(() => ({ logs, body, settings, overrides }), [logs, body, settings, overrides])

  const trained = useMemo(() => trainedExercises(data), [data])
  const ready = useMemo(() => readyToProgress(data), [data])
  const [selected, setSelected] = useState<string | null>(null)

  const current = trained.find((t) => t.key === selected) ?? trained[0]
  const points = useMemo(() => (current ? loadSeries(data, current) : []), [data, current])
  const stats = summarize(points)

  // Nella doppia progressione, appena si aggiunge peso le ripetizioni calano:
  // il grafico scende pur essendo un progresso, e va detto
  const justIncreased =
    points.length >= 2 &&
    points[points.length - 1].weight > points[points.length - 2].weight &&
    points[points.length - 1].value < points[points.length - 2].value

  if (trained.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="text-3xl">🏋️</div>
        <h2 className="mt-1 text-base font-extrabold">Ancora nessun carico registrato</h2>
        <p className="mt-1 text-sm font-bold text-mute">
          Registra le serie durante l’allenamento: dopo due sedute dello stesso tipo qui vedrai
          l’andamento e ti dirò quando salire di peso.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* La cosa più azionabile: cosa aumentare alla prossima seduta */}
      <div className={`card p-4 ${ready.length > 0 ? 'border-leaf! bg-leaf-soft!' : ''}`}>
        <h2 className="text-base font-extrabold">
          {ready.length > 0 ? '📈 Pronti a salire di carico' : '⏳ Nessuno pronto a salire'}
        </h2>
        {ready.length > 0 ? (
          <div className="mt-2 space-y-1.5">
            {ready.map(({ ref, message }) => (
              <motion.div
                key={ref.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl bg-white px-3 py-2"
              >
                <div className="text-sm leading-tight font-extrabold">{ref.exercise.name}</div>
                <div className="text-[11px] font-bold text-mute">
                  {ref.dayTitle} · {message}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs font-bold text-mute">
            Il piano dice di salire solo dopo due sedute con tutte le serie al limite superiore del
            range, mantenendo il RIR previsto.
          </p>
        )}
      </div>

      {/* Selettore esercizio, dal più allenato di recente */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {trained.map((t) => (
          <button
            key={t.key}
            onClick={() => setSelected(t.key)}
            className={`btn3d shrink-0 rounded-2xl border-2 px-3 py-1.5 text-xs font-extrabold ${
              current?.key === t.key
                ? 'border-tang bg-tang text-white [--btn-shadow:var(--color-tang-dark)]'
                : 'border-line bg-white text-mute [--btn-shadow:var(--color-line)]'
            }`}
          >
            {t.exercise.name.split(',')[0]}
          </button>
        ))}
      </div>

      {current && (
        <>
          <div className="card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-base leading-tight font-extrabold">{current.exercise.name}</h2>
                <p className="text-[11px] font-bold text-mute">
                  {current.dayTitle} · {current.exercise.sets} × {current.exercise.repsMin}-
                  {current.exercise.repsMax} · RIR {current.exercise.rir}
                </p>
              </div>
              {stats.weightDelta !== null && stats.weightDelta !== 0 && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-extrabold ${
                    stats.weightDelta > 0
                      ? 'bg-leaf-soft text-leaf-dark'
                      : 'bg-berry-soft text-berry-dark'
                  }`}
                >
                  {signed(stats.weightDelta, 1)} kg
                </span>
              )}
            </div>

            <div className="mt-2">
              <LineChart points={points} color="var(--color-tang)" unit="" />
            </div>
            <p className="text-center text-[10px] font-bold text-mute">
              Serie migliore di ogni seduta: kg × ripetizioni
            </p>
            {justIncreased && (
              <p className="mt-2 rounded-xl bg-sky-soft px-3 py-2 text-center text-[11px] font-bold text-sky-dark">
                Il calo finale è normale: hai appena aumentato il carico, ora si ricostruiscono le
                ripetizioni fino al tetto del range.
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* La serie record va mostrata intera: dire solo i kg confonde
                quando hai già sollevato di più con meno ripetizioni */}
            <Riquadro
              emoji="🏆"
              valore={
                stats.record ? `${num(stats.record.weight)}×${stats.record.reps}` : '—'
              }
              etichetta="Serie record"
            />
            <Riquadro
              emoji="🏋️"
              valore={stats.maxWeight !== null ? `${num(stats.maxWeight)} kg` : '—'}
              etichetta="Peso massimo"
            />
            <Riquadro
              emoji="🎯"
              valore={stats.last ? `${num(stats.last.weight)}×${stats.last.reps}` : '—'}
              etichetta="Ultima volta"
            />
          </div>

          <div className="card p-4">
            <h3 className="mb-2 text-base font-extrabold">🗂️ Storico delle sedute</h3>
            <div className="max-h-64 space-y-1.5 overflow-y-auto">
              {[...points].reverse().map((p) => (
                <div key={p.date} className="flex gap-2 text-sm">
                  <span className="w-14 shrink-0 font-extrabold text-mute">
                    {fmtShort(p.date)}
                  </span>
                  <span className="min-w-0 flex-1 font-bold">
                    {p.sets.map((s) => `${num(s.weight)}×${s.reps}`).join(' · ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Riquadro({
  emoji,
  valore,
  etichetta,
}: {
  emoji: string
  valore: string
  etichetta: string
}) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xl">{emoji}</div>
      <div className="text-base font-extrabold">{valore}</div>
      <div className="text-[10px] font-extrabold text-mute">{etichetta}</div>
    </div>
  )
}
