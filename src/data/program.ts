import type { Exercise, Meal, ProgramDay } from '../types'

/**
 * Il programma vive nel codice, non nello storage: i log salvati puntano al
 * giorno-programma e all'id del pasto/esercizio. Così correggere un grammo o
 * un esercizio qui non richiede di azzerare lo storico.
 */

// ------------------------------------------------------------------- DIETA

/**
 * Generato da `npm run dieta` a partire dal piano in formato testo: i valori
 * nutrizionali arrivano dalla fonte, non da una trascrizione a mano.
 * Non modificare a mano questo blocco, si perde alla prossima generazione.
 *
 * `grams` serve a ricalcolare i macro quando l'utente registra il proprio
 * prodotto: le correzioni sono salvate per 100 g, così valgono in tutti i
 * giorni anche dove la quantità cambia.
 *
 * La creatina non compare fra gli alimenti perché è già una voce fissa della
 * routine giornaliera (vedi routine.ts): sarebbe una spunta doppia.
 */

const MEALS_1: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "300 ml", grams: 300, kcal: 138, p: 10.5, c: 15, g: 4.5, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "220 g", grams: 220, kcal: 95, p: 23.5, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "120 g", grams: 120, kcal: 91, p: 1.4, c: 20.9, g: 0.4, fiber: 2.2 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "80 g", grams: 80, kcal: 294, p: 7.2, c: 66.3, g: 1.5, fiber: 1 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "180 g", grams: 180, kcal: 180, p: 41.9, c: 0, g: 1.4, fiber: 0 },
    { id: "broccoli", name: "Broccoli", qty: "250 g", grams: 250, kcal: 82, p: 7.5, c: 7.8, g: 1, fiber: 7.8 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "12 g", grams: 12, kcal: 108, p: 0, c: 0, g: 12, fiber: 0 },
    { id: "mela", name: "Mela", qty: "180 g", grams: 180, kcal: 79, p: 0.4, c: 18, g: 0, fiber: 4.7 },
    ],
  },
  {
    id: "pre",
    name: "Pre-workout",
    emoji: "⚡",
    time: "15:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "gallette-di-riso", name: "Gallette di riso", qty: "35 g", grams: 35, kcal: 134, p: 3, c: 28, g: 0.8, fiber: 1.1 },
    { id: "marmellata", name: "Marmellata", qty: "20 g", grams: 20, kcal: 45, p: 0.1, c: 11.7, g: 0, fiber: 0.4 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "55 g", grams: 55, kcal: 202, p: 5, c: 45.6, g: 1, fiber: 0.7 },
    { id: "petto-di-tacchino", name: "Petto di tacchino", qty: "170 g", grams: 170, kcal: 182, p: 40.8, c: 0, g: 2, fiber: 0 },
    { id: "zucchine", name: "Zucchine", qty: "250 g", grams: 250, kcal: 40, p: 3.8, c: 4.2, g: 0.2, fiber: 3 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "15 g", grams: 15, kcal: 135, p: 0, c: 0, g: 15, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "8 g", grams: 8, kcal: 50, p: 1.8, c: 0.4, g: 4.4, fiber: 1 },
    ],
  },
]

const MEALS_2: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "300 ml", grams: 300, kcal: 138, p: 10.5, c: 15, g: 4.5, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "220 g", grams: 220, kcal: 95, p: 23.5, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "120 g", grams: 120, kcal: 91, p: 1.4, c: 20.9, g: 0.4, fiber: 2.2 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "80 g", grams: 80, kcal: 294, p: 7.2, c: 66.3, g: 1.5, fiber: 1 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "180 g", grams: 180, kcal: 180, p: 41.9, c: 0, g: 1.4, fiber: 0 },
    { id: "carote-e-peperoni", name: "Carote e peperoni", qty: "250 g", grams: 250, kcal: 84, p: 2.5, c: 14.8, g: 0.6, fiber: 6.2 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "12 g", grams: 12, kcal: 108, p: 0, c: 0, g: 12, fiber: 0 },
    { id: "arancia", name: "Arancia", qty: "190 g", grams: 190, kcal: 70, p: 1.3, c: 14.8, g: 0.4, fiber: 3 },
    ],
  },
  {
    id: "pre",
    name: "Pre-workout",
    emoji: "⚡",
    time: "15:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "gallette-di-riso", name: "Gallette di riso", qty: "35 g", grams: 35, kcal: 134, p: 3, c: 28, g: 0.8, fiber: 1.1 },
    { id: "marmellata", name: "Marmellata", qty: "20 g", grams: 20, kcal: 45, p: 0.1, c: 11.7, g: 0, fiber: 0.4 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "55 g", grams: 55, kcal: 202, p: 5, c: 45.6, g: 1, fiber: 0.7 },
    { id: "manzo-magro", name: "Manzo magro", qty: "180 g", grams: 180, kcal: 185, p: 39.2, c: 0, g: 3.2, fiber: 0 },
    { id: "spinaci", name: "Spinaci", qty: "250 g", grams: 250, kcal: 88, p: 8.5, c: 7.2, g: 1.8, fiber: 4.8 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "10 g", grams: 10, kcal: 90, p: 0, c: 0, g: 10, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "8 g", grams: 8, kcal: 50, p: 1.8, c: 0.4, g: 4.4, fiber: 1 },
    ],
  },
]

