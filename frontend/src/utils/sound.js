// Web Audio API synthesizer for real-time auditory medical alerts
// Zero external files, zero latency, works offline in any modern browser.

class SoundService {
  constructor() {
    this.ctx = null
  }

  _getContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
    return this.ctx
  }

  // Pleasant chime for "Dose Taken" confirmation
  playSuccessChime() {
    try {
      const ctx = this._getContext()
      if (!ctx) return

      const now = ctx.currentTime
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gain = ctx.createGain()

      // Notes: E5 (659.25Hz) -> G#5 (830.61Hz)
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(659.25, now)
      osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.15)

      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(1318.5, now) // Octave harmonic

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.5)
      osc2.stop(now + 0.5)
    } catch (e) {
      console.warn('Audio playback error:', e)
    }
  }

  // Gentle medical reminder alarm tone (two pulses)
  playReminderAlarm() {
    try {
      const ctx = this._getContext()
      if (!ctx) return

      const now = ctx.currentTime
      const playPulse = (start) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, start) // A5
        osc.frequency.exponentialRampToValueAtTime(1046.5, start + 0.1) // C6
        gain.gain.setValueAtTime(0.2, start)
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.25)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + 0.25)
      }

      playPulse(now)
      playPulse(now + 0.3)
      playPulse(now + 0.6)
    } catch (e) {
      console.warn('Alarm tone error:', e)
    }
  }

  // Refill confirmation tone
  playRefillTone() {
    try {
      const ctx = this._getContext()
      if (!ctx) return
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now) // C5
      osc.frequency.linearRampToValueAtTime(783.99, now + 0.2) // G5
      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.35)
    } catch (e) {
      console.warn('Refill tone error:', e)
    }
  }
}

export const sound = new SoundService()
