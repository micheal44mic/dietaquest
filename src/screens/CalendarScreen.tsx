import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useStats } from '../hooks/useStats'
import { useToday } from '../hooks/useToday'
import { cyclePosition, dayFor } from '../game/cycle'
import { SHOPPING_LIST, WEEKLY_AVERAGE } from '../data/program'
import { addDays, dateKey, MONTHS, startOfWeek, WEEKDAYS_SHORT } from '../lib/dates'
import { ProgressRing } from '../components/ProgressRing'

const KIND_EMOJI: Record<string, string> = {
  upper: '💪',
  lower: '🦵',
  riposo: '🚲',
}

export function CalendarScreen() {
  const [view, setView] = useState<'settimana' | 'mese'>('settimana')

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">📅 Calendario</h1>

      <div className="card flex p-1">
        {(['settimana', 'mese'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="relative flex-1 rounded-2xl py-2 text-sm font-extrabold capitalize"
          >
            {view === v && (
              <motion.div
                layoutId="cal-toggle"
                className="absolute inset-0 rounded-2xl bg-leaf"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={`relative z-10 ${view === v ? 'text-white' : 'text-mute'}`}>{v}</span>
          </button>
        ))}
      </div>

      {view === 'settimana' ? <WeekView /> : <MonthView />}
    </div>
  )
}

function WeekView() {
  const stats = useStats()
  const settings = useAppStore((s) => s.settings)
  const today = useToday()
  const [offset, setOffset] = useState(0)

  const days = useMemo(() => {
    const start = addDays(startOfWeek(new Date()), offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i)
      const key = dateKey(d)
      const pos = cyclePosition(settings, key)
      return { key, num: d.getDate(), program: dayFor(pos.programDay), pos }
    })
  }, [offset, settings])

  const weekXP = days.reduce((sum, d) => sum + (stats.perDay[d.key]?.xp ?? 0), 0)
  const perfect = days.filter((d) => stats.perDay[d.key]?.perfect).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="btn3d rounded-xl border-2 border-line bg-white px-4 py-1.5 font-extrabold text-mute [--btn-shadow:var(--color-line)]"
        >
          ‹
        </button>
        <span className="text-sm font-extrabold">
          {offset === 0
            ? 'Questa settimana'
            : offset === -1
              ? 'Settimana scorsa'
              : `${Math.abs(offset)} settimane fa`}
        </span>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset === 0}
          className="btn3d rounded-xl border-2 border-line bg-white px-4 py-1.5 font-extrabold text-mute [--btn-shadow:var(--color-line)] disabled:opacity-40"
        >
          ›
        </button>
      </div>

      <div className="card p-3">
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const ds = stats.perDay[d.key]
            const pct = ds && ds.mealsTotal > 0 ? ds.mealsEaten / ds.mealsTotal : 0
            const isToday = d.key === today
            const future = d.key > today
            return (
              <motion.div
                key={d.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col items-center gap-0.5 rounded-2xl py-2 ${
                  isToday ? 'bg-leaf-soft' : ''
                }`}
              >
                <span className="text-[9px] font-extrabold text-mute">{WEEKDAYS_SHORT[i]}</span>
                <ProgressRing
                  pct={pct}
                  size={32}
                  stroke={4}
                  color={ds?.perfect ? 'var(--color-tang)' : 'var(--color-leaf)'}
                >
                  <span className="text-[10px] font-extrabold">
                    {future ? '' : ds?.perfect ? '⭐' : d.num}
                  </span>
                </ProgressRing>
                <span className="text-[11px]" title={d.program.title}>
                  {KIND_EMOJI[d.program.kind]}
                </span>
                <span className="text-[8px] font-extrabold text-mute">G{d.pos.programDay}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard emoji="⚡" value={String(weekXP)} label="XP della settimana" />
        <StatCard emoji="⭐" value={`${perfect}/7`} label="Giornate perfette" />
      </div>

      {/* Cosa prevede ogni giorno */}
      <div className="card p-4">
        <h2 className="mb-2 text-base font-extrabold">Programma della settimana</h2>
        <div className="space-y-1">
          {days.map((d) => (
            <div key={d.key} className="flex items-center gap-2 text-sm">
              <span className="w-8 shrink-0 text-[11px] font-extrabold text-mute">
                G{d.pos.programDay}
              </span>
              <span>{KIND_EMOJI[d.program.kind]}</span>
              <span className="flex-1 truncate font-bold">{d.program.title}</span>
              <span className="shrink-0 rounded-full bg-cream px-1.5 text-[10px] font-extrabold text-mute">
                dieta {d.program.dietModel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spesa: il piano dà quantità settimanali fisse, da ripetere tre volte */}
      <details className="card p-4">
        <summary className="cursor-pointer text-base font-extrabold">
          🛒 Spesa della settimana
        </summary>
        <p className="mt-1 text-xs font-bold text-mute">
          Quantità per 7 giorni. Media della settimana: {WEEKLY_AVERAGE.kcal} kcal ·{' '}
          {WEEKLY_AVERAGE.p} P · {WEEKLY_AVERAGE.c} C · {WEEKLY_AVERAGE.g} G.
        </p>
        <div className="mt-2 space-y-0.5">
          {SHOPPING_LIST.map(([nome, qta]) => (
            <div key={nome} className="flex justify-between gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-semibold text-ink/80">{nome}</span>
              <span className="shrink-0 font-extrabold">{qta}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}

function MonthView() {
  const stats = useStats()
  const today = useToday()
  const [offset, setOffset] = useState(0)

  const { title, cells, monthKeys } = useMemo(() => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1)
    const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
    const lead = (first.getDay() + 6) % 7
    const cells: Array<{ key: string; num: number } | null> = Array.from({ length: lead }, () => null)
    const monthKeys: string[] = []
    for (let day = 1; day <= last.getDate(); day++) {
      const key = dateKey(new Date(first.getFullYear(), first.getMonth(), day))
      monthKeys.push(key)
      cells.push({ key, num: day })
    }
    return { title: `${MONTHS[first.getMonth()]} ${first.getFullYear()}`, cells, monthKeys }
  }, [offset])

  const monthXP = monthKeys.reduce((s, k) => s + (stats.perDay[k]?.xp ?? 0), 0)
  const perfect = monthKeys.filter((k) => stats.perDay[k]?.perfect).length
  const sessions = monthKeys.filter(
    (k) => stats.perDay[k]?.workoutComplete || stats.perDay[k]?.cardioDone,
  ).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="btn3d rounded-xl border-2 border-line bg-white px-4 py-1.5 font-extrabold text-mute [--btn-shadow:var(--color-line)]"
        >
          ‹
        </button>
        <span className="text-sm font-extrabold">{title}</span>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset === 0}
          className="btn3d rounded-xl border-2 border-line bg-white px-4 py-1.5 font-extrabold text-mute [--btn-shadow:var(--color-line)] disabled:opacity-40"
        >
          ›
        </button>
      </div>

      <div className="card p-3">
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS_SHORT.map((w) => (
            <div key={w} className="text-center text-[9px] font-extrabold text-mute">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={`x-${i}`} />
            const ds = stats.perDay[cell.key]
            const pct = ds && ds.mealsTotal > 0 ? ds.mealsEaten / ds.mealsTotal : 0
            const isToday = cell.key === today
            const future = cell.key > today
            const bg =
              pct === 0
                ? 'transparent'
                : `color-mix(in srgb, var(--color-leaf) ${20 + pct * 60}%, white)`
            return (
              <motion.div
                key={cell.key}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.012 }}
                className={`flex aspect-square items-center justify-center rounded-xl border-2 text-xs font-extrabold ${
                  isToday ? 'border-leaf' : 'border-transparent'
                } ${future ? 'text-line' : pct > 0.6 ? 'text-white' : 'text-ink'}`}
                style={{ background: bg }}
              >
                {ds?.perfect ? <span className="text-sm leading-none">⭐</span> : cell.num}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard emoji="⚡" value={String(monthXP)} label="XP" />
        <StatCard emoji="⭐" value={String(perfect)} label="Perfette" />
        <StatCard emoji="🏋️" value={String(sessions)} label="Sedute" />
      </div>
    </div>
  )
}

export function StatCard({
  emoji,
  value,
  label,
}: {
  emoji: string
  value: string
  label: string
}) {
  return (
    <div className="card p-3 text-center">
      <div className="text-xl">{emoji}</div>
      <div className="text-lg font-extrabold">{value}</div>
      <div className="text-[10px] font-extrabold text-mute">{label}</div>
    </div>
  )
}
