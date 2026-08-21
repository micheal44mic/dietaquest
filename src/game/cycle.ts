import { DELOAD_AFTER_WEEKS, INTRO_SETS, PROGRAM } from '../data/program'
import type { Exercise, ProgramDay, Settings } from '../types'
import { parseKey } from '../lib/dates'

/** La scheda è settimanale: 5 sedute e 2 giorni senza pesi, ripetuti ogni 7 giorni */
export const CYCLE_LENGTH = 7

const daysBetween = (from: string, to: string) =>
  Math.round((parseKey(to).getTime() - parseKey(from).getTime()) / 86_400_000)

export interface CyclePosition {
  /** 1..7, indice nel programma */
  programDay: number
  /** Numero della settimana dall'inizio, a partire da 1 */
  week: number
  /** Giorni totali dall'inizio, negativo se la data precede l'avvio */
  elapsed: number
  /** Prime due settimane: volume ridotto su laterali e collo */
  isIntro: boolean
  /** Il piano prevede una settimana di scarico dopo 6-8 settimane */
  deloadDue: boolean
  /** La data precede l'inizio del programma: settimana e giorno non hanno senso */
  beforeStart: boolean
}

export function cyclePosition(settings: Settings, date: string): CyclePosition {
  const elapsed = daysBetween(settings.startDate, date) + settings.dayOffset
  // Il modulo di JS è negativo per input negativi: qui serve sempre 0..6
  const slot = ((elapsed % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH
  const week = Math.floor(elapsed / CYCLE_LENGTH) + 1
  return {
    programDay: slot + 1,
    week: Math.max(1, week),
    elapsed,
    isIntro: week <= 2,
    deloadDue: week > DELOAD_AFTER_WEEKS,
    beforeStart: elapsed < 0,
  }
}

export const dayFor = (programDay: number): ProgramDay => PROGRAM[programDay - 1] ?? PROGRAM[0]

/**
 * Rampa di ingresso richiesta dal piano: nelle prime due settimane le alzate
 * laterali scendono a 4 serie e il collo a una serie per direzione. Nella prima
 * settimana si resta a circa 2 RIR anche sugli isolamenti (il collo resta a 3).
 */
export function workoutFor(pos: CyclePosition, _settings: Settings): Exercise[] | undefined {
  const day = dayFor(pos.programDay)
  if (!day.workout) return undefined
  if (!pos.isIntro) return day.workout

  const firstWeek = pos.week <= 1
  return day.workout.map((e) => {
    const sets = INTRO_SETS[e.id] ?? e.sets
    // Il collo va sempre tenuto a 3 RIR, non si abbassa mai
    const rir = firstWeek && e.rir !== '3' ? '2' : e.rir
    return sets === e.sets && rir === e.rir ? e : { ...e, sets, rir }
  })
}

/** Quante serie sono previste in totale per la seduta */
export const totalSets = (exercises: Exercise[] | undefined) =>
  (exercises ?? []).reduce((n, e) => n + e.sets, 0)
