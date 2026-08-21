import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppData, BodyEntry, DayLog, MealStatus, SetLog, Settings } from '../types'
import { PROGRAM_START } from '../data/program'
import { STORAGE_KEY } from '../lib/storage'

const emptyLog = (): DayLog => ({
  meals: {},
  routine: {},
  sets: {},
  water: 0,
  steps: null,
  cardio: false,
})

export const DEFAULT_SETTINGS: Settings = {
  name: 'Campione',
  waterGoal: 8,
  sound: true,
  startDate: PROGRAM_START,
  dayOffset: 0,
}

interface AppState extends AppData {
  seenBadges: string[]
  seenLevel: number
  /** Dopo un import lo storico non va rifestaggiato: le celebrazioni si allineano in silenzio */
  silentSync: boolean

  setMealStatus: (date: string, mealId: string, status: MealStatus | undefined) => void
  toggleRoutine: (date: string, itemId: string) => void
  setWater: (date: string, glasses: number) => void
  setSteps: (date: string, steps: number | null) => void
  setCardio: (date: string, done: boolean) => void
  saveSet: (date: string, exerciseId: string, index: number, set: SetLog) => void
  clearSet: (date: string, exerciseId: string, index: number) => void
  setBody: (date: string, entry: Partial<BodyEntry>) => void

  setName: (name: string) => void
  toggleSound: () => void
  setStartDate: (date: string) => void
  shiftDay: (delta: number) => void

  markBadgesSeen: (ids: string[]) => void
  markLevelSeen: (level: number) => void
  clearSilentSync: () => void
  importData: (data: AppData) => void
  resetAll: () => void
}

const patchLog = (
  state: AppState,
  date: string,
  patch: Partial<DayLog> | ((log: DayLog) => Partial<DayLog>),
) => {
  const current = state.logs[date] ?? emptyLog()
  const applied = typeof patch === 'function' ? patch(current) : patch
  return { logs: { ...state.logs, [date]: { ...current, ...applied } } }
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      logs: {},
      body: {},
      settings: { ...DEFAULT_SETTINGS },
      seenBadges: [],
      seenLevel: 1,
      silentSync: false,

      setMealStatus: (date, mealId, status) =>
        set((s) => patchLog(s, date, (log) => ({ meals: { ...log.meals, [mealId]: status } }))),

      toggleRoutine: (date, itemId) =>
        set((s) =>
          patchLog(s, date, (log) => ({
            routine: { ...log.routine, [itemId]: !log.routine[itemId] },
          })),
        ),

      setWater: (date, glasses) => set((s) => patchLog(s, date, { water: Math.max(0, glasses) })),

      setSteps: (date, steps) =>
        set((s) => patchLog(s, date, { steps: steps === null ? null : Math.max(0, steps) })),

      setCardio: (date, done) => set((s) => patchLog(s, date, { cardio: done })),

      saveSet: (date, exerciseId, index, value) =>
        set((s) =>
          patchLog(s, date, (log) => {
            const list = [...(log.sets[exerciseId] ?? [])]
            list[index] = value
            // Un buco lasciato da una serie saltata romperebbe i conteggi
            for (let i = 0; i < list.length; i++) {
              if (!list[i]) list[i] = { weight: 0, reps: 0, rir: null }
            }
            return { sets: { ...log.sets, [exerciseId]: list } }
          }),
        ),

      clearSet: (date, exerciseId, index) =>
        set((s) =>
          patchLog(s, date, (log) => {
            const list = [...(log.sets[exerciseId] ?? [])]
            list.splice(index, 1)
            const sets = { ...log.sets }
            if (list.length === 0) delete sets[exerciseId]
            else sets[exerciseId] = list
            return { sets }
          }),
        ),

      setBody: (date, entry) =>
        set((s) => {
          const merged: BodyEntry = { ...(s.body[date] ?? {}), ...entry }
          for (const k of Object.keys(merged) as Array<keyof BodyEntry>) {
            if (merged[k] === undefined) delete merged[k]
          }
          const body = { ...s.body }
          if (Object.keys(merged).length === 0) delete body[date]
          else body[date] = merged
          return { body }
        }),

      setName: (name) => set((s) => ({ settings: { ...s.settings, name } })),

      toggleSound: () => set((s) => ({ settings: { ...s.settings, sound: !s.settings.sound } })),

      setStartDate: (date) =>
        set((s) => ({ settings: { ...s.settings, startDate: date, dayOffset: 0 } })),

      shiftDay: (delta) =>
        set((s) => ({ settings: { ...s.settings, dayOffset: s.settings.dayOffset + delta } })),

      markBadgesSeen: (ids) => set((s) => ({ seenBadges: [...new Set([...s.seenBadges, ...ids])] })),

      markLevelSeen: (level) => set(() => ({ seenLevel: level })),

      clearSilentSync: () => set(() => ({ silentSync: false })),

      importData: (data) =>
        set(() => ({
          logs: data.logs ?? {},
          body: data.body ?? {},
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
          silentSync: true,
        })),

      resetAll: () =>
        set(() => ({
          logs: {},
          body: {},
          settings: { ...DEFAULT_SETTINGS },
          seenBadges: [],
          seenLevel: 1,
          silentSync: false,
        })),
    }),
    {
      name: STORAGE_KEY,
      /**
       * Il merge predefinito di zustand è superficiale: uno stato salvato
       * parziale (versione più vecchia, backup a mano) sostituirebbe in blocco
       * `settings` lasciando campi mancanti, e waterGoal/startDate assenti
       * fanno diventare NaN gli XP. Qui si ricostruisce sempre dai default.
       */
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<AppState>
        return {
          ...current,
          logs: p.logs ?? {},
          body: p.body ?? {},
          settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) },
          seenBadges: p.seenBadges ?? [],
          seenLevel: p.seenLevel ?? 1,
          silentSync: false,
        }
      },
    },
  ),
)
