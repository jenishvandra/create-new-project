export interface LevelInfo {
  level: number
  currentXp: number
  nextLevelXp: number
  leveledUp: boolean
  levelsGained: number
}

export interface DifficultyRewards {
  xp: number
  gold: number
  gems: number
}

export const DIFFICULTY_REWARDS: Record<string, DifficultyRewards> = {
  easy: { xp: 25, gold: 10, gems: 0 },
  medium: { xp: 50, gold: 25, gems: 0 },
  hard: { xp: 100, gold: 60, gems: 0 },
  epic: { xp: 250, gold: 150, gems: 1 }
}

export const PRIORITY_MULTIPLIER: Record<string, number> = {
  low: 1.0,
  medium: 1.1,
  high: 1.25,
  legendary: 1.5
}

export function getNextLevelXp(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5))
}

export function calculateQuestGains(
  difficulty: string,
  priority: string = 'medium',
  streakDays: number = 1,
  activeMultiplier: number = 1.0
) {
  const base = DIFFICULTY_REWARDS[difficulty.toLowerCase()] || DIFFICULTY_REWARDS.medium
  const priorityMult = PRIORITY_MULTIPLIER[priority.toLowerCase()] || 1.0
  const streakMult = 1 + Math.min((streakDays - 1) * 0.05, 0.5) // Max 50% streak bonus

  const finalXp = Math.floor(base.xp * priorityMult * streakMult * activeMultiplier)
  const finalGold = Math.floor(base.gold * priorityMult * streakMult)
  const finalGems = base.gems

  return {
    xp: finalXp,
    gold: finalGold,
    gems: finalGems
  }
}

export function processXpGain(currentLevel: number, currentXp: number, xpGained: number): LevelInfo {
  let level = currentLevel
  let xp = currentXp + xpGained
  let levelsGained = 0

  let required = getNextLevelXp(level)
  while (xp >= required) {
    xp -= required
    level++
    levelsGained++
    required = getNextLevelXp(level)
  }

  return {
    level,
    currentXp: xp,
    nextLevelXp: required,
    leveledUp: levelsGained > 0,
    levelsGained
  }
}

export const CATEGORY_TO_STAT: Record<string, string> = {
  coding: 'intellect',
  tech: 'intellect',
  work: 'intellect',
  gym: 'strength',
  fitness: 'strength',
  workout: 'strength',
  reading: 'wisdom',
  study: 'wisdom',
  learning: 'wisdom',
  social: 'charisma',
  networking: 'charisma',
  running: 'agility',
  sports: 'agility',
  meditation: 'vitality',
  health: 'vitality',
  sleep: 'vitality'
}

export function getStatForCategory(category: string): string {
  const catLower = category.toLowerCase()
  for (const [key, stat] of Object.entries(CATEGORY_TO_STAT)) {
    if (catLower.includes(key)) return stat
  }
  return 'intellect' // Default stat
}
