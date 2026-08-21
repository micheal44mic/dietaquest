/** XP necessari per passare dal livello `level` al successivo */
export const xpForLevel = (level: number) => 150 + (level - 1) * 75

export interface LevelInfo {
  level: number
  into: number
  need: number
  title: string
  titleEmoji: string
}

const TITLES: Array<[minLevel: number, title: string, emoji: string]> = [
  [1, 'Recluta della Colazione', '🥄'],
  [3, 'Esploratore degli Spuntini', '🧭'],
  [5, 'Cavaliere della Cucina', '⚔️'],
  [8, 'Maestro dei Macros', '🎓'],
  [12, 'Campione del Bilanciere', '🏆'],
  [16, 'Leggenda della Dieta', '🐉'],
  [20, 'Divinità della Nutrizione', '✨'],
]

export const levelFromXP = (totalXP: number): LevelInfo => {
  let level = 1
  let rest = totalXP
  while (rest >= xpForLevel(level)) {
    rest -= xpForLevel(level)
    level += 1
  }
  let title = TITLES[0][1]
  let titleEmoji = TITLES[0][2]
  for (const [min, t, e] of TITLES) {
    if (level >= min) {
      title = t
      titleEmoji = e
    }
  }
  return { level, into: rest, need: xpForLevel(level), title, titleEmoji }
}
