import React, { useState } from 'react'

interface ThemeBackgroundProps {
  theme: string
}

const DASHBOARD_BG_IMAGE =
  'https://assets.userstyles.org/assets_packs/type=style/user_id=4918850/screenshot_55c00d31-98b2-44a3-b316-09fedad31963.webp'

const FALLBACK_DASHBOARD_BG =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop'

export const THEME_CONFIGS: Record<
  string,
  {
    name: string
    bgGradient: string
    accentColor: string
    overlayPattern: string
    wallpaperUrl: string
  }
> = {
  obsidian_coral: {
    name: 'Obsidian Coral (Default)',
    bgGradient: 'from-[#1E2019]/80 via-[#282A21]/50 to-[#1E2019]/85',
    accentColor: '#D46B4E',
    overlayPattern: 'radial-gradient(circle at 50% 20%, rgba(212, 107, 78, 0.25), transparent 70%), radial-gradient(circle at 80% 80%, rgba(245, 143, 124, 0.18), transparent 70%)',
    wallpaperUrl: DASHBOARD_BG_IMAGE
  },
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bgGradient: 'from-slate-950/80 via-purple-950/60 to-slate-950/85',
    accentColor: 'cyan',
    overlayPattern: 'radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.2), transparent 70%), radial-gradient(circle at 80% 80%, rgba(217, 70, 239, 0.18), transparent 70%)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=2000&auto=format&fit=crop'
  },
  lofi: {
    name: 'Cozy Lofi Tavern',
    bgGradient: 'from-amber-950/80 via-stone-900/60 to-amber-950/85',
    accentColor: 'amber',
    overlayPattern: 'radial-gradient(circle at 30% 30%, rgba(245, 158, 11, 0.2), transparent 70%), radial-gradient(circle at 70% 70%, rgba(180, 83, 9, 0.18), transparent 70%)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=2000&auto=format&fit=crop'
  },
  dungeon: {
    name: '16-Bit Dungeon',
    bgGradient: 'from-neutral-950/85 via-zinc-900/65 to-neutral-950/85',
    accentColor: 'red',
    overlayPattern: 'radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.18), transparent 70%)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2000&auto=format&fit=crop'
  },
  celestial: {
    name: 'Celestial Astro-Realm',
    bgGradient: 'from-indigo-950/80 via-slate-900/60 to-violet-950/85',
    accentColor: 'indigo',
    overlayPattern: 'radial-gradient(circle at 50% 30%, rgba(129, 140, 248, 0.25), transparent 70%), radial-gradient(circle at 20% 80%, rgba(192, 132, 252, 0.18), transparent 70%)',
    wallpaperUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2000&auto=format&fit=crop'
  }
}

export default function ThemeBackground({ theme }: ThemeBackgroundProps) {
  const current = THEME_CONFIGS[theme] || THEME_CONFIGS.obsidian_coral
  const [imgSrc, setImgSrc] = useState(current.wallpaperUrl)

  // Update image source if theme changes
  React.useEffect(() => {
    setImgSrc(current.wallpaperUrl)
  }, [current.wallpaperUrl])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Background Image wallpaper with referrerPolicy="no-referrer" to prevent hotlink blocking */}
      <img
        src={imgSrc}
        referrerPolicy="no-referrer"
        onError={() => {
          if (imgSrc !== FALLBACK_DASHBOARD_BG) {
            setImgSrc(FALLBACK_DASHBOARD_BG)
          }
        }}
        alt="Dashboard Anime RPG Background"
        className="w-full h-full object-cover object-center animate-kenburns opacity-70 transition-opacity duration-1000"
      />

      {/* Dark Gradient Overlay for Crisp UI Contrast */}
      <div className={`absolute inset-0 bg-gradient-to-br ${current.bgGradient}`} />

      {/* Overlay pattern glow */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ backgroundImage: current.overlayPattern }}
      />

      {/* Ambient floating glowing lights */}
      <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-[#D46B4E]/15 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/5 w-96 h-96 bg-[#F2C4CE]/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '2s' }}
      />
    </div>
  )
}
