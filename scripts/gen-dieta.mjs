// Genera il blocco DIETA di src/data/program.ts leggendo il piano in formato
// testo. Trascrivere a mano 130 alimenti con 5 valori ciascuno sarebbe troppo
// facile da sbagliare: qui i numeri arrivano direttamente dalla fonte.
//
// Uso: node scripts/gen-dieta.mjs <file-del-piano.txt>
import { readFileSync, writeFileSync } from 'node:fs'

const FONTE = process.argv[2] ?? 'C:/Users/michi/Downloads/dieta_settimanale_testo_mandorle.txt'
const TARGET = 'src/data/program.ts'

const NOMI_PASTO = {
  COLAZIONE: 'colazione',
  PRANZO: 'pranzo',
  'PRE-WORKOUT': 'pre',
  SPUNTINO: 'spuntino',
  CENA: 'cena',
}

const num = (s) => Number(String(s).replace(',', '.'))

/** Id stabile: lega fra loro lo stesso alimento nei sette giorni */
const slug = (nome) =>
  nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// ------------------------------------------------------------------ parsing
const testo = readFileSync(FONTE, 'utf8')
const giorni = {}
let g = null
let pasto = null

for (const riga of testo.split(/\r?\n/)) {
  const mg = riga.match(/^GIORNO (\d) -/)
  if (mg) {
    g = Number(mg[1])
    giorni[g] = { pasti: {}, ordine: [] }
    pasto = null
    continue
  }
  const mp = riga.match(/^(COLAZIONE|PRANZO|PRE-WORKOUT|SPUNTINO|CENA) - ORE (\d{2}:\d{2})/)
  if (mp) {
    pasto = NOMI_PASTO[mp[1]]
    giorni[g].pasti[pasto] = { ora: mp[2], items: [] }
    giorni[g].ordine.push(pasto)
    continue
  }
  const ma = riga.match(
    /^- (.+?) \| quantita: (.+?) \| kcal: ([\d.,]+) \| P: ([\d.,]+) g \| C: ([\d.,]+) g \| G: ([\d.,]+) g \| fibre: ([\d.,]+) g/,
  )
  if (ma && g && pasto) {
    const [, nome, qta, kcal, p, c, gr, fib] = ma
    const grammi = num(qta.match(/^([\d.,]+)/)[1])
    giorni[g].pasti[pasto].items.push({
      id: slug(nome),
      name: nome.trim(),
      qty: qta.trim(),
      grams: grammi,
      kcal: num(kcal),
      p: num(p),
      c: num(c),
      g: num(gr),
      fiber: num(fib),
    })
  }
}

// -------------------------------------------------- controlli prima di scrivere
const totaliDichiarati = [...testo.matchAll(/TOTALE GIORNO \| kcal: (\d+)/g)].map((m) => Number(m[1]))
let problemi = 0

for (let d = 1; d <= 7; d++) {
  const somma = Object.values(giorni[d].pasti)
    .flatMap((p) => p.items)
    .reduce((t, i) => t + i.kcal, 0)
  const scarto = Math.abs(somma - totaliDichiarati[d - 1])
  if (scarto > 2) {
    console.error(`G${d}: somma alimenti ${somma} kcal, totale dichiarato ${totaliDichiarati[d - 1]}`)
    problemi++
  }
}

// Anche i totali di ogni pasto devono tornare: se il parsing perdesse una riga,
// il totale del giorno potrebbe comunque restare nella tolleranza
const totaliPasto = [...testo.matchAll(/TOTALE PASTO \| kcal: (\d+)/g)].map((m) => Number(m[1]))
const pastiInOrdine = []
for (let d = 1; d <= 7; d++) {
  for (const nome of giorni[d].ordine) pastiInOrdine.push([d, nome, giorni[d].pasti[nome]])
}
if (pastiInOrdine.length !== totaliPasto.length) {
  console.error(`${pastiInOrdine.length} pasti letti, ${totaliPasto.length} totali dichiarati`)
  problemi++
} else {
  pastiInOrdine.forEach(([d, nome, p], k) => {
    const somma = p.items.reduce((t, i) => t + i.kcal, 0)
    if (Math.abs(somma - totaliPasto[k]) > 1) {
      console.error(`G${d} ${nome}: ${somma} kcal, dichiarati ${totaliPasto[k]}`)
      problemi++
    }
  })
}

// Lo stesso id deve avere sempre la stessa densita' per 100 g, altrimenti una
// correzione dell'utente darebbe risultati incoerenti fra i giorni.
// La fonte arrotonda a kcal intere, quindi su porzioni piccole la densita'
// oscilla parecchio (8 g di mandorle: 1 kcal di arrotondamento = 12 kcal/100 g).
// Il confronto va fatto sulla porzione, non sulla densita'.
const densita = new Map()
for (let d = 1; d <= 7; d++) {
  for (const p of Object.values(giorni[d].pasti)) {
    for (const i of p.items) {
      const per100 = (i.kcal / i.grams) * 100
      const rif = densita.get(i.id)
      if (rif === undefined) {
        densita.set(i.id, per100)
        continue
      }
      const attese = (rif * i.grams) / 100
      if (Math.abs(attese - i.kcal) > 1.5) {
        console.error(
          `${i.id} al giorno ${d}: ${i.kcal} kcal per ${i.grams} g, ma altrove la densita' ne darebbe ${attese.toFixed(1)}`,
        )
        problemi++
      }
      // Tiene la porzione piu' grande: e' quella con l'arrotondamento meno pesante
      if (i.grams > 0 && per100 && i.grams >= 100) densita.set(i.id, per100)
    }
  }
}

