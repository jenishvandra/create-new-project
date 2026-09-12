import React, { useEffect, useRef } from 'react'
import { playButtonClickSound } from '../utils/audio'

interface LandingPageProps {
  onEnterArena: () => void
  onOpenAuth: () => void
}

// User specified anime game background image URL
const PRIMARY_LANDING_BG =
  'https://img.magnific.com/premium-photo/anime-game-background_670382-254192.jpg?semt=ais_hybrid&w=740&q=80'

// Reliable fallback high-res anime wallpaper
const FALLBACK_LANDING_BG =
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000&auto=format&fit=crop'

/** Live HTML5 Canvas animation rendering glowing Stardust & Constellation lines */
function StardustConstellationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    interface Star {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      alpha: number
      alphaSpeed: number
      color: string
    }

    const starColors = ['#D46B4E', '#F58F7C', '#F2C4CE', '#FFFFFF', '#FFA07A']
    const stars: Star[] = []
    const count = 75

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
        alphaSpeed: Math.random() * 0.015 + 0.005,
        color: starColors[Math.floor(Math.random() * starColors.length)]
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 1. Draw connecting constellation lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.25
            ctx.save()
            ctx.strokeStyle = '#D46B4E'
            ctx.globalAlpha = lineAlpha
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }

      // 2. Draw glowing star particles
      stars.forEach((s) => {
        s.x += s.vx
        s.y += s.vy
        s.alpha += s.alphaSpeed

        if (s.alpha > 0.95 || s.alpha < 0.25) {
          s.alphaSpeed = -s.alphaSpeed
        }

        if (s.x < 0) s.x = canvas.width
        if (s.x > canvas.width) s.x = 0
        if (s.y < 0) s.y = canvas.height
        if (s.y > canvas.height) s.y = 0

        ctx.save()
        ctx.globalAlpha = s.alpha
        ctx.fillStyle = s.color
        ctx.shadowColor = s.color
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  )
}

