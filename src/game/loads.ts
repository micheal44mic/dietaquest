import type { AppData, Exercise, SetLog } from '../types'
import { PROGRAM } from '../data/program'
import { exerciseHistory, progressionHint } from './review'

/** Un esercizio nel contesto della giornata in cui compare */
export interface ExerciseRef {
  key: string
  exercise: Exercise
  programDay: number
  dayTitle: string
}

/**
 * Lo stesso id può comparire in più giornate con schemi diversi, quindi la
 * chiave è la coppia giorno + esercizio: i carichi vanno confrontati solo
 * fra sedute dello stesso tipo.
 */
export const ALL_EXERCISES: ExerciseRef[] = PROGRAM.flatMap((d) =>
  (d.workout ?? []).map((e) => ({
    key: `${d.day}:${e.id}`,
    exercise: e,
    programDay: d.day,
    dayTitle: d.title,
  })),
)

export interface LoadPoint {
  date: string
  /** Serie migliore della seduta: kg × ripetizioni */
  value: number
  weight: number
  reps: number
  /** Tutte le serie della seduta, per lo storico */
  sets: SetLog[]
}

const bestOf = (sets: SetLog[]): SetLog =>
  sets.reduce((best, s) =>
    s.weight * s.reps > best.weight * best.reps ||
    (s.weight * s.reps === best.weight * best.reps && s.weight > best.weight)
      ? s
      : best,
  )

/**
 * Andamento della serie migliore nel tempo. Si usa kg × ripetizioni e non il
 * solo peso perché nella doppia progressione si avanza prima aggiungendo
 * ripetizioni: col peso soltanto il grafico resterebbe piatto proprio mentre
 * stai migliorando. E non il volume totale, che salterebbe quando cambia il
 * numero di serie durante la rampa di ingresso.
 */
export function loadSeries(data: AppData, ref: ExerciseRef): LoadPoint[] {
  return exerciseHistory(data, ref.exercise.id, ref.programDay)
    .map((s) => {
      const best = bestOf(s.sets)
      return {
        date: s.date,
        value: Math.round(best.weight * best.reps * 10) / 10,
        weight: best.weight,
        reps: best.reps,
        sets: s.sets,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Esercizi con almeno una serie registrata, dal più allenato di recente */
export function trainedExercises(
  data: AppData,
): Array<ExerciseRef & { sessions: number; lastDate: string }> {
  return ALL_EXERCISES.map((ref) => {
    const h = exerciseHistory(data, ref.exercise.id, ref.programDay)
    return { ...ref, sessions: h.length, lastDate: h[0]?.date ?? '' }
  })
    .filter((r) => r.sessions > 0)
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate))
}

export interface ReadyItem {
  ref: ExerciseRef
  message: string
}

/** Esercizi che soddisfano la regola di progressione del piano */
export function readyToProgress(data: AppData): ReadyItem[] {
  const out: ReadyItem[] = []
  for (const ref of ALL_EXERCISES) {
    const hint = progressionHint(data, ref.exercise, undefined, ref.programDay)
    if (hint?.ready) out.push({ ref, message: hint.message })
  }
  return out
}

export interface LoadSummary {
  sessions: number
  /** Serie migliore di sempre per kg × ripetizioni */
  record: LoadPoint | null
  /** Peso più alto mai usato, anche con poche ripetizioni */
  maxWeight: number | null
  first: LoadPoint | null
  last: LoadPoint | null
  /** Variazione del peso della serie migliore, in kg */
  weightDelta: number | null
}

export function summarize(points: LoadPoint[]): LoadSummary {
  if (points.length === 0) {
    return {
      sessions: 0,
      record: null,
      maxWeight: null,
      first: null,
      last: null,
      weightDelta: null,
    }
  }
  const record = points.reduce((a, b) => (b.value > a.value ? b : a))
  const first = points[0]
  const last = points[points.length - 1]
  return {
    sessions: points.length,
    record,
    maxWeight: Math.max(...points.flatMap((p) => p.sets.map((s) => s.weight))),
    first,
    last,
    weightDelta: points.length >= 2 ? Math.round((last.weight - first.weight) * 10) / 10 : null,
  }
}
