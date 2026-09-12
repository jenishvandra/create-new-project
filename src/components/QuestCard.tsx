import React from 'react'
import type { Quest } from '../types/rpg'
import { playQuestCompleteSound, playButtonClickSound } from '../utils/audio'
import { triggerParticleBurst } from '../utils/particles'
import { IconCheck, IconCoin, IconEdit, IconTrash } from './Icons'

interface QuestCardProps {
  quest: Quest
  onComplete: (id: string, e: React.MouseEvent) => void
  onEdit: (quest: Quest) => void
  onDelete: (id: string) => void
}

export const CATEGORY_ICONS: Record<string, { stat: string }> = {
  coding: { stat: '+INT' },
  tech: { stat: '+INT' },
  work: { stat: '+INT' },
  gym: { stat: '+STR' },
  fitness: { stat: '+STR' },
  reading: { stat: '+WIS' },
  study: { stat: '+WIS' },
  social: { stat: '+CHA' },
  running: { stat: '+AGI' },
  meditation: { stat: '+VIT' }
}

export const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  easy: { bg: 'bg-[#2E3C2B]', text: 'text-[#85B876]', label: 'Easy' },
  medium: { bg: 'bg-[#3C3A29]', text: 'text-[#D9B75B]', label: 'Medium' },
  hard: { bg: 'bg-[#402B26]', text: 'text-[#D46B4E]', label: 'Hard' },
  epic: { bg: 'bg-[#3A293E]', text: 'text-[#C57BD9]', label: 'Epic' }
}

export default function QuestCard({ quest, onComplete, onEdit, onDelete }: QuestCardProps) {
  const isCompleted = quest.status === 'completed'
  const catKey = Object.keys(CATEGORY_ICONS).find((k) => quest.category.toLowerCase().includes(k)) || 'coding'
  const primaryStat = CATEGORY_ICONS[catKey]?.stat || '+INT'
  const secondaryStat = primaryStat === '+INT' ? '+WIS' : primaryStat === '+STR' ? '+VIT' : '+CHA'
  const diffMeta = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.medium

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isCompleted) return

    playQuestCompleteSound()
    triggerParticleBurst(e.clientX, e.clientY, quest.difficulty === 'epic' ? 'rainbow' : 'gold')
    onComplete(quest.id, e)
  }

  return (
    <div
      className={`group relative olive-card rounded-2xl p-5 border transition-all duration-300 ${
        isCompleted
          ? 'opacity-50 bg-[#24261E] border-[#3F4236]/40'
          : 'hover:border-[#D46B4E]/60 hover:shadow-xl'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox (Matching Screenshot 4) */}
        <button
          onClick={handleCheckClick}
          disabled={isCompleted}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 ${
            isCompleted
              ? 'bg-[#D46B4E] text-white font-black scale-100'
              : 'border-2 border-[#3F4236] hover:border-[#D46B4E] hover:bg-[#D46B4E]/20 text-transparent hover:text-[#D46B4E]'
          }`}
          title={isCompleted ? 'Completed!' : 'Click to complete quest'}
        >
          <IconCheck className="w-3.5 h-3.5" />
        </button>

        {/* Quest Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3
              className={`text-sm font-bold text-white group-hover:text-[#D46B4E] transition-colors ${
                isCompleted ? 'line-through text-[#A2A190]' : ''
              }`}
            >
              {quest.title}
            </h3>

            {/* Difficulty Tag */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${diffMeta.bg} ${diffMeta.text}`}
            >
              {diffMeta.label}
            </span>
          </div>

          {/* Description */}
          {quest.description && (
            <p className="text-xs text-[#A2A190] leading-relaxed mb-4 line-clamp-2">
              {quest.description}
            </p>
          )}

          {/* Bottom Row: Stat Badges on Left & Rewards on Right */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-[#3F4236]/50 text-xs">
            {/* Stat Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#3B3D32] text-[#D46B4E]">
                {primaryStat}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#3B3D32] text-[#D46B4E]">
                {secondaryStat}
              </span>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#D46B4E]">
              <span>+{quest.xp_reward} XP</span>
              <span className="flex items-center gap-1">
                <IconCoin className="w-3 h-3 text-[#D9B75B]" />
                +{quest.gold_reward} Gold
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons (Edit / Delete) */}
        {!isCompleted && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              onClick={() => {
                onEdit(quest)
                playButtonClickSound()
              }}
              className="p-1 rounded text-[#A2A190] hover:text-white transition-colors"
              title="Edit Quest"
            >
              <IconEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                onDelete(quest.id)
                playButtonClickSound()
              }}
              className="p-1 rounded text-[#A2A190] hover:text-rose-400 transition-colors"
              title="Delete Quest"
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