const MEALS_3: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "250 ml", grams: 250, kcal: 115, p: 8.8, c: 12.5, g: 3.8, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "250 g", grams: 250, kcal: 108, p: 26.8, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "100 g", grams: 100, kcal: 76, p: 1.2, c: 17.4, g: 0.3, fiber: 1.8 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "40 g", grams: 40, kcal: 147, p: 3.6, c: 33.2, g: 0.8, fiber: 0.5 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "200 g", grams: 200, kcal: 200, p: 46.6, c: 0, g: 1.6, fiber: 0 },
    { id: "broccoli", name: "Broccoli", qty: "300 g", grams: 300, kcal: 99, p: 9, c: 9.3, g: 1.2, fiber: 9.3 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "15 g", grams: 15, kcal: 135, p: 0, c: 0, g: 15, fiber: 0 },
    ],
  },
  {
    id: "spuntino",
    name: "Spuntino",
    emoji: "🥪",
    time: "16:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    { id: "kiwi", name: "Kiwi", qty: "150 g", grams: 150, kcal: 72, p: 1.8, c: 13.5, g: 0.9, fiber: 3.3 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "patate", name: "Patate", qty: "150 g", grams: 150, kcal: 108, p: 3, c: 24, g: 0.2, fiber: 2.7 },
    { id: "fagioli-cotti-sgocciolati", name: "Fagioli cotti sgocciolati", qty: "100 g", grams: 100, kcal: 106, p: 6.9, c: 16.4, g: 0.4, fiber: 6.9 },
    { id: "uova-intere", name: "Uova intere", qty: "110 g (≈2 uova)", grams: 110, kcal: 141, p: 13.6, c: 0, g: 9.6, fiber: 0 },
    { id: "tonno-al-naturale-sgocciolato", name: "Tonno al naturale sgocciolato", qty: "70 g", grams: 70, kcal: 72, p: 17.6, c: 0, g: 0.2, fiber: 0 },
    { id: "fagiolini", name: "Fagiolini", qty: "300 g", grams: 300, kcal: 72, p: 6.3, c: 7.2, g: 0.3, fiber: 8.7 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "5 g", grams: 5, kcal: 45, p: 0, c: 0, g: 5, fiber: 0 },
    { id: "mela", name: "Mela", qty: "180 g", grams: 180, kcal: 79, p: 0.4, c: 18, g: 0, fiber: 4.7 },
    ],
  },
]

