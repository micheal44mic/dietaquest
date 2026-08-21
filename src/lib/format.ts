/** Numero con la virgola decimale italiana, senza zeri finali inutili */
export const num = (n: number, max = 2): string => {
  const fixed = n.toFixed(max)
  const trimmed = fixed.includes('.') ? fixed.replace(/0+$/, '').replace(/\.$/, '') : fixed
  return trimmed.replace('.', ',')
}

/** Come `num`, ma con il segno + davanti ai valori positivi */
export const signed = (n: number, max = 2): string => (n > 0 ? '+' : '') + num(n, max)

/** Migliaia con il punto: 8000 -> 8.000 */
export const thousands = (n: number): string =>
  String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
