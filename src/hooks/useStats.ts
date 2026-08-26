import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { computeStats } from '../game/derive'
import { useToday } from './useToday'

/**
 * Statistiche di gioco derivate dai log: si ricalcolano quando cambiano i dati
 * e al cambio di giorno, perché la streak dipende da che giorno è oggi.
 */
export function useStats() {
  const logs = useAppStore((s) => s.logs)
  const body = useAppStore((s) => s.body)
  const settings = useAppStore((s) => s.settings)
  const overrides = useAppStore((s) => s.overrides)
  const today = useToday()

  return useMemo(
    () => computeStats({ logs, body, settings, overrides }, today),
    [logs, body, settings, overrides, today],
  )
}
