import type { AppData } from '../types'

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Un import sovrascrive tutto lo storico e non è annullabile: se il file non è
 * davvero un backup di DietaQuest va rifiutato prima di toccare lo store.
 * Un log malformato che arrivasse fino a computeStats manderebbe l'app in crash
 * a ogni avvio, rendendo irraggiungibile anche il pulsante di azzeramento.
 */
export function validateBackup(raw: unknown): AppData | null {
  if (!isObj(raw)) return null
  if (!isObj(raw.logs) || !isObj(raw.body) || !isObj(raw.settings)) return null
  if (typeof raw.settings.startDate !== 'string') return null

  const logsOk = Object.values(raw.logs).every(
    (l) =>
      isObj(l) &&
      isObj(l.meals) &&
      isObj(l.routine) &&
      isObj(l.sets) &&
      typeof l.water === 'number' &&
      typeof l.cardio === 'boolean' &&
      (l.steps === null || typeof l.steps === 'number') &&
      Object.values(l.sets).every(
        (arr) =>
          Array.isArray(arr) &&
          arr.every(
            (s) =>
              isObj(s) &&
              typeof s.weight === 'number' &&
              typeof s.reps === 'number' &&
              (s.rir === null || typeof s.rir === 'number'),
          ),
      ),
  )
  if (!logsOk) return null

  const bodyOk = Object.values(raw.body).every(
    (e) => isObj(e) && Object.values(e).every((v) => typeof v === 'number'),
  )
  if (!bodyOk) return null

  // I backup fatti prima dei prodotti personalizzati non hanno questa chiave
  if (raw.overrides !== undefined) {
    if (!isObj(raw.overrides)) return null
    const ok = Object.values(raw.overrides).every(
      (o) =>
        isObj(o) &&
        (o.name === undefined || typeof o.name === 'string') &&
        ['kcal', 'p', 'c', 'g', 'fiber'].every((k) => typeof o[k] === 'number'),
    )
    if (!ok) return null
  }

  return { ...raw, overrides: raw.overrides ?? {} } as unknown as AppData
}

/** Quanti giorni di storico contiene un backup, per mostrarlo nella conferma */
export const backupSize = (data: AppData) =>
  new Set([...Object.keys(data.logs), ...Object.keys(data.body)]).size
