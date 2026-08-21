export interface RoutineItem {
  id: string
  time: string
  label: string
  detail?: string
  emoji: string
  /** Solo nei giorni senza pesi */
  recoveryOnly?: boolean
}

/** La routine fissa che si ripete identica tutti i giorni */
export const ROUTINE: RoutineItem[] = [
  {
    id: 'peso',
    time: '07:30',
    label: 'Pesati',
    detail: 'Senza vestiti o sempre nelle stesse condizioni, dopo il bagno',
    emoji: '⚖️',
  },
  {
    id: 'camminata-mattino',
    time: '07:35',
    label: 'Camminata all’aperto',
    detail: '15-20 minuti tranquilli, serve anche per la luce del mattino',
    emoji: '🌅',
  },
  {
    id: 'mobilita',
    time: '07:55',
    label: 'Mobilità',
    detail: 'Un giro completo, 10-12 minuti',
    emoji: '🧘',
  },
  {
    id: 'creatina',
    time: '08:10',
    label: 'Creatina 5 g',
    detail: 'Con la colazione, anche nei giorni senza pesi',
    emoji: '💊',
  },
  {
    id: 'camminata-pranzo',
    time: '13:30',
    label: 'Camminata dopo pranzo',
    detail: '10 minuti tranquilli',
    emoji: '🚶',
  },
  {
    id: 'mobilita-2',
    time: '17:15',
    label: 'Secondo giro di mobilità',
    detail: 'Solo nei giorni senza pesi',
    emoji: '🧘',
    recoveryOnly: true,
  },
  {
    id: 'camminata-cena',
    time: '21:00',
    label: 'Camminata dopo cena',
    detail: '10 minuti tranquilli',
    emoji: '🌙',
  },
  {
    id: 'stop-lavoro',
    time: '22:15',
    label: 'Stop al lavoro',
    detail: 'Luci più basse, telefono fuori dal letto',
    emoji: '🕯️',
  },
  {
    id: 'sonno',
    time: '23:00',
    label: 'A letto',
    detail: 'Sveglia sempre alle 07:30, anche nel fine settimana',
    emoji: '😴',
  },
]

export const MOBILITY = [
  'Cat-camel: 6 ripetizioni',
  'Open book: 6 per lato',
  'Passaggi 90/90: 8 per lato',
  'Mobilità caviglia, ginocchio verso la parete: 10 per lato',
  'Allungamento flessore dell’anca: 30 secondi per lato',
  'Allungamento posteriori coscia: 30 secondi per lato',
  'Pettorale alla porta: 30 secondi per lato',
  'Dorsale con mani su un supporto: 30 secondi',
  'Accosciata profonda assistita: 2 × 20 secondi',
]

export const WARMUP = [
  'Cinque minuti di cyclette, camminata inclinata o ellittica',
  'Primo esercizio: carico molto leggero × 8-10',
  'Poi circa il 60% del carico di lavoro × 5',
  'Poi circa il 75-80% × 2-3',
  'Secondo multiarticolare: una o due serie progressive',
  'Inizia le serie allenanti solo quando movimento e articolazioni si sentono normali',
  'Le serie di riscaldamento non contano come serie allenanti',
]

export const HYDRATION = 'Porta 500-750 ml di acqua durante i pesi'

export const SEDENTARY_TIP =
  'Ogni 50-55 minuti seduto, alzati 3-5 minuti: cammina, prendi acqua, fai le scale'
