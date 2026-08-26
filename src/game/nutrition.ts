import type { FoodItem, FoodOverride, Meal, Nutrients } from '../types'

const ZERO: Nutrients = { kcal: 0, p: 0, c: 0, g: 0, fiber: 0 }

const arrotonda = (n: Nutrients): Nutrients => ({
  kcal: Math.round(n.kcal),
  p: Math.round(n.p * 10) / 10,
  c: Math.round(n.c * 10) / 10,
  g: Math.round(n.g * 10) / 10,
  fiber: Math.round(n.fiber * 10) / 10,
})

export interface ResolvedItem extends FoodItem {
  /** Valori effettivi: quelli del piano, oppure quelli del prodotto dell'utente */
  actual: Nutrients
  /** L'utente ha registrato il proprio prodotto per questa voce */
  custom: boolean
  /** Nome del prodotto dell'utente, se ne ha messo uno */
  customName?: string
}

/**
 * Applica la correzione dell'utente a una voce del piano.
 * Le correzioni sono salvate per 100 g: qui vengono riportate alla quantità
 * prevista per quel giorno, così lo stesso prodotto vale anche dove la
 * porzione cambia (il pollo va da 180 a 220 g secondo la giornata).
 */
export function resolveItem(
  item: FoodItem,
  overrides: Record<string, FoodOverride>,
): ResolvedItem {
  const o = overrides[item.id]
  if (!o) {
    return {
      ...item,
      custom: false,
      actual: { kcal: item.kcal, p: item.p, c: item.c, g: item.g, fiber: item.fiber },
    }
  }
  const k = item.grams / 100
  return {
    ...item,
    custom: true,
    customName: o.name,
    actual: arrotonda({
      kcal: o.kcal * k,
      p: o.p * k,
      c: o.c * k,
      g: o.g * k,
      fiber: o.fiber * k,
    }),
  }
}

export const somma = (parti: Nutrients[]): Nutrients =>
  arrotonda(
    parti.reduce(
      (t, n) => ({
        kcal: t.kcal + n.kcal,
        p: t.p + n.p,
        c: t.c + n.c,
        g: t.g + n.g,
        fiber: t.fiber + n.fiber,
      }),
      ZERO,
    ),
  )

export const resolveMeal = (meal: Meal, overrides: Record<string, FoodOverride>) =>
  meal.items.map((i) => resolveItem(i, overrides))

export const mealTotals = (meal: Meal, overrides: Record<string, FoodOverride>): Nutrients =>
  somma(resolveMeal(meal, overrides).map((i) => i.actual))

export const dayTotals = (meals: Meal[], overrides: Record<string, FoodOverride>): Nutrients =>
  somma(meals.map((m) => mealTotals(m, overrides)))

/** Valori per 100 g di una voce del piano: precompilano l'editor */
export const per100 = (item: FoodItem): FoodOverride => {
  const k = 100 / item.grams
  return {
    kcal: Math.round(item.kcal * k),
    p: Math.round(item.p * k * 10) / 10,
    c: Math.round(item.c * k * 10) / 10,
    g: Math.round(item.g * k * 10) / 10,
    fiber: Math.round(item.fiber * k * 10) / 10,
  }
}
