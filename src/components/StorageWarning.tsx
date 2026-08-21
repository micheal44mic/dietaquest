import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { checkStorage, type StorageHealth } from '../lib/storage'

/**
 * Se il salvataggio non funziona i dati vivono solo in memoria e spariscono
 * alla chiusura: meglio dirlo subito e in grande, prima che l'utente registri
 * un'intera giornata a vuoto.
 */
export function StorageWarning() {
  const [health, setHealth] = useState<StorageHealth | null>(null)

  useEffect(() => {
    setHealth(checkStorage())
  }, [])

  if (!health || health.usable) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-berry! bg-berry-soft! p-4"
    >
      <h3 className="text-base font-extrabold text-berry-dark">⚠️ I dati non vengono salvati</h3>
      <p className="mt-1 text-xs font-bold text-ink/80">
        Questo browser non permette di salvare: quello che segni sparisce quando chiudi l’app.
      </p>
      <ul className="mt-2 space-y-0.5 text-xs font-semibold text-ink/75">
        <li>• Se sei in navigazione privata, esci e riapri normalmente</li>
        <li>• Se hai aperto il link dentro un’altra app, aprilo direttamente in Safari</li>
        <li>• Controlla Impostazioni → Safari che «Blocca tutti i cookie» sia spento</li>
      </ul>
      <p className="mt-2 text-[10px] font-bold text-mute">Dettaglio tecnico: {health.error}</p>
    </motion.div>
  )
}
