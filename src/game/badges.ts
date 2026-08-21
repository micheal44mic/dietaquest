import type { Stats } from './derive'

export interface Badge {
  id: string
  name: string
  desc: string
  emoji: string
  check: (s: Stats) => boolean
}

/**
 * I `check` devono essere monotoni: una volta veri non possono più tornare falsi,
 * altrimenti un badge già conquistato si ri-blocca e non viene mai più celebrato
 * (seenBadges non si svuota mai). Per questo si usa bestStreak e non streak.
 */
export const BADGES: Badge[] = [
  {
    id: 'first-meal',
    name: 'Prima Forchettata',
    desc: 'Completa il tuo primo pasto',
    emoji: '🍽️',
    check: (s) => s.mealsEaten >= 1,
  },
  {
    id: 'perfect-day',
    name: 'Giornata Perfetta',
    desc: 'Pasti, seduta, creatina e sonno nello stesso giorno',
    emoji: '🌟',
    check: (s) => s.perfectDays >= 1,
  },
  {
    id: 'streak-3',
    name: 'Scintilla',
    desc: '3 giornate perfette di fila',
    emoji: '🔥',
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: 'streak-7',
    name: 'Settimana di Fuoco',
    desc: '7 giornate perfette di fila',
    emoji: '🚒',
    check: (s) => s.bestStreak >= 7,
  },
  {
    id: 'streak-21',
    name: 'Blocco Completo',
    desc: '21 giornate perfette di fila',
    emoji: '👑',
    check: (s) => s.bestStreak >= 21,
  },
  {
    id: 'meals-50',
    name: 'Mezzo Centone',
    desc: '50 pasti completati in totale',
    emoji: '🍱',
    check: (s) => s.mealsEaten >= 50,
  },
  {
    id: 'meals-200',
    name: 'Macchina da Pasti',
    desc: '200 pasti completati in totale',
    emoji: '🤖',
    check: (s) => s.mealsEaten >= 200,
  },
  {
    id: 'workout-1',
    name: 'Primo Sudore',
    desc: 'Completa la prima seduta con i pesi',
    emoji: '💪',
    check: (s) => s.workoutsDone >= 1,
  },
  {
    id: 'workout-10',
    name: 'Palestrato',
    desc: '10 sedute complete',
    emoji: '🏋️',
    check: (s) => s.workoutsDone >= 10,
  },
  {
    id: 'sets-100',
    name: 'Centurione',
    desc: '100 serie registrate',
    emoji: '📓',
    check: (s) => s.setsLogged >= 100,
  },
  {
    id: 'cardio-1',
    name: 'Recupero Attivo',
    desc: 'Completa il primo cardio di recupero',
    emoji: '🚲',
    check: (s) => s.cardioDone >= 1,
  },
  {
    id: 'water-7',
    name: 'Sirena',
    desc: 'Obiettivo acqua raggiunto 7 volte',
    emoji: '🧜',
    check: (s) => s.waterGoalDays >= 7,
  },
  {
    id: 'steps-1',
    name: 'Scarpe Fumanti',
    desc: 'Raggiungi l’obiettivo passi del giorno',
    emoji: '👟',
    check: (s) => s.stepsGoalDays >= 1,
  },
  {
    id: 'weight-14',
    name: 'Fedele alla Bilancia',
    desc: 'Pesati 14 volte: la media conta più del singolo giorno',
    emoji: '⚖️',
    check: (s) => s.weighIns >= 14,
  },
  {
    id: 'level-5',
    name: 'Stella Nascente',
    desc: 'Raggiungi il livello 5',
    emoji: '⭐',
    check: (s) => s.levelInfo.level >= 5,
  },
  {
    id: 'level-10',
    name: 'Superstar',
    desc: 'Raggiungi il livello 10',
    emoji: '🌈',
    check: (s) => s.levelInfo.level >= 10,
  },
]

export const earnedBadges = (s: Stats): string[] => BADGES.filter((b) => b.check(s)).map((b) => b.id)