const MEALS_4: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "300 ml", grams: 300, kcal: 138, p: 10.5, c: 15, g: 4.5, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "220 g", grams: 220, kcal: 95, p: 23.5, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "120 g", grams: 120, kcal: 91, p: 1.4, c: 20.9, g: 0.4, fiber: 2.2 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "80 g", grams: 80, kcal: 294, p: 7.2, c: 66.3, g: 1.5, fiber: 1 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "200 g", grams: 200, kcal: 200, p: 46.6, c: 0, g: 1.6, fiber: 0 },
    { id: "cavolo-e-carote", name: "Cavolo e carote", qty: "250 g", grams: 250, kcal: 80, p: 3, c: 13.9, g: 0.4, fiber: 7 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "12 g", grams: 12, kcal: 108, p: 0, c: 0, g: 12, fiber: 0 },
    { id: "mela", name: "Mela", qty: "180 g", grams: 180, kcal: 79, p: 0.4, c: 18, g: 0, fiber: 4.7 },
    ],
  },
  {
    id: "pre",
    name: "Pre-workout",
    emoji: "⚡",
    time: "15:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "gallette-di-riso", name: "Gallette di riso", qty: "35 g", grams: 35, kcal: 134, p: 3, c: 28, g: 0.8, fiber: 1.1 },
    { id: "marmellata", name: "Marmellata", qty: "20 g", grams: 20, kcal: 45, p: 0.1, c: 11.7, g: 0, fiber: 0.4 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "55 g", grams: 55, kcal: 202, p: 5, c: 45.6, g: 1, fiber: 0.7 },
    { id: "petto-di-tacchino", name: "Petto di tacchino", qty: "170 g", grams: 170, kcal: 182, p: 40.8, c: 0, g: 2, fiber: 0 },
    { id: "zucchine", name: "Zucchine", qty: "250 g", grams: 250, kcal: 40, p: 3.8, c: 4.2, g: 0.2, fiber: 3 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "15 g", grams: 15, kcal: 135, p: 0, c: 0, g: 15, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "8 g", grams: 8, kcal: 50, p: 1.8, c: 0.4, g: 4.4, fiber: 1 },
    ],
  },
]

const MEALS_5: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "300 ml", grams: 300, kcal: 138, p: 10.5, c: 15, g: 4.5, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "250 g", grams: 250, kcal: 108, p: 26.8, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "120 g", grams: 120, kcal: 91, p: 1.4, c: 20.9, g: 0.4, fiber: 2.2 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "70 g", grams: 70, kcal: 257, p: 6.3, c: 58, g: 1.3, fiber: 0.9 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "200 g", grams: 200, kcal: 200, p: 46.6, c: 0, g: 1.6, fiber: 0 },
    { id: "broccoli", name: "Broccoli", qty: "250 g", grams: 250, kcal: 82, p: 7.5, c: 7.8, g: 1, fiber: 7.8 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "12 g", grams: 12, kcal: 108, p: 0, c: 0, g: 12, fiber: 0 },
    { id: "arancia", name: "Arancia", qty: "190 g", grams: 190, kcal: 70, p: 1.3, c: 14.8, g: 0.4, fiber: 3 },
    ],
  },
  {
    id: "pre",
    name: "Pre-workout",
    emoji: "⚡",
    time: "15:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "gallette-di-riso", name: "Gallette di riso", qty: "35 g", grams: 35, kcal: 134, p: 3, c: 28, g: 0.8, fiber: 1.1 },
    { id: "marmellata", name: "Marmellata", qty: "20 g", grams: 20, kcal: 45, p: 0.1, c: 11.7, g: 0, fiber: 0.4 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "60 g", grams: 60, kcal: 220, p: 5.4, c: 49.7, g: 1.1, fiber: 0.8 },
    { id: "salmone", name: "Salmone", qty: "150 g", grams: 150, kcal: 278, p: 27.6, c: 1.5, g: 18, fiber: 0 },
    { id: "spinaci", name: "Spinaci", qty: "250 g", grams: 250, kcal: 88, p: 8.5, c: 7.2, g: 1.8, fiber: 4.8 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "5 g", grams: 5, kcal: 45, p: 0, c: 0, g: 5, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "8 g", grams: 8, kcal: 50, p: 1.8, c: 0.4, g: 4.4, fiber: 1 },
    ],
  },
]

