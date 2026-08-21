import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useStats } from '../hooks/useStats'
import { BADGES } from '../game/badges'
import { earnedBadges } from '../game/badges'
import { Mascot } from './Mascot'
import { fx } from '../fx/FxLayer'
import { sfx } from '../fx/sound'

/**
 * Osserva le statistiche derivate e fa partire le celebrazioni:
 * modale di level-up e toast dei badge appena sbloccati.
 */
export function Celebrations() {
  const stats = useStats()
  const seenLevel = useAppStore((s) => s.seenLevel)
  const seenBadges = useAppStore((s) => s.seenBadges)
  const silentSync = useAppStore((s) => s.silentSync)
  const markLevelSeen = useAppStore((s) => s.markLevelSeen)
  const markBadgesSeen = useAppStore((s) => s.markBadgesSeen)
  const clearSilentSync = useAppStore((s) => s.clearSilentSync)

  const [levelModal, setLevelModal] = useState<number | null>(null)
  const [toastQueue, setToastQueue] = useState<string[]>([])
  const firstRun = useRef(true)

  // Al primo avvio e dopo un import lo storico si allinea senza festeggiamenti
  const silent = firstRun.current || silentSync

  // Level-up
  useEffect(() => {
    if (stats.levelInfo.level > seenLevel) {
      markLevelSeen(stats.levelInfo.level)
      if (!silent) {
        setLevelModal(stats.levelInfo.level)
        sfx.levelUp()
        fx.levelUp()
      }
    } else if (stats.levelInfo.level < seenLevel) {
      markLevelSeen(stats.levelInfo.level)
    }
  }, [stats.levelInfo.level, seenLevel, silent, markLevelSeen])

  // Badge
  useEffect(() => {
    const earned = earnedBadges(stats)
    const fresh = earned.filter((id) => !seenBadges.includes(id))
    if (fresh.length > 0) {
      markBadgesSeen(fresh)
      if (!silent) {
        setToastQueue((q) => [...q, ...fresh])
        sfx.badge()
      }
    }
    firstRun.current = false
    if (silentSync) clearSilentSync()
  }, [stats, seenBadges, silent, silentSync, markBadgesSeen, clearSilentSync])

  // Consuma la coda dei toast uno alla volta
  const current = toastQueue[0]
  useEffect(() => {
    if (!current) return
    const t = setTimeout(() => setToastQueue((q) => q.slice(1)), 3200)
    return () => clearTimeout(t)
  }, [current])

  const badge = BADGES.find((b) => b.id === current)

  return (
    <>
      {/* Toast badge */}
      <AnimatePresence>
        {badge && (
          <motion.div
            key={badge.id}
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="fixed inset-x-4 top-4 z-[55] mx-auto max-w-sm"
            style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
          >
            <div className="card flex items-center gap-3 border-sun! bg-sun-soft! p-3 shadow-[0_3px_0_var(--color-sun)]!">
              <motion.span
                className="text-3xl"
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8 }}
              >
                {badge.emoji}
              </motion.span>
              <div>
                <div className="text-xs font-extrabold tracking-wide text-sun-dark uppercase">
                  Badge sbloccato!
                </div>
                <div className="text-base font-extrabold">{badge.name}</div>
                <div className="text-xs font-bold text-mute">{badge.desc}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale level-up */}
      <AnimatePresence>
        {levelModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] flex items-center justify-center bg-ink/50 p-6"
            onClick={() => setLevelModal(null)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 60 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="card w-full max-w-xs p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center">
                <Mascot mood="cheer" size={110} />
              </div>
              <motion.div
                className="mt-2 text-4xl font-extrabold text-sun-dark"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 0.5 }}
              >
                LIVELLO {levelModal}!
              </motion.div>
              <p className="mt-1 text-sm font-bold text-mute">
                Vito è fiero di te. Continua così! 🎉
              </p>
              <button
                onClick={() => setLevelModal(null)}
                className="btn3d mt-4 w-full rounded-2xl bg-leaf py-3 text-base font-extrabold text-white [--btn-shadow:var(--color-leaf-dark)]"
              >
                GRANDE! 💚
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
