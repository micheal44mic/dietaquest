import type { AppData, Exercise, SetLog } from '../types'
import { parseKey } from '../lib/dates'
import { num, signed } from '../lib/format'
import { cyclePosition, dayFor, workoutFor } from './cycle'
import { isLoggedSet } from './derive'

/** Indice della settimana di programma (0 = giorni 1-7, 1 = giorni 8-14, 2 = settimana 3) */
const weekIndexOf = (data: AppData, date: string) =>
  Math.floor(cyclePosition(data.settings, date).elapsed / 7)

export interface WeekWeight {
  week: number
  label: string
  avg: number
  days: number
}

/**
 * Il piano dice esplicitamente di non reagire alle oscillazioni giornaliere:
 * il dato utile è la media della settimana di programma.
 */
export function weeklyWeights(data: AppData): WeekWeight[] {
  const buckets = new Map<number, number[]>()
  for (const [date, entry] of Object.entries(data.body)) {
    if (entry.weight === undefined) continue
    const w = weekIndexOf(data, date)
    if (w < 0) continue
    const list = buckets.get(w) ?? []
    list.push(entry.weight)
    buckets.set(w, list)
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([week, values]) => ({
      week,
      label: `Settimana ${week + 1}`,
      avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
      days: values.length,
    }))
}

export type AdviceKind = 'mantieni' | 'aggiungi' | 'togli' | 'attendi' | 'controlla'

export interface Advice {
  kind: AdviceKind
  title: string
  detail: string
  /** Variazione settimanale media, in kg */
  rate: number | null
  /** Variazione totale fra la prima e l'ultima settimana disponibile, in kg */
  total: number | null
  /** Variazione della vita fra la prima e l'ultima misura, in cm */
  waist: number | null
  weeksOfData: number
}

/**
 * Differenza fra la prima e l'ultima misura della vita registrata.
 * Serve perché la tabella di decisione del piano non guarda solo la bilancia:
 * peso fermo con vita in calo è ricomposizione, non stallo.
 */
function waistDelta(data: AppData): number | null {
  const values = Object.entries(data.body)
    .filter(([, e]) => e.vita !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, e]) => e.vita as number)
  if (values.length < 2) return null
  return Math.round((values[values.length - 1] - values[0]) * 10) / 10
}

const NEED_DAYS = 4

/**
 * Applica la tabella di decisione del giorno 22 del piano, che è un
 * dimagrimento: il bersaglio è PERDERE 0,15-0,30 kg a settimana, cioè circa
 * 0,45-0,90 kg sui 21 giorni. Non è un consiglio mio: è aritmetica sulle regole
 * del piano applicata alle medie, e la decisione resta dell'utente.
 */
export function calorieAdvice(data: AppData): Advice {
  const weeks = weeklyWeights(data).filter((w) => w.days >= NEED_DAYS)
  const waist = waistDelta(data)

  if (weeks.length < 2) {
    return {
      kind: 'attendi',
      title: 'Servono ancora dati',
      detail: `Ti servono almeno due settimane con ${NEED_DAYS}+ pesate per confrontare le medie. Continua a pesarti ogni mattina, appena alzato.`,
      rate: null,
      total: null,
      waist,
      weeksOfData: weeks.length,
    }
  }

  const first = weeks[0]
  const last = weeks[weeks.length - 1]
  const span = Math.max(1, last.week - first.week)
  const total = Math.round((last.avg - first.avg) * 100) / 100
  const rate = Math.round((total / span) * 100) / 100

  if (weeks.length < 3) {
    return {
      kind: 'attendi',
      title: 'Non cambiare ancora',
      detail: `Finora ${signed(total)} kg (${signed(rate)} a settimana), ma il piano chiede 21 giorni completi prima di toccare le calorie.`,
      rate,
      total,
      waist,
      weeksOfData: weeks.length,
    }
  }

  const base = { rate, total, waist, weeksOfData: weeks.length }
  const waistDown = waist !== null && waist <= -0.5
  const waistUp = waist !== null && waist >= 0.5

  // Oltre −1,2 kg in 21 giorni: il piano dice di rallentare per proteggere la massa magra
  if (total <= -1.2) {
    return {
      ...base,
      kind: 'aggiungi',
      title: 'Stai calando troppo in fretta',
      detail: `${signed(total)} kg in tre settimane supera gli 1,2 previsti. Il piano dice di aggiungere circa 100-150 kcal.`,
    }
  }

  // Dentro la fascia −0,45/−0,90 kg sui 21 giorni
  if (total <= -0.45) {
    return {
      ...base,
      kind: 'mantieni',
      title: 'Sei nel bersaglio',
      detail: `${signed(total)} kg in tre settimane (${signed(rate)} a settimana) è dentro la fascia 0,45-0,90 del piano. Se la forza tiene, continua identico per altre tre settimane.`,
    }
  }

  // Peso quasi fermo ma vita in calo: il piano lo chiama ricomposizione
  if (waistDown) {
    return {
      ...base,
      kind: 'mantieni',
      title: 'Probabile ricomposizione',
      detail: `Il peso si è mosso poco (${signed(total)} kg) ma la vita è scesa di ${num(Math.abs(waist))} cm. Il piano dice di continuare identico: se anche i carichi salgono, stai cambiando composizione.`,
    }
  }

  // Vita in aumento nonostante l'aderenza: prima si controlla, non si taglia
  if (waistUp) {
    return {
      ...base,
      kind: 'controlla',
      title: 'Ricontrolla prima di cambiare',
      detail: `La vita è salita di ${num(waist)} cm. Il piano dice di ricontrollare la pesatura degli alimenti e il punto in cui misuri, prima di toccare le calorie.`,
    }
  }

  // Peso quasi invariato e vita invariata
  if (total > -0.15) {
    return {
      ...base,
      kind: 'togli',
      title: 'Il piano prevede -100 kcal',
      detail: `${signed(total)} kg in tre settimane con la vita invariata. Il piano dice di togliere circa 100 kcal al giorno: 25-30 g di riso secco in meno, divisi fra pranzo e cena.`,
    }
  }

  return {
    ...base,
    kind: 'mantieni',
    title: 'Calo lento ma presente',
    detail: `${signed(total)} kg in tre settimane: sotto la fascia 0,45-0,90 ma nella direzione giusta. Guarda anche vita, foto e carichi prima di cambiare qualcosa.`,
  }
}

