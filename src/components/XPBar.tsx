import { motion } from 'framer-motion'
import type { LevelInfo } from '../game/xp'

export function XPBar({ info }: { info: LevelInfo }) {
  const pct = Math.min(100, (info.into / info.need) * 100)
  return (
    <div className="card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sun text-base font-extrabold text-white shadow-[0_3px_0_var(--color-sun-dark)]">
            {info.level}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold">
              {info.titleEmoji} {info.title}
            </div>
            <div className="text-xs font-bold text-mute">Livello {info.level}</div>
          </div>
        </div>
        <div className="text-xs font-extrabold text-mute">
          {info.into}/{info.need} XP
        </div>
      </div>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-sun-soft">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-sun to-tang"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
