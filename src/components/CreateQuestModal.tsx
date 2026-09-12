import React, { useState, useEffect } from 'react'
import type { Quest, QuestDifficulty, QuestPriority, QuestRecurrence } from '../types/rpg'
import { playButtonClickSound } from '../utils/audio'

interface CreateQuestModalProps {
  isOpen: boolean
  editingQuest: Quest | null
  onClose: () => void
  onSave: (questData: Partial<Quest>) => void
}

const CATEGORY_OPTIONS = [
  { value: 'Coding', label: '💻 Coding / Tech (+INT)' },
  { value: 'Gym', label: '🏋️‍♂️ Gym / Workout (+STR)' },
  { value: 'Reading', label: '📚 Reading / Study (+WIS)' },
  { value: 'Social', label: '🗣️ Social / Networking (+CHA)' },
  { value: 'Running', label: '⚡ Running / Sports (+AGI)' },
  { value: 'Meditation', label: '🧘‍♀️ Meditation / Health (+VIT)' }
]

export default function CreateQuestModal({
  isOpen,
  editingQuest,
  onClose,
  onSave
}: CreateQuestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Coding')
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium')
  const [recurrence, setRecurrence] = useState<QuestRecurrence>('main')
  const [priority, setPriority] = useState<QuestPriority>('medium')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title)
      setDescription(editingQuest.description || '')
      setCategory(editingQuest.category)
      setDifficulty(editingQuest.difficulty)
      setRecurrence(editingQuest.recurrence)
      setPriority(editingQuest.priority)
      setDueDate(editingQuest.due_date || new Date().toISOString().split('T')[0])
    } else {
      setTitle('')
      setDescription('')
      setCategory('Coding')
      setDifficulty('medium')
      setRecurrence('main')
      setPriority('medium')
      setDueDate(new Date().toISOString().split('T')[0])
    }
  }, [editingQuest, isOpen])

  if (!isOpen) return null

  // Estimated rewards preview
  const baseRewards: Record<QuestDifficulty, { xp: number; gold: number; gems: number }> = {
    easy: { xp: 25, gold: 10, gems: 0 },
    medium: { xp: 50, gold: 25, gems: 0 },
    hard: { xp: 100, gold: 60, gems: 0 },
    epic: { xp: 250, gold: 150, gems: 1 }
  }

  const priorityMult: Record<QuestPriority, number> = {
    low: 1.0,
    medium: 1.1,
    high: 1.25,
    legendary: 1.5
  }

  const mult = priorityMult[priority] || 1.0
  const base = baseRewards[difficulty] || baseRewards.medium
  const estXp = Math.floor(base.xp * mult)
  const estGold = Math.floor(base.gold * mult)
  const estGems = base.gems

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      ...(editingQuest ? { id: editingQuest.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      difficulty,
      recurrence,
      priority,
      due_date: dueDate
    })
    playButtonClickSound()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2B30]/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#D6D6D6]/20 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={() => {
            onClose()
            playButtonClickSound()
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#4F4F51]/80 border border-[#D6D6D6]/15 flex items-center justify-center text-[#D6D6D6] hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚔️</span>
          <h2 className="text-xl font-extrabold text-white">
            {editingQuest ? 'Edit Quest' : 'Create New Quest'}
          </h2>
        </div>
        <p className="text-xs text-[#D6D6D6]/70 mb-6">
          Set your objectives and earn experience points upon completion.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quest Title */}
          <div>
            <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
              Quest Title <span className="text-[#F58F7C]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Read 20 pages of System Design"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#D6D6D6]/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional details, links, or specific targets..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#D6D6D6]/40"
            />
          </div>

          {/* Category / Attribute */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
                Attribute Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#2C2B30] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Recurrence */}
            <div>
              <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
                Type
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as QuestRecurrence)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
              >
                <option value="main" className="bg-[#2C2B30]">🗡️ Main Quest (One-off)</option>
                <option value="daily" className="bg-[#2C2B30]">🔄 Daily Habit</option>
                <option value="side" className="bg-[#2C2B30]">📜 Side Quest</option>
              </select>
            </div>
          </div>

          {/* Difficulty & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
                Difficulty
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['easy', 'medium', 'hard', 'epic'] as QuestDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDifficulty(d)
                      playButtonClickSound()
                    }}
                    className={`py-1.5 rounded-lg text-xs font-extrabold capitalize border transition-all ${
                      difficulty === d
                        ? 'bg-[#F58F7C]/30 text-[#F58F7C] border-[#F58F7C] shadow-sm'
                        : 'bg-[#4F4F51]/40 text-[#D6D6D6]/70 border-[#D6D6D6]/10 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as QuestPriority)}
                className="w-full glass-input rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
              >
                <option value="low" className="bg-[#2C2B30]">Low (1.0x)</option>
                <option value="medium" className="bg-[#2C2B30]">Medium (1.1x)</option>
                <option value="high" className="bg-[#2C2B30]">High (1.25x)</option>
                <option value="legendary" className="bg-[#2C2B30]">★ Legendary (1.5x)</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-[#D6D6D6] uppercase tracking-wider mb-1.5">
              Target Completion Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          {/* Estimated Rewards Display */}
          <div className="p-3 bg-[#F58F7C]/15 border border-[#F58F7C]/30 rounded-2xl flex items-center justify-between text-xs font-bold text-[#F58F7C]">
            <span>Predicted Rewards:</span>
            <div className="flex items-center gap-3">
              <span>⚡ +{estXp} XP</span>
              <span className="text-[#F2C4CE]">🪙 +{estGold} Gold</span>
              {estGems > 0 && <span>💎 +{estGems} Gem</span>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose()
                playButtonClickSound()
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#D6D6D6]/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-black text-xs shadow-lg shadow-[#F58F7C]/20 hover:brightness-110 active:scale-95 transition-all"
            >
              {editingQuest ? 'Save Changes' : 'Accept Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
