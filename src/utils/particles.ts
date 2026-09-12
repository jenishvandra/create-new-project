export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
  life: number
  maxLife: number
}

export function triggerParticleBurst(originX: number, originY: number, colorPreset: 'gold' | 'neon' | 'rainbow' = 'gold') {
  const canvas = document.createElement('canvas')
  canvas.style.position = 'fixed'
  canvas.style.top = '0'
  canvas.style.left = '0'
  canvas.style.width = '100vw'
  canvas.style.height = '100vh'
  canvas.style.pointerEvents = 'none'
  canvas.style.zIndex = '9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    document.body.removeChild(canvas)
    return
  }

  const dpr = window.devicePixelRatio || 1
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  const colors =
    colorPreset === 'gold'
      ? ['#FBBF24', '#F59E0B', '#FDE047', '#EAB308', '#FFFFFF']
      : colorPreset === 'neon'
      ? ['#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981']
      : ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899']

  const particles: Particle[] = []
  const count = 45

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = (Math.random() * 6 + 2) * dpr
    particles.push({
      x: originX * dpr,
      y: originY * dpr,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (Math.random() * 3 + 1) * dpr,
      size: (Math.random() * 5 + 3) * dpr,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 0,
      maxLife: Math.random() * 30 + 40
    })
  }

  let animationFrameId: number

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    let alive = false

    particles.forEach((p) => {
      p.life++
      if (p.life < p.maxLife) {
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 * dpr // gravity
        p.alpha = 1 - p.life / p.maxLife

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    })

    if (alive) {
      animationFrameId = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(animationFrameId)
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas)
      }
    }
  }

  animate()
}
