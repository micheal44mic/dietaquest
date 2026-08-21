import type { Exercise, Meal, ProgramDay, Targets } from '../types'

/**
 * Il programma vive nel codice, non nello storage: i log salvati puntano al
 * giorno-programma e all'id del pasto/esercizio. Così correggere un grammo o
 * un esercizio qui non richiede di azzerare lo storico.
 *
 * La creatina non compare fra gli alimenti perché è già una voce fissa della
 * routine giornaliera (vedi routine.ts): sarebbe una spunta doppia.
 */

// ------------------------------------------------------------------- DIETA

/**
 * Rotazione di frutta e verdura. Nel piano è indicizzata sui giorni 1-21, ma le
 * righe si ripetono identiche ogni 7 (1-8-15 condividono le stesse verdure):
 * basta quindi un ciclo di 7 posizioni.
 */
const ROTATION = [
  { pranzo: 'Broccoli', cena: 'Zucchine' },
  { pranzo: 'Carote e peperoni', cena: 'Spinaci' },
  { pranzo: 'Broccoli', cena: 'Fagiolini' },
  { pranzo: 'Cavolo e carote', cena: 'Zucchine' },
  { pranzo: 'Broccoli', cena: 'Spinaci' },
  { pranzo: 'Verdure miste surgelate', cena: 'Fagiolini' },
  { pranzo: 'Broccoli', cena: 'Spinaci' },
]

const rot = (day: number) => ROTATION[(day - 1) % 7]

const colazione = (items: string[], note?: string): Meal => ({
  id: 'colazione',
  name: 'Colazione',
  emoji: '🥣',
  time: '08:10',
  items,
  note,
})

const pranzo = (items: string[]): Meal => ({
  id: 'pranzo',
  name: 'Pranzo',
  emoji: '🍝',
  time: '13:00',
  items,
})

const pre = (items: string[]): Meal => ({
  id: 'pre',
  name: 'Pre-workout',
  emoji: '⚡',
  time: '15:30',
  items,
})

const spuntino = (items: string[]): Meal => ({
  id: 'spuntino',
  name: 'Spuntino',
  emoji: '🥪',
  time: '16:30',
  items,
})

const cena = (items: string[]): Meal => ({
  id: 'cena',
  name: 'Cena',
  emoji: '🍗',
  time: '19:00',
  items,
})

const T_A: Targets = { kcal: '≈2.286 kcal', protein: '161 g', carbs: '287 g', fat: '54 g' }
const T_B: Targets = { kcal: '≈2.297 kcal', protein: '160 g', carbs: '287 g', fat: '56 g' }
const T_C: Targets = { kcal: '≈2.281 kcal', protein: '152 g', carbs: '283 g', fat: '59 g' }
const T_D: Targets = { kcal: '≈2.027 kcal', protein: '156 g', carbs: '226 g', fat: '56 g' }
const T_E: Targets = { kcal: '≈2.034 kcal', protein: '151 g', carbs: '215 g', fat: '64 g' }

const COLAZIONE_PESI = colazione(
  [
    'Fiocchi d’avena 50 g',
    'Latte parzialmente scremato 300 ml',
    'Whey 15 g',
    'Banana 120 g',
    'Semi di lino macinati 10 g',
  ],
  'Porridge, oppure lascia tutto in frigorifero la sera prima',
)

const PRE_WORKOUT = pre(['Yogurt greco 0% 250 g', 'Gallette di riso 35 g', 'Marmellata 20 g'])

const SPUNTINO_RIPOSO = spuntino([
  'Yogurt greco 0% 250 g',
  'Semi di girasole 10 g',
  'Kiwi 150 g',
])

/** Modello A — giornate di parte alta (Upper A, Upper B, Upper C) */
const MODEL_A = (day: number): Meal[] => [
  COLAZIONE_PESI,
  pranzo([
    'Riso basmati secco 80 g',
    'Petto di pollo 180 g',
    `${rot(day).pranzo} 250 g`,
    'Olio extravergine 12 g',
    'Mela 180 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 55 g',
    'Pollo o tacchino 170 g',
    `${rot(day).cena} 250 g`,
    'Olio extravergine 15 g',
    'Semi di girasole 8 g',
  ]),
]

