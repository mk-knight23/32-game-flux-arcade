import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useAudio() {
  const settings = useSettingsStore()
  const audioContext = ref<AudioContext | null>(null)
  const enabled = ref(true)

  onMounted(() => {
    enabled.value = settings.soundEnabled
  })

  function playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) {
    if (!enabled.value || !settings.soundEnabled) return

    try {
      if (!audioContext.value) {
        audioContext.value = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      }

      const oscillator = audioContext.value.createOscillator()
      const gainNode = audioContext.value.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.value.destination)

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, audioContext.value.currentTime)

      const vol = (volume * settings.volume) / 100
      gainNode.gain.setValueAtTime(vol, audioContext.value.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.value.currentTime + duration)

      oscillator.start(audioContext.value.currentTime)
      oscillator.stop(audioContext.value.currentTime + duration)
    } catch (e) {
      console.warn('Audio playback failed:', e)
    }
  }

  function playClick() {
    playTone(800, 0.05, 'sine', 0.2)
  }

  function playHover() {
    playTone(600, 0.03, 'sine', 0.1)
  }

  function playSuccess() {
    playTone(523.25, 0.1, 'sine', 0.3)
    setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100)
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 200)
  }

  function playError() {
    playTone(200, 0.2, 'sawtooth', 0.2)
  }

  function playNavigate() {
    playTone(440, 0.05, 'sine', 0.15)
  }

  return {
    playClick,
    playHover,
    playSuccess,
    playError,
    playNavigate,
    isEnabled: enabled,
  }
}
