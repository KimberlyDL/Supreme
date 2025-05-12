import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { themes } from '@/assets/themes'

export const useThemeStore = defineStore('theme', () => {
    // Check if user has a saved preference, otherwise use system preference
    const getInitialDarkMode = () => {
        const savedMode = localStorage.getItem('darkMode')
        if (savedMode !== null) {
            return savedMode === 'true'
        }
        // Check system preference
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // State
    const currentTheme = ref(localStorage.getItem('theme') || 'light')
    const isDarkMode = ref(getInitialDarkMode())

    // Get all available themes
    const availableThemes = computed(() => Object.keys(themes))

    // Apply theme function
    const applyTheme = (theme, dark = false) => {
        // Remove all theme classes
        document.documentElement.classList.forEach(className => {
            if (className.startsWith('theme-')) {
                document.documentElement.classList.remove(className)
            }
        })

        // Add dark mode class if needed
        if (dark) {
            document.documentElement.classList.add('theme-dark')
        }

        // Add theme class if not default light theme
        if (theme !== 'light') {
            document.documentElement.classList.add(`theme-${theme}`)
        }

        // Save preferences
        localStorage.setItem('theme', theme)
        localStorage.setItem('darkMode', dark.toString())

        // Update state
        currentTheme.value = theme
        isDarkMode.value = dark
    }

    // Set theme
    const setTheme = (theme) => {
        applyTheme(theme, isDarkMode.value)
    }

    // Toggle dark mode
    const toggleDarkMode = () => {
        applyTheme(currentTheme.value, !isDarkMode.value)
    }

    // Use system preference
    const useSystemPreference = () => {
        // Remove saved preference to use system preference
        localStorage.removeItem('darkMode')

        // Apply system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        applyTheme(currentTheme.value, prefersDark)
    }

    // Listen for system preference changes
    const setupSystemPreferenceListener = () => {
        if (window.matchMedia) {
            const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

            const handleChange = (e) => {
                // Only apply if user hasn't explicitly set a preference
                if (localStorage.getItem('darkMode') === null) {
                    applyTheme(currentTheme.value, e.matches)
                }
            }

            // Modern browsers
            if (colorSchemeQuery.addEventListener) {
                colorSchemeQuery.addEventListener('change', handleChange)
            }
            // Older browsers
            else if (colorSchemeQuery.addListener) {
                colorSchemeQuery.addListener(handleChange)
            }
        }
    }

    // Initialize theme on store creation
    if (typeof window !== 'undefined') {
        applyTheme(currentTheme.value, isDarkMode.value)
        setupSystemPreferenceListener()
    }

    return {
        currentTheme,
        isDarkMode,
        availableThemes,
        setTheme,
        toggleDarkMode,
        useSystemPreference,
        applyTheme
    }
}, {
    persist: true
})