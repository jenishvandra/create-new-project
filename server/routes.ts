import { Router, type Request, type Response } from 'express'
import { db } from './database.ts'
import {
  calculateQuestGains,
  processXpGain,
  getStatForCategory,
  getNextLevelXp
} from './engine.ts'

export const apiRouter = Router()

// Helper to authenticate user header or default to user 1
function getUserId(req: Request): number {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const parsed = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
      if (parsed && parsed.userId) return Number(parsed.userId)
    } catch {
      // Fallback
    }
  }
  // Default to 1 (Demo User) if no token provided
  return 1
}

// Helper to generate simple token
function makeToken(userId: number, username: string): string {
  return Buffer.from(JSON.stringify({ userId, username, time: Date.now() })).toString('base64')
}

// ── Auth Endpoints ─────────────────────────────────────────────────────────

// POST /api/auth/register
apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' })
  }

  try {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email)
    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' })
    }

    const userResult = db.prepare(`
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `).run(username, email, password)

    const userId = Number(userResult.lastInsertRowid)

    // Init profile
    const today = new Date().toISOString().split('T')[0]
    db.prepare(`
      INSERT INTO character_profiles (user_id, level, current_xp, gold, gems, streak, last_active_date, equipped_avatar, equipped_theme, equipped_title)
      VALUES (?, 1, 0, 100, 5, 1, ?, 'cyber_hero', 'cyberpunk', 'Novice Adventurer')
    `).run(userId, today)

    // Init stats
    db.prepare(`
      INSERT INTO character_stats (user_id, strength, intellect, wisdom, agility, charisma, vitality)
      VALUES (?, 10, 10, 10, 10, 10, 10)
    `).run(userId)

    // Init boss
    db.prepare(`
      INSERT INTO boss_battles (user_id, boss_name, max_hp, current_hp, level, defeated_count, reward_claimed)
      VALUES (?, 'Lord Procrastinoid the Idle', 1000, 1000, 1, 0, 0)
    `).run(userId)

    // Add starter inventory
    db.prepare(`
      INSERT INTO inventory (user_id, item_id, item_name, item_type, is_equipped)
      VALUES (?, 'theme_cyberpunk', 'Cyberpunk Neon', 'theme', 1),
             (?, 'avatar_cyber_hero', 'Cyber Cyberware', 'avatar', 1),
             (?, 'title_novice', 'Novice Adventurer', 'title', 1)
    `).run(userId, userId, userId)

    // Starter quests
    const starterQuests = [
      { id: `q_${Date.now()}_1`, title: 'Complete your first Quest', category: 'Coding', difficulty: 'easy', priority: 'medium', xp: 25, gold: 10 },
      { id: `q_${Date.now()}_2`, title: 'Explore the RPG Shop', category: 'Reading', difficulty: 'easy', priority: 'low', xp: 25, gold: 10 }
    ]
    for (const q of starterQuests) {
      db.prepare(`
        INSERT INTO quests (id, user_id, title, category, difficulty, recurrence, due_date, status, priority, xp_reward, gold_reward)
        VALUES (?, ?, ?, ?, ?, 'main', ?, 'active', ?, ?, ?)
      `).run(q.id, userId, q.title, q.category, q.difficulty, today, q.priority, q.xp, q.gold)
    }

    const token = makeToken(userId, username)
    return res.json({ token, user: { id: userId, username, email } })
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed' })
  }
})

// POST /api/auth/login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' })
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const token = makeToken(user.id, user.username)
  return res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
})

// GET /api/auth/me
apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const user = db.prepare('SELECT id, username, email, created_at FROM users WHERE id = ?').get(userId) as any
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  return res.json({ user })
})

// ── Profile & Character Endpoints ─────────────────────────────────────────

