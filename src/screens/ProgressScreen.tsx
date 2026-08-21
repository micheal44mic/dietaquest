import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useStats } from '../hooks/useStats'
import { useToday } from '../hooks/useToday'
import { calorieAdvice, weeklyWeights, type AdviceKind } from '../game/review'
import { fmtShort } from '../lib/dates'
import { num, signed } from '../lib/format'
import { LineChart } from '../components/LineChart'
import { LoadsView } from './LoadsView'
import type { BodyEntry } from '../types'

function ViewToggle({
  view,
  onChange,
}: {
  view: 'corpo' | 'carichi'
  onChange: (v: 'corpo' | 'carichi') => void
}) {
  return (
    <div className="card flex p-1">
      {(
        [
          ['corpo', '⚖️ Corpo'],
          ['carichi', '🏋️ Carichi'],
        ] as const
      ).map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className="relative flex-1 rounded-2xl py-2 text-sm font-extrabold"
        >
          {view === v && (
            <motion.div
              layoutId="prog-toggle"
              className="absolute inset-0 rounded-2xl bg-leaf"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className={`relative z-10 ${view === v ? 'text-white' : 'text-mute'}`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  )
}

const MEASURES: Array<{ key: keyof BodyEntry; label: string; emoji: string; color: string }> = [
  { key: 'weight', label: 'Peso', emoji: '⚖️', color: 'var(--color-sky)' },
  { key: 'vita', label: 'Vita', emoji: '📏', color: 'var(--color-tang)' },
  { key: 'fianchi', label: 'Fianchi', emoji: '🍑', color: 'var(--color-grape)' },
  { key: 'petto', label: 'Petto', emoji: '🫁', color: 'var(--color-berry)' },
  { key: 'braccio', label: 'Braccio', emoji: '💪', color: 'var(--color-leaf)' },
]

const ADVICE_STYLE: Record<AdviceKind, { bg: string; border: string; text: string; emoji: string }> =
  {
    mantieni: {
      bg: 'bg-leaf-soft!',
      border: 'border-leaf!',
      text: 'text-leaf-dark',
      emoji: '✅',
    },
    aggiungi: { bg: 'bg-sun-soft!', border: 'border-sun!', text: 'text-sun-dark', emoji: '➕' },
    togli: { bg: 'bg-berry-soft!', border: 'border-berry!', text: 'text-berry-dark', emoji: '➖' },
    attendi: { bg: 'bg-sky-soft!', border: 'border-sky!', text: 'text-sky-dark', emoji: '⏳' },
    controlla: {
      bg: 'bg-tang-soft!',
      border: 'border-tang!',
      text: 'text-tang-dark',
      emoji: '🔍',
    },
  }

export function ProgressScreen() {
  const body = useAppStore((s) => s.body)
  const logs = useAppStore((s) => s.logs)
  const settings = useAppStore((s) => s.settings)
  const setBody = useAppStore((s) => s.setBody)
  const stats = useStats()
  const today = useToday()
  const [view, setView] = useState<'corpo' | 'carichi'>('corpo')
  const [metric, setMetric] = useState<keyof BodyEntry>('weight')
  const [drafts, setDrafts] = useState<Partial<Record<keyof BodyEntry, string>>>({})

  const data = useMemo(() => ({ logs, body, settings }), [logs, body, settings])
  const advice = useMemo(() => calorieAdvice(data), [data])
  const weeks = useMemo(() => weeklyWeights(data), [data])

  const series = useMemo(
    () =>
      Object.entries(body)
        .filter(([, e]) => e[metric] !== undefined)
        .map(([date, e]) => ({ date, value: e[metric] as number }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    [body, metric],
  )

  const active = MEASURES.find((m) => m.key === metric)!
  const delta = series.length >= 2 ? series[series.length - 1].value - series[0].value : null
  const style = ADVICE_STYLE[advice.kind]

  const saveMeasure = (key: keyof BodyEntry) => {
    const raw = drafts[key]
    if (!raw) return
    const n = parseFloat(raw.replace(',', '.'))
    if (Number.isNaN(n) || n <= 0) return
    setBody(today, { [key]: Math.round(n * 10) / 10 })
    setDrafts((d) => ({ ...d, [key]: '' }))
  }

  if (view === 'carichi') {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-extrabold">📈 I tuoi progressi</h1>
        <ViewToggle view={view} onChange={setView} />
        <LoadsView />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">📈 I tuoi progressi</h1>
      <ViewToggle view={view} onChange={setView} />

      {/* Revisione: le regole del piano applicate ai tuoi dati */}
      <div className={`card p-4 ${style.bg} ${style.border}`}>
        <h2 className={`text-base font-extrabold ${style.text}`}>
          {style.emoji} {advice.title}
        </h2>
        <p className="mt-1 text-sm font-bold text-ink/80">{advice.detail}</p>
        {advice.total !== null && (
          <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold ${style.text}`}>
                {signed(advice.total)}
              </span>
              <span className="text-xs font-extrabold text-mute">kg dall’inizio</span>
            </div>
            {advice.rate !== null && (
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-extrabold ${style.text}`}>
                  {signed(advice.rate)}
                </span>
                <span className="text-xs font-extrabold text-mute">a settimana</span>
              </div>
            )}
            {advice.waist !== null && (
              <div className="flex items-baseline gap-1">
                <span className={`text-lg font-extrabold ${style.text}`}>
                  {signed(advice.waist, 1)}
                </span>
                <span className="text-xs font-extrabold text-mute">cm di vita</span>
              </div>
            )}
          </div>
        )}
        <p className="mt-2 text-[10px] font-bold text-mute">
          La decisione resta tua: questa è solo la regola del tuo piano applicata alle tue medie.
        </p>
      </div>

      {/* Medie settimanali */}
      {weeks.length > 0 && (
        <div className="card p-4">
          <h2 className="text-base font-extrabold">📊 Medie settimanali</h2>
          <p className="text-xs font-bold text-mute">
            Il piano dice di non reagire alle oscillazioni del singolo giorno
          </p>
          <div className="mt-2 space-y-1">
            {weeks.map((w, i) => {
              const prev = weeks[i - 1]
              const diff = prev ? Math.round((w.avg - prev.avg) * 100) / 100 : null
              return (
                <div key={w.week} className="flex items-center gap-2 text-sm">
                  <span className="w-24 shrink-0 font-extrabold text-mute">{w.label}</span>
                  <span className="flex-1 font-extrabold">{num(w.avg)} kg</span>
                  {diff !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                        diff > 0 ? 'bg-leaf-soft text-leaf-dark' : 'bg-sky-soft text-sky-dark'
                      }`}
                    >
                      {signed(diff)}
                    </span>
                  )}
                  <span className="w-14 shrink-0 text-right text-[10px] font-bold text-mute">
                    {w.days} pesate
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Selettore misura */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {MEASURES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={`btn3d shrink-0 rounded-2xl border-2 px-3 py-1.5 text-xs font-extrabold ${
              metric === m.key
                ? 'border-leaf bg-leaf text-white [--btn-shadow:var(--color-leaf-dark)]'
                : 'border-line bg-white text-mute [--btn-shadow:var(--color-line)]'
            }`}
          >
            {m.emoji} {m.label}
          </button>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold">
            {active.emoji} {active.label} {metric === 'weight' ? '(kg)' : '(cm)'}
          </h2>
          {delta !== null && (
            <motion.span
              key={`${metric}-${delta}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full bg-cream px-2 py-0.5 text-xs font-extrabold text-mute"
            >
              {signed(delta, 1)} dall’inizio
            </motion.span>
          )}
        </div>
        <div className="mt-2">
          <LineChart points={series} color={active.color} unit={metric === 'weight' ? 'kg' : 'cm'} />
        </div>
      </div>

      {/* Misure di oggi */}
      <div className="card space-y-2 p-4">
        <h2 className="text-base font-extrabold">✍️ Misure di oggi</h2>
        {MEASURES.map((m) => {
          const current = body[today]?.[m.key]
          return (
            <div key={m.key} className="flex items-center gap-2">
              <span className="w-24 shrink-0 text-sm font-extrabold text-ink/80">
                {m.emoji} {m.label}
              </span>
              {/* type="text": su iOS un input number scarta il valore se scrivi la virgola */}
              <input
                type="text"
                inputMode="decimal"
                placeholder={current !== undefined ? String(current) : '—'}
                value={drafts[m.key] ?? ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [m.key]: e.target.value }))}
                className="min-w-0 flex-1 rounded-xl border-2 border-line bg-cream px-3 py-1.5 font-bold outline-none focus:border-leaf"
              />
              <button
                onClick={() => saveMeasure(m.key)}
                disabled={!drafts[m.key]}
                className="btn3d rounded-xl bg-leaf px-3 py-1.5 text-sm font-extrabold text-white [--btn-shadow:var(--color-leaf-dark)] disabled:opacity-40"
              >
                ✓
              </button>
            </div>
          )
        })}
      </div>

      {/* Totali */}
      <div className="card p-4">
        <h2 className="mb-2 text-base font-extrabold">🏆 Da quando hai iniziato</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-bold text-ink/80">
          <span>🍽️ Pasti completati</span>
          <span className="text-right font-extrabold">{stats.mealsEaten}</span>
          <span>⭐ Giornate perfette</span>
          <span className="text-right font-extrabold">{stats.perfectDays}</span>
          <span>🏋️ Sedute complete</span>
          <span className="text-right font-extrabold">{stats.workoutsDone}</span>
          <span>🚲 Cardio di recupero</span>
          <span className="text-right font-extrabold">{stats.cardioDone}</span>
          <span>📓 Serie registrate</span>
          <span className="text-right font-extrabold">{stats.setsLogged}</span>
          <span>⚖️ Pesate</span>
          <span className="text-right font-extrabold">{stats.weighIns}</span>
          <span>⚡ XP totali</span>
          <span className="text-right font-extrabold">{stats.totalXP}</span>
        </div>
      </div>

      {/* Storico misure */}
      {Object.keys(body).length > 0 && (
        <div className="card p-4">
          <h2 className="mb-2 text-base font-extrabold">🗂️ Storico misure</h2>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {Object.entries(body)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, e]) => (
                <div key={date} className="flex justify-between text-sm font-bold">
                  <span className="text-mute">{fmtShort(date)}</span>
                  <span className="text-right">
                    {MEASURES.filter((m) => e[m.key] !== undefined)
                      .map((m) => `${m.emoji} ${e[m.key]}`)
                      .join('  ')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
