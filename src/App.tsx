import React, { useState, useEffect } from 'react'
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

import {
  fetchProfile,
  fetchQuests,
  createQuest,
  updateQuest,
  deleteQuest,
  completeQuest,
  fetchShop,
  buyShopItem,
  equipInventoryItem,
  useInventoryItem,
  createCustomReward,
  claimCustomReward,
  fetchBoss,
  respawnBoss,
  fetchAnalytics,
  loginUser,
  registerUser,
  logoutUser,
  resetDemoData
} from './api'

import { playLevelUpSound, playButtonClickSound } from './utils/audio'

import LandingPage from './components/LandingPage'
import ThemeBackground from './components/ThemeBackground'
import Navbar from './components/Navbar'
import QuestList from './components/QuestList'
import CreateQuestModal from './components/CreateQuestModal'
import CharacterSheet from './components/CharacterSheet'
import ShopAndInventory from './components/ShopAndInventory'
import BossRaid from './components/BossRaid'
import AnalyticsHistory from './components/AnalyticsHistory'
import LevelUpModal from './components/LevelUpModal'
import AuthModal from './components/AuthModal'

type NavTab = 'quests' | 'character' | 'shop' | 'boss' | 'analytics'
type AppView = 'landing' | 'dashboard'

export default function App() {
  // Start on Landing Page by default when opening website
  const [view, setView] = useState<AppView>('landing')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<CharacterProfile | null>(null)
  const [stats, setStats] = useState<CharacterStats | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [customRewards, setCustomRewards] = useState<CustomReward[]>([])
  const [boss, setBoss] = useState<BossBattle | null>(null)
  const [logs, setLogs] = useState<QuestLog[]>([])
  const [completedCount, setCompletedCount] = useState<number>(0)
  const [totalXp, setTotalXp] = useState<number>(0)

  // Navigation & Modals State
  const [activeTab, setActiveTab] = useState<NavTab>('quests')
  const [activeTheme, setActiveTheme] = useState<string>('obsidian_coral')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [levelUpGains, setLevelUpGains] = useState<GainsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Show Toast notification helper
  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3500)
  }

  // Load state from backend
  const loadData = async () => {
    try {
      setLoading(true)

      // Fetch user profile
      const profData = await fetchProfile()
      setUser(profData.user)
      setProfile(profData.profile)
      setStats(profData.stats)

      // Fetch Quests
      const qData = await fetchQuests()
      setQuests(qData.quests)

      // Fetch Shop & Inventory
      const sData = await fetchShop()
      setShopItems(sData.items)
      setInventory(sData.inventory)
      setCustomRewards(sData.customRewards)

      // Fetch Boss
      const bData = await fetchBoss()
      setBoss(bData.boss)

      // Fetch Analytics
      const aData = await fetchAnalytics()
      setLogs(aData.logs)
      setCompletedCount(aData.completedCount)
      setTotalXp(aData.totalXp)
    } catch (err: any) {
      console.error('Failed to load application data:', err)
      showNotification(err.message || 'Failed to sync with server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Keyboard hotkeys handler ('N' for new quest, '1-5' for tabs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'dashboard') return
      // Don't trigger hotkeys if typing inside input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setEditingQuest(null)
        setIsCreateModalOpen(true)
      } else if (e.key === '1') {
        setActiveTab('quests')
      } else if (e.key === '2') {
        setActiveTab('character')
      } else if (e.key === '3') {
        setActiveTab('shop')
      } else if (e.key === '4') {
        setActiveTab('boss')
      } else if (e.key === '5') {
        setActiveTab('analytics')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view])

  // Quest Handlers
  const handleSaveQuest = async (questData: Partial<Quest>) => {
    try {
      if (questData.id) {
        const res = await updateQuest(questData.id, questData)
        setQuests(quests.map((q) => (q.id === res.quest.id ? res.quest : q)))
        showNotification('Quest updated successfully!', 'success')
      } else {
        const res = await createQuest(questData)
        setQuests([res.quest, ...quests])
        showNotification(`New Quest "${res.quest.title}" created!`, 'success')
      }
      setIsCreateModalOpen(false)
      setEditingQuest(null)
    } catch (err: any) {
      showNotification(err.message || 'Failed to save quest', 'error')
    }
  }

  const handleDeleteQuest = async (id: string) => {
    try {
      await deleteQuest(id)
      setQuests(quests.filter((q) => q.id !== id))
      showNotification('Quest deleted', 'info')
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete quest', 'error')
    }
  }

  const handleCompleteQuest = async (id: string, e: React.MouseEvent) => {
    try {
      const res = await completeQuest(id)

      // Update quests list
      setQuests(quests.map((q) => (q.id === id ? { ...q, status: 'completed' as const } : q)))

      // Update profile & stats
      setProfile(res.profile)
      setStats(res.stats)

      // Update boss HP
      if (boss) {
        setBoss({
          ...boss,
          current_hp: Math.max(0, boss.current_hp - res.bossDamage)
        })
      }

      showNotification(`Quest Complete! +${res.gains.xp} XP, +${res.gains.gold} Gold!`, 'success')

      // Check Level Up
      if (res.gains.levelInfo.leveledUp) {
        playLevelUpSound()
        setLevelUpGains(res.gains)
      }

      // Reload analytics log silently
      const aData = await fetchAnalytics()
      setLogs(aData.logs)
      setCompletedCount(aData.completedCount)
      setTotalXp(aData.totalXp)
    } catch (err: any) {
      showNotification(err.message || 'Failed to complete quest', 'error')
    }
  }

  // Shop Handlers
  const handleBuyItem = async (itemId: string) => {
    try {
      const res = await buyShopItem(itemId)
      setProfile(res.profile)
      setInventory(res.inventory)
      showNotification('Item purchased & added to your inventory!', 'success')
    } catch (err: any) {
      showNotification(err.message || 'Purchase failed', 'error')
    }
  }

  const handleEquipItem = async (itemId: string, type: string) => {
    try {
      const res = await equipInventoryItem(itemId, type)
      setProfile(res.profile)
      setInventory(res.inventory)
      if (type === 'theme' && res.profile.equipped_theme) {
        setActiveTheme(res.profile.equipped_theme)
      }
      showNotification(`Equipped new ${type}!`, 'success')
    } catch (err: any) {
      showNotification(err.message || 'Equip failed', 'error')
    }
  }

  const handleUseItem = async (itemId: string) => {
    try {
      const res = await useInventoryItem(itemId)
      setProfile(res.profile)
      setInventory(res.inventory)
      showNotification('Potion consumed! XP Boost Active!', 'success')
    } catch (err: any) {
      showNotification(err.message || 'Item usage failed', 'error')
    }
  }

  const handleCreateReward = async (title: string, cost_gold: number) => {
    try {
      const res = await createCustomReward(title, cost_gold)
      setCustomRewards(res.customRewards)
      showNotification('Custom real-world reward created!', 'success')
    } catch (err: any) {
      showNotification(err.message || 'Failed to create reward', 'error')
    }
  }

  const handleClaimReward = async (rewardId: number) => {
    try {
      const res = await claimCustomReward(rewardId)
      setProfile(res.profile)
      showNotification(`Reward Claimed: "${res.rewardClaimed.title}"! Enjoy your treat! 🎉`, 'success')
    } catch (err: any) {
      showNotification(err.message || 'Claim failed', 'error')
    }
  }

  // Boss Handlers
  const handleRespawnBoss = async () => {
    try {
      const res = await respawnBoss()
      setBoss(res.boss)
      showNotification(`Next Boss Awakened: ${res.boss.boss_name}!`, 'info')
    } catch (err: any) {
      showNotification(err.message || 'Failed to respawn boss', 'error')
    }
  }

  // Auth Handlers
  const handleLogin = async (u: string, p: string) => {
    await loginUser(u, p)
    await loadData()
    setView('dashboard')
    showNotification('Welcome back!', 'success')
  }

  const handleRegister = async (u: string, e: string, p: string) => {
    await registerUser(u, e, p)
    await loadData()
    setView('dashboard')
    showNotification('Account created successfully! Welcome to Life RPG!', 'success')
  }

  const handleDemoLogin = async () => {
    await loginUser('demo_hero', 'password123')
    await loadData()
    setView('dashboard')
    showNotification('Logged in as Demo Hero!', 'success')
  }

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setProfile(null)
    setQuests([])
    setView('landing')
    showNotification('Logged out successfully', 'info')
  }

  const handleResetDemo = async () => {
    await resetDemoData()
    await loadData()
    showNotification('Demo environment reset!', 'success')
  }

  const completedCountToday = quests.filter((q) => q.status === 'completed').length
  const totalQuestsTarget = Math.max(8, quests.length)

  // 1. LANDING PAGE VIEW (Default when opening website)
  if (view === 'landing') {
    return (
      <>
        <LandingPage
          onEnterArena={() => setIsAuthModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onDemoLogin={handleDemoLogin}
        />
      </>
    )
  }

  // 2. DASHBOARD VIEW (Shown after logging in / entering arena)
  return (
    <div className="min-h-screen relative flex flex-col text-[#E6E5D8] selection:bg-[#D46B4E] selection:text-white bg-[#1A1C16]">
      {/* Dynamic Background Image Shader */}
      <ThemeBackground theme={activeTheme} />

      {/* Top Navbar */}
      <Navbar
        user={user}
        profile={profile}
        activeTheme={activeTheme}
        onSelectTheme={(th) => {
          setActiveTheme(th)
          if (user && profile) handleEquipItem(`theme_${th}`, 'theme')
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onResetDemo={handleResetDemo}
        onGoToLanding={() => setView('landing')}
      />

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 border ${
              notification.type === 'success'
                ? 'border-[#D46B4E] text-white bg-[#1A1C16]/90'
                : notification.type === 'error'
                ? 'border-rose-500 text-rose-300 bg-[#1A1C16]/90'
                : 'border-[#3F4236] text-[#E6E5D8] bg-[#1A1C16]/90'
            }`}
          >
            <span>{notification.type === 'success' ? '✨' : notification.type === 'error' ? '⚠️' : '🔔'}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Dashboard Layout (Matching Screenshot 4) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="olive-card rounded-2xl p-4 border border-[#3F4236] space-y-4 sticky top-20 shadow-2xl">
            <nav className="space-y-1">
              {(
                [
                  { id: 'quests', label: 'Quest Board' },
                  { id: 'character', label: 'Character Sheet' },
                  { id: 'shop', label: 'Marketplace & Rewards' },
                  { id: 'boss', label: 'World Boss Raid' },
                  { id: 'analytics', label: 'Quest History Logs' }
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      playButtonClickSound()
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'sidebar-item-active'
                        : 'text-[#A2A190] hover:text-white hover:bg-[#36382D]'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>

            {/* Daily Progress Card */}
            <div className="p-3.5 rounded-xl bg-[#24261E]/70 border border-[#3F4236] space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#A2A190]">
                DAILY PROGRESS
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-white">{completedCountToday}</span>
                <span className="text-xs text-[#A2A190]">/ {totalQuestsTarget} quests completed</span>
              </div>
              <div className="w-full h-1.5 bg-[#1A1C16] rounded-full overflow-hidden border border-[#3F4236]">
                <div
                  className="h-full bg-[#D46B4E] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (completedCountToday / totalQuestsTarget) * 100)}%` }}
                />
              </div>
            </div>

            {/* New Quest Button */}
            <button
              onClick={() => {
                setEditingQuest(null)
                setIsCreateModalOpen(true)
                playButtonClickSound()
              }}
              className="w-full py-2.5 rounded-xl btn-terracotta text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>New Quest</span>
              <span className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono">N</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <section className="lg:col-span-9 min-w-0">
          {loading ? (
            <div className="olive-card rounded-2xl p-12 text-center border border-[#3F4236]">
              <div className="text-3xl animate-bounce mb-2">⚔️</div>
              <p className="text-xs font-bold text-[#A2A190]">Syncing Life RPG Character Data...</p>
            </div>
          ) : (
            <>
              {activeTab === 'quests' && (
                <QuestList
                  quests={quests}
                  onCompleteQuest={handleCompleteQuest}
                  onEditQuest={(q) => {
                    setEditingQuest(q)
                    setIsCreateModalOpen(true)
                  }}
                  onDeleteQuest={handleDeleteQuest}
                  onOpenCreateModal={() => {
                    setEditingQuest(null)
                    setIsCreateModalOpen(true)
                  }}
                />
              )}

              {activeTab === 'character' && (
                <CharacterSheet user={user} profile={profile} stats={stats} />
              )}

              {activeTab === 'shop' && (
                <ShopAndInventory
                  profile={profile}
                  items={shopItems}
                  inventory={inventory}
                  customRewards={customRewards}
                  onBuyItem={handleBuyItem}
                  onEquipItem={handleEquipItem}
                  onUseItem={handleUseItem}
                  onCreateReward={handleCreateReward}
                  onClaimReward={handleClaimReward}
                />
              )}

              {activeTab === 'boss' && (
                <BossRaid boss={boss} onRespawnBoss={handleRespawnBoss} />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsHistory
                  logs={logs}
                  completedCount={completedCount}
                  totalXp={totalXp}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Modals */}
      <CreateQuestModal
        isOpen={isCreateModalOpen}
        editingQuest={editingQuest}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingQuest(null)
        }}
        onSave={handleSaveQuest}
      />

      <LevelUpModal
        gains={levelUpGains}
        onClose={() => setLevelUpGains(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onDemoLogin={handleDemoLogin}
      />

      {/* Footer */}
      <footer className="border-t border-[#3F4236] py-4 px-6 mt-12 text-center text-xs text-[#A2A190] relative z-10 glass-landing-header">
        <p className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>⚔️ Life RPG — Gamified Productivity System</span>
          <span>React 19 + Express 5 + SQLite Architecture</span>
        </p>
      </footer>
    </div>
  )
}
