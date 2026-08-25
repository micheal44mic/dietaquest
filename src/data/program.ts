import type { Exercise, Meal, ProgramDay, Targets } from '../types'

/**
 * Il programma vive nel codice, non nello storage: i log salvati puntano al
 * giorno-programma e all'id del pasto/esercizio. Così correggere un grammo o
 * un esercizio qui non richiede di azzerare lo storico.
 */

// ------------------------------------------------------------------- DIETA

/**
 * I sette giorni sono scritti per esteso, uno per uno, e non generati da
 * funzioni condivise: nel piano le giornate dello stesso modello non sono più
 * identiche (i giorni 1, 4 e 6 sono tutti "modello A" ma con 180, 200 e 180 g
 * di pollo). Ripetere le quantità è più prolisso ma rende impossibile che una
 * modifica a un giorno ne sposti un altro per sbaglio.
 *
 * La creatina non compare fra gli alimenti perché è già una voce fissa della
 * routine giornaliera (vedi routine.ts): sarebbe una spunta doppia.
 */

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

const ALBUME_NOTA = 'L’albume va sempre consumato cotto'

/** Colazione dei giorni con pesi, tranne il venerdì */
const COLAZIONE_PESI = colazione(
  [
    'Pan bauletto bianco 70 g (≈3 fette)',
    'Latte parzialmente scremato 300 ml',
    'Albume d’uovo 220 g',
    'Banana 120 g',
    'Mandorle 10 g',
  ],
  ALBUME_NOTA,
)

/** Colazione dei due giorni senza pesi */
const COLAZIONE_RIPOSO = colazione(
  [
    'Pan bauletto bianco 70 g (≈3 fette)',
    'Latte parzialmente scremato 250 ml',
    'Albume d’uovo 250 g',
    'Banana 100 g',
    'Mandorle 10 g',
  ],
  ALBUME_NOTA,
)

const PRE_WORKOUT = pre(['Yogurt greco 0% 250 g', 'Gallette di riso 35 g', 'Marmellata 20 g'])

const SPUNTINO_RIPOSO = spuntino(['Yogurt greco 0% 250 g', 'Mandorle 10 g', 'Kiwi 150 g'])

// Giorno 1 — modello A, Upper A
const MEALS_1: Meal[] = [
  COLAZIONE_PESI,
  pranzo([
    'Riso basmati secco 80 g',
    'Petto di pollo 180 g',
    'Broccoli 250 g',
    'Olio extravergine 12 g',
    'Mela 180 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 55 g',
    'Petto di tacchino 170 g',
    'Zucchine 250 g',
    'Olio extravergine 15 g',
    'Mandorle 8 g',
  ]),
]

// Giorno 2 — modello B, Lower A
const MEALS_2: Meal[] = [
  COLAZIONE_PESI,
  pranzo([
    'Riso basmati secco 80 g',
    'Petto di pollo 180 g',
    'Carote e peperoni 250 g',
    'Olio extravergine 12 g',
    'Arancia 190 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 55 g',
    'Manzo magro 180 g',
    'Spinaci 250 g',
    'Olio extravergine 10 g',
    'Mandorle 8 g',
  ]),
]

// Giorno 3 — modello D, riposo
const MEALS_3: Meal[] = [
  COLAZIONE_RIPOSO,
  pranzo([
    'Riso basmati secco 40 g',
    'Petto di pollo 200 g',
    'Broccoli 300 g',
    'Olio extravergine 15 g',
  ]),
  SPUNTINO_RIPOSO,
  cena([
    'Patate 150 g',
    'Fagioli cotti e sgocciolati 100 g',
    'Uova intere 110 g (≈2 uova)',
    'Tonno al naturale sgocciolato 70 g',
    'Fagiolini 300 g',
    'Olio extravergine 5 g',
    'Mela 180 g',
  ]),
]

// Giorno 4 — modello A, Upper B
const MEALS_4: Meal[] = [
  COLAZIONE_PESI,
  pranzo([
    'Riso basmati secco 80 g',
    'Petto di pollo 200 g',
    'Cavolo e carote 250 g',
    'Olio extravergine 12 g',
    'Mela 180 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 55 g',
    'Petto di tacchino 170 g',
    'Zucchine 250 g',
    'Olio extravergine 15 g',
    'Mandorle 8 g',
  ]),
]

// Giorno 5 — modello C, Lower B. Colazione con 250 g di albume, non 220
const MEALS_5: Meal[] = [
  colazione(
    [
      'Pan bauletto bianco 70 g (≈3 fette)',
      'Latte parzialmente scremato 300 ml',
      'Albume d’uovo 250 g',
      'Banana 120 g',
      'Mandorle 10 g',
    ],
    ALBUME_NOTA,
  ),
  pranzo([
    'Riso basmati secco 70 g',
    'Petto di pollo 200 g',
    'Broccoli 250 g',
    'Olio extravergine 12 g',
    'Arancia 190 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 60 g',
    'Salmone 150 g',
    'Spinaci 250 g',
    'Olio extravergine 5 g',
    'Mandorle 8 g',
  ]),
]

