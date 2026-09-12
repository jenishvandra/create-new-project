// Web Audio API Synthesizer for Life RPG retro / fantasy sound effects
let audioCtx: AudioContext | null = null
let soundMuted = false

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function isMuted(): boolean {
  return soundMuted
}

export function toggleMute(): boolean {
  soundMuted = !soundMuted
  return soundMuted
}

export function playButtonClickSound() {
  if (soundMuted) return
  try {
    const ctx = getAudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  } catch (e) {
    // Ignore audio autoplay policy restrictions
  }
}

export function playQuestCompleteSound() {
  if (soundMuted) return
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // First chime
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(523.25, now) // C5
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.3)

    // Second chime
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(659.25, now + 0.1) // E5
    gain2.gain.setValueAtTime(0.2, now + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.1)
    osc2.stop(now + 0.4)

    // Third high chime
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(1046.5, now + 0.2) // C6
    gain3.gain.setValueAtTime(0.25, now + 0.2)
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(now + 0.2)
    osc3.stop(now + 0.6)
  } catch (e) {
    // Ignore audio restriction
  }
}

export function playLevelUpSound() {
  if (soundMuted) return
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51] // C5, E5, G5, C6, E6

    notes.forEach((freq, index) => {
      const startTime = now + index * 0.08
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = index === notes.length - 1 ? 'sine' : 'triangle'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.2, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + 0.4)
    })
  } catch (e) {
    // Ignore audio restriction
  }
}

export function playGoldSound() {
  if (soundMuted) return
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(987.77, now) // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08) // E6

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  } catch (e) {
    // Ignore audio restriction
  }
}

export function playBossSlashSound() {
  if (soundMuted) return
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, now)
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  } catch (e) {
    // Ignore audio restriction
  }
}