const MEALS_6: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "300 ml", grams: 300, kcal: 138, p: 10.5, c: 15, g: 4.5, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "220 g", grams: 220, kcal: 95, p: 23.5, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "120 g", grams: 120, kcal: 91, p: 1.4, c: 20.9, g: 0.4, fiber: 2.2 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "80 g", grams: 80, kcal: 294, p: 7.2, c: 66.3, g: 1.5, fiber: 1 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "180 g", grams: 180, kcal: 180, p: 41.9, c: 0, g: 1.4, fiber: 0 },
    { id: "verdure-miste-surgelate", name: "Verdure miste surgelate", qty: "250 g", grams: 250, kcal: 100, p: 5, c: 15, g: 1, fiber: 7.5 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "12 g", grams: 12, kcal: 108, p: 0, c: 0, g: 12, fiber: 0 },
    { id: "mela", name: "Mela", qty: "180 g", grams: 180, kcal: 79, p: 0.4, c: 18, g: 0, fiber: 4.7 },
    ],
  },
  {
    id: "pre",
    name: "Pre-workout",
    emoji: "⚡",
    time: "15:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "gallette-di-riso", name: "Gallette di riso", qty: "35 g", grams: 35, kcal: 134, p: 3, c: 28, g: 0.8, fiber: 1.1 },
    { id: "marmellata", name: "Marmellata", qty: "20 g", grams: 20, kcal: 45, p: 0.1, c: 11.7, g: 0, fiber: 0.4 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "55 g", grams: 55, kcal: 202, p: 5, c: 45.6, g: 1, fiber: 0.7 },
    { id: "petto-di-tacchino", name: "Petto di tacchino", qty: "170 g", grams: 170, kcal: 182, p: 40.8, c: 0, g: 2, fiber: 0 },
    { id: "fagiolini", name: "Fagiolini", qty: "250 g", grams: 250, kcal: 60, p: 5.2, c: 6, g: 0.2, fiber: 7.2 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "15 g", grams: 15, kcal: 135, p: 0, c: 0, g: 15, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "8 g", grams: 8, kcal: 50, p: 1.8, c: 0.4, g: 4.4, fiber: 1 },
    ],
  },
]

