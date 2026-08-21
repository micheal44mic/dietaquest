export const STORAGE_KEY = 'dietaquest-v2'
const PROBE_KEY = 'dietaquest-probe'

export interface StorageHealth {
  /** Si riesce davvero a scrivere e rileggere? */
  usable: boolean
  /** Motivo del fallimento, se c'è */
  error: string | null
  /** L'app è stata aperta dall'icona sulla Home invece che dal browser */
  standalone: boolean
  origin: string
  /** Giorni presenti nel salvataggio */
  savedDays: number
  /** Byte occupati dal salvataggio */
  bytes: number
}

/**
 * Su iPhone il salvataggio può fallire in silenzio: navigazione privata,
 * "Blocca tutti i cookie", oppure un browser incorporato dentro un'altra app.
 * In quei casi i dati vivono solo in memoria e spariscono alla chiusura, quindi
 * conviene accorgersene subito invece che dopo una giornata di registrazioni.
 */
export function checkStorage(): StorageHealth {
  const standalone =
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      // Safari su iOS espone questo flag solo per le app aggiunte alla Home
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true)

  const base = {
    standalone,
    origin: typeof location !== 'undefined' ? location.origin : '—',
    savedDays: 0,
    bytes: 0,
  }

  try {
    localStorage.setItem(PROBE_KEY, '1')
    const readBack = localStorage.getItem(PROBE_KEY)
    localStorage.removeItem(PROBE_KEY)
    if (readBack !== '1') {
      return { ...base, usable: false, error: 'La scrittura non viene riletta' }
    }
  } catch (e) {
    return {
      ...base,
      usable: false,
      error: e instanceof Error ? e.message : 'localStorage non disponibile',
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  let savedDays = 0
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { state?: { logs?: object; body?: object } }
      savedDays = new Set([
        ...Object.keys(parsed.state?.logs ?? {}),
        ...Object.keys(parsed.state?.body ?? {}),
      ]).size
    } catch {
      savedDays = 0
    }
  }

  return { ...base, usable: true, error: null, savedDays, bytes: raw?.length ?? 0 }
}
