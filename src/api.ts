import type {
  User,
  CharacterProfile,
  CharacterStats,
  Quest,
  ShopItem,
  InventoryItem,
  CustomReward,
  BossBattle,
  QuestLog,
  GainsSummary
} from './types/rpg'

const API_BASE = '/api'
const TOKEN_KEY = 'life_rpg_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network response error' }))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Auth
export async function loginUser(username: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })
  setStoredToken(data.token)
  return data
}

export async function registerUser(username: string, email: string, password: string): Promise<{ token: string; user: User }> {
  const data = await request<{ token: string; user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  })
  setStoredToken(data.token)
  return data
}

export async function getMe(): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me')
}

export function logoutUser() {
  setStoredToken(null)
}

// Profile
export async function fetchProfile(): Promise<{ user: User; profile: CharacterProfile; stats: CharacterStats }> {
  return request<{ user: User; profile: CharacterProfile; stats: CharacterStats }>('/profile')
}

// Quests
export async function fetchQuests(): Promise<{ quests: Quest[] }> {
  return request<{ quests: Quest[] }>('/quests')
}

export async function createQuest(questData: Partial<Quest>): Promise<{ quest: Quest }> {
  return request<{ quest: Quest }>('/quests', {
    method: 'POST',
    body: JSON.stringify(questData)
  })
}

export async function updateQuest(id: string, questData: Partial<Quest>): Promise<{ quest: Quest }> {
  return request<{ quest: Quest }>(`/quests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(questData)
  })
}

export async function deleteQuest(id: string): Promise<{ success: boolean; id: string }> {
  return request<{ success: boolean; id: string }>(`/quests/${id}`, {
    method: 'DELETE'
  })
}

export async function completeQuest(id: string): Promise<{
  success: boolean
  gains: GainsSummary
  bossDamage: number
  bossDefeated: boolean
  profile: CharacterProfile
  stats: CharacterStats
}> {
  return request(`/quests/${id}/complete`, {
    method: 'POST'
  })
}

// Shop & Inventory
export async function fetchShop(): Promise<{ items: ShopItem[]; inventory: InventoryItem[]; customRewards: CustomReward[] }> {
  return request('/shop')
}

export async function buyShopItem(itemId: string): Promise<{ success: boolean; profile: CharacterProfile; inventory: InventoryItem[] }> {
  return request('/shop/buy', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  })
}

export async function equipInventoryItem(itemId: string, type: string): Promise<{ success: boolean; profile: CharacterProfile; inventory: InventoryItem[] }> {
  return request('/inventory/equip', {
    method: 'POST',
    body: JSON.stringify({ itemId, type })
  })
}

export async function useInventoryItem(itemId: string): Promise<{ success: boolean; profile: CharacterProfile; inventory: InventoryItem[] }> {
  return request('/inventory/use', {
    method: 'POST',
    body: JSON.stringify({ itemId })
  })
}

export async function createCustomReward(title: string, cost_gold: number, icon: string = 'gift'): Promise<{ customRewards: CustomReward[] }> {
  return request('/rewards/create', {
    method: 'POST',
    body: JSON.stringify({ title, cost_gold, icon })
  })
}

export async function claimCustomReward(rewardId: number): Promise<{ success: boolean; rewardClaimed: CustomReward; profile: CharacterProfile }> {
  return request('/rewards/claim', {
    method: 'POST',
    body: JSON.stringify({ rewardId })
  })
}

// Boss
export async function fetchBoss(): Promise<{ boss: BossBattle }> {
  return request<{ boss: BossBattle }>('/boss')
}

export async function respawnBoss(): Promise<{ boss: BossBattle }> {
  return request<{ boss: BossBattle }>('/boss/respawn', {
    method: 'POST'
  })
}

// Analytics
export async function fetchAnalytics(): Promise<{ logs: QuestLog[]; completedCount: number; totalXp: number }> {
  return request<{ logs: QuestLog[]; completedCount: number; totalXp: number }>('/analytics')
}

// Reset Demo Data
export async function resetDemoData(): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>('/seed', {
    method: 'POST'
  })
}
