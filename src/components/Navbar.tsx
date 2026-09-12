import React from 'react'
import type { CharacterProfile, User } from '../types/rpg'
import { isMuted, toggleMute, playButtonClickSound } from '../utils/audio'
import {
  IconSwords,
  IconCoin,
  IconGem,
  IconFlame,
  IconVolume,
  IconVolumeMute,
  IconUser,
  IconRefresh,
  IconLogOut
} from './Icons'

interface NavbarProps {
  user: User | null
  profile: CharacterProfile | null
  activeTheme: string
  onSelectTheme: (themeKey: string) => void
  onOpenAuth: () => void
  onLogout: () => void
  onResetDemo: () => void
  onGoToLanding?: () => void
}

export default function Navbar({
  user,
  profile,
  activeTheme,
  onSelectTheme,
  onOpenAuth,
  onLogout,
  onResetDemo,
  onGoToLanding
}: NavbarProps) {
  const [muted, setMuted] = React.useState(isMuted())
  const [showUserMenu, setShowUserMenu] = React.useState(false)

  const handleMuteToggle = () => {
    const newMute = toggleMute()
    setMuted(newMute)
    if (!newMute) playButtonClickSound()
  }

  const level = profile?.level || 1
  const currentXp = profile?.current_xp || 0
  const nextLevelXp = profile?.nextLevelXp || 100
  const xpPct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100))
  const streak = profile?.streak || 1
  const gold = profile?.gold || 0
  const gems = profile?.gems || 0

  return (
    <header className="sticky top-0 z-40 w-full bg-[#282A21] border-b border-[#3F4236] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand logo */}
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={onGoToLanding}>
          <div className="w-8 h-8 rounded-lg bg-[#D46B4E] flex items-center justify-center text-white shadow-md shadow-[#D46B4E]/30 group-hover:scale-105 transition-transform">
            <IconSwords className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-wider text-white">LIFE RPG</span>
        </div>

        {/* Middle: Character Level & XP Bar (Matching Screenshot 4) */}
        {profile && (
          <div className="hidden md:flex items-center gap-3 bg-[#34362B] border border-[#3F4236] rounded-xl px-3.5 py-1.5 flex-1 max-w-sm">
            <div className="text-[11px] font-extrabold text-[#D46B4E] uppercase tracking-wider whitespace-nowrap">
              LVL {level} — {profile.equipped_title.toUpperCase()}
            </div>
            <div className="flex-1 flex items-center gap-2">
              <div className="w-full h-1.5 bg-[#24261E] rounded-full overflow-hidden border border-[#3F4236]">
                <div
                  className="h-full bg-[#D46B4E] rounded-full transition-all duration-500"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-[#A2A190] whitespace-nowrap">
                {currentXp} / {nextLevelXp} XP
              </span>
            </div>
          </div>
        )}

        {/* Right: Currency & Profile Menu (Matching Screenshot 4) */}
        <div className="flex items-center gap-2.5">
          {profile && (
            <div className="flex items-center gap-2">
              {/* Gold */}
              <div className="bg-[#34362B] border border-[#3F4236] rounded-xl px-3 py-1 text-xs font-bold text-[#E6E5D8] flex items-center gap-1.5">
                <IconCoin className="w-3.5 h-3.5 text-[#D9B75B]" />
                <span>{gold} Gold</span>
              </div>

              {/* Gems */}
              <div className="bg-[#34362B] border border-[#3F4236] rounded-xl px-3 py-1 text-xs font-bold text-[#E6E5D8] flex items-center gap-1.5">
                <IconGem className="w-3.5 h-3.5 text-[#C57BD9]" />
                <span>{gems} Gems</span>
              </div>

              {/* Streak */}
              <div className="bg-[#383025] border border-[#D46B4E]/30 rounded-xl px-3 py-1 text-xs font-bold text-[#D46B4E] flex items-center gap-1.5">
                <IconFlame className="w-3.5 h-3.5 text-[#D46B4E]" />
                <span>{streak}-Day Streak</span>
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleMuteToggle}
            className="p-2 rounded-xl bg-[#34362B] border border-[#3F4236] text-[#A2A190] hover:text-white transition-colors"
            title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          >
            {muted ? <IconVolumeMute className="w-4 h-4" /> : <IconVolume className="w-4 h-4" />}
          </button>

          {/* Profile Menu */}
          <div className="relative">
            {user ? (
              <div>
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu)
                    playButtonClickSound()
                  }}
                  className="w-8 h-8 rounded-xl bg-[#34362B] border border-[#3F4236] hover:border-[#D46B4E] flex items-center justify-center text-[#A2A190] hover:text-white transition-colors"
                  title="User Profile Menu"
                >
                  <IconUser className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 olive-panel rounded-2xl shadow-2xl p-2 z-50 border border-[#3F4236]">
                    <div className="px-3 py-2 border-b border-[#3F4236] mb-1">
                      <div className="text-xs font-bold text-white">{user.username}</div>
                      <div className="text-[10px] text-[#A2A190] truncate">{user.email}</div>
                    </div>

                    <button
                      onClick={() => {
                        onResetDemo()
                        setShowUserMenu(false)
                        playButtonClickSound()
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#D46B4E] hover:bg-[#D46B4E]/10 transition-colors flex items-center gap-2"
                    >
                      <IconRefresh className="w-3.5 h-3.5 text-[#D46B4E]" />
                      <span>Reset Demo Data</span>
                    </button>

                    <button
                      onClick={() => {
                        onLogout()
                        setShowUserMenu(false)
                        playButtonClickSound()
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                    >
                      <IconLogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth()
                  playButtonClickSound()
                }}
                className="px-4 py-1.5 rounded-xl btn-terracotta text-xs font-extrabold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