// GET /api/profile
apiRouter.get('/profile', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const user = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(userId) as any
  const profile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  const stats = db.prepare('SELECT * FROM character_stats WHERE user_id = ?').get(userId) as any

  if (!profile || !stats) {
    return res.status(404).json({ error: 'Profile not found' })
  }

  // Update streak if needed
  const today = new Date().toISOString().split('T')[0]
  if (profile.last_active_date) {
    const lastActive = new Date(profile.last_active_date)
    const currentDate = new Date(today)
    const diffTime = Math.abs(currentDate.getTime() - lastActive.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > 1) {
      // Check if user has streak shield
      const shield = db.prepare("SELECT * FROM inventory WHERE user_id = ? AND item_id = 'potion_streak_shield' AND quantity > 0").get(userId) as any
      if (shield) {
        // Consume shield
        if (shield.quantity > 1) {
          db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE id = ?').run(shield.id)
        } else {
          db.prepare('DELETE FROM inventory WHERE id = ?').run(shield.id)
        }
      } else {
        // Reset streak
        db.prepare('UPDATE character_profiles SET streak = 1, last_active_date = ? WHERE user_id = ?').run(today, userId)
        profile.streak = 1
      }
    }
  }

  const nextLevelXp = getNextLevelXp(profile.level)

  return res.json({
    user,
    profile: {
      ...profile,
      nextLevelXp
    },
    stats
  })
})

// ── Quests Endpoints ──────────────────────────────────────────────────────

// GET /api/quests
apiRouter.get('/quests', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const quests = db.prepare('SELECT * FROM quests WHERE user_id = ? ORDER BY created_at DESC').all(userId)
  return res.json({ quests })
})

// POST /api/quests
apiRouter.post('/quests', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { title, description, category, difficulty, recurrence, due_date, priority } = req.body

  if (!title || !category || !difficulty) {
    return res.status(400).json({ error: 'Title, category, and difficulty are required' })
  }

  const gains = calculateQuestGains(difficulty, priority || 'medium', 1, 1.0)
  const questId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  db.prepare(`
    INSERT INTO quests (id, user_id, title, description, category, difficulty, recurrence, due_date, status, priority, xp_reward, gold_reward, gem_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
  `).run(
    questId,
    userId,
    title,
    description || '',
    category,
    difficulty,
    recurrence || 'main',
    due_date || new Date().toISOString().split('T')[0],
    priority || 'medium',
    gains.xp,
    gains.gold,
    gains.gems
  )

  const created = db.prepare('SELECT * FROM quests WHERE id = ?').get(questId)
  return res.json({ quest: created })
})

// PUT /api/quests/:id
apiRouter.put('/quests/:id', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const questId = String(req.params.id)
  const { title, description, category, difficulty, recurrence, due_date, priority } = req.body

  const existing = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(questId, userId) as any
  if (!existing) {
    return res.status(404).json({ error: 'Quest not found' })
  }

  const gains = calculateQuestGains(difficulty || existing.difficulty, priority || existing.priority, 1, 1.0)

  db.prepare(`
    UPDATE quests
    SET title = ?, description = ?, category = ?, difficulty = ?, recurrence = ?, due_date = ?, priority = ?, xp_reward = ?, gold_reward = ?, gem_reward = ?
    WHERE id = ? AND user_id = ?
  `).run(
    title || existing.title,
    description !== undefined ? description : existing.description,
    category || existing.category,
    difficulty || existing.difficulty,
    recurrence || existing.recurrence,
    due_date || existing.due_date,
    priority || existing.priority,
    gains.xp,
    gains.gold,
    gains.gems,
    questId,
    userId
  )

  const updated = db.prepare('SELECT * FROM quests WHERE id = ?').get(questId)
  return res.json({ quest: updated })
})

// DELETE /api/quests/:id
apiRouter.delete('/quests/:id', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const questId = String(req.params.id)

  const existing = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(questId, userId)
  if (!existing) {
    return res.status(404).json({ error: 'Quest not found' })
  }

  db.prepare('DELETE FROM quests WHERE id = ? AND user_id = ?').run(questId, userId)
  return res.json({ success: true, id: questId })
})

