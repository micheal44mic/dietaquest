import { useEffect, useState } from 'react'
import { todayKey } from '../lib/dates'

/**
 * Chiave del giorno corrente che si aggiorna da sola a mezzanotte
 * e quando l'app torna in primo piano (PWA riaperta il giorno dopo).
 */
export function useToday(): string {
  const [key, setKey] = useState(todayKey)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const schedule = () => {
      const now = new Date()
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2)
      timer = setTimeout(() => {
        setKey(todayKey())
        schedule()
      }, midnight.getTime() - now.getTime())
    }
    schedule()

    const onVisible = () => {
      if (document.visibilityState === 'visible') setKey(todayKey())
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return key
}
