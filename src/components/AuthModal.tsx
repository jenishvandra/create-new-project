import React, { useState } from 'react'
import { playButtonClickSound } from '../utils/audio'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (username: string, password: string) => Promise<void>
  onRegister: (username: string, email: string, password: string) => Promise<void>
  onDemoLogin: () => Promise<void>
}

// User specified image link
const PRIMARY_AUTH_BG =
  'https://img.magnific.com/premium-photo/anime-game-background_670382-254120.jpg?semt=ais_hybrid&w=740&q=80'

// Reliable fallback anime RPG wallpaper
const FALLBACK_AUTH_BG =
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000&auto=format&fit=crop'

export default function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onDemoLogin
}: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [bgSrc, setBgSrc] = useState(PRIMARY_AUTH_BG)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      if (isRegister) {
        await onRegister(username || email.split('@')[0], email, password)
      } else {
        await onLogin(username || email, password)
      }
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoClick = async () => {
    setErrorMsg('')
    setLoading(true)
    try {
      await onDemoLogin()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Main Split Screen Container with Background Photo */}
      <div className="w-full max-w-5xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden relative min-h-[600px] grid grid-cols-1 md:grid-cols-2">
        {/* 🌟 Background Image Layer (referrerPolicy="no-referrer" prevents hotlink blocking!) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src={bgSrc}
            referrerPolicy="no-referrer"
            onError={() => {
              if (bgSrc !== FALLBACK_AUTH_BG) {
                setBgSrc(FALLBACK_AUTH_BG)
              }
            }}
            alt="Anime Game Background"
            className="w-full h-full object-cover object-center scale-105 opacity-80"
          />

          {/* Dark Shader Overlay for Crisp Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-[#282A21]/60 to-black/85" />
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            onClose()
            playButtonClickSound()
          }}
          className="absolute top-5 right-5 z-30 w-9 h-9 rounded-full bg-black/60 border border-white/20 text-[#E6E5D8] hover:text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        >
          ✕
        </button>

        {/* Left Column (Split Screen Testimonial with Semi-Transparent Glass) */}
        <div className="relative z-10 p-8 sm:p-12 border-b md:border-b-0 md:border-r border-white/15 flex flex-col justify-between space-y-8 bg-[#1A1C16]/50 backdrop-blur-md">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-10">
              <div className="w-8 h-8 rounded-lg bg-[#D46B4E] flex items-center justify-center font-black text-white text-xs shadow-lg shadow-[#D46B4E]/40">
                A
              </div>
              <span className="text-base font-black tracking-wider text-white">LIFE RPG</span>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-[2px] bg-[#D46B4E]" />
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                Your legend <br />
                <span className="text-[#D46B4E] drop-shadow-[0_0_20px_rgba(212,107,78,0.6)]">
                  awaits within.
                </span>
              </h2>
              <p className="text-xs text-[#E6E5D8] italic leading-relaxed pt-1 drop-shadow">
                "The secret of getting ahead is getting started. One quest at a time."
              </p>
              <p className="text-[11px] font-bold text-[#D46B4E]">
                — Structured ambition, delivered daily.
              </p>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="olive-card rounded-2xl p-5 border border-white/20 space-y-3 shadow-xl">
            <p className="text-xs text-[#E6E5D8] italic leading-relaxed">
              "I shipped 4 side projects, read 22 books, and lost 18 lbs — all in one year using Life RPG."
            </p>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-full bg-[#D46B4E]/30 border border-[#D46B4E] flex items-center justify-center font-bold text-xs text-[#D46B4E]">
                JK
              </div>
              <div>
                <div className="text-xs font-bold text-white">Jordan K.</div>
                <div className="text-[10px] text-[#A2A190]">LVL 18 — Iron Architect</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Form with Semi-Transparent Glass) */}
        <div className="relative z-10 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-[#282A21]/50 backdrop-blur-md">
          {/* Sign In / Create Account Tab Switcher */}
          <div className="p-1 bg-black/50 rounded-xl border border-white/15 flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false)
                setErrorMsg('')
                playButtonClickSound()
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isRegister
                  ? 'btn-terracotta'
                  : 'text-[#A2A190] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true)
                setErrorMsg('')
                playButtonClickSound()
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isRegister
                  ? 'btn-terracotta'
                  : 'text-[#A2A190] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-white">
              {isRegister ? 'Begin Your Quest' : 'Welcome back, Adventurer'}
            </h3>
            <p className="text-xs text-[#A2A190] mt-0.5">
              {isRegister ? 'Create your hero profile and start evolving.' : 'Your quests are waiting.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A2A190] mb-1">
                  USERNAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="ShadowCoder"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full olive-input rounded-xl px-4 py-2.5 text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A2A190] mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="text"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full olive-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A2A190]">
                  PASSWORD
                </label>
                {!isRegister && (
                  <button type="button" className="text-[10px] font-bold text-[#D46B4E] hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full olive-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-terracotta text-xs font-extrabold cursor-pointer"
            >
              {loading ? 'Please wait...' : 'Enter the Arena'}
            </button>
          </form>

          {/* Divider OR */}
          <div className="flex items-center gap-3 text-[10px] font-bold text-[#A2A190] my-1">
            <div className="flex-1 h-[1px] bg-white/15" />
            <span>OR</span>
            <div className="flex-1 h-[1px] bg-white/15" />
          </div>

          {/* 1-Click Demo Login */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={loading}
              className="w-full py-2.5 rounded-xl btn-outline-sage text-xs font-bold hover:bg-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎮</span> Continue with 1-Click Demo Hero
            </button>
          </div>

          <p className="text-[11px] text-center text-[#A2A190]">
            {isRegister ? 'Already have an account? ' : 'New adventurer? '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setErrorMsg('')
                playButtonClickSound()
              }}
              className="font-bold text-[#D46B4E] hover:underline"
            >
              {isRegister ? 'Sign In' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
