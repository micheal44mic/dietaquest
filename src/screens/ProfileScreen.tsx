import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { useStats } from '../hooks/useStats'
import { useToday } from '../hooks/useToday'
import { BADGES, earnedBadges } from '../game/badges'
import { cyclePosition, dayFor } from '../game/cycle'
import { Mascot } from '../components/Mascot'
import { backupSize, validateBackup } from '../lib/validateBackup'
import { fmtLong, parseKey } from '../lib/dates'
import { checkStorage, type StorageHealth } from '../lib/storage'
import { ALL_FOODS } from '../data/program'
import { num } from '../lib/format'
import type { AppData } from '../types'

function Riga({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 font-bold text-mute">{etichetta}</span>
      <span className="min-w-0 truncate text-right font-extrabold">{valore}</span>
    </div>
  )
}

export function ProfileScreen() {
  const settings = useAppStore((s) => s.settings)
  const setName = useAppStore((s) => s.setName)
  const toggleSound = useAppStore((s) => s.toggleSound)
  const setStartDate = useAppStore((s) => s.setStartDate)
  const shiftDay = useAppStore((s) => s.shiftDay)
  const resetAll = useAppStore((s) => s.resetAll)
  const importData = useAppStore((s) => s.importData)
  const overrides = useAppStore((s) => s.overrides)
  const clearOverride = useAppStore((s) => s.clearOverride)
  const stats = useStats()
  const today = useToday()

  const earned = new Set(earnedBadges(stats))
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null)
  const [pendingImport, setPendingImport] = useState<AppData | null>(null)
  const [health, setHealth] = useState<StorageHealth | null>(null)

  useEffect(() => {
    setHealth(checkStorage())
  }, [])

  const pos = cyclePosition(settings, today)
  const program = dayFor(pos.programDay)

  const flash = (text: string, ok: boolean) => {
    setNotice({ text, ok })
    setTimeout(() => setNotice(null), 3200)
  }

  const exportJson = () => {
    const { logs, body, overrides } = useAppStore.getState()
    const data: AppData = { logs, body, settings, overrides }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dietaquest-backup-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      let parsed: unknown
      try {
        parsed = JSON.parse(String(reader.result))
      } catch {
        flash('Non è un file JSON 😕', false)
        return
      }
      const data = validateBackup(parsed)
      if (!data) {
        flash('Non è un backup di DietaQuest 😕', false)
        return
      }
      // L'import cancella tutto lo storico e non si torna indietro: prima si conferma
      setPendingImport(data)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const confirmImport = () => {
    if (!pendingImport) return
    importData(pendingImport)
    setPendingImport(null)
    flash('Dati importati! 🎉', true)
  }

  return (
    <div className="space-y-4">
      <div className="card flex flex-col items-center p-6 text-center">
        <div className="float-slow">
          <Mascot size={110} />
        </div>
        <input
          value={settings.name}
          onChange={(e) => setName(e.target.value)}
          maxLength={20}
          className="mt-2 w-full bg-transparent text-center text-xl font-extrabold outline-none"
          aria-label="Il tuo nome"
        />
        <div className="mt-1 text-sm font-extrabold text-mute">
          {stats.levelInfo.titleEmoji} {stats.levelInfo.title} · Lv {stats.levelInfo.level}
        </div>
        <div className="mt-3 flex gap-6 text-center">
          <div>
            <div className="text-xl font-extrabold text-sun-dark">{stats.totalXP}</div>
            <div className="text-[10px] font-extrabold text-mute">XP TOTALI</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-tang-dark">{stats.streak}</div>
            <div className="text-[10px] font-extrabold text-mute">STREAK</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-leaf-dark">{earned.size}</div>
            <div className="text-[10px] font-extrabold text-mute">BADGE</div>
          </div>
        </div>
      </div>

      {/* Programma */}
      <div className="card space-y-3 p-4">
        <h2 className="text-base font-extrabold">🗓️ Programma</h2>
        <div className="rounded-2xl bg-cream p-3">
          <div className="text-sm font-extrabold">
            Oggi è il giorno {pos.programDay}: {program.title}
          </div>
          <div className="text-xs font-bold text-mute">
            Settimana {pos.week} · {fmtLong(parseKey(today))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-extrabold text-mute">Data di inizio</span>
          <input
            type="date"
            value={settings.startDate}
            onChange={(e) => e.target.value && setStartDate(e.target.value)}
            className="mt-1 w-full rounded-xl border-2 border-line bg-cream px-3 py-2 font-bold outline-none focus:border-leaf"
          />
        </label>

        <div>
          <span className="text-xs font-extrabold text-mute">
            Ho saltato o sono avanti: sposta il ciclo
          </span>
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => shiftDay(-1)}
              className="btn3d flex-1 rounded-xl border-2 border-line bg-white py-2 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
            >
              ‹ giorno prima
            </button>
            <button
              onClick={() => shiftDay(1)}
              className="btn3d flex-1 rounded-xl border-2 border-line bg-white py-2 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
            >
              giorno dopo ›
            </button>
          </div>
          {settings.dayOffset !== 0 && (
            <p className="mt-1 text-center text-[11px] font-extrabold text-tang-dark">
              Scostamento attuale: {settings.dayOffset > 0 ? '+' : ''}
              {settings.dayOffset} giorni
            </p>
          )}
        </div>

        <p className="text-[11px] font-bold text-mute">
          Il volume sale da solo: prime due settimane di ingresso, poi pieno. Dopo 6-8 settimane
          l’app ti ricorda la settimana di scarico.
        </p>
      </div>

      {/* Badge */}
      <div className="card p-4">
        <h2 className="mb-3 text-base font-extrabold">
          🏅 Badge ({earned.size}/{BADGES.length})
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((b, i) => {
            const has = earned.has(b.id)
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`flex flex-col items-center rounded-2xl border-2 p-2 text-center ${
                  has ? 'border-sun bg-sun-soft' : 'border-line bg-cream opacity-60'
                }`}
              >
                <span className="text-2xl">{has ? b.emoji : '🔒'}</span>
                <span className="mt-1 text-[10px] leading-tight font-extrabold">{b.name}</span>
                <span className="text-[8px] leading-tight font-bold text-mute">{b.desc}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Impostazioni */}
      <div className="card space-y-3 p-4">
        <h2 className="text-base font-extrabold">⚙️ Impostazioni</h2>
        <button
          onClick={toggleSound}
          className="btn3d w-full rounded-2xl border-2 border-line bg-white py-2.5 text-sm font-extrabold [--btn-shadow:var(--color-line)]"
        >
          {settings.sound ? '🔊 Suoni attivi' : '🔇 Suoni spenti'}
        </button>
        <div className="flex gap-2">
          <button
            onClick={exportJson}
            className="btn3d flex-1 rounded-2xl bg-sky py-2.5 text-sm font-extrabold text-white [--btn-shadow:var(--color-sky-dark)]"
          >
            ⬇️ Esporta
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn3d flex-1 rounded-2xl border-2 border-sky bg-white py-2.5 text-sm font-extrabold text-sky-dark [--btn-shadow:var(--color-sky-soft)]"
          >
            ⬆️ Importa
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onImportFile}
          />
        </div>

        {pendingImport && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-tang bg-tang-soft p-3"
          >
            <p className="text-center text-sm font-extrabold text-tang-dark">
              Il backup contiene {backupSize(pendingImport)}{' '}
              {backupSize(pendingImport) === 1 ? 'giorno' : 'giorni'} di dati.
            </p>
            <p className="mt-0.5 text-center text-xs font-bold text-mute">
              Sostituirà tutto quello che hai ora, senza possibilità di tornare indietro.
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={confirmImport}
                className="btn3d flex-1 rounded-2xl bg-tang py-2.5 text-sm font-extrabold text-white [--btn-shadow:var(--color-tang-dark)]"
              >
                Sostituisci
              </button>
              <button
                onClick={() => setPendingImport(null)}
                className="btn3d flex-1 rounded-2xl border-2 border-line bg-white py-2.5 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
              >
                Annulla
              </button>
            </div>
          </motion.div>
        )}

        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl px-3 py-2 text-center text-sm font-extrabold ${
              notice.ok ? 'bg-leaf-soft text-leaf-dark' : 'bg-berry-soft text-berry-dark'
            }`}
          >
            {notice.text}
          </motion.div>
        )}

        {confirmReset ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                resetAll()
                setConfirmReset(false)
              }}
              className="btn3d flex-1 rounded-2xl bg-berry py-2.5 text-sm font-extrabold text-white [--btn-shadow:var(--color-berry-dark)]"
            >
              Sì, cancella tutto
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="btn3d flex-1 rounded-2xl border-2 border-line bg-white py-2.5 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
            >
              Annulla
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-1 text-center text-xs font-extrabold text-berry underline"
          >
            Azzera tutti i dati
          </button>
        )}
      </div>

      {/* I prodotti corretti dall'utente, per ritrovarli senza cercarli fra i pasti */}
      {Object.keys(overrides).length > 0 && (
        <div className="card p-4">
          <h2 className="text-base font-extrabold">🏷️ I tuoi prodotti</h2>
          <p className="mt-0.5 text-xs font-bold text-mute">
            Valori per 100 g che sostituiscono quelli del piano in tutti i giorni.
          </p>
          <div className="mt-2 space-y-1.5">
            {Object.entries(overrides).map(([id, o]) => (
              <div key={id} className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-extrabold">
                    {o.name ?? ALL_FOODS[id] ?? id}
                  </div>
                  <div className="text-[10px] font-bold text-mute">
                    {ALL_FOODS[id] ?? id} · {o.kcal} kcal · {num(o.p)} P · {num(o.c)} C ·{' '}
                    {num(o.g)} G · {num(o.fiber)} fibre per 100 g
                  </div>
                </div>
                <button
                  onClick={() => clearOverride(id)}
                  className="shrink-0 text-xs font-extrabold text-berry underline"
                >
                  ripristina
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostica: serve a capire perché su un certo telefono i dati non restano */}
      <details className="card p-4">
        <summary className="cursor-pointer text-base font-extrabold">
          🩺 Il salvataggio funziona?
        </summary>
        {health && (
          <div className="mt-2 space-y-1 text-sm">
            <Riga
              etichetta="Salvataggio"
              valore={health.usable ? '✅ funziona' : `❌ ${health.error}`}
            />
            <Riga etichetta="Indirizzo" valore={health.origin} />
            <Riga
              etichetta="Aperta da"
              valore={health.standalone ? 'icona sulla Home' : 'browser'}
            />
            <Riga etichetta="Giorni salvati" valore={String(health.savedDays)} />
            <Riga etichetta="Spazio usato" valore={`${(health.bytes / 1024).toFixed(1)} kB`} />
            <p className="pt-1 text-[11px] font-bold text-mute">
              I dati sono legati all’indirizzo qui sopra: cambiandolo riparti da zero. Se «Aperta
              da» dice browser mentre tu la apri dall’icona, sono due archivi diversi.
            </p>
            <button
              onClick={() => setHealth(checkStorage())}
              className="btn3d mt-1 w-full rounded-xl border-2 border-line bg-white py-2 text-sm font-extrabold text-mute [--btn-shadow:var(--color-line)]"
            >
              Ricontrolla
            </button>
          </div>
        )}
      </details>

      <p className="pb-2 text-center text-[10px] font-bold text-mute">
        DietaQuest v0.2 · fatto con 🥑 e WebGPU
      </p>
    </div>
  )
}