/** Modello B — Lower A. Colazione, pranzo e pre-workout come il modello A, con l'arancia */
const MODEL_B = (day: number): Meal[] => [
  COLAZIONE_PESI,
  pranzo([
    'Riso basmati secco 80 g',
    'Petto di pollo 180 g',
    `${rot(day).pranzo} 250 g`,
    'Olio extravergine 12 g',
    'Arancia 180-200 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 55 g',
    'Manzo magro 180 g',
    `${rot(day).cena} 250 g`,
    'Olio extravergine 10 g',
    'Semi di girasole 8 g',
  ]),
]

/** Modello C — Lower B */
const MODEL_C = (day: number): Meal[] => [
  colazione(
    [
      'Fiocchi d’avena 50 g',
      'Latte parzialmente scremato 300 ml',
      'Whey 20 g',
      'Banana 120 g',
      'Semi di lino macinati 10 g',
    ],
    'Porridge, oppure lascia tutto in frigorifero la sera prima',
  ),
  pranzo([
    'Riso basmati secco 70 g',
    'Petto di pollo 180 g',
    `${rot(day).pranzo} 250 g`,
    'Olio extravergine 12 g',
    'Arancia 180-200 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 60 g',
    'Salmone 130 g',
    `${rot(day).cena} 250 g`,
    'Olio extravergine 5 g',
    'Semi di girasole 8 g',
  ]),
]

const COLAZIONE_RIPOSO = colazione([
  'Fiocchi d’avena 45 g',
  'Latte parzialmente scremato 250 ml',
  'Whey 20 g',
  'Banana 100 g',
  'Semi di lino macinati 10 g',
])

/** Modello D — primo giorno senza pesi della settimana */
const MODEL_D = (day: number): Meal[] => [
  COLAZIONE_RIPOSO,
  pranzo([
    'Riso basmati secco 40 g',
    'Petto di pollo 180 g',
    `${rot(day).pranzo} 300 g`,
    'Olio extravergine 15 g',
  ]),
  SPUNTINO_RIPOSO,
  cena([
    'Patate 100 g',
    'Fagioli cotti e sgocciolati 100 g',
    'Uova intere 110 g (circa 2)',
    'Tonno al naturale sgocciolato 60 g',
    `${rot(day).cena} 300 g`,
    'Olio extravergine 5 g',
    'Mela 180 g',
  ]),
]

/** Modello E — secondo giorno senza pesi della settimana */
const MODEL_E = (day: number): Meal[] => [
  COLAZIONE_RIPOSO,
  pranzo([
    'Riso basmati secco 30 g',
    'Petto di pollo 180 g',
    `${rot(day).pranzo} 300 g`,
    'Olio extravergine 15 g',
  ]),
  SPUNTINO_RIPOSO,
  cena([
    'Patate 200 g',
    'Salmone 150 g',
    `${rot(day).cena} 300 g`,
    'Olio extravergine 5 g',
    'Mela 180 g',
  ]),
]

// -------------------------------------------------------------- ALLENAMENTO

const ex = (
  id: string,
  name: string,
  sets: number,
  repsMin: number,
  repsMax: number,
  rir: string,
  restSec: number,
  opts: { perSide?: boolean; note?: string; cue?: string; superset?: string } = {},
): Exercise => ({ id, name, sets, repsMin, repsMax, rir, restSec, ...opts })

const CUE_REMATORE =
  'Porta la maniglia verso il basso sterno o la parte alta dell’addome, con i gomiti a circa 45-70° dal busto. Lascia che le scapole si allontanino nella fase di allungamento, poi riavvicinale e fermati circa un secondo. Non trasformare il movimento in un’estensione della zona lombare.'

const CUE_COLLO =
  'Ripetizioni lente, carichi piccoli, almeno 3 RIR. Niente ponti sul collo, rotazioni caricate o movimenti esplosivi. Interrompi se compare dolore cervicale, mal di testa da sforzo, vertigini, formicolio o dolore che scende a spalle e braccia.'