// ------------------------------------------------------------- PROGRESSIONE

const LEG_IDS = new Set([
  'squat',
  'stacco-rumeno',
  'leg-press',
  'leg-curl-seduto',
  'leg-curl-sdraiato',
  'calf-piedi',
  'calf-seduto',
  'calf-raise',
  'bulgaro',
  'hip-thrust',
  'hack-legpress',
])

export interface Session {
  date: string
  sets: SetLog[]
}

/**
 * Tutte le sedute passate in cui compare un dato esercizio, dalla più recente.
 * `programDay` limita il confronto alle sedute dello stesso tipo: lo stesso
 * esercizio può comparire in due giornate con serie e ripetizioni diverse
 * (es. le estensioni tricipiti in Upper A e in Upper C) e confrontarle
 * darebbe progressioni sbagliate.
 */
export function exerciseHistory(
  data: AppData,
  exerciseId: string,
  programDay?: number,
): Session[] {
  return Object.entries(data.logs)
    .filter(
      ([date]) =>
        programDay === undefined || cyclePosition(data.settings, date).programDay === programDay,
    )
    .map(([date, log]) => ({
      date,
      // I segnaposto a zero lasciati da una serie registrata fuori ordine non contano
      sets: (log.sets[exerciseId] ?? []).filter(isLoggedSet),
    }))
    .filter((s) => s.sets.length > 0)
    .sort((a, b) => parseKey(b.date).getTime() - parseKey(a.date).getTime())
}

export interface ProgressionHint {
  ready: boolean
  message: string
}

/**
 * Regola del piano: quando raggiungi il limite superiore delle ripetizioni in
 * tutte le serie, con tecnica corretta, per due sedute consecutive, aumenti il
 * carico. Parte superiore 1-2,5 kg, gambe 2,5-5 kg.
 */
export function progressionHint(
  data: AppData,
  exercise: Exercise,
  excludeDate?: string,
  programDay?: number,
): ProgressionHint | null {
  const history = exerciseHistory(data, exercise.id, programDay).filter(
    (s) => s.date !== excludeDate,
  )
  if (history.length < 2) return null

  const hitTop = (s: Session) =>
    s.sets.length >= exercise.sets && s.sets.every((set) => set.reps >= exercise.repsMax)

  if (hitTop(history[0]) && hitTop(history[1])) {
    const step = LEG_IDS.has(exercise.id) ? '2,5-5 kg' : '1-2,5 kg'
    return {
      ready: true,
      message: `Due sedute al massimo del range: sali di ${step}`,
    }
  }
  return null
}

/** Ultima seduta registrata per un esercizio, da mostrare come riferimento */
export function lastSession(
  data: AppData,
  exerciseId: string,
  excludeDate?: string,
  programDay?: number,
): Session | null {
  const h = exerciseHistory(data, exerciseId, programDay).filter((s) => s.date !== excludeDate)
  return h[0] ?? null
}

/** Volume totale (kg × ripetizioni) di una seduta, per il grafico dei carichi */
export function sessionVolume(data: AppData, date: string): number {
  const log = data.logs[date]
  if (!log) return 0
  const pos = cyclePosition(data.settings, date)
  if (!dayFor(pos.programDay).workout) return 0
  const exercises = workoutFor(pos, data.settings) ?? []
  let total = 0
  for (const e of exercises) {
    for (const s of log.sets[e.id] ?? []) total += s.weight * s.reps
  }
  return Math.round(total)
}
