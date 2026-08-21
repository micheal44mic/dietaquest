import { motion } from 'framer-motion'

export function StreakFlame({ streak }: { streak: number }) {
  const active = streak > 0
  return (
    <div
      className={`flex items-center gap-1 rounded-2xl border-2 px-3 py-1.5 ${
        active ? 'border-tang bg-tang-soft' : 'border-line bg-white'
      }`}
    >
      <motion.span
        className="text-xl"
        animate={active ? { scale: [1, 1.2, 1], rotate: [0, -6, 6, 0] } : {}}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {active ? '🔥' : '🪵'}
      </motion.span>
      <span className={`text-lg font-extrabold ${active ? 'text-tang-dark' : 'text-mute'}`}>
        {streak}
      </span>
    </div>
  )
}
