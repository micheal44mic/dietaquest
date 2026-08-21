import { motion } from 'framer-motion'

export type Tab = 'oggi' | 'calendario' | 'progressi' | 'profilo'

const TABS: Array<{ id: Tab; label: string; emoji: string }> = [
  { id: 'oggi', label: 'Oggi', emoji: '🍽️' },
  { id: 'calendario', label: 'Calendario', emoji: '📅' },
  { id: 'progressi', label: 'Progressi', emoji: '📈' },
  { id: 'profilo', label: 'Profilo', emoji: '🥑' },
]

export function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-line bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className="relative flex flex-1 flex-col items-center gap-0.5 py-2"
            >
              {active && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-x-3 inset-y-1 rounded-2xl bg-leaf-soft"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.span
                className="relative z-10 text-2xl"
                animate={active ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {t.emoji}
              </motion.span>
              <span
                className={`relative z-10 text-[10px] font-extrabold ${
                  active ? 'text-leaf-dark' : 'text-mute'
                }`}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
