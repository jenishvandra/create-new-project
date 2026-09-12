export interface User {
  id: number
  username: string
  email: string
}

export interface CharacterProfile {
  user_id: number
  level: number
  current_xp: number
  nextLevelXp: number
  gold: number
  gems: number
  streak: number
  last_active_date: string | null
  equipped_avatar: string
  equipped_theme: string
  equipped_title: string
  active_xp_multiplier: number
  total_quests_completed: number
}

export interface CharacterStats {
  strength: number
  intellect: number
  wisdom: number
  agility: number
  charisma: number
  vitality: number
}

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic'
export type QuestPriority = 'low' | 'medium' | 'high' | 'legendary'
export type QuestRecurrence = 'daily' | 'main' | 'side' | 'boss'
export type QuestStatus = 'active' | 'completed' | 'abandoned'

export interface Quest {
  id: string
  user_id: number
  title: string
  description?: string
  category: string
  difficulty: QuestDifficulty
  recurrence: QuestRecurrence
  due_date: string
  status: QuestStatus
  priority: QuestPriority
  xp_reward: number
  gold_reward: number
  gem_reward: number
  created_at?: string
  completed_at?: string
}

export type ItemType = 'theme' | 'avatar' | 'title' | 'potion'

export interface ShopItem {
  id: string
  name: string
  description: string
  type: ItemType
  cost_gold: number
  cost_gems: number
  icon: string
  value: string
}

export interface InventoryItem {
  id: number
  user_id: number
  item_id: string
  item_name: string
  item_type: ItemType
  is_equipped: number
  quantity: number
  acquired_at?: string
}

export interface CustomReward {
  id: number
  user_id: number
  title: string
  cost_gold: number
  icon: string
  created_at?: string
}

export interface BossBattle {
  user_id: number
  boss_name: string
  max_hp: number
  current_hp: number
  level: number
  defeated_count: number
  reward_claimed: number
}

export interface QuestLog {
  id: number
  user_id: number
  quest_id: string
  quest_title: string
  category: string
  xp_gained: number
  gold_gained: number
  completed_at: string
}

export interface GainsSummary {
  xp: number
  gold: number
  gems: number
  statBoost: { stat: string; amount: number }
  levelInfo: {
    level: number
    currentXp: number
    nextLevelXp: number
    leveledUp: boolean
    levelsGained: number
  }
}
