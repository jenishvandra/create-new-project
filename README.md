# ⚔️ Life RPG - Gamify Your Real-World Productivity

> **TechZephyr Web Hackathon Submission**  
> A full-stack, theme-rich web application that translates mundane real-world tasks into an engaging virtual RPG progression system.

---

## 🌟 Overview & Core Solution

Traditional task managers often suffer from delayed gratification—the real-world benefits of going to the gym, studying system design, or coding take weeks or months to materialize. **Life RPG** bridges this gap by converting real-world habits into immediate dopamine loops with non-linear experience scaling, character attribute gains (STR, INT, WIS, AGI, CHA, VIT), daily streak multipliers, a virtual shop, custom real-world treat rewards, and world boss raids.

---

## 🔥 Key Features

1. **The RPG Progression Engine**:
   - **Non-Linear Level Scaling**: Level requirements scale according to $XP_{\text{req}} = \lfloor 100 \times Level^{1.5} \rfloor$.
   - **Attribute Stats System**: Tasks directly increase specific character attributes:
     - 💻 **Intellect (INT)**: Coding, Tech & Engineering
     - 🏋️‍♂️ **Strength (STR)**: Gym & Fitness Workouts
     - 📚 **Wisdom (WIS)**: Reading & Educational Study
     - ⚡ **Agility (AGI)**: Running & Cardio Sports
     - 🗣️ **Charisma (CHA)**: Social Networking & Public Speaking
     - 🧘‍♀️ **Vitality (VIT)**: Meditation & Health Habits
   - **Archetype Titles**: Dynamically assigns hero titles (e.g. *Code Sorcerer*, *Iron Paladin*, *Grand Archivist*) based on highest stat.

2. **Streak Tracking & Multipliers**:
   - Tracks consecutive days of activity.
   - Grants +5% bonus XP per active streak day (up to +50% max bonus).

3. **Virtual Marketplace & Real-World Rewards**:
   - **Thematic Presets**: Buy & switch between Cyberpunk Neon, Cozy Lofi Tavern, 16-Bit Dungeon, Celestial Astro-Realm, and Emerald Zen Bamboo themes.
   - **Avatars & Titles**: Unlock custom portrait frames and title badges.
   - **Consumable Potions**: XP Elixir (2x XP boost) and Streak Shields.
   - **Real-World Treat Redemptions**: Create custom rewards (e.g., *"Watch 1 Episode of Anime"*, *"Buy Boba Coffee"*, *"1 Hour Gaming Break"*) and redeem them using earned Gold!

4. **Weekly World Boss Raids**:
   - Deal real-time damage to World Bosses (e.g., *Lord Procrastinoid the Idle*) whenever you complete real-life quests.
   - Claim bonus Gold & Gems upon defeating bosses.

5. **Tactile Glassmorphism UI & Audio**:
   - Frosted glass cards, glowing neon accents, dynamic wallpaper image backgrounds.
   - Canvas particle explosions on quest checkmarks.
   - Web Audio API synthesizer for retro sound effects (level-up fanfare, quest chimes, coin drops, boss slashes).
   - Hotkeys (`N` for new quest, `1-5` for tab navigation).

6. **Full-Stack & Persistent Database**:
   - Node.js Express API backend integrated into Vite dev server.
   - SQLite (`node:sqlite`) database with users, character profiles, quests, inventory, shop, and activity log tables.
   - 1-Click **Demo Hero Login** for instant reviewer testing.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript 5.7, Tailwind CSS v4 (`@tailwindcss/vite`), Web Audio API, HTML Canvas Particles
- **Backend**: Node.js, Express 5 REST API
- **Database**: SQLite (`node:sqlite` persistent file database)
- **Build System**: Vite 8

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v22.0.0 or higher
- **pnpm** or **npm**

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vandrajenish/life-rpg.git
   cd life-rpg
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Application**:
   Open your browser and navigate to:
   `http://localhost:8443` (or the port specified in terminal).

5. **1-Click Demo Login**:
   Click **"Login / Signup"** in the top navbar and hit **"1-Click Demo Hero Login"** to instantly test pre-populated quests, stats, and shop inventory!

---

## 📄 Environment Variables (`.env.example`)

Create a `.env` file in the root directory (optional):

```env
PORT=8443
NODE_ENV=development
DATABASE_PATH=./server/data/life_rpg.db
JWT_SECRET=super_secret_life_rpg_key
```

---

## 📊 Database Schema Overview

```
+------------------+       +---------------------+       +-------------------+
|      users       |       | character_profiles  |       |  character_stats  |
+------------------+       +---------------------+       +-------------------+
| id (PK)          | <---+ | user_id (FK/PK)     | <---+ | user_id (FK/PK)   |
| username         |     | | level               |     | | strength          |
| email            |     | | current_xp          |     | | intellect         |
| password_hash    |     | | gold, gems, streak  |     | | wisdom, agility   |
+------------------+     | | equipped_theme      |     | | charisma, vital  |
                         | +---------------------+     +-------------------+
                         |
                         | +---------------------+       +-------------------+
                         +-|       quests        |       |     inventory     |
                         | +---------------------+       +-------------------+
                         | | id (PK), user_id    |       | id (PK), user_id  |
                         | | title, category     |       | item_id, item_type|
                         | | difficulty, priority|       | is_equipped       |
                         | | xp_reward, gold     |       +-------------------+
                         | +---------------------+
                         |
                         | +---------------------+       +-------------------+
                         +-|    boss_battles     |       |    quest_logs     |
                           +---------------------+       +-------------------+
                           | user_id, current_hp |       | id (PK), user_id  |
                           | max_hp, level       |       | xp_gained, date   |
                           +---------------------+       +-------------------+
```

---

## ⌨️ Keyboard Shortcuts

- **`N`**: Open Create Quest Modal
- **`1`**: Switch to Quest Board
- **`2`**: Switch to Character Sheet
- **`3`**: Switch to Shop & Rewards
- **`4`**: Switch to Boss Raid
- **`5`**: Switch to Quest History Log

---

## 🏆 Hackathon Submission Checklist

- [x] Full-Stack Architecture (React + Express + SQLite Database)
- [x] Non-linear Leveling Engine ($XP = 100 \times Level^{1.5}$)
- [x] Attribute System & Streaks Multiplier
- [x] Marketplace, Potions & Real-World Rewards
- [x] World Boss Raid Damage Mechanic
- [x] Accessible Glassmorphism UI & Micro-interactions
- [x] Web Audio Synthesizer & Particle Celebrations
- [x] 1-Click Demo Login for Hackathon Judges
