import React, { useState } from 'react'
import type { Quest } from '../types/rpg'
import QuestCard from './QuestCard'
import { playButtonClickSound } from '../utils/audio'
import { IconPlus, IconSearch, IconShield } from './Icons'

interface QuestListProps {
  quests: Quest[]
  onCompleteQuest: (id: string, e: React.MouseEvent) => void
  onEditQuest: (quest: Quest) => void
  onDeleteQuest: (id: string) => void
  onOpenCreateModal: () => void
}

type TabFilter = 'all' | 'daily' | 'main' | 'completed'

export default function QuestList({
  quests,
  onCompleteQuest,
  onEditQuest,
  onDeleteQuest,
  onOpenCreateModal
}: QuestListProps) {
  const [activeTab, setActiveTab] = useState<TabFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = Array.from(new Set(quests.map((q) => q.category)))

  const filteredQuests = quests.filter((quest) => {
    // Tab filter
    if (activeTab === 'daily' && (quest.recurrence !== 'daily' || quest.status === 'completed')) return false
    if (activeTab === 'main' && (quest.recurrence !== 'main' || quest.status === 'completed')) return false
    if (activeTab === 'completed' && quest.status !== 'completed') return false
    if (activeTab === 'all' && quest.status === 'completed') return false

    // Category filter
    if (selectedCategory !== 'all' && quest.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return quest.title.toLowerCase().includes(q) || (quest.description && quest.description.toLowerCase().includes(q))
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Banner Card (Matching Screenshot 4) */}
      <div className="olive-card rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#3F4236]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Conquer Daily Tasks & Level Up
          </h2>
          <p className="text-xs text-[#A2A190] mt-1">
            Each quest brings you closer to mastery. Stay consistent, grow relentless.
          </p>
        </div>

        <button
          onClick={() => {
            onOpenCreateModal()
            playButtonClickSound()
          }}
          className="px-5 py-2.5 rounded-xl btn-terracotta text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap"
        >
          <IconPlus className="w-4 h-4" />
          <span>Start Quest</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar (Matching Screenshot 4) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#24261E] rounded-xl border border-[#3F4236] overflow-x-auto scrollbar-hide">
          {(
            [
              { id: 'all', label: 'Active' },
              { id: 'daily', label: 'Daily Habits' },
              { id: 'main', label: 'Main Quests' },
              { id: 'completed', label: 'Completed' }
            ] as { id: TabFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                playButtonClickSound()
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#3C3E32] text-[#D46B4E] border border-[#D46B4E]/30'
                  : 'text-[#A2A190] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full olive-input rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#A2A190]/60"
            />
            <IconSearch className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#A2A190]" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="olive-input rounded-xl px-3 py-1.5 text-xs font-semibold text-[#E6E5D8] outline-none"
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#282A21] text-white">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quest Grid - 3 Columns (Matching Screenshot 4) */}
      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onComplete={onCompleteQuest}
              onEdit={onEditQuest}
              onDelete={onDeleteQuest}
            />
          ))}
        </div>
      ) : (
        <div className="olive-card rounded-2xl p-12 text-center border border-[#3F4236]">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[#3B3D32] flex items-center justify-center text-[#D46B4E]">
              <IconShield className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-base font-bold text-white">No Quests Found</h3>
          <p className="text-xs text-[#A2A190] max-w-sm mx-auto mt-1">
            {activeTab === 'completed'
              ? "You haven't completed any quests yet."
              : 'Your quest log is empty in this view. Click "Start Quest" to begin!'}
          </p>
          <button
            onClick={() => {
              onOpenCreateModal()
              playButtonClickSound()
            }}
            className="mt-4 px-4 py-2 rounded-xl btn-terracotta text-xs font-bold inline-flex items-center gap-1.5"
          >
            <IconPlus className="w-4 h-4" />
            <span>Start Quest</span>
          </button>
        </div>
      )}
    </div>
  )
}