if (problemi) {
  console.error(`\n✗ ${problemi} incoerenze nella fonte: niente scrittura`)
  process.exit(1)
}

// ------------------------------------------------------------------ emissione
const s = (v) => JSON.stringify(v)

const itemTs = (i) =>
  `    { id: ${s(i.id)}, name: ${s(i.name)}, qty: ${s(i.qty)}, grams: ${i.grams}, kcal: ${i.kcal}, p: ${i.p}, c: ${i.c}, g: ${i.g}, fiber: ${i.fiber} },`

const EMOJI = { colazione: '🥣', pranzo: '🍝', pre: '⚡', spuntino: '🥪', cena: '🍗' }
const ETICHETTA = {
  colazione: 'Colazione',
  pranzo: 'Pranzo',
  pre: 'Pre-workout',
  spuntino: 'Spuntino',
  cena: 'Cena',
}

let out = `// ------------------------------------------------------------------- DIETA

/**
 * Generato da \`npm run dieta\` a partire dal piano in formato testo: i valori
 * nutrizionali arrivano dalla fonte, non da una trascrizione a mano.
 * Non modificare a mano questo blocco, si perde alla prossima generazione.
 *
 * \`grams\` serve a ricalcolare i macro quando l'utente registra il proprio
 * prodotto: le correzioni sono salvate per 100 g, così valgono in tutti i
 * giorni anche dove la quantità cambia.
 *
 * La creatina non compare fra gli alimenti perché è già una voce fissa della
 * routine giornaliera (vedi routine.ts): sarebbe una spunta doppia.
 */

`

for (let d = 1; d <= 7; d++) {
  out += `const MEALS_${d}: Meal[] = [\n`
  for (const nome of giorni[d].ordine) {
    const p = giorni[d].pasti[nome]
    out += `  {\n    id: ${s(nome)},\n    name: ${s(ETICHETTA[nome])},\n    emoji: ${s(EMOJI[nome])},\n    time: ${s(p.ora)},\n`
    if (nome === 'colazione') out += `    note: 'L’albume va sempre consumato cotto',\n`
    out += `    items: [\n`
    for (const i of p.items) out += itemTs(i) + '\n'
    out += `    ],\n  },\n`
  }
  out += `]\n\n`
}

out += `export const MEALS_BY_DAY: Meal[][] = [MEALS_1, MEALS_2, MEALS_3, MEALS_4, MEALS_5, MEALS_6, MEALS_7]\n\n`

// Mappa id -> nome del piano: serve a etichettare le correzioni dell'utente
// nella schermata Profilo, dove non si ha sotto mano il pasto di origine.
const nomi = new Map()
for (const d of Object.values(giorni)) {
  for (const p of Object.values(d.pasti)) {
    for (const i of p.items) nomi.set(i.id, i.name)
  }
}
out += `/** id alimento -> nome usato dal piano */\nexport const ALL_FOODS: Record<string, string> = {\n`
for (const [id, nome] of nomi) out += `  ${s(id)}: ${s(nome)},\n`
out += `}\n\n`

// -------------------------------------------------------- regole e spesa
const regole = [
  'Riso: peso a secco',
  'Pollo, tacchino, manzo e salmone: peso crudo e pulito',
  'Tonno e fagioli: peso cotto e sgocciolato',
  'Uova: peso senza guscio',
  'Albume: peso del prodotto, da consumare sempre cotto',
  'Frutta e verdura: peso della parte commestibile',
  'Olio extravergine: sempre pesato con la bilancia',
  'Acqua, caffè o tè non zuccherati, spezie, limone, aceto ed erbe non si contano',
  'Per i prodotti confezionati fa fede l’etichetta: correggi i valori dal pasto',
]
out += `/** Regole di pesatura: sbagliarle falsa i totali di tutta la settimana */\nexport const WEIGHING_RULES = [\n${regole.map((r) => `  ${s(r)},`).join('\n')}\n]\n\n`

const spesa = [...testo.matchAll(/^- (.+?): (.+)$/gm)]
  .slice(-29)
  .map(([, nome, qta]) => [nome.trim(), qta.trim()])
  .filter(([, q]) => !/^0 g$/.test(q))
out += `/** Spesa per 7 giorni */\nexport const SHOPPING_LIST: Array<[string, string]> = [\n${spesa
  .map(([n, q]) => `  [${s(n)}, ${s(q)}],`)
  .join('\n')}\n]\n\n`

const media = testo.match(/MEDIA GIORNALIERA: (\d+) kcal \| P ([\d,]+) g \| C ([\d,]+) g \| G ([\d,]+) g \| fibre ([\d,]+) g/)
out += `/** Media settimanale del piano */\nexport const WEEKLY_AVERAGE = {\n  kcal: ${num(media[1])},\n  p: ${num(media[2])},\n  c: ${num(media[3])},\n  g: ${num(media[4])},\n  fiber: ${num(media[5])},\n}\n\n`

// ---------------------------------------------------- innesto nel file sorgente
let file = readFileSync(TARGET, 'utf8')
const inizio = file.indexOf('// ------------------------------------------------------------------- DIETA')
const fine = file.indexOf('// -------------------------------------------------------------- ALLENAMENTO')
if (inizio < 0 || fine < 0) throw new Error('delimitatori del blocco DIETA non trovati')
file = file.slice(0, inizio) + out + file.slice(fine)
writeFileSync(TARGET, file)

const totItems = Object.values(giorni).reduce(
  (t, d) => t + Object.values(d.pasti).reduce((n, p) => n + p.items.length, 0),
  0,
)
console.log(`✓ 7 giorni, ${totItems} alimenti, ${densita.size} prodotti distinti`)
console.log(`  totali giornalieri coerenti con la fonte, densità per 100 g uniformi`)