const MEALS_7: Meal[] = [
  {
    id: "colazione",
    name: "Colazione",
    emoji: "🥣",
    time: "08:10",
    note: 'L’albume va sempre consumato cotto',
    items: [
    { id: "pan-bauletto-bianco", name: "Pan bauletto bianco", qty: "70 g (≈3 fette)", grams: 70, kcal: 190, p: 5.9, c: 33.9, g: 2.7, fiber: 3.1 },
    { id: "latte-parz-scremato", name: "Latte parz. scremato", qty: "250 ml", grams: 250, kcal: 115, p: 8.8, c: 12.5, g: 3.8, fiber: 0 },
    { id: "albume-duovo", name: "Albume d'uovo", qty: "250 g", grams: 250, kcal: 108, p: 26.8, c: 0, g: 0, fiber: 0 },
    { id: "banana", name: "Banana", qty: "100 g", grams: 100, kcal: 76, p: 1.2, c: 17.4, g: 0.3, fiber: 1.8 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    ],
  },
  {
    id: "pranzo",
    name: "Pranzo",
    emoji: "🍝",
    time: "13:00",
    items: [
    { id: "riso-basmati-secco", name: "Riso basmati secco", qty: "30 g", grams: 30, kcal: 110, p: 2.7, c: 24.9, g: 0.6, fiber: 0.4 },
    { id: "petto-di-pollo", name: "Petto di pollo", qty: "220 g", grams: 220, kcal: 220, p: 51.3, c: 0, g: 1.8, fiber: 0 },
    { id: "broccoli", name: "Broccoli", qty: "300 g", grams: 300, kcal: 99, p: 9, c: 9.3, g: 1.2, fiber: 9.3 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "15 g", grams: 15, kcal: 135, p: 0, c: 0, g: 15, fiber: 0 },
    ],
  },
  {
    id: "spuntino",
    name: "Spuntino",
    emoji: "🥪",
    time: "16:30",
    items: [
    { id: "yogurt-greco-0", name: "Yogurt greco 0%", qty: "250 g", grams: 250, kcal: 135, p: 25.8, c: 7.5, g: 0, fiber: 0 },
    { id: "mandorle", name: "Mandorle", qty: "10 g", grams: 10, kcal: 63, p: 2.2, c: 0.5, g: 5.5, fiber: 1.3 },
    { id: "kiwi", name: "Kiwi", qty: "150 g", grams: 150, kcal: 72, p: 1.8, c: 13.5, g: 0.9, fiber: 3.3 },
    ],
  },
  {
    id: "cena",
    name: "Cena",
    emoji: "🍗",
    time: "19:00",
    items: [
    { id: "patate", name: "Patate", qty: "200 g", grams: 200, kcal: 144, p: 4, c: 32, g: 0.2, fiber: 3.6 },
    { id: "salmone", name: "Salmone", qty: "160 g", grams: 160, kcal: 296, p: 29.4, c: 1.6, g: 19.2, fiber: 0 },
    { id: "spinaci", name: "Spinaci", qty: "300 g", grams: 300, kcal: 105, p: 10.2, c: 8.7, g: 2.1, fiber: 5.7 },
    { id: "olio-extravergine", name: "Olio extravergine", qty: "5 g", grams: 5, kcal: 45, p: 0, c: 0, g: 5, fiber: 0 },
    { id: "mela", name: "Mela", qty: "180 g", grams: 180, kcal: 79, p: 0.4, c: 18, g: 0, fiber: 4.7 },
    ],
  },
]

export const MEALS_BY_DAY: Meal[][] = [MEALS_1, MEALS_2, MEALS_3, MEALS_4, MEALS_5, MEALS_6, MEALS_7]

/** id alimento -> nome usato dal piano */
export const ALL_FOODS: Record<string, string> = {
  "pan-bauletto-bianco": "Pan bauletto bianco",
  "latte-parz-scremato": "Latte parz. scremato",
  "albume-duovo": "Albume d'uovo",
  "banana": "Banana",
  "mandorle": "Mandorle",
  "riso-basmati-secco": "Riso basmati secco",
  "petto-di-pollo": "Petto di pollo",
  "broccoli": "Broccoli",
  "olio-extravergine": "Olio extravergine",
  "mela": "Mela",
  "yogurt-greco-0": "Yogurt greco 0%",
  "gallette-di-riso": "Gallette di riso",
  "marmellata": "Marmellata",
  "petto-di-tacchino": "Petto di tacchino",
  "zucchine": "Zucchine",
  "carote-e-peperoni": "Carote e peperoni",
  "arancia": "Arancia",
  "manzo-magro": "Manzo magro",
  "spinaci": "Spinaci",
  "kiwi": "Kiwi",
  "patate": "Patate",
  "fagioli-cotti-sgocciolati": "Fagioli cotti sgocciolati",
  "uova-intere": "Uova intere",
  "tonno-al-naturale-sgocciolato": "Tonno al naturale sgocciolato",
  "fagiolini": "Fagiolini",
  "cavolo-e-carote": "Cavolo e carote",
  "salmone": "Salmone",
  "verdure-miste-surgelate": "Verdure miste surgelate",
}

/** Regole di pesatura: sbagliarle falsa i totali di tutta la settimana */
export const WEIGHING_RULES = [
  "Riso: peso a secco",
  "Pollo, tacchino, manzo e salmone: peso crudo e pulito",
  "Tonno e fagioli: peso cotto e sgocciolato",
  "Uova: peso senza guscio",
  "Albume: peso del prodotto, da consumare sempre cotto",
  "Frutta e verdura: peso della parte commestibile",
  "Olio extravergine: sempre pesato con la bilancia",
  "Acqua, caffè o tè non zuccherati, spezie, limone, aceto ed erbe non si contano",
  "Per i prodotti confezionati fa fede l’etichetta: correggi i valori dal pasto",
]

/** Spesa per 7 giorni */
export const SHOPPING_LIST: Array<[string, string]> = [
  ["Gallette di riso", "175 g"],
  ["Patate", "350 g"],
  ["Marmellata", "100 g"],
  ["Albume d'uovo", "1,63 kg; in pratica circa 1,7 litri in brick"],
  ["Petto di pollo", "1,36 kg"],
  ["Petto di tacchino", "510 g"],
  ["Manzo magro", "180 g"],
  ["Salmone", "310 g"],
  ["Tonno al naturale sgocciolato", "70 g"],
  ["Uova intere", "110 g senza guscio; circa 2 uova grandi"],
  ["Fagioli cotti e sgocciolati", "100 g"],
  ["Latte parzialmente scremato", "2 litri"],
  ["Yogurt greco 0%", "1,75 kg"],
  ["Banane", "800 g commestibili"],
  ["Mele", "900 g; circa 5 mele da 180 g"],
  ["Arance", "380 g; circa 2 arance"],
  ["Kiwi", "300 g commestibili"],
  ["Broccoli", "1,10 kg"],
  ["Carote e peperoni", "250 g totali"],
  ["Cavolo e carote", "250 g totali"],
  ["Verdure miste surgelate", "250 g"],
  ["Zucchine", "500 g"],
  ["Spinaci", "800 g"],
  ["Fagiolini", "550 g"],
  ["Mandorle", "130 g totali"],
  ["Olio extravergine", "160 g; circa 175 ml"],
  ["Creatina", "35 g"],
]

/** Media settimanale del piano */
export const WEEKLY_AVERAGE = {
  kcal: 2201,
  p: 180.8,
  c: 241.7,
  g: 54.9,
  fiber: 30.2,
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

export const PROGRAM_START = '2026-08-22'