/** Upper A — centro schiena e deltoidi laterali */
const UPPER_A: Exercise[] = [
  ex('rematore-petto', 'Rematore con petto appoggiato, presa semi-pronata', 4, 6, 10, '2', 165, {
    cue: CUE_REMATORE,
  }),
  ex('rematore-unilaterale-cavo', 'Rematore unilaterale al cavo', 3, 10, 15, '1-2', 120, {
    cue: `Gomito moderatamente aperto, non incollato al fianco. ${CUE_REMATORE}`,
  }),
  ex('lat-neutra', 'Lat machine presa neutra', 2, 10, 15, '2-3', 120, {
    note: 'Solo un richiamo',
    cue: 'In questo blocco è solo un richiamo per i dorsali: non aggiungere trazioni, pullover o altre tirate verticali.',
  }),
  ex('alzate-macchina', 'Alzate laterali alla macchina', 5, 10, 20, '1-2', 85, {
    cue: 'Puoi alternare macchina, cavo e manubri secondo la comodità articolare: i confronti fra cavo e manubrio danno risultati simili. Sali fino all’altezza delle spalle senza slanciare il busto.',
  }),
  ex('preacher-curl', 'Preacher curl alla macchina o al cavo', 3, 8, 12, '1', 105, {
    cue: 'Braccia appoggiate per tutta la serie. Controlla l’eccentrica e non staccare i gomiti dal supporto per aiutarti.',
  }),
  ex('tricipiti-sopra', 'Estensioni tricipiti sopra la testa al cavo', 3, 8, 12, '1', 105, {
    cue: 'Con il braccio sopra la testa il capo lungo lavora allungato: in un trial è cresciuto più che con il braccio lungo il fianco. Tieni i gomiti fermi e vicini fra loro.',
  }),
]

/** Lower A — femorali e glutei pesanti, addome, collo */
const LOWER_A: Exercise[] = [
  ex('stacco-rumeno', 'Stacco rumeno', 3, 6, 10, '2', 165, {
    cue: 'Scendi solo finché mantieni bacino e colonna sotto controllo. Se non padroneggi ancora la tecnica, usa temporaneamente una macchina hip-hinge o le iperestensioni a 45° e fatti correggere dal personale di sala.',
  }),
  ex('hip-thrust', 'Hip thrust', 3, 6, 10, '2', 150, {
    cue: 'Mento leggermente raccolto, costole basse. Spingi con i talloni e ferma un istante in alto senza iperestendere la lombare.',
  }),
  ex('leg-curl-seduto', 'Leg curl seduto', 4, 8, 12, '1-2', 120, {
    cue: 'Da seduto i femorali lavorano in posizione più allungata: in uno studio ha prodotto più ipertrofia complessiva rispetto al leg curl prono. Controlla il ritorno.',
  }),
  ex('hack-squat', 'Hack squat', 3, 8, 12, '2', 150, {
    note: 'Profondità controllata',
    cue: 'Scendi fino alla profondità che controlli senza che il bacino si arrotondi. Piedi stabili, spinta continua.',
  }),
  ex('calf-piedi', 'Calf raise in piedi', 3, 8, 15, '1', 105, {
    cue: 'Allungamento completo in basso, pausa breve in alto. Non rimbalzare.',
  }),
  ex('crunch-cavi', 'Crunch al cavo', 4, 10, 15, '1', 90, {
    cue: 'Arrotola la colonna avvicinando le costole al bacino, non fletterti dalle anche.',
  }),
  ex('flessione-collo', 'Flessione del collo con elastico o macchina', 2, 15, 25, '3', 50, {
    note: 'Carichi piccoli, movimento lento',
    cue: CUE_COLLO,
  }),
  ex('estensione-collo', 'Estensione del collo con imbrago, elastico o macchina', 2, 15, 25, '3', 50, {
    note: 'Carichi piccoli, movimento lento',
    cue: CUE_COLLO,
  }),
]

