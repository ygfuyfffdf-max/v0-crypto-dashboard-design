import { useCallback, useEffect, useRef } from 'react'

export const useKocmocSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    // Initialize AudioContext on first user interaction or mount (if allowed)
    // For auto-playing intros, browsers often block audio until interaction.
    // However, we can try to initialize it.
    const initAudio = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass()
          masterGainRef.current = audioContextRef.current.createGain()
          masterGainRef.current.gain.value = 0.3 // Default volume
          masterGainRef.current.connect(audioContextRef.current.destination)
        }
      }
    }

    // Resume context if suspended (common browser policy)
    const resumeAudio = () => {
      // Lazy init on first interaction
      if (!audioContextRef.current) {
        initAudio()
      }

      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume()
      }
    }

    // Do NOT auto-init to avoid console warnings
    // initAudio()

    window.addEventListener('click', resumeAudio)
    window.addEventListener('touchstart', resumeAudio)
    window.addEventListener('keydown', resumeAudio)

    return () => {
      window.removeEventListener('click', resumeAudio)
      window.removeEventListener('touchstart', resumeAudio)
      window.removeEventListener('keydown', resumeAudio)
    }
  }, [])

  const playOscillator = useCallback((
    type: OscillatorType,
    freqStart: number,
    freqEnd: number,
    duration: number,
    vol: number = 0.5
  ) => {
    if (!audioContextRef.current || !masterGainRef.current) return

    const ctx = audioContextRef.current
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freqStart, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + duration * 0.1)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(masterGainRef.current)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  }, [])

  const playDrone = useCallback(() => {
    if (!audioContextRef.current || !masterGainRef.current) return
    const ctx = audioContextRef.current

    // Deep drone
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(50, ctx.currentTime)
    gain1.gain.setValueAtTime(0, ctx.currentTime)
    gain1.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2)

    osc1.connect(gain1)
    gain1.connect(masterGainRef.current)
    osc1.start()

    // Space ambience
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(120, ctx.currentTime)
    gain2.gain.setValueAtTime(0, ctx.currentTime)
    gain2.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3)

    osc2.connect(gain2)
    gain2.connect(masterGainRef.current)
    osc2.start()

    return () => {
      const now = ctx.currentTime
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 2)
      osc1.stop(now + 2)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 2)
      osc2.stop(now + 2)
    }
  }, [])

  const playLogoForming = useCallback(() => {
    // Sci-fi scanner sound
    playOscillator('sine', 200, 800, 2.5, 0.2)
    playOscillator('triangle', 100, 50, 2.5, 0.1)
  }, [playOscillator])

  const playTextReveal = useCallback(() => {
    // Sharp high-tech sound
    playOscillator('sine', 800, 1200, 0.5, 0.1)
    // Low thud
    playOscillator('square', 100, 50, 0.8, 0.1)
  }, [playOscillator])

  const playComplete = useCallback(() => {
    // Ethereal chord
    playOscillator('sine', 440, 440, 3, 0.2) // A4
    playOscillator('sine', 554.37, 554.37, 3, 0.2) // C#5
    playOscillator('sine', 659.25, 659.25, 3, 0.2) // E5
  }, [playOscillator])

  const playHover = useCallback(() => {
    playOscillator('sine', 400, 600, 0.1, 0.05)
  }, [playOscillator])

  const playClick = useCallback(() => {
    playOscillator('triangle', 800, 400, 0.1, 0.1)
  }, [playOscillator])

  return {
    playDrone,
    playLogoForming,
    playTextReveal,
    playComplete,
    playHover,
    playClick
  }
}
