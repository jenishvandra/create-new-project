import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import fs from 'node:fs'

const dbDir = path.resolve(process.cwd(), 'server/data')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, 'life_rpg.db')
export const db = new DatabaseSync(dbPath)

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS character_profiles (
      user_id INTEGER PRIMARY KEY,
      level INTEGER DEFAULT 1,
      current_xp INTEGER DEFAULT 0,
      gold INTEGER DEFAULT 150,
      gems INTEGER DEFAULT 10,
      streak INTEGER DEFAULT 3,
      last_active_date TEXT,
      equipped_avatar TEXT DEFAULT 'cyber_hero',
      equipped_theme TEXT DEFAULT 'cyberpunk',
      equipped_title TEXT DEFAULT 'Novice Adventurer',
      active_xp_multiplier REAL DEFAULT 1.0,
      total_quests_completed INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS character_stats (
      user_id INTEGER PRIMARY KEY,
      strength INTEGER DEFAULT 12,
      intellect INTEGER DEFAULT 15,
      wisdom INTEGER DEFAULT 10,
      agility INTEGER DEFAULT 8,
      charisma INTEGER DEFAULT 11,
      vitality INTEGER DEFAULT 14,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      recurrence TEXT DEFAULT 'main',
      due_date TEXT,
      status TEXT DEFAULT 'active',
      priority TEXT DEFAULT 'medium',
      xp_reward INTEGER NOT NULL,
      gold_reward INTEGER NOT NULL,
      gem_reward INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quest_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      quest_id TEXT NOT NULL,
      quest_title TEXT NOT NULL,
      category TEXT NOT NULL,
      xp_gained INTEGER NOT NULL,
      gold_gained INTEGER NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shop_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      cost_gold INTEGER DEFAULT 0,
      cost_gems INTEGER DEFAULT 0,
      icon TEXT NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      item_type TEXT NOT NULL,
      is_equipped INTEGER DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS custom_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      cost_gold INTEGER NOT NULL,
      icon TEXT DEFAULT 'gift',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS boss_battles (
      user_id INTEGER PRIMARY KEY,
      boss_name TEXT NOT NULL,
      max_hp INTEGER NOT NULL,
      current_hp INTEGER NOT NULL,
      level INTEGER DEFAULT 1,
      defeated_count INTEGER DEFAULT 0,
      reward_claimed INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  seedShopItems()
  seedDemoUser()
}

function seedShopItems() {
  const count = db.prepare('SELECT COUNT(*) as count FROM shop_items').get() as { count: number }
  if (count.count > 0) return

  const items = [
    // Themes
    { id: 'theme_cyberpunk', name: 'Cyberpunk Neon', description: 'Futuristic glowing neon interface with cyber ambient styling.', type: 'theme', cost_gold: 0, cost_gems: 0, icon: 'zap', value: 'cyberpunk' },
    { id: 'theme_lofi', name: 'Cozy Lofi Tavern', description: 'Warm amber tones and relaxing study room aesthetic.', type: 'theme', cost_gold: 150, cost_gems: 0, icon: 'coffee', value: 'lofi' },
    { id: 'theme_dungeon', name: '16-Bit Dungeon', description: 'Retro pixel dark dungeon interface for true RPG crawlers.', type: 'theme', cost_gold: 250, cost_gems: 2, icon: 'sword', value: 'dungeon' },
    { id: 'theme_celestial', name: 'Celestial Astro-Realm', description: 'Deep cosmic violet and starry glowing stardust vibes.', type: 'theme', cost_gold: 400, cost_gems: 5, icon: 'moon', value: 'celestial' },
    { id: 'theme_bamboo', name: 'Emerald Zen Bamboo', description: 'Calming green bamboo forest for peaceful focus.', type: 'theme', cost_gold: 200, cost_gems: 1, icon: 'feather', value: 'bamboo' },

    // Avatars
    { id: 'avatar_cyber_hero', name: 'Cyber Cyberware', description: 'Augmented code warrior with neon optics.', type: 'avatar', cost_gold: 0, cost_gems: 0, icon: 'user', value: 'cyber_hero' },
    { id: 'avatar_shadow_paladin', name: 'Shadow Paladin', description: 'Armored knight of productivity clad in dark plate.', type: 'avatar', cost_gold: 100, cost_gems: 0, icon: 'shield', value: 'shadow_paladin' },
    { id: 'avatar_archmage', name: 'Archmage of Tech', description: 'Master wizard wielding digital elemental spells.', type: 'avatar', cost_gold: 200, cost_gems: 2, icon: 'sparkles', value: 'archmage' },
    { id: 'avatar_lofi_scholar', name: 'Lofi Scholar', description: 'Focused researcher sipping hot tea while coding.', type: 'avatar', cost_gold: 150, cost_gems: 0, icon: 'book-open', value: 'lofi_scholar' },
    { id: 'avatar_astro_knight', name: 'Astro Knight', description: 'Starlight warrior traversing the cosmic void.', type: 'avatar', cost_gold: 350, cost_gems: 4, icon: 'star', value: 'astro_knight' },

    // Titles
    { id: 'title_novice', name: 'Novice Adventurer', description: 'Beginning the epic quest of self-improvement.', type: 'title', cost_gold: 0, cost_gems: 0, icon: 'award', value: 'Novice Adventurer' },
    { id: 'title_code_sorcerer', name: 'Code Sorcerer', description: 'Master of algorithms, compiler whisperer.', type: 'title', cost_gold: 120, cost_gems: 0, icon: 'code', value: 'Code Sorcerer' },
    { id: 'title_iron_titan', name: 'Iron Titan', description: 'Unyielding strength and daily gym discipline.', type: 'title', cost_gold: 120, cost_gems: 0, icon: 'activity', value: 'Iron Titan' },
    { id: 'title_grand_archivist', name: 'Grand Archivist', description: 'Keeper of vast wisdom and relentless reader.', type: 'title', cost_gold: 180, cost_gems: 1, icon: 'book', value: 'Grand Archivist' },
    { id: 'title_unstoppable', name: 'The Unstoppable', description: 'Maintained a legendary streak through grit and honor.', type: 'title', cost_gold: 300, cost_gems: 3, icon: 'flame', value: 'The Unstoppable' },

    // Potions
    { id: 'potion_xp_elixir', name: 'XP Elixir (2x)', description: 'Grants +100% XP bonus on your next 3 completed quests.', type: 'potion', cost_gold: 80, cost_gems: 0, icon: 'droplet', value: 'xp_boost_2x' },
    { id: 'potion_streak_shield', name: 'Streak Shield', description: 'Prevents losing your daily streak if you miss a day.', type: 'potion', cost_gold: 150, cost_gems: 2, icon: 'shield-off', value: 'streak_shield' }
  ]

  const stmt = db.prepare(`
    INSERT INTO shop_items (id, name, description, type, cost_gold, cost_gems, icon, value)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const item of items) {
    stmt.run(item.id, item.name, item.description, item.type, item.cost_gold, item.cost_gems, item.icon, item.value)
  }
}

export function seedDemoUser() {
  const demoUser = db.prepare('SELECT * FROM users WHERE username = ?').get('demo_hero') as any
  if (demoUser) return

  // Create demo user
  const userResult = db.prepare(`
    INSERT INTO users (username, email, password_hash)
    VALUES (?, ?, ?)
  `).run('demo_hero', 'hero@liferpg.dev', 'password123')

  const userId = Number(userResult.lastInsertRowid)

  // Character Profile
  const today = new Date().toISOString().split('T')[0]
  db.prepare(`
    INSERT INTO character_profiles (user_id, level, current_xp, gold, gems, streak, last_active_date, equipped_avatar, equipped_theme, equipped_title, total_quests_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 3, 140, 220, 12, 5, today, 'cyber_hero', 'cyberpunk', 'Code Sorcerer', 8)

  // Stats
  db.prepare(`
    INSERT INTO character_stats (user_id, strength, intellect, wisdom, agility, charisma, vitality)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 18, 25, 20, 14, 16, 22)

  // Quests
  const defaultQuests = [
    {
      id: 'quest_1',
      title: 'Build Life RPG Hackathon Project',
      description: 'Implement full-stack React + Express + SQLite RPG app with glassmorphism UI & persistent state.',
      category: 'Coding',
      difficulty: 'epic',
      recurrence: 'main',
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'legendary',
      xp_reward: 250,
      gold_reward: 150,
      gem_reward: 2
    },
    {
      id: 'quest_2',
      title: 'Morning Gym Session - Heavy Deadlifts',
      description: 'Complete 4 sets of 8 deadlifts + 30 mins cardio to boost Strength stat.',
      category: 'Gym',
      difficulty: 'hard',
      recurrence: 'daily',
      due_date: today,
      priority: 'high',
      xp_reward: 100,
      gold_reward: 60,
      gem_reward: 0
    },
    {
      id: 'quest_3',
      title: 'Read 20 Pages of System Architecture Book',
      description: 'Expand Wisdom stat by studying microservices and distributed database design patterns.',
      category: 'Reading',
      difficulty: 'medium',
      recurrence: 'daily',
      due_date: today,
      priority: 'medium',
      xp_reward: 50,
      gold_reward: 25,
      gem_reward: 0
    },
    {
      id: 'quest_4',
      title: '15 Min Mindful Meditation & Breathing',
      description: 'Restore Vitality stat and clear mental fog for maximum focus.',
      category: 'Meditation',
      difficulty: 'easy',
      recurrence: 'daily',
      due_date: today,
      priority: 'low',
      xp_reward: 25,
      gold_reward: 10,
      gem_reward: 0
    },
    {
      id: 'quest_5',
      title: 'Networking & Team Sync Call',
      description: 'Level up Charisma stat by connecting with developer community.',
      category: 'Social',
      difficulty: 'medium',
      recurrence: 'side',
      due_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      priority: 'medium',
      xp_reward: 50,
      gold_reward: 25,
      gem_reward: 0
    }
  ]

  const questStmt = db.prepare(`
    INSERT INTO quests (id, user_id, title, description, category, difficulty, recurrence, due_date, status, priority, xp_reward, gold_reward, gem_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
  `)

  for (const q of defaultQuests) {
    questStmt.run(q.id, userId, q.title, q.description, q.category, q.difficulty, q.recurrence, q.due_date, q.priority, q.xp_reward, q.gold_reward, q.gem_reward)
  }

  // Inventory items
  const inventoryItems = [
    { item_id: 'theme_cyberpunk', item_name: 'Cyberpunk Neon', item_type: 'theme', is_equipped: 1 },
    { item_id: 'avatar_cyber_hero', item_name: 'Cyber Cyberware', item_type: 'avatar', is_equipped: 1 },
    { item_id: 'title_novice', item_name: 'Novice Adventurer', item_type: 'title', is_equipped: 0 },
    { item_id: 'title_code_sorcerer', item_name: 'Code Sorcerer', item_type: 'title', is_equipped: 1 },
    { item_id: 'potion_xp_elixir', item_name: 'XP Elixir (2x)', item_type: 'potion', is_equipped: 0 }
  ]

  const invStmt = db.prepare(`
    INSERT INTO inventory (user_id, item_id, item_name, item_type, is_equipped, quantity)
    VALUES (?, ?, ?, ?, ?, 1)
  `)

  for (const item of inventoryItems) {
    invStmt.run(userId, item.item_id, item.item_name, item.item_type, item.is_equipped)
  }

  // Custom Real World Rewards
  const defaultRewards = [
    { title: 'Watch 1 Episode of Anime / Netflix', cost_gold: 50, icon: 'tv' },
    { title: 'Buy Iced Boba Coffee / Frappe', cost_gold: 100, icon: 'coffee' },
    { title: '1 Hour Gaming Break', cost_gold: 120, icon: 'gamepad' },
    { title: 'Cheat Meal / Gourmet Pizza', cost_gold: 250, icon: 'pizza' }
  ]

  const rewardStmt = db.prepare(`
    INSERT INTO custom_rewards (user_id, title, cost_gold, icon)
    VALUES (?, ?, ?, ?)
  `)

  for (const r of defaultRewards) {
    rewardStmt.run(userId, r.title, r.cost_gold, r.icon)
  }

  // Boss Battle
  db.prepare(`
    INSERT INTO boss_battles (user_id, boss_name, max_hp, current_hp, level, defeated_count, reward_claimed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, 'Lord Procrastinoid the Idle', 1000, 680, 3, 1, 0)

  // Seed some quest completion logs for analytics
  const yesterday = new Date(Date.now() - 86400000).toISOString()
  const twoDaysAgo = new Date(Date.now() - 172800000).toISOString()
  const logStmt = db.prepare(`
    INSERT INTO quest_logs (user_id, quest_id, quest_title, category, xp_gained, gold_gained, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  logStmt.run(userId, 'completed_prev_1', 'Solve LeetCode Hard Problem', 'Coding', 120, 70, twoDaysAgo)
  logStmt.run(userId, 'completed_prev_2', 'Run 5km Morning Jog', 'Running', 80, 45, twoDaysAgo)
  logStmt.run(userId, 'completed_prev_3', '50 Pushups Workout', 'Gym', 50, 25, yesterday)
  logStmt.run(userId, 'completed_prev_4', 'Read Chapter 4 of TypeScript Deep Dive', 'Reading', 60, 30, yesterday)
}
