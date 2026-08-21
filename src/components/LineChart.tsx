import { motion } from 'framer-motion'
import { fmtShort } from '../lib/dates'
import { num } from '../lib/format'

interface Props {
  points: Array<{ date: string; value: number }>
  color?: string
  unit?: string
}

/** Grafico a linea SVG con disegno animato, pensato per il peso e le misure. */
export function LineChart({ points, color = 'var(--color-sky)', unit = 'kg' }: Props) {
  if (points.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center text-sm font-bold text-mute">
        Registra il primo valore per vedere il grafico 📈
      </div>
    )
  }

  const W = 320
  const H = 140
  const PAD = { top: 16, right: 14, bottom: 22, left: 34 }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 0.5)
  const lo = min - span * 0.15
  const hi = max + span * 0.15

  const x = (i: number) =>
    points.length === 1
      ? (W - PAD.left - PAD.right) / 2 + PAD.left
      : PAD.left + (i / (points.length - 1)) * (W - PAD.left - PAD.right)
  const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom)

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const area = `${path} L ${x(points.length - 1)} ${H - PAD.bottom} L ${x(0)} ${H - PAD.bottom} Z`

  const last = points[points.length - 1]
  const gid = `grad-${color.replace(/[^a-z]/gi, '')}`

  // Con un solo valore le tre linee coinciderebbero: in quel caso ne resta una
  const gridValues =
    max - min < 0.05
      ? [(lo + hi) / 2]
      : [hi - span * 0.15, (lo + hi) / 2, lo + span * 0.15]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridValues.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={W - PAD.right}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--color-line)"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
          <text
            x={PAD.left - 5}
            y={y(v) + 3}
            textAnchor="end"
            fontSize="8"
            fontWeight="800"
            fill="var(--color-mute)"
          >
            {num(v, 1)}
          </text>
        </g>
      ))}

      <motion.path
        d={area}
        fill={`url(#${gid})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />

      {points.map((p, i) => (
        <motion.circle
          key={p.date}
          cx={x(i)}
          cy={y(p.value)}
          r="4"
          fill="white"
          stroke={color}
          strokeWidth="2.5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 300 }}
        />
      ))}

      {/* Etichette prima/ultima data */}
      <text x={x(0)} y={H - 6} textAnchor="middle" fontSize="8" fontWeight="800" fill="var(--color-mute)">
        {fmtShort(points[0].date)}
      </text>
      {points.length > 1 && (
        <text
          x={x(points.length - 1)}
          y={H - 6}
          textAnchor="middle"
          fontSize="8"
          fontWeight="800"
          fill="var(--color-mute)"
        >
          {fmtShort(last.date)}
        </text>
      )}

      {/* Valore ultimo punto */}
      <motion.text
        x={x(points.length - 1)}
        y={y(last.value) - 9}
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={color}
        initial={{ opacity: 0, y: y(last.value) }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {num(last.value)}
        {unit}
      </motion.text>
    </svg>
  )
}