/** Upper B — spalle, centro schiena e braccia */
const UPPER_B: Exercise[] = [
  ex('high-row', 'High row con petto appoggiato, gomiti 60-75°', 4, 8, 12, '1-2', 150, {
    cue: 'Deve sembrare un rematore, non una lat machine: petto fermo sul supporto, gomiti non incollati al fianco e tirata verso lo sterno.',
  }),
  ex('chest-press-inclinata', 'Chest press inclinata alla macchina', 2, 8, 12, '2', 120, {
    cue: 'Il petto qui riceve solo 4 serie dirette a settimana: è un richiamo, non il piatto forte. Escursione completa e controllata.',
  }),
  ex('reverse-pec-deck', 'Reverse pec deck', 3, 12, 20, '1', 90, {
    cue: 'Braccia quasi tese, apri con i gomiti e non con le mani. Fermati quando le braccia sono in linea con le spalle.',
  }),
  ex('alzate-cavo', 'Alzate laterali al cavo', 5, 12, 20, '1-2', 85, {
    cue: 'Il cavo mantiene tensione anche in basso. Busto fermo, salita fino all’altezza della spalla.',
  }),
  ex('curl-inclinato', 'Curl inclinato con manubri', 3, 10, 15, '1', 105, {
    cue: 'Sulla panca inclinata il bicipite parte allungato: lascia scendere del tutto il braccio prima di risalire.',
  }),
  ex('pushdown', 'Pushdown con barra o corda', 3, 10, 15, '1', 105, {
    cue: 'Gomiti fermi al fianco, estendi completamente senza inclinare il busto in avanti.',
  }),
  ex('scrollate', 'Scrollate alla macchina o con manubri', 2, 10, 15, '1-2', 120, {
    cue: 'Servono soprattutto al trapezio superiore e a dare spessore alla zona collo-spalle. Salita verticale, pausa breve in alto, niente rotazioni.',
  }),
]

/** Lower B — glutei e femorali */
const LOWER_B: Exercise[] = [
  ex('bulgaro', 'Bulgarian split squat', 3, 8, 12, '2', 120, {
    perSide: true,
    cue: 'Passo abbastanza lungo, lieve inclinazione del busto in avanti e tutta la profondità che riesci a controllare. Se l’equilibrio limita le gambe prima dei muscoli, sostituiscilo con la pressa a una gamba mantenendo 3 × 8-12. Recupero dopo entrambe le gambe.',
  }),
  ex('leg-curl-sdraiato', 'Leg curl sdraiato', 4, 10, 15, '1-2', 105, {
    cue: 'Bacino aderente alla panca: se si stacca stai usando la lombare. Ritorno controllato.',
  }),
  ex('leg-press', 'Leg press a 45°', 3, 10, 15, '2', 150, {
    note: 'Escursione profonda e controllata',
    cue: 'Scendi finché il bacino resta appoggiato: appena si arrotonda, hai superato la tua escursione utile.',
  }),
  ex('iperestensioni', 'Iperestensioni a 45° con enfasi sui glutei', 3, 10, 15, '1-2', 120, {
    cue: 'Pensa a spingere il bacino contro il supporto e a contrarre i glutei. Fermati quando il busto torna in linea con le gambe: non iperestendere la zona lombare.',
  }),
  ex('calf-seduto', 'Calf raise seduto', 3, 10, 15, '1', 105, {
    cue: 'Da seduto lavora di più il soleo. Allungamento pieno in basso, pausa in alto.',
  }),
  ex('ginocchia-sbarra', 'Sollevamento ginocchia alla sbarra', 4, 8, 15, '1-2', 90, {
    cue: 'Porta il bacino verso l’alto arrotolando, non limitarti ad alzare le cosce. Evita di dondolare.',
  }),
  ex('flessione-laterale-collo', 'Flessione laterale del collo con elastico o macchina', 2, 15, 25, '3', 50, {
    perSide: true,
    note: 'Carichi piccoli, movimento lento',
    cue: CUE_COLLO,
  }),
]