export default function LandingPage({ onEnterArena, onOpenAuth }: LandingPageProps) {
  const [bgSrc, setBgSrc] = React.useState(PRIMARY_LANDING_BG)

  return (
    <div className="min-h-screen relative text-[#E6E5D8] selection:bg-[#D46B4E] selection:text-white bg-[#1A1C16] overflow-hidden">
      {/* 🌟 Live Background Wallpaper & Stardust Constellation Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Background Image with referrerPolicy="no-referrer" to prevent hotlink blocking */}
        <img
          src={bgSrc}
          referrerPolicy="no-referrer"
          onError={() => {
            if (bgSrc !== FALLBACK_LANDING_BG) {
              setBgSrc(FALLBACK_LANDING_BG)
            }
          }}
          alt="Anime Game Background"
          className="w-full h-full object-cover object-center animate-kenburns opacity-75 transition-opacity duration-1000"
        />

        {/* Dark Vignette Overlay for High Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1E2019]/75 via-[#1E2019]/45 to-[#1E2019]/90" />

        {/* Radial Terracotta Glow Shimmer */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 25%, rgba(212, 107, 78, 0.3), transparent 65%), radial-gradient(circle at 80% 75%, rgba(245, 143, 124, 0.22), transparent 70%)'
          }}
        />

        {/* Live Stardust Constellation & Particle Canvas */}
        <StardustConstellationCanvas />
      </div>

      {/* Top Glass Navbar */}
      <header className="sticky top-0 z-40 w-full glass-landing-header px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onEnterArena}>
            <div className="w-8 h-8 rounded-lg bg-[#D46B4E] flex items-center justify-center font-black text-white text-sm shadow-lg shadow-[#D46B4E]/40">
              A
            </div>
            <span className="text-lg font-black tracking-wider text-white">LIFE RPG</span>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#A2A190]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#manifesto" className="hover:text-white transition-colors">Manifesto</a>
            <a href="#leaderboard" className="hover:text-white transition-colors">Leaderboard</a>
          </nav>

          {/* Right Action */}
          <button
            onClick={() => {
              onEnterArena()
              playButtonClickSound()
            }}
            className="px-5 py-2.5 rounded-xl btn-terracotta text-xs font-extrabold cursor-pointer"
          >
            Start Your Journey
          </button>
        </div>
      </header>

      {/* Hero Section (Matching Screenshot 1 with Transparent Glass) */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 space-y-10 relative z-20">
        {/* Pill Badge */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D46B4E]/25 backdrop-blur-md border border-[#D46B4E]/60 text-[#D46B4E] text-[11px] font-extrabold tracking-wider uppercase shadow-xl shadow-[#D46B4E]/20">
            <span className="w-2 h-2 rounded-full bg-[#D46B4E] animate-ping" />
            GAMIFIED PRODUCTIVITY SYSTEM
          </span>
        </div>

        {/* Display Heading */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-2xl">
            Your Life Is the <br />
            <span className="text-[#D46B4E] drop-shadow-[0_0_35px_rgba(212,107,78,0.65)]">
              Greatest RPG
            </span> <br />
            You Will Ever Play.
          </h1>

          <p className="text-sm sm:text-base text-[#E6E5D8] italic max-w-2xl pt-4 leading-relaxed font-normal drop-shadow-lg">
            Transform your daily habits, career goals, and personal growth into a rich role-playing experience. Earn XP. Level up. Claim real-world rewards.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={() => {
              onEnterArena()
              playButtonClickSound()
            }}
            className="px-7 py-3.5 rounded-2xl btn-terracotta text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-xl shadow-[#D46B4E]/30"
          >
            <span>Enter the Arena</span>
          </button>

          <button
            onClick={() => {
              onOpenAuth()
              playButtonClickSound()
            }}
            className="px-6 py-3.5 rounded-2xl btn-outline-sage text-sm font-semibold cursor-pointer"
          >
            Watch the Manifesto
          </button>
        </div>

        {/* Bottom Metrics Bar with Transparent Glass Card */}
        <div className="pt-10">
          <div className="olive-card rounded-3xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left border border-white/20 shadow-2xl">
            <div>
              <div className="text-3xl font-extrabold text-white">12,400+</div>
              <div className="text-xs font-semibold text-[#A2A190] mt-0.5">Active Adventurers</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">3.2M</div>
              <div className="text-xs font-semibold text-[#A2A190] mt-0.5">Quests Completed</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white">98%</div>
              <div className="text-xs font-semibold text-[#A2A190] mt-0.5">Habit Retention Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Systems Section (Matching Screenshot 2 with Transparent Glass Cards) */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 space-y-10 relative z-20">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#D46B4E]">
            CORE SYSTEMS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Built for the <span className="text-[#D46B4E]">relentlessly ambitious.</span>
          </h2>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Quest System */}
          <div className="olive-card rounded-2xl p-6 space-y-3 relative overflow-hidden">
            <div className="w-8 h-[2px] bg-[#D46B4E]" />
            <h3 className="text-lg font-bold text-white pt-1">Quest System</h3>
            <p className="text-xs text-[#A2A190] leading-relaxed">
              Turn every goal — fitness, career, learning — into structured quests with clear XP rewards and difficulty tiers.
            </p>
          </div>

          {/* Card 2: Character Growth */}
          <div className="olive-card rounded-2xl p-6 space-y-3 relative overflow-hidden">
            <div className="w-8 h-[2px] bg-[#D46B4E]" />
            <h3 className="text-lg font-bold text-white pt-1">Character Growth</h3>
            <p className="text-xs text-[#A2A190] leading-relaxed">
              Six attributes that evolve with your real-world actions. Watch STR, INT, WIS, AGI, CHA, and VIT rise as you level up.
            </p>
          </div>

          {/* Card 3: Real-World Rewards */}
          <div className="olive-card rounded-2xl p-6 space-y-3 relative overflow-hidden">
            <div className="w-8 h-[2px] bg-[#D46B4E]" />
            <h3 className="text-lg font-bold text-white pt-1">Real-World Rewards</h3>
            <p className="text-xs text-[#A2A190] leading-relaxed">
              Spend earned Gold and Gems on actual treats. A boba run, a gaming hour, a movie night — all guilt-free.
            </p>
          </div>

          {/* Card 4: World Boss Raids */}
          <div className="olive-card rounded-2xl p-6 space-y-3 relative overflow-hidden">
            <div className="w-8 h-[2px] bg-[#D46B4E]" />
            <h3 className="text-lg font-bold text-white pt-1">World Boss Raids</h3>
            <p className="text-xs text-[#A2A190] leading-relaxed">
              Community-wide weekly challenges where your individual progress contributes to defeating a shared boss together.
            </p>
          </div>
        </div>

        {/* Ready Banner */}
        <div className="olive-card rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20">
          <div>
            <h3 className="text-2xl font-extrabold text-white">Ready to begin your legend?</h3>
            <p className="text-xs text-[#A2A190] mt-1">Create your character. Accept your first quest. Never look back.</p>
          </div>
          <button
            onClick={() => {
              onEnterArena()
              playButtonClickSound()
            }}
            className="px-6 py-3.5 rounded-2xl btn-terracotta text-xs font-extrabold whitespace-nowrap cursor-pointer"
          >
            Create My Character
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full glass-landing-header py-6 px-6 text-center text-xs text-[#A2A190] relative z-20">
        <p>© 2026 Life RPG. All rights reserved. Full-Stack Web Hackathon Project.</p>
      </footer>
    </div>
  )
}
