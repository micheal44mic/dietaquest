import { motion } from 'framer-motion'
import { fmtLong, parseKey } from '../lib/dates'

interface Props {
  date: string
  offset: number
  onShift: (delta: number) => void
  onToday: () => void
}

/** Frecce per scorrere i giorni: indietro per correggere, avanti per prepararsi */
export function DayNav({ date, offset, onShift, onToday }: Props) {
  const label =
    offset === 0
      ? 'Oggi'
      : offset === 1
        ? 'Domani'
        : offset === -1
          ? 'Ieri'
          : offset > 0
            ? `Fra ${offset} giorni`
            : `${-offset} giorni fa`

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onShift(-1)}
        aria-label="Giorno precedente"
        className="btn3d shrink-0 rounded-xl border-2 border-line bg-white px-3 py-2 text-lg leading-none font-extrabold text-mute [--btn-shadow:var(--color-line)]"
      >
        ‹
      </button>

      <div className="min-w-0 flex-1 text-center">
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="truncate text-sm font-extrabold capitalize"
        >
          {fmtLong(parseKey(date))}
        </motion.div>
        {offset === 0 ? (
          <span className="text-[10px] font-extrabold tracking-wide text-leaf-dark uppercase">
            Oggi
          </span>
        ) : (
          <button
            onClick={onToday}
            className="text-[10px] font-extrabold tracking-wide text-tang-dark uppercase underline"
          >
            {label} · torna a oggi
          </button>
        )}
      </div>

      <button
        onClick={() => onShift(1)}
        aria-label="Giorno successivo"
        className="btn3d shrink-0 rounded-xl border-2 border-line bg-white px-3 py-2 text-lg leading-none font-extrabold text-mute [--btn-shadow:var(--color-line)]"
      >
        ›
      </button>
    </div>
  )
}
