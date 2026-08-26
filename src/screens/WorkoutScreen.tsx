import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import type { Exercise, SetLog } from '../types'
import { HYDRATION, WARMUP } from '../data/routine'
import { lastSession, progressionHint } from '../game/review'
import { cyclePosition } from '../game/cycle'
import { isLoggedSet, XP } from '../game/derive'
import { fmtShort } from '../lib/dates'
import { num } from '../lib/format'
import { ProgressRing } from '../components/ProgressRing'
import { fx } from '../fx/FxLayer'
import { sfx } from '../fx/sound'

interface Props {
  date: string
  title: string
  rirNote?: string
  exercises: Exercise[]
  onClose: () => void
}

export function WorkoutScreen({ date, title, rirNote, exercises, onClose }: Props) {
  const [rest, setRest] = useState<number | null>(null)
  const [openWarmup, setOpenWarmup] = useState(false)
  const logs = useAppStore((s) => s.logs)

  const done = exercises.reduce(
    (n, e) => n + Math.min((logs[date]?.sets[e.id] ?? []).filter(isLoggedSet).length, e.sets),
    0,
  )
  const total = exercises.reduce((n, e) => n + e.sets, 0)
  const complete = done >= total

  const wasComplete = useRef(complete)
  useEffect(() => {
    if (complete && !wasComplete.current) {
      sfx.levelUp()
      fx.fireworks()
    }
    wasComplete.current = complete
  }, [complete])

  return (
    /* Sopra la TabBar (z-30): durante la seduta la schermata resta a fuoco */
    <div className="fixed inset-0 z-40 overflow-y-auto bg-cream">
      <div
        className="mx-auto max-w-md px-4 pb-32"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        {/* Testata */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="btn3d rounded-2xl border-2 border-line bg-white px-3 py-2 text-lg font-extrabold text-mute [--btn-shadow:var(--color-line)]"
          >
            ‹
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-extrabold">{title}</h1>
            {rirNote && <p className="text-xs font-bold text-mute">{rirNote}</p>}
          </div>
          <ProgressRing pct={total ? done / total : 0} size={48} stroke={6} color="var(--color-tang)">
            <span className="text-[11px] font-extrabold text-tang-dark">
              {done}/{total}
            </span>
          </ProgressRing>
        </div>

        {complete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card mt-4 border-sun! bg-gradient-to-r from-sun-soft to-tang-soft p-4 text-center shadow-[0_3px_0_var(--color-sun)]!"
          >
            <div className="text-xl font-extrabold text-tang-dark">🏋️ SEDUTA COMPLETATA!</div>
            <div className="text-sm font-extrabold text-sun-dark">
              +{XP.workoutComplete} XP bonus
            </div>
          </motion.div>
        )}

        {/* Riscaldamento */}
        <button
          onClick={() => setOpenWarmup((v) => !v)}
          className="card mt-4 w-full p-3 text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold">🔥 Riscaldamento · 16:20</span>
            <motion.span animate={{ rotate: openWarmup ? 180 : 0 }} className="text-mute">
              ▾
            </motion.span>
          </div>
          <AnimatePresence initial={false}>
            {openWarmup && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {WARMUP.map((w) => (
                  <li key={w} className="mt-1 text-xs font-semibold text-ink/75">
                    • {w}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </button>

        <p className="mt-2 rounded-xl bg-sky-soft px-3 py-1.5 text-center text-xs font-bold text-sky-dark">
          💧 {HYDRATION}
        </p>

        {/* Esercizi */}
        <div className="mt-4 space-y-3">
          {exercises.map((e, i) => (
            <ExerciseCard
              key={`${e.id}-${i}`}
              date={date}
              exercise={e}
              // restSec 0 = superserie: si passa subito all'esercizio abbinato
              onSetSaved={() => setRest(e.restSec > 0 ? e.restSec : null)}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="btn3d mt-5 w-full rounded-2xl bg-leaf py-3 text-base font-extrabold text-white [--btn-shadow:var(--color-leaf-dark)]"
        >
          {complete ? 'Chiudi la seduta 💪' : 'Torna a Oggi'}
        </button>
      </div>

      <RestTimer seconds={rest} onDone={() => setRest(null)} />
    </div>
  )
}

// --------------------------------------------------------------- ESERCIZIO

function ExerciseCard({
  date,
  exercise,
  onSetSaved,
}: {
  date: string
  exercise: Exercise
  onSetSaved: () => void
}) {
  const sets = useAppStore((s) => s.logs[date]?.sets[exercise.id]) ?? []
  const saveSet = useAppStore((s) => s.saveSet)
  const clearSet = useAppStore((s) => s.clearSet)
  // Selettori separati: uno che costruisce un oggetto manderebbe zustand in loop
  const logs = useAppStore((s) => s.logs)
  const body = useAppStore((s) => s.body)
  const settings = useAppStore((s) => s.settings)
  const overrides = useAppStore((s) => s.overrides)
  const data = useMemo(() => ({ logs, body, settings, overrides }), [logs, body, settings, overrides])

  const programDay = cyclePosition(settings, date).programDay
  const previous = useMemo(
    () => lastSession(data, exercise.id, date, programDay),
    [data, exercise.id, date, programDay],
  )
  const hint = useMemo(
    () => progressionHint(data, exercise, date, programDay),
    [data, exercise, date, programDay],
  )
  const complete = sets.filter(isLoggedSet).length >= exercise.sets

  return (
    <div className={`card p-4 ${complete ? 'border-tang! bg-tang-soft!' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base leading-tight font-extrabold">
          {exercise.superset && (
            <span className="mr-1.5 rounded-md bg-grape px-1.5 py-0.5 align-middle text-[10px] text-white">
              {exercise.superset}
            </span>
          )}
          {exercise.name}
        </h3>
        <span className="shrink-0 rounded-full bg-cream px-2 py-0.5 text-[11px] font-extrabold text-mute">
          {exercise.sets} × {exercise.repsMin}-{exercise.repsMax}
          {exercise.perSide ? '/lato' : ''}
        </span>
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-extrabold text-mute">
        <span>RIR {exercise.rir}</span>
        <span>· rec {exercise.restSec > 0 ? `${exercise.restSec}″` : 'subito la coppia'}</span>
        {exercise.note && <span className="text-berry-dark">· {exercise.note}</span>}
      </div>

      {exercise.cue && (
        <details className="mt-1.5">
          <summary className="cursor-pointer text-[11px] font-extrabold text-sky-dark">
            ℹ️ Come farlo bene
          </summary>
          <p className="mt-1 text-xs leading-snug font-semibold text-ink/75">{exercise.cue}</p>
        </details>
      )}

      {previous && (
        <p className="mt-1.5 text-[11px] font-bold text-mute">
          Ultima volta ({fmtShort(previous.date)}):{' '}
          {previous.sets.map((s) => `${num(s.weight)}×${s.reps}`).join('  ')}
        </p>
      )}

      {hint && (
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-1.5 rounded-xl bg-leaf-soft px-2.5 py-1.5 text-[11px] font-extrabold text-leaf-dark"
        >
          📈 {hint.message}
        </motion.p>
      )}

      <div className="mt-2.5 space-y-1.5">
        {Array.from({ length: exercise.sets }, (_, i) => (
          <SetRow
            key={i}
            index={i}
            value={isLoggedSet(sets[i]) ? sets[i] : undefined}
            suggestion={previous?.sets[i] ?? previous?.sets[previous.sets.length - 1]}
            onSave={(v) => {
              saveSet(date, exercise.id, i, v)
              onSetSaved()
            }}
            onClear={() => clearSet(date, exercise.id, i)}
          />
        ))}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------- SERIE

function SetRow({
  index,
  value,
  suggestion,
  onSave,
  onClear,
}: {
  index: number
  value: SetLog | undefined
  suggestion: SetLog | undefined
  onSave: (v: SetLog) => void
  onClear: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [rir, setRir] = useState('')

  const open = () => {
    setWeight(String(value?.weight ?? suggestion?.weight ?? '').replace('.', ','))
    setReps(String(value?.reps ?? suggestion?.reps ?? ''))
    setRir(value?.rir !== null && value?.rir !== undefined ? String(value.rir) : '')
    setEditing(true)
  }

  const save = (e: React.MouseEvent<HTMLButtonElement>) => {
    const w = parseFloat(weight.replace(',', '.'))
    const r = parseInt(reps, 10)
    if (Number.isNaN(w) || Number.isNaN(r) || r <= 0) return
    const rirNum = rir.trim() === '' ? null : parseInt(rir, 10)
    onSave({ weight: w, reps: r, rir: Number.isNaN(rirNum as number) ? null : rirNum })
    setEditing(false)
    sfx.pop()
    fx.burstFromElement(e.currentTarget, 'tang', 16, 0.7)
  }

  if (!editing) {
    return (
      <button
        onClick={open}
        className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left ${
          value ? 'border-tang bg-white' : 'border-line bg-cream'
        }`}
      >
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold ${
            value ? 'bg-tang text-white' : 'bg-white text-mute'
          }`}
        >
          {index + 1}
        </span>
        {value ? (
          <>
            <span className="flex-1 text-sm font-extrabold">
              {num(value.weight)} kg × {value.reps}
            </span>
            {value.rir !== null && (
              <span className="text-[11px] font-extrabold text-mute">RIR {value.rir}</span>
            )}
          </>
        ) : (
          <span className="flex-1 text-sm font-bold text-mute">Registra la serie…</span>
        )}
      </button>
    )
  }

  return (
    <div className="rounded-xl border-2 border-tang bg-white p-2">
      <div className="flex items-center gap-1.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-tang text-[11px] font-extrabold text-white">
          {index + 1}
        </span>
        {/* type="text": su iOS un input number scarta il valore se scrivi la virgola */}
        <Field label="kg" value={weight} onChange={setWeight} mode="decimal" autoFocus />
        <Field label="rip" value={reps} onChange={setReps} mode="numeric" />
        <Field label="RIR" value={rir} onChange={setRir} mode="numeric" />
        <button
          onClick={save}
          className="btn3d shrink-0 rounded-lg bg-tang px-2.5 py-2 text-sm font-extrabold text-white [--btn-shadow:var(--color-tang-dark)]"
        >
          ✓
        </button>
      </div>
      <div className="mt-1 flex justify-end gap-3 pr-1">
        {value && (
          <button
            onClick={() => {
              onClear()
              setEditing(false)
            }}
            className="text-[11px] font-extrabold text-berry underline"
          >
            cancella
          </button>
        )}
        <button
          onClick={() => setEditing(false)}
          className="text-[11px] font-extrabold text-mute underline"
        >
          annulla
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  mode,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mode: 'decimal' | 'numeric'
  autoFocus?: boolean
}) {
  return (
    <label className="min-w-0 flex-1">
      <span className="block text-center text-[9px] font-extrabold text-mute uppercase">
        {label}
      </span>
      <input
        type="text"
        inputMode={mode}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border-2 border-line bg-cream px-1 py-1 text-center font-extrabold outline-none focus:border-tang"
      />
    </label>
  )
}

// ------------------------------------------------------------------- TIMER

function RestTimer({ seconds, onDone }: { seconds: number | null; onDone: () => void }) {
  const [left, setLeft] = useState(0)

  useEffect(() => {
    if (seconds === null) return
    setLeft(seconds)
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(id)
          sfx.badge()
          onDone()
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [seconds, onDone])

  const mm = Math.floor(left / 60)
  const ss = String(left % 60).padStart(2, '0')

  return (
    <AnimatePresence>
      {seconds !== null && left > 0 && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          className="fixed inset-x-0 bottom-0 z-[45] border-t-2 border-line bg-white/95 backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              ⏱️
            </motion.span>
            <div className="flex-1">
              <div className="text-xs font-extrabold text-mute">Recupero</div>
              <div className="text-2xl leading-none font-extrabold text-tang-dark">
                {mm}:{ss}
              </div>
            </div>
            <button
              onClick={onDone}
              className="btn3d rounded-2xl border-2 border-line bg-white px-4 py-2 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
            >
              Salta
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
