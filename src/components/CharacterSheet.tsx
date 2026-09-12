import React from 'react'
import type { CharacterProfile, CharacterStats, User } from '../types/rpg'

interface CharacterSheetProps {
  user: User | null
  profile: CharacterProfile | null
  stats: CharacterStats | null
}

export default function CharacterSheet({ user, profile, stats }: CharacterSheetProps) {
  if (!profile || !stats) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center border border-[#D6D6D6]/15">
        <p className="text-sm text-[#D6D6D6]/70">Loading Character Profile...</p>
      </div>
    )
  }

  const statItems = [
    { key: 'intellect', name: 'Intellect (INT)', val: stats.intellect, icon: '💻', desc: 'Increased by Coding, Tech, & Work tasks', color: 'from-[#F2C4CE] to-[#F58F7C]' },
    { key: 'strength', name: 'Strength (STR)', val: stats.strength, icon: '🏋️‍♂️', desc: 'Increased by Gym & Physical Fitness', color: 'from-[#F58F7C] to-[#E56B55]' },
    { key: 'wisdom', name: 'Wisdom (WIS)', val: stats.wisdom, icon: '📚', desc: 'Increased by Reading & Educational Quests', color: 'from-[#F2C4CE] to-[#D6D6D6]' },
    { key: 'agility', name: 'Agility (AGI)', val: stats.agility, icon: '⚡', desc: 'Increased by Running & Cardio Habits', color: 'from-[#F58F7C] to-[#F2C4CE]' },
    { key: 'charisma', name: 'Charisma (CHA)', val: stats.charisma, icon: '🗣️', desc: 'Increased by Social & Public Speaking', color: 'from-[#F2C4CE] to-[#F58F7C]' },
    { key: 'vitality', name: 'Vitality (VIT)', val: stats.vitality, icon: '🧘‍♀️', desc: 'Increased by Meditation & Health Habits', color: 'from-[#F58F7C] to-[#D6D6D6]' }
  ]

  const maxStat = Math.max(...statItems.map((s) => s.val), 30)

  // Class Archetype lookup based on top stat
  const topStatObj = [...statItems].sort((a, b) => b.val - a.val)[0]
  const archetypeMap: Record<string, string> = {
    intellect: 'Cyber Alchemist / Tech Archmage',
    strength: 'Iron Paladin of Muscle',
    wisdom: 'Grand Scholar of Antiquity',
    agility: 'Shadow Runner / Swift Assassin',
    charisma: 'Master Bard of Influence',
    vitality: 'Zen Guardian of Wellness'
  }
  const archetype = archetypeMap[topStatObj.key] || 'Adventurer'

  return (
    <div className="space-y-6">
      {/* Hero Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#D6D6D6]/15 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          {/* Avatar Frame */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#F58F7C] via-[#F2C4CE] to-[#4F4F51] p-1 shadow-2xl shadow-[#F58F7C]/25">
              <div className="w-full h-full bg-[#2C2B30] rounded-xl flex items-center justify-center text-4xl">
                {profile.equipped_avatar === 'shadow_paladin'
                  ? '🛡️'
                  : profile.equipped_avatar === 'archmage'
                  ? '🔮'
                  : profile.equipped_avatar === 'lofi_scholar'
                  ? '☕'
                  : profile.equipped_avatar === 'astro_knight'
                  ? '⭐'
                  : '🤖'}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-xl bg-[#F58F7C] text-[#2C2B30] font-black text-xs shadow-lg">
              LVL {profile.level}
            </div>
          </div>

          {/* Name & Title */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {user?.username || 'Hero'}
              </h2>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#F2C4CE]/20 border border-[#F2C4CE]/40 text-[#F2C4CE]">
                {profile.equipped_title}
              </span>
            </div>

            <p className="text-xs font-bold text-[#F58F7C]">
              Archetype: <span className="text-white">{archetype}</span>
            </p>

            {/* Metrics pills */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs font-bold">
              <div className="px-3 py-1.5 rounded-xl bg-[#4F4F51]/50 border border-[#D6D6D6]/15 flex items-center gap-1.5 text-[#F58F7C]">
                <span>🔥</span>
                <span>{profile.streak} Day Streak</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-[#4F4F51]/50 border border-[#D6D6D6]/15 flex items-center gap-1.5 text-[#F2C4CE]">
                <span>🏆</span>
                <span>{profile.total_quests_completed} Quests Finished</span>
              </div>
              {profile.active_xp_multiplier > 1.0 && (
                <div className="px-3 py-1.5 rounded-xl bg-[#F58F7C]/20 border border-[#F58F7C]/40 text-[#F58F7C] animate-pulse">
                  🧪 2x XP Elixir Active
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attribute Stat Breakdown */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-[#D6D6D6]/15 space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>📊</span> Character Attributes & Stats
          </h3>
          <p className="text-xs text-[#D6D6D6]/70 mt-0.5">
            Completing tasks in specific categories permanently boosts your core stats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statItems.map((st) => {
            const pct = Math.min(100, Math.round((st.val / maxStat) * 100))
            return (
              <div
                key={st.key}
                className="glass-card rounded-2xl p-4 border border-[#D6D6D6]/10 space-y-2 hover:border-[#F58F7C]/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{st.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{st.name}</h4>
                      <p className="text-[10px] text-[#D6D6D6]/70">{st.desc}</p>
                    </div>
                  </div>
                  <span className="text-lg font-black font-mono text-[#F58F7C]">
                    {st.val}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#2C2B30] rounded-full overflow-hidden p-0.5 border border-[#D6D6D6]/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${st.color} transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
