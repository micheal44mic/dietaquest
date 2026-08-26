import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { per100, type ResolvedItem } from '../game/nutrition'
import { num } from '../lib/format'
import { sfx } from '../fx/sound'

/** Riga di un alimento: valori della porzione e, se serve, editor del prodotto */
export function FoodRow({ item, readOnly = false }: { item: ResolvedItem; readOnly?: boolean }) {
  const [open, setOpen] = useState(false)
  const a = item.actual

  const riga = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <span className="min-w-0 flex-1 text-sm font-semibold text-ink/85">
          {item.customName ?? item.name} <span className="text-mute">{item.qty}</span>
          {item.custom && (
            <span className="ml-1 rounded bg-grape-soft px-1 text-[9px] font-extrabold text-grape-dark">
              TUO
            </span>
          )}
        </span>
        <span className="shrink-0 text-sm font-extrabold">{a.kcal}</span>
      </div>
      <div className="text-[10px] leading-tight font-bold text-mute">
        {num(a.p)} P · {num(a.c)} C · {num(a.g)} G · {num(a.fiber)} fibre
      </div>
    </>
  )

  if (readOnly) return <div className="py-0.5">{riga}</div>

  return (
    <div className="border-b border-line/60 py-1 last:border-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left">
        {riga}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Editor item={item} onDone={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const CAMPI = [
  ['kcal', 'kcal'],
  ['p', 'P'],
  ['c', 'C'],
  ['g', 'G'],
  ['fiber', 'fibre'],
] as const

function Editor({ item, onDone }: { item: ResolvedItem; onDone: () => void }) {
  const setOverride = useAppStore((s) => s.setOverride)
  const clearOverride = useAppStore((s) => s.clearOverride)
  const salvato = useAppStore((s) => s.overrides[item.id])

  const base = salvato ?? per100(item)
  const [nome, setNome] = useState(salvato?.name ?? '')
  const [v, setV] = useState<Record<string, string>>({
    kcal: String(base.kcal).replace('.', ','),
    p: String(base.p).replace('.', ','),
    c: String(base.c).replace('.', ','),
    g: String(base.g).replace('.', ','),
    fiber: String(base.fiber).replace('.', ','),
  })

  const salva = () => {
    const n = (k: string) => {
      const x = parseFloat((v[k] ?? '').replace(',', '.'))
      return Number.isFinite(x) && x >= 0 ? x : 0
    }
    setOverride(item.id, {
      name: nome.trim() || undefined,
      kcal: n('kcal'),
      p: n('p'),
      c: n('c'),
      g: n('g'),
      fiber: n('fiber'),
    })
    sfx.pop()
    onDone()
  }

  return (
    <div className="mt-1.5 rounded-2xl bg-cream p-3">
      <p className="text-[11px] font-extrabold text-mute">
        Valori per 100 g dall’etichetta del prodotto che usi. Valgono per {item.name.toLowerCase()}{' '}
        in tutti i giorni, anche dove la quantità è diversa.
      </p>

      {/* type="text": su iOS un input number scarta il valore se scrivi la virgola */}
      <input
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder={`Marca (facoltativo) — es. ${item.name}`}
        className="mt-2 w-full rounded-xl border-2 border-line bg-white px-3 py-2 font-bold outline-none focus:border-grape"
      />

      <div className="mt-2 flex gap-1">
        {CAMPI.map(([k, etichetta]) => (
          <label key={k} className="min-w-0 flex-1">
            <span className="block text-center text-[9px] font-extrabold text-mute uppercase">
              {etichetta}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={v[k]}
              onChange={(e) => setV((s) => ({ ...s, [k]: e.target.value }))}
              className="w-full rounded-lg border-2 border-line bg-white px-1 py-1 text-center font-extrabold outline-none focus:border-grape"
            />
          </label>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={salva}
          className="btn3d flex-1 rounded-xl bg-grape py-2 text-sm font-extrabold text-white [--btn-shadow:var(--color-grape-dark)]"
        >
          Salva
        </button>
        {salvato && (
          <button
            onClick={() => {
              clearOverride(item.id)
              onDone()
            }}
            className="btn3d rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
          >
            Ripristina
          </button>
        )}
        <button
          onClick={onDone}
          className="btn3d rounded-xl border-2 border-line bg-white px-3 py-2 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
        >
          Chiudi
        </button>
      </div>
    </div>
  )
}