/** Upper C — braccia prioritarie, allenate per prime in superserie */
const UPPER_C: Exercise[] = [
  ex('bayesian-curl', 'Bayesian curl al cavo', 2, 10, 15, '1', 0, {
    superset: 'A1',
    cue: 'In piedi davanti al cavo basso, un passo avanti: il braccio resta dietro il corpo e il bicipite parte allungato. Nessun recupero prima di A2.',
  }),
  ex('tricipiti-sopra', 'Estensioni tricipiti sopra la testa al cavo', 2, 10, 15, '1', 90, {
    superset: 'A2',
    cue: 'Subito dopo A1, senza pausa. Poi recupera 90 secondi prima di ripartire.',
  }),
  ex('hammer-curl', 'Hammer curl', 2, 8, 12, '1', 0, {
    superset: 'B1',
    cue: 'Presa neutra, pollici in alto: coinvolge brachiale e brachioradiale. Nessun recupero prima di B2.',
  }),
  ex('pushdown-corda', 'Pushdown con corda', 2, 10, 15, '1', 90, {
    superset: 'B2',
    cue: 'Subito dopo B1. Apri leggermente la corda alla fine del movimento. Poi recupera 90 secondi.',
  }),
  ex('rematore-cavo-largo', 'Rematore al cavo con presa medio-larga', 2, 10, 15, '2', 120, {
    cue: CUE_REMATORE,
  }),
  ex('alzate-manubri', 'Alzate laterali con manubri o al cavo', 5, 15, 25, '1', 75, {
    cue: 'Serie lunghe: scegli un carico che ti lasci arrivare a 15-25 ripetizioni pulite senza slanci.',
  }),
  ex('chest-press', 'Chest press alla macchina', 2, 10, 15, '2', 105, {
    cue: 'Richiamo per il petto, non cercare carichi massimali.',
  }),
  ex('ab-wheel', 'Ab wheel', 4, 6, 12, '1-2', 90, {
    cue: 'Estenditi solo fin dove riesci a tenere le costole basse e il bacino retroverso. Se la lombare si inarca, hai superato il tuo raggio.',
  }),
]

// -------------------------------------------------------------- I 7 GIORNI

const RIPOSO_NOTE = 'Nessun lavoro con i pesi: la scheda prevede riposo o camminata leggera.'

/** Cardio facile dei giorni senza pesi, dal protocollo alimentare */
const CYCLETTE = {
  time: '17:15',
  title: 'Cardio facile',
  steps: [
    'Cyclette o ellittica: 20-25 minuti',
    'Intensità 3-4 su 10: devi riuscire a parlare in frasi complete',
    'Nessuno sprint, nessun HIIT',
  ],
}

export const PROGRAM: ProgramDay[] = [
  {
    day: 1,
    weekday: 'Lunedì',
    title: 'Upper A',
    subtitle: 'Centro schiena, deltoidi laterali, braccia',
    kind: 'upper',
    steps: 9000,
    rirNote: 'Le serie di riscaldamento non si contano',
    meals: MODEL_A(1),
    targets: T_A,
    dietModel: 'A',
    workout: UPPER_A,
  },
  {
    day: 2,
    weekday: 'Martedì',
    title: 'Lower A',
    subtitle: 'Femorali e glutei pesanti, addome, collo',
    kind: 'lower',
    steps: 9000,
    rirNote: 'Sui grandi esercizi resta a 1-2 RIR, mai al cedimento',
    meals: MODEL_B(2),
    targets: T_B,
    dietModel: 'B',
    workout: LOWER_A,
  },
  {
    day: 3,
    weekday: 'Mercoledì',
    title: 'Riposo',
    subtitle: 'Riposo o camminata leggera',
    kind: 'riposo',
    steps: 9000,
    notes: [RIPOSO_NOTE],
    meals: MODEL_D(3),
    targets: T_D,
    dietModel: 'D',
    cardio: CYCLETTE,
  },
  {
    day: 4,
    weekday: 'Giovedì',
    title: 'Upper B',
    subtitle: 'Centro schiena, spalle, braccia, poco petto',
    kind: 'upper',
    steps: 9000,
    meals: MODEL_A(4),
    targets: T_A,
    dietModel: 'A',
    workout: UPPER_B,
  },
  {
    day: 5,
    weekday: 'Venerdì',
    title: 'Lower B',
    subtitle: 'Glutei e femorali, addome, collo',
    kind: 'lower',
    steps: 9000,
    meals: MODEL_C(5),
    targets: T_C,
    dietModel: 'C',
    workout: LOWER_B,
  },
  {
    day: 6,
    weekday: 'Sabato',
    title: 'Upper C',
    subtitle: 'Braccia prioritarie, laterali, richiamo schiena e petto',
    kind: 'upper',
    steps: 9000,
    rirNote: 'Superserie A1-A2 e B1-B2: seduta da 55-65 minuti',
    meals: MODEL_A(6),
    targets: T_A,
    dietModel: 'A',
    workout: UPPER_C,
  },
  {
    day: 7,
    weekday: 'Domenica',
    title: 'Riposo',
    subtitle: 'Riposo o camminata leggera',
    kind: 'riposo',
    steps: 9000,
    notes: [RIPOSO_NOTE],
    meals: MODEL_E(7),
    targets: T_E,
    dietModel: 'E',
    cardio: CYCLETTE,
  },
]

