import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { TabBar, type Tab } from './components/TabBar'
import { TodayScreen } from './screens/TodayScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { ProgressScreen } from './screens/ProgressScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { FxLayer } from './fx/FxLayer'
import { Celebrations } from './components/Celebrations'

const SCREENS: Record<Tab, () => React.ReactElement> = {
  oggi: TodayScreen,
  calendario: CalendarScreen,
  progressi: ProgressScreen,
  profilo: ProfileScreen,
}

export default function App() {
  const [tab, setTab] = useState<Tab>('oggi')
  const Screen = SCREENS[tab]

  return (
    /* overflow-x-clip: le transizioni fra tab traslano di 24px e sforerebbero il viewport */
    <div className="min-h-dvh overflow-x-clip">
      <main
        className="mx-auto max-w-md px-4 pb-28"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>

      <TabBar tab={tab} onChange={setTab} />
      <Celebrations />
      <FxLayer />
    </div>
  )
}
