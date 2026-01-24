import { ref, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { KEYBOARD_SHORTCUTS } from '@/utils/constants'

export type KeyAction = 'back' | 'help' | 'settings' | 'sound' | 'none'

export function useKeyboardControls() {
  const settings = useSettingsStore()
  const keysPressed = ref<Set<string>>(new Set())
  const lastAction = ref<KeyAction>('none')

  const actionMap: Record<string, KeyAction> = {
    Escape: 'back',
    Backspace: 'back',
    KeyH: 'help',
    h: 'help',
    H: 'help',
    KeyS: 'settings',
    s: 'settings',
    S: 'settings',
    KeyM: 'sound',
    m: 'sound',
    M: 'sound',
  }

  function getAction(key: string): KeyAction {
    return actionMap[key] || 'none'
  }

  function isPressed(key: string): boolean {
    return keysPressed.value.has(key)
  }

  function handleKeyDown(e: KeyboardEvent) {
    const action = getAction(e.key)

    if (action === 'back' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      lastAction.value = action
      return
    }

    if (action === 'help' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      settings.toggleHelp()
      lastAction.value = action
      return
    }

    if (action === 'settings' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      lastAction.value = action
      return
    }

    if (action === 'sound' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      settings.toggleSound()
      lastAction.value = action
      return
    }

    if (action !== 'none') {
      lastAction.value = action
    }

    keysPressed.value.add(e.key)
  }

  function handleKeyUp(e: KeyboardEvent) {
    keysPressed.value.delete(e.key)

    if (getAction(e.key) === lastAction.value) {
      setTimeout(() => {
        lastAction.value = 'none'
      }, 50)
    }
  }

  function clearAction() {
    lastAction.value = 'none'
  }

  function getShortcuts() {
    return KEYBOARD_SHORTCUTS
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  })

  return {
    lastAction,
    isPressed,
    getAction,
    clearAction,
    getShortcuts,
  }
}
