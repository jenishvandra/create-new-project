import React from 'react'
import type { GainsSummary } from '../types/rpg'
import { playButtonClickSound } from '../utils/audio'

interface LevelUpModalProps {
  gains: GainsSummary | null
  onClose: () => void
}

export default function LevelUpModal({ gains, onClose }: LevelUpModalProps) {
  if (!gains || !gains.levelInfo.leveledUp) return null

  const newLevel = gains.levelInfo.level

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2B30]/90 backdrop-blur-lg animate-fadeIn">
      <div className="glass-panel-coral w-full max-w-md rounded-3xl p-8 border-2 border-[#F58F7C]/60 shadow-2xl shadow-[#F58F7C]/30 text-center space-y-6 animate-level-up relative overflow-hidden">
        {/* Shimmer background light */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F58F7C]/20 via-transparent to-transparent pointer-events-none" />

        {/* Level Up Emblem */}
        <div className="relative z-10 space-y-2">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-[#F58F7C] via-[#F2C4CE] to-[#F58F7C] p-1 shadow-2xl shadow-[#F58F7C]/50 flex items-center justify-center">
            <div className="w-full h-full bg-[#2C2B30] rounded-2xl flex items-center justify-center text-4xl font-black text-[#F58F7C]">
              L{newLevel}
            </div>
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-[#F58F7C]/20 border border-[#F58F7C]/40 text-[#F58F7C] font-extrabold text-xs tracking-widest uppercase">
            Level Up Achieved!
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">
            You Reached Level {newLevel}!
          </h2>
          <p className="text-xs text-[#F2C4CE]">
            Your real-life dedication has earned you greater strength and renown across the realm!
          </p>
        </div>

        {/* Stat Boost Breakdown */}
        <div className="relative z-10 p-4 rounded-2xl bg-[#2C2B30]/80 border border-[#F58F7C]/30 space-y-2 text-xs">
          <div className="font-bold text-[#F58F7C] text-sm">🎉 Level Up Bonuses Awarded:</div>
          <div className="grid grid-cols-2 gap-2 text-left font-semibold text-white">
            <div className="flex items-center gap-1.5 bg-[#4F4F51]/50 p-2 rounded-xl border border-[#D6D6D6]/10">
              <span>💪</span> +{gains.levelInfo.levelsGained * 2} All Stats Boost
            </div>
            <div className="flex items-center gap-1.5 bg-[#4F4F51]/50 p-2 rounded-xl border border-[#D6D6D6]/10">
              <span>🪙</span> +100 Gold Bonus
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose()
            playButtonClickSound()
          }}
          className="relative z-10 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#F58F7C] text-[#2C2B30] font-black text-sm shadow-xl shadow-[#F58F7C]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Claim Level {newLevel} Glory
        </button>
      </div>
    </div>
  )
}