/**
 * Rampa di ingresso nel volume: il piano chiede di non passare di colpo da 9 a
 * 15 serie di laterali. Nelle prime due settimane si fanno 4 serie di alzate
 * per seduta e una sola serie per direzione del collo.
 */
export const INTRO_SETS: Record<string, number> = {
  'alzate-macchina': 4,
  'alzate-cavo': 4,
  'alzate-manubri': 4,
  'flessione-collo': 1,
  'estensione-collo': 1,
  'flessione-laterale-collo': 1,
}

/** Dopo 6-8 settimane il piano prevede una settimana di scarico */
export const DELOAD_AFTER_WEEKS = 6

/** Regole di pesatura: sbagliarle falsa tutto il test delle 21 giornate */
export const WEIGHING_RULES = [
  'Riso e avena: peso a secco',
  'Pollo, tacchino, manzo e salmone: peso crudo e pulito',
  'Tonno e legumi: peso cotto e sgocciolato',
  'Uova: senza guscio (110 g ≈ 2 uova grandi)',
  'Olio: sempre pesato con la bilancia, mai a occhio',
  'Frutta e verdura: parte commestibile',
  'Acqua, caffè non zuccherato, tè, spezie, limone, aceto ed erbe non si contano',
  'Le marche spostano 50-100 kcal: prevale sempre l’etichetta del prodotto che usi',
]

/** Spesa settimanale del piano */
export const SHOPPING_LIST: Array<[string, string]> = [
  ['Riso basmati secco', '740 g'],
  ['Avena', '340 g'],
  ['Gallette di riso', '175 g'],
  ['Patate', '300 g'],
  ['Pollo/tacchino', '1,77 kg'],
  ['Manzo magro', '180 g'],
  ['Salmone', '280 g'],
  ['Tonno sgocciolato', '60 g'],
  ['Uova', '2 grandi'],
  ['Fagioli sgocciolati', '100 g'],
  ['Latte parzialmente scremato', '2 litri'],
  ['Yogurt greco 0%', '1,75 kg'],
  ['Whey', '120 g'],
  ['Banane', '≈800 g commestibili'],
  ['Mele', '≈5 da 180 g'],
  ['Arance', '≈2 da 180-200 g'],
  ['Kiwi', '300 g commestibili'],
  ['Verdure miste', '≈3,7 kg'],
  ['Olio extravergine', '160 g (≈175 ml)'],
  ['Semi di lino macinati', '70 g'],
  ['Semi di girasole', '60 g'],
  ['Marmellata', '100 g'],
  ['Creatina', '35 g'],
]

/**
 * Giorno in cui parte il giorno 1 della scheda. Il piano dice che si può
 * iniziare in qualunque giorno della settimana: il primo diventa il "lunedì"
 * del programma, e l'app mostra comunque la data reale.
 */
export const PROGRAM_START = '2026-08-22'
