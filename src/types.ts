export type MealStatus = 'eaten' | 'skipped'

export type DayKind = 'upper' | 'lower' | 'riposo'

/** Un alimento del piano, con i valori nutrizionali della porzione prevista */
export interface FoodItem {
  /** Stabile e condiviso fra i giorni: lega la correzione dell'utente a tutte le occorrenze */
  id: string
  name: string
  /** Testo mostrato, es. "70 g (≈3 fette)" */
  qty: string
  /** Quantità in grammi o ml, per ricalcolare dai valori per 100 g */
  grams: number
  kcal: number
  p: number
  c: number
  g: number
  fiber: number
}

/**
 * Valori del prodotto realmente comprato, presi dall'etichetta.
 * Sono per 100 g proprio perché la stessa voce compare con quantità diverse
 * nei vari giorni: salvando la densità, ogni porzione si ricalcola da sola.
 */
export interface FoodOverride {
  /** Nome del prodotto, se l'utente vuole ricordarsi la marca */
  name?: string
  kcal: number
  p: number
  c: number
  g: number
  fiber: number
}

/** Somma nutrizionale di un pasto o di una giornata */
export interface Nutrients {
  kcal: number
  p: number
  c: number
  g: number
  fiber: number
}

/** Un pasto prescritto dal programma (vive nel codice, non nello storage) */
export interface Meal {
  id: string
  name: string
  emoji: string
  time: string
  items: FoodItem[]
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
  /** id alimento -> valori del prodotto dell'utente, per 100 g */
  overrides: Record<string, FoodOverride>
}
