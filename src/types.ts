export type MealStatus = 'eaten' | 'skipped'

export type DayKind = 'upper' | 'lower' | 'riposo'

/** Un pasto prescritto dal programma (vive nel codice, non nello storage) */
export interface Meal {
  id: string
  name: string
  emoji: string
  time: string
  /** Riga introduttiva tipo "Pancake preparato con:" */
  intro?: string
  items: string[]
  /** Voci da aggiungere dopo la preparazione */
  extra?: string[]
  note?: string
}

export interface Exercise {
  id: string
  name: string
  sets: number
  repsMin: number
  repsMax: number
  /** Testo del bersaglio RIR, es. "3" oppure "1-2" */
  rir: string
  perSide?: boolean
  /** Avvertenza breve, sempre visibile */
  note?: string
  /** Descrizione tecnica, si apre su richiesta */
  cue?: string
  /** Etichetta della superserie, es. "A1" */
  superset?: string
  /** Recupero in secondi, come da scheda */
  restSec: number
}

export interface Cardio {
  time: string
  title: string
  steps: string[]
}

export interface Targets {
  kcal: string
  protein: string
  carbs: string
  fat: string
}

export interface ProgramDay {
  /** 1..7 */
  day: number
  weekday: string
  title: string
  /** Riga di dettaglio: quali gruppi lavora la seduta */
  subtitle?: string
  kind: DayKind
  steps: number
  meals: Meal[]
  /** Calorie e macro della giornata: differiscono fra pesi e recupero */
  targets: Targets
  /** Lettera del modello alimentare del piano (A-E) */
  dietModel: string
  workout?: Exercise[]
  /** Nota generale della seduta, mostrata in testa */
  rirNote?: string
  cardio?: Cardio
  /** Promemoria speciali del giorno */
  notes?: string[]
}

/** Una serie registrata durante l'allenamento */
export interface SetLog {
  weight: number
  reps: number
  rir: number | null
}

export interface DayLog {
  meals: Record<string, MealStatus | undefined>
  /** id della routine -> completata */
  routine: Record<string, boolean | undefined>
  /** id esercizio -> serie registrate, in ordine */
  sets: Record<string, SetLog[] | undefined>
  water: number
  steps: number | null
  cardio: boolean
}

export interface BodyEntry {
  weight?: number
  vita?: number
  fianchi?: number
  petto?: number
  braccio?: number
}

export interface Settings {
  name: string
  waterGoal: number
  sound: boolean
  /** Data di inizio del programma, formato YYYY-MM-DD */
  startDate: string
  /** Scorrimento manuale del ciclo, in giorni */
  dayOffset: number
}

export interface AppData {
  logs: Record<string, DayLog>
  body: Record<string, BodyEntry>
  settings: Settings
}
