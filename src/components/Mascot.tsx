import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export type MascotMood = 'happy' | 'cheer' | 'chill'

/**
 * Vito l'Avocado: la mascotte di DietaQuest.
 * `cheer` alza le braccia e mette gli occhi a stella.
 */
export function Mascot({ mood = 'happy', size = 96 }: { mood?: MascotMood; size?: number }) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const loop = () => {
      timeout = setTimeout(
        () => {
          setBlink(true)
          setTimeout(() => setBlink(false), 130)
          loop()
        },
        2200 + Math.random() * 2600,
      )
    }
    loop()
    return () => clearTimeout(timeout)
  }, [])

  const cheering = mood === 'cheer'

  return (
    <motion.svg
      viewBox="0 0 120 130"
      width={size}
      height={(size * 130) / 120}
      animate={
        cheering
          ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] }
          : { y: [0, -4, 0] }
      }
      transition={{
        duration: cheering ? 0.6 : 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Braccia */}
      <motion.g
        animate={{ rotate: cheering ? -50 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        style={{ originX: '22px', originY: '78px' }}
      >
        <path d="M24 78 Q6 70 8 56" stroke="#2e7d0f" strokeWidth="9" strokeLinecap="round" fill="none" />
      </motion.g>
      <motion.g
        animate={{ rotate: cheering ? 50 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        style={{ originX: '98px', originY: '78px' }}
      >
        <path d="M96 78 Q114 70 112 56" stroke="#2e7d0f" strokeWidth="9" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Corpo a pera */}
      <path
        d="M60 6 C40 6 34 26 32 42 C28 72 36 116 60 116 C84 116 92 72 88 42 C86 26 80 6 60 6 Z"
        fill="#58cc02"
        stroke="#2e7d0f"
        strokeWidth="4"
      />
      {/* Pancia chiara */}
      <path
        d="M60 34 C48 34 44 52 44 68 C44 90 50 104 60 104 C70 104 76 90 76 68 C76 52 72 34 60 34 Z"
        fill="#d7f7b2"
      />
      {/* Nocciolo */}
      <ellipse cx="60" cy="82" rx="12" ry="13" fill="#a5673f" stroke="#7c4a28" strokeWidth="3" />
      <ellipse cx="56" cy="78" rx="4" ry="4.5" fill="#c98c5a" />

      {/* Occhi */}
      {cheering ? (
        <>
          <text x="38" y="56" fontSize="18" textAnchor="middle">⭐</text>
          <text x="82" y="56" fontSize="18" textAnchor="middle">⭐</text>
        </>
      ) : (
        <>
          <ellipse cx="46" cy="50" rx="6.5" ry={blink ? 1 : 8} fill="#2b2b2b" />
          <ellipse cx="74" cy="50" rx="6.5" ry={blink ? 1 : 8} fill="#2b2b2b" />
          {!blink && (
            <>
              <circle cx="48.5" cy="47" r="2.2" fill="#fff" />
              <circle cx="76.5" cy="47" r="2.2" fill="#fff" />
            </>
          )}
        </>
      )}

      {/* Guance */}
      <ellipse cx="38" cy="62" rx="5" ry="3.5" fill="#ffb3ba" opacity="0.8" />
      <ellipse cx="82" cy="62" rx="5" ry="3.5" fill="#ffb3ba" opacity="0.8" />

      {/* Bocca */}
      {cheering ? (
        <path d="M50 64 Q60 76 70 64 Q60 72 50 64 Z" fill="#7c3a1d" stroke="#5c2a12" strokeWidth="2" />
      ) : (
        <path d="M52 64 Q60 71 68 64" stroke="#5c2a12" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}

      {/* Fogliolina */}
      <motion.path
        d="M60 8 Q68 -4 80 2 Q70 8 62 10 Z"
        fill="#8ee000"
        stroke="#2e7d0f"
        strokeWidth="3"
        animate={{ rotate: [0, 8, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ originX: '60px', originY: '10px' }}
      />
    </motion.svg>
  )
}