// Giorno 6 — modello A, Upper C
const MEALS_6: Meal[] = [
  COLAZIONE_PESI,
  pranzo([
    'Riso basmati secco 80 g',
    'Petto di pollo 180 g',
    'Verdure miste surgelate 250 g',
    'Olio extravergine 12 g',
    'Mela 180 g',
  ]),
  PRE_WORKOUT,
  cena([
    'Riso basmati secco 55 g',
    'Petto di tacchino 170 g',
    'Fagiolini 250 g',
    'Olio extravergine 15 g',
    'Mandorle 8 g',
  ]),
]

// Giorno 7 — modello E, riposo
const MEALS_7: Meal[] = [
  COLAZIONE_RIPOSO,
  pranzo([
    'Riso basmati secco 30 g',
    'Petto di pollo 220 g',
    'Broccoli 300 g',
    'Olio extravergine 15 g',
  ]),
  SPUNTINO_RIPOSO,
  cena([
    'Patate 200 g',
    'Salmone 160 g',
    'Spinaci 300 g',
    'Olio extravergine 5 g',
    'Mela 180 g',
  ]),
]

const T1: Targets = { kcal: '2.243 kcal', protein: '181 g', carbs: '260 g', fat: '52 g', fiber: '26 g' }
const T2: Targets = { kcal: '2.242 kcal', protein: '180 g', carbs: '267 g', fat: '50 g', fiber: '25 g' }
const T3: Targets = { kcal: '2.026 kcal', protein: '182 g', carbs: '194 g', fat: '53 g', fiber: '44 g' }
const T4: Targets = { kcal: '2.261 kcal', protein: '181 g', carbs: '266 g', fat: '52 g', fiber: '26 g' }
const T5: Targets = { kcal: '2.302 kcal', protein: '181 g', carbs: '257 g', fat: '61 g', fiber: '26 g' }
const T6: Targets = { kcal: '2.281 kcal', protein: '180 g', carbs: '269 g', fat: '52 g', fiber: '30 g' }
const T7: Targets = { kcal: '2.055 kcal', protein: '182 g', carbs: '180 g', fat: '64 g', fiber: '35 g' }

/** Media settimanale del piano, mostrata come riferimento */
export const WEEKLY_AVERAGE: Targets = {
  kcal: '2.201 kcal',
  protein: '181 g',
  carbs: '242 g',
  fat: '55 g',
  fiber: '30 g',
}

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
    meals: MEALS_1,
    targets: T1,
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
    meals: MEALS_2,
    targets: T2,
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
    meals: MEALS_3,
    targets: T3,
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
    meals: MEALS_4,
    targets: T4,
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
    meals: MEALS_5,
    targets: T5,
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
    meals: MEALS_6,
    targets: T6,
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
    meals: MEALS_7,
    targets: T7,
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

/** Regole di pesatura: sbagliarle falsa i totali di tutta la settimana */
export const WEIGHING_RULES = [
  'Riso: peso a secco',
  'Pollo, tacchino, manzo e salmone: peso crudo e pulito',
  'Tonno e fagioli: peso cotto e sgocciolato',
  'Uova: peso senza guscio',
  'Albume: peso del prodotto, da consumare sempre cotto',
  'Frutta e verdura: peso della parte commestibile',
  'Olio extravergine: sempre pesato con la bilancia',
  'Acqua, caffè o tè non zuccherati, spezie, limone, aceto ed erbe non si contano',
  'Per pan bauletto, yogurt, gallette e marmellata fa fede l’etichetta del prodotto che compri',
]

/** Spesa per 7 giorni */
export const SHOPPING_LIST: Array<[string, string]> = [
  ['Riso basmati secco', '740 g'],
  ['Pan bauletto bianco', '490 g'],
  ['Gallette di riso', '175 g'],
  ['Patate', '350 g'],
  ['Marmellata', '100 g'],
  ['Albume d’uovo', '1,63 kg (≈1,7 litri in brick)'],
  ['Petto di pollo', '1,36 kg'],
  ['Petto di tacchino', '510 g'],
  ['Manzo magro', '180 g'],
  ['Salmone', '310 g'],
  ['Tonno al naturale sgocciolato', '70 g'],
  ['Uova intere', '110 g senza guscio (≈2 grandi)'],
  ['Fagioli cotti e sgocciolati', '100 g'],
  ['Latte parzialmente scremato', '2 litri'],
  ['Yogurt greco 0%', '1,75 kg'],
  ['Banane', '800 g commestibili'],
  ['Mele', '900 g (≈5 da 180 g)'],
  ['Arance', '380 g (≈2)'],
  ['Kiwi', '300 g commestibili'],
  ['Broccoli', '1,10 kg'],
  ['Carote e peperoni', '250 g'],
  ['Cavolo e carote', '250 g'],
  ['Verdure miste surgelate', '250 g'],
  ['Zucchine', '500 g'],
  ['Spinaci', '800 g'],
  ['Fagiolini', '550 g'],
  ['Mandorle', '130 g'],
  ['Olio extravergine', '160 g (≈175 ml)'],
  ['Creatina', '35 g'],
]

/** Giorno in cui parte il giorno 1 della scheda. */
export const PROGRAM_START = '2026-08-22'