// POST /api/quests/:id/complete
apiRouter.post('/quests/:id/complete', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const questId = String(req.params.id)

  const quest = db.prepare('SELECT * FROM quests WHERE id = ? AND user_id = ?').get(questId, userId) as any
  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' })
  }
  if (quest.status === 'completed') {
    return res.status(400).json({ error: 'Quest already completed' })
  }

  const profile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  const stats = db.prepare('SELECT * FROM character_stats WHERE user_id = ?').get(userId) as any

  // Calculate rewards with multipliers
  const gains = calculateQuestGains(quest.difficulty, quest.priority, profile.streak, profile.active_xp_multiplier)

  // Update level and XP
  const levelInfo = processXpGain(profile.level, profile.current_xp, gains.xp)

  // Consume XP multiplier if active
  let newXpMult = profile.active_xp_multiplier
  if (profile.active_xp_multiplier > 1.0) {
    newXpMult = 1.0 // Single boost consumption
  }

  // Update profile
  const today = new Date().toISOString().split('T')[0]
  const isNewDay = profile.last_active_date !== today
  const newStreak = isNewDay ? profile.streak + 1 : profile.streak
  const newQuestsCount = profile.total_quests_completed + 1

  db.prepare(`
    UPDATE character_profiles
    SET level = ?, current_xp = ?, gold = gold + ?, gems = gems + ?, streak = ?, last_active_date = ?, active_xp_multiplier = ?, total_quests_completed = ?
    WHERE user_id = ?
  `).run(
    levelInfo.level,
    levelInfo.currentXp,
    gains.gold,
    gains.gems,
    newStreak,
    today,
    newXpMult,
    newQuestsCount,
    userId
  )

  // Stat boost based on category
  const targetStat = getStatForCategory(quest.category)
  const statGain = quest.difficulty === 'epic' ? 3 : quest.difficulty === 'hard' ? 2 : 1
  db.prepare(`UPDATE character_stats SET ${targetStat} = ${targetStat} + ? WHERE user_id = ?`).run(statGain, userId)

  // If level up happened, boost all stats by level gain
  if (levelInfo.leveledUp) {
    db.prepare(`
      UPDATE character_stats
      SET strength = strength + ?, intellect = intellect + ?, wisdom = wisdom + ?, agility = agility + ?, charisma = charisma + ?, vitality = vitality + ?
      WHERE user_id = ?
    `).run(
      levelInfo.levelsGained * 2,
      levelInfo.levelsGained * 2,
      levelInfo.levelsGained * 2,
      levelInfo.levelsGained * 2,
      levelInfo.levelsGained * 2,
      levelInfo.levelsGained * 2,
      userId
    )
  }

  // Update quest status
  const completedAt = new Date().toISOString()
  db.prepare("UPDATE quests SET status = 'completed', completed_at = ? WHERE id = ?").run(completedAt, questId)

  // Log quest completion
  db.prepare(`
    INSERT INTO quest_logs (user_id, quest_id, quest_title, category, xp_gained, gold_gained, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, questId, quest.title, quest.category, gains.xp, gains.gold, completedAt)

  // Deal damage to Boss
  let bossDamage = gains.xp
  let bossDefeated = false
  const boss = db.prepare('SELECT * FROM boss_battles WHERE user_id = ?').get(userId) as any
  if (boss && boss.current_hp > 0) {
    const newHp = Math.max(0, boss.current_hp - bossDamage)
    if (newHp === 0 && boss.current_hp > 0) {
      bossDefeated = true
      // Reward bonus gold & gems for boss defeat
      db.prepare('UPDATE character_profiles SET gold = gold + 200, gems = gems + 5 WHERE user_id = ?').run(userId)
      db.prepare('UPDATE boss_battles SET current_hp = 0, defeated_count = defeated_count + 1 WHERE user_id = ?').run(userId)
    } else {
      db.prepare('UPDATE boss_battles SET current_hp = ? WHERE user_id = ?').run(newHp, userId)
    }
  }

  // Retrieve updated profile & stats
  const updatedProfile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  const updatedStats = db.prepare('SELECT * FROM character_stats WHERE user_id = ?').get(userId) as any

  return res.json({
    success: true,
    gains: {
      xp: gains.xp,
      gold: gains.gold,
      gems: gains.gems,
      statBoost: { stat: targetStat, amount: statGain },
      levelInfo
    },
    bossDamage,
    bossDefeated,
    profile: {
      ...updatedProfile,
      nextLevelXp: getNextLevelXp(updatedProfile.level)
    },
    stats: updatedStats
  })
})

// ── Shop & Inventory Endpoints ─────────────────────────────────────────────

// GET /api/shop
apiRouter.get('/shop', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const items = db.prepare('SELECT * FROM shop_items').all()
  const userInventory = db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId)
  const customRewards = db.prepare('SELECT * FROM custom_rewards WHERE user_id = ?').all(userId)

  return res.json({ items, inventory: userInventory, customRewards })
})

// POST /api/shop/buy
apiRouter.post('/shop/buy', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { itemId } = req.body

  const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemId) as any
  if (!item) {
    return res.status(404).json({ error: 'Shop item not found' })
  }

  const profile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  if (profile.gold < item.cost_gold || profile.gems < item.cost_gems) {
    return res.status(400).json({ error: 'Insufficient Gold or Gems' })
  }

  // Deduct currency
  db.prepare('UPDATE character_profiles SET gold = gold - ?, gems = gems - ? WHERE user_id = ?').run(item.cost_gold, item.cost_gems, userId)

  // Check if item already in inventory
  const existing = db.prepare('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any
  if (existing) {
    db.prepare('UPDATE inventory SET quantity = quantity + 1 WHERE id = ?').run(existing.id)
  } else {
    db.prepare(`
      INSERT INTO inventory (user_id, item_id, item_name, item_type, is_equipped, quantity)
      VALUES (?, ?, ?, ?, 0, 1)
    `).run(userId, item.id, item.name, item.type)
  }

  const updatedProfile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  const userInventory = db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId)

  return res.json({
    success: true,
    profile: {
      ...updatedProfile,
      nextLevelXp: getNextLevelXp(updatedProfile.level)
    },
    inventory: userInventory
  })
})

// POST /api/inventory/equip
apiRouter.post('/inventory/equip', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { itemId, type } = req.body

  const item = db.prepare('SELECT * FROM inventory WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any
  if (!item) {
    return res.status(404).json({ error: 'Item not in inventory' })
  }

  const shopItem = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemId) as any
  if (!shopItem) {
    return res.status(404).json({ error: 'Item reference not found' })
  }

  // Unequip all items of same type in inventory
  db.prepare('UPDATE inventory SET is_equipped = 0 WHERE user_id = ? AND item_type = ?').run(userId, type)
  // Equip target item
  db.prepare('UPDATE inventory SET is_equipped = 1 WHERE user_id = ? AND item_id = ?').run(userId, itemId)

  // Update profile field
  if (type === 'theme') {
    db.prepare('UPDATE character_profiles SET equipped_theme = ? WHERE user_id = ?').run(shopItem.value, userId)
  } else if (type === 'avatar') {
    db.prepare('UPDATE character_profiles SET equipped_avatar = ? WHERE user_id = ?').run(shopItem.value, userId)
  } else if (type === 'title') {
    db.prepare('UPDATE character_profiles SET equipped_title = ? WHERE user_id = ?').run(shopItem.value, userId)
  }

  const updatedProfile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  const userInventory = db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId)

  return res.json({
    success: true,
    profile: {
      ...updatedProfile,
      nextLevelXp: getNextLevelXp(updatedProfile.level)
    },
    inventory: userInventory
  })
})

// POST /api/inventory/use
apiRouter.post('/inventory/use', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { itemId } = req.body

  const item = db.prepare('SELECT * FROM inventory WHERE user_id = ? AND item_id = ? AND quantity > 0').get(userId, itemId) as any
  if (!item) {
    return res.status(404).json({ error: 'Potion not found in inventory' })
  }

  if (itemId === 'potion_xp_elixir') {
    db.prepare('UPDATE character_profiles SET active_xp_multiplier = 2.0 WHERE user_id = ?').run(userId)
  }

  // Reduce quantity
  if (item.quantity > 1) {
    db.prepare('UPDATE inventory SET quantity = quantity - 1 WHERE id = ?').run(item.id)
  } else {
    db.prepare('DELETE FROM inventory WHERE id = ?').run(item.id)
  }

  const updatedProfile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  const userInventory = db.prepare('SELECT * FROM inventory WHERE user_id = ?').all(userId)

  return res.json({
    success: true,
    profile: {
      ...updatedProfile,
      nextLevelXp: getNextLevelXp(updatedProfile.level)
    },
    inventory: userInventory
  })
})

// POST /api/rewards/create
apiRouter.post('/rewards/create', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { title, cost_gold, icon } = req.body
  if (!title || !cost_gold) {
    return res.status(400).json({ error: 'Title and cost in gold are required' })
  }

  db.prepare(`
    INSERT INTO custom_rewards (user_id, title, cost_gold, icon)
    VALUES (?, ?, ?, ?)
  `).run(userId, title, cost_gold, icon || 'gift')

  const customRewards = db.prepare('SELECT * FROM custom_rewards WHERE user_id = ?').all(userId)
  return res.json({ customRewards })
})

// POST /api/rewards/claim
apiRouter.post('/rewards/claim', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const { rewardId } = req.body

  const reward = db.prepare('SELECT * FROM custom_rewards WHERE id = ? AND user_id = ?').get(rewardId, userId) as any
  if (!reward) {
    return res.status(404).json({ error: 'Reward not found' })
  }

  const profile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  if (profile.gold < reward.cost_gold) {
    return res.status(400).json({ error: 'Not enough Gold to claim this reward' })
  }

  db.prepare('UPDATE character_profiles SET gold = gold - ? WHERE user_id = ?').run(reward.cost_gold, userId)

  const updatedProfile = db.prepare('SELECT * FROM character_profiles WHERE user_id = ?').get(userId) as any
  return res.json({
    success: true,
    rewardClaimed: reward,
    profile: {
      ...updatedProfile,
      nextLevelXp: getNextLevelXp(updatedProfile.level)
    }
  })
})

// ── Boss Endpoints ─────────────────────────────────────────────────────────

// GET /api/boss
apiRouter.get('/boss', (req: Request, res: Response) => {
  const userId = getUserId(req)
  let boss = db.prepare('SELECT * FROM boss_battles WHERE user_id = ?').get(userId) as any

  if (!boss) {
    db.prepare(`
      INSERT INTO boss_battles (user_id, boss_name, max_hp, current_hp, level, defeated_count, reward_claimed)
      VALUES (?, 'Lord Procrastinoid the Idle', 1000, 1000, 1, 0, 0)
    `).run(userId)
    boss = db.prepare('SELECT * FROM boss_battles WHERE user_id = ?').get(userId)
  }

  return res.json({ boss })
})

// POST /api/boss/respawn
apiRouter.post('/boss/respawn', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const boss = db.prepare('SELECT * FROM boss_battles WHERE user_id = ?').get(userId) as any
  if (!boss) {
    return res.status(404).json({ error: 'Boss not found' })
  }

  const names = [
    'Lord Procrastinoid the Idle',
    'Shadow Beast of Distraction',
    'The Burnout Dragon',
    'Gorgon of Endless Scrolling'
  ]

  const nextLevel = boss.level + 1
  const nextName = names[nextLevel % names.length]
  const nextMaxHp = 1000 + nextLevel * 500

  db.prepare(`
    UPDATE boss_battles
    SET boss_name = ?, max_hp = ?, current_hp = ?, level = ?, reward_claimed = 0
    WHERE user_id = ?
  `).run(nextName, nextMaxHp, nextMaxHp, nextLevel, userId)

  const updatedBoss = db.prepare('SELECT * FROM boss_battles WHERE user_id = ?').get(userId)
  return res.json({ boss: updatedBoss })
})

// ── Analytics Endpoints ────────────────────────────────────────────────────

// GET /api/analytics
apiRouter.get('/analytics', (req: Request, res: Response) => {
  const userId = getUserId(req)
  const logs = db.prepare('SELECT * FROM quest_logs WHERE user_id = ? ORDER BY completed_at DESC LIMIT 50').all(userId)
  const completedCount = db.prepare("SELECT COUNT(*) as count FROM quests WHERE user_id = ? AND status = 'completed'").get(userId) as { count: number }
  const totalXp = db.prepare('SELECT SUM(xp_gained) as total FROM quest_logs WHERE user_id = ?').get(userId) as { total: number | null }

  return res.json({
    logs,
    completedCount: completedCount.count,
    totalXp: totalXp.total || 0
  })
})

// POST /api/seed - Reset demo data easily for reviewer testing
apiRouter.post('/seed', (req: Request, res: Response) => {
  const userId = getUserId(req)
  // Delete user quests & reset stats
  db.prepare('DELETE FROM quests WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM quest_logs WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM inventory WHERE user_id = ?').run(userId)
  db.prepare('DELETE FROM custom_rewards WHERE user_id = ?').run(userId)

  // Reset profile
  const today = new Date().toISOString().split('T')[0]
  db.prepare(`
    UPDATE character_profiles
    SET level = 3, current_xp = 140, gold = 220, gems = 12, streak = 5, last_active_date = ?, equipped_avatar = 'cyber_hero', equipped_theme = 'cyberpunk', equipped_title = 'Code Sorcerer', active_xp_multiplier = 1.0, total_quests_completed = 8
    WHERE user_id = ?
  `).run(today, userId)

  // Reset stats
  db.prepare(`
    UPDATE character_stats
    SET strength = 18, intellect = 25, wisdom = 20, agility = 14, charisma = 16, vitality = 22
    WHERE user_id = ?
  `).run(userId)

  // Reset boss
  db.prepare(`
    UPDATE boss_battles
    SET boss_name = 'Lord Procrastinoid the Idle', max_hp = 1000, current_hp = 680, level = 3, defeated_count = 1
    WHERE user_id = ?
  `).run(userId)

  // Re-seed default starter items
  const defaultQuests = [
    { id: `q_reset_1`, title: 'Build Life RPG Hackathon Project', category: 'Coding', difficulty: 'epic', priority: 'legendary', xp: 250, gold: 150 },
    { id: `q_reset_2`, title: 'Morning Gym Session - Heavy Deadlifts', category: 'Gym', difficulty: 'hard', priority: 'high', xp: 100, gold: 60 },
    { id: `q_reset_3`, title: 'Read 20 Pages of System Architecture Book', category: 'Reading', difficulty: 'medium', priority: 'medium', xp: 50, gold: 25 },
    { id: `q_reset_4`, title: '15 Min Mindful Meditation & Breathing', category: 'Meditation', difficulty: 'easy', priority: 'low', xp: 25, gold: 10 }
  ]

  for (const q of defaultQuests) {
    db.prepare(`
      INSERT INTO quests (id, user_id, title, category, difficulty, recurrence, due_date, status, priority, xp_reward, gold_reward)
      VALUES (?, ?, ?, ?, ?, 'main', ?, 'active', ?, ?, ?)
    `).run(q.id, userId, q.title, q.category, q.difficulty, today, q.priority, q.xp, q.gold)
  }

  // Inventory
  db.prepare(`
    INSERT INTO inventory (user_id, item_id, item_name, item_type, is_equipped)
    VALUES (?, 'theme_cyberpunk', 'Cyberpunk Neon', 'theme', 1),
           (?, 'avatar_cyber_hero', 'Cyber Cyberware', 'avatar', 1),
           (?, 'title_code_sorcerer', 'Code Sorcerer', 'title', 1),
           (?, 'potion_xp_elixir', 'XP Elixir (2x)', 'potion', 0)
  `).run(userId, userId, userId, userId)

  // Custom rewards
  const defaultRewards = [
    { title: 'Watch 1 Episode of Anime / Netflix', cost_gold: 50, icon: 'tv' },
    { title: 'Buy Iced Boba Coffee / Frappe', cost_gold: 100, icon: 'coffee' },
    { title: '1 Hour Gaming Break', cost_gold: 120, icon: 'gamepad' }
  ]
  for (const r of defaultRewards) {
    db.prepare('INSERT INTO custom_rewards (user_id, title, cost_gold, icon) VALUES (?, ?, ?, ?)').run(userId, r.title, r.cost_gold, r.icon)
  }

  return res.json({ success: true, message: 'Demo data re-seeded successfully' })
})
