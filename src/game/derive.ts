import type { AppData, DayLog, SetLog } from '../types'
import { ROUTINE } from '../data/routine'
import { addDays, dateKey, parseKey, todayKey } from '../lib/dates'
import { cyclePosition, dayFor, totalSets, workoutFor } from './cycle'
import { levelFromXP, type LevelInfo } from './xp'

export const XP = {
  meal: 40,
  mealSkipped: 5,
  allMeals: 100,
  routineItem: 10,
  allRoutine: 40,
  set: 8,
  workoutComplete: 80,
  cardio: 70,
  stepsGoal: 40,
  waterGlass: 5,
  weightLog: 20,
} as const

export interface DayStats {
  mealsEaten: number
  mealsSkipped: number
  mealsTotal: number
  routineDone: number
  routineTotal: number
  setsLogged: number
  setsTotal: number
  workoutComplete: boolean
  cardioDone: boolean
  /** L'impegno principale del giorno: pesi oppure cardio facile */
  mainDone: boolean
  stepsGoal: number
  stepsReached: boolean
  perfect: boolean
  xp: number
}

export interface Stats {
  totalXP: number
  levelInfo: LevelInfo
  streak: number
  bestStreak: number
  perfectDays: number
  mealsEaten: number
  workoutsDone: number
  cardioDone: number
  setsLogged: number
  stepsGoalDays: number
  waterGoalDays: number
  weighIns: number
  perDay: Record<string, DayStats>
}

const EMPTY: DayLog = {
  meals: {},
  routine: {},
  sets: {},
  water: 0,
  steps: null,
  cardio: false,
}

export const emptyLog = (): DayLog => ({ ...EMPTY, meals: {}, routine: {}, sets: {} })

/**
 * Registrando la serie 3 prima della 1, lo store riempie i buchi con
 * segnaposto a zero: quelli non sono serie fatte e non vanno contati.
 */
export const isLoggedSet = (s: SetLog | undefined): boolean => Boolean(s) && s!.reps > 0

/** Voci di routine attive in un dato giorno (il secondo giro di mobilità solo senza pesi) */
export const routineFor = (isRestDay: boolean) =>
  ROUTINE.filter((r) => !r.recoveryOnly || isRestDay)

export function computeDayStats(data: AppData, key: string): DayStats {
  const log = data.logs[key] ?? EMPTY
  const pos = cyclePosition(data.settings, key)
  const program = dayFor(pos.programDay)
  const exercises = workoutFor(pos, data.settings)
  const routine = routineFor(program.kind === 'riposo')

  let xp = 0

  let mealsEaten = 0
  let mealsSkipped = 0
  for (const meal of program.meals) {
    const st = log.meals[meal.id]
    if (st === 'eaten') {
      mealsEaten += 1
      xp += XP.meal
    } else if (st === 'skipped') {
      mealsSkipped += 1
      xp += XP.mealSkipped
    }
  }
  const allMeals = mealsEaten === program.meals.length
  if (allMeals) xp += XP.allMeals

  const routineDone = routine.filter((r) => log.routine[r.id]).length
  xp += routineDone * XP.routineItem
  if (routineDone === routine.length) xp += XP.allRoutine

  const setsTotal = totalSets(exercises)
  let setsLogged = 0
  for (const e of exercises ?? []) {
    setsLogged += Math.min((log.sets[e.id] ?? []).filter(isLoggedSet).length, e.sets)
  }
  xp += setsLogged * XP.set
  const workoutComplete = setsTotal > 0 && setsLogged >= setsTotal
  if (workoutComplete) xp += XP.workoutComplete

  const cardioDone = Boolean(program.cardio && log.cardio)
  if (cardioDone) xp += XP.cardio

  const stepsReached = log.steps !== null && log.steps >= program.steps
  if (stepsReached) xp += XP.stepsGoal

  xp += Math.min(log.water, data.settings.waterGoal) * XP.waterGlass
  if (data.body[key]?.weight !== undefined) xp += XP.weightLog

  // Nei giorni senza pesi conta il cardio; se un giorno non prevede nulla,
  // l'impegno principale è considerato assolto
  const mainDone = program.workout ? workoutComplete : program.cardio ? cardioDone : true

  // La giornata perfetta segue le priorità del piano: pasti, seduta, creatina, sonno
  const perfect =
    allMeals && mainDone && Boolean(log.routine.creatina) && Boolean(log.routine.sonno)

  return {
    mealsEaten,
    mealsSkipped,
    mealsTotal: program.meals.length,
    routineDone,
    routineTotal: routine.length,
    setsLogged,
    setsTotal,
    workoutComplete,
    cardioDone,
    mainDone,
    stepsGoal: program.steps,
    stepsReached,
    perfect,
    xp,
  }
}

/**
 * Tutte le statistiche di gioco sono derivate dai log grezzi: niente XP salvati,
 * quindi cambiare le regole non lascia mai lo storico incoerente.
 */
export function computeStats(data: AppData, today: string = todayKey()): Stats {
  const keys = new Set([...Object.keys(data.logs), ...Object.keys(data.body)])
  const perDay: Record<string, DayStats> = {}

  let totalXP = 0
  let perfectDays = 0
  let mealsEaten = 0
  let workoutsDone = 0
  let cardioDone = 0
  let setsLogged = 0
  let stepsGoalDays = 0
  let waterGoalDays = 0
  let weighIns = 0

  for (const key of keys) {
    const ds = computeDayStats(data, key)
    perDay[key] = ds
    totalXP += ds.xp
    if (ds.perfect) perfectDays += 1
    mealsEaten += ds.mealsEaten
    if (ds.workoutComplete) workoutsDone += 1
    if (ds.cardioDone) cardioDone += 1
    setsLogged += ds.setsLogged
    if (ds.stepsReached) stepsGoalDays += 1
    if ((data.logs[key]?.water ?? 0) >= data.settings.waterGoal) waterGoalDays += 1
    if (data.body[key]?.weight !== undefined) weighIns += 1
  }

  // Streak viva: se oggi non è ancora perfetto, la catena resta contando da ieri
  let streak = 0
  const todayDate = parseKey(today)
  let cursor = perDay[today]?.perfect ? todayDate : addDays(todayDate, -1)
  while (perDay[dateKey(cursor)]?.perfect) {
    streak += 1
    cursor = addDays(cursor, -1)
  }

  // Run più lunga di sempre: i badge la usano per restare conquistati per sempre
  let bestStreak = 0
  let run = 0
  let prevKey: string | null = null
  for (const key of Object.keys(perDay)
    .filter((k) => perDay[k].perfect)
    .sort()) {
    run = prevKey !== null && dateKey(addDays(parseKey(prevKey), 1)) === key ? run + 1 : 1
    if (run > bestStreak) bestStreak = run
    prevKey = key
  }

  return {
    totalXP,
    levelInfo: levelFromXP(totalXP),
    streak,
    bestStreak,
    perfectDays,
    mealsEaten,
    workoutsDone,
    cardioDone,
    setsLogged,
    stepsGoalDays,
    waterGoalDays,
    weighIns,
    perDay,
  }
}
