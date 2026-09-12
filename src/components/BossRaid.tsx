import React from 'react'
import type { BossBattle } from '../types/rpg'
import { playBossSlashSound, playButtonClickSound } from '../utils/audio'

interface BossRaidProps {
  boss: BossBattle | null
  onRespawnBoss: () => void
}

export default function BossRaid({ boss, onRespawnBoss }: BossRaidProps) {
  if (!boss) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-[#D6D6D6]/15">
        <p className="text-sm text-[#D6D6D6]/70">Loading Boss Battle Arena...</p>
      </div>
    )
  }

  const hpPct = Math.min(100, Math.max(0, Math.round((boss.current_hp / boss.max_hp) * 100)))
  const isDefeated = boss.current_hp === 0

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#D6D6D6]/15 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-[#F58F7C] font-bold text-xs uppercase tracking-wider">
            <span>🐉 Weekly World Boss Raid</span>
            <span className="w-2 h-2 rounded-full bg-[#F58F7C] animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            {boss.boss_name}
          </h2>
          <p className="text-xs sm:text-sm text-[#D6D6D6] max-w-lg">
            Completing quests in real life deals instant damage to the Boss! Defeat the Boss to claim legendary Gold & Gem loot!
          </p>
        </div>

        {/* Boss Level Badge */}
        <div className="px-5 py-3 rounded-2xl bg-[#F58F7C]/20 border border-[#F58F7C]/40 text-[#F58F7C] font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#F58F7C]/10">
          <span>👑</span>
          <span>Boss Level {boss.level}</span>
        </div>
      </div>

      {/* Main Boss Stage */}
      <div className="glass-panel rounded-3xl p-8 border border-[#D6D6D6]/20 relative overflow-hidden flex flex-col items-center justify-center text-center space-y-6 shadow-2xl">
        {/* Boss Visual Monster Art */}
        <div className="relative group">
          <div
            className={`w-40 h-40 sm:w-48 sm:h-48 rounded-3xl flex items-center justify-center text-7xl sm:text-8xl transition-all duration-500 ${
              isDefeated
                ? 'bg-[#2C2B30] border border-[#D6D6D6]/10 grayscale opacity-40 scale-95'
                : 'bg-gradient-to-tr from-[#2C2B30] via-[#4F4F51] to-[#2C2B30] border-2 border-[#F58F7C]/60 shadow-2xl shadow-[#F58F7C]/30 animate-float'
            }`}
          >
            {isDefeated ? '💀' : boss.level % 2 === 0 ? '👾' : '👹'}
          </div>

          {/* Slash animation effect if active */}
          {!isDefeated && (
            <div className="absolute inset-0 rounded-3xl border border-[#F58F7C]/40 animate-pulse pointer-events-none" />
          )}
        </div>

        {/* HP Bar */}
        <div className="w-full max-w-lg space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-[#F58F7C] flex items-center gap-1">
              <span>❤️</span> Boss Health Points
            </span>
            <span className="font-mono text-white">
              {boss.current_hp} / {boss.max_hp} HP ({hpPct}%)
            </span>
          </div>

          <div className="w-full h-4 bg-[#2C2B30] rounded-full overflow-hidden p-1 border border-[#D6D6D6]/15 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDefeated
                  ? 'bg-[#4F4F51]'
                  : hpPct < 25
                  ? 'bg-rose-600 animate-pulse'
                  : 'bg-gradient-to-r from-[#F58F7C] via-[#F2C4CE] to-[#F58F7C]'
              }`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
        </div>

        {/* Battle Instructions / Respawn */}
        {isDefeated ? (
          <div className="p-6 rounded-2xl bg-[#F58F7C]/15 border border-[#F58F7C]/30 max-w-md space-y-3">
            <div className="text-2xl">🏆</div>
            <h3 className="text-lg font-extrabold text-[#F58F7C]">BOSS DEFEATED!</h3>
            <p className="text-xs text-[#D6D6D6]">
              You dealt the final blow! +200 Gold and +5 Gems have been deposited into your vault.
            </p>
            <button
              onClick={() => {
                onRespawnBoss()
                playBossSlashSound()
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F58F7C] to-[#F2C4CE] text-[#2C2B30] font-black text-xs shadow-lg shadow-[#F58F7C]/25 hover:brightness-110 active:scale-95 transition-all"
            >
              Summon Next Boss (Level {boss.level + 1})
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#4F4F51]/30 border border-[#D6D6D6]/15 max-w-md text-xs text-[#D6D6D6]/70 space-y-1">
            <p className="font-bold text-white">🗡️ Combat Log:</p>
            <p>Every active quest completed delivers real-time damage proportional to XP gained!</p>
          </div>
        )}
      </div>
    </div>
  )
}
