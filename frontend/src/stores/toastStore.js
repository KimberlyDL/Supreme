// frontend\src\stores\toastStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

let toastId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  const addToast = ({ type = 'info', message, duration = 4000, sound = true }) => {
    const id = ++toastId
    const toast = { id, type, message }

    if (toasts.value.length >= 5) {
      toasts.value.shift() // Remove oldest toast if queue is full
    }

    toasts.value.push(toast)
    if (sound) playSound(type)

    setTimeout(() => removeToast(id), duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const playSound = (type) => {
    // const soundMap = {
    //   success: '/sounds/success.mp3',
    //   error: '/sounds/error.mp3',
    //   warning: '/sounds/warning.mp3',
    //   info: '/sounds/info.mp3',
    // }
    // const audio = new Audio(soundMap[type] || soundMap.info)
    // audio.volume = 0.6
    // audio.play()
  }

  return { toasts, addToast, removeToast }
})
