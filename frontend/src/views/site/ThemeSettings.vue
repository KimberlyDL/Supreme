<!-- frontend\src\views\site\ThemeSettings.vue -->
<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="theme in availableThemes" :key="theme"
            class="border border-bgPrimary-200 rounded-lg overflow-hidden shadow-md">
            <div class="p-4 border-b border-bgPrimary-200">
                <h3 class="text-lg font-semibold">{{ formatThemeName(theme) }}</h3>
            </div>

            <!-- Important: We need to apply the theme class directly to this div -->
            <div class="p-4 space-y-4" :class="theme !== 'light' ? `theme-${theme}` : ''">
                <!-- Primary colors -->
                <div>
                    <h4 class="text-sm font-medium mb-2">Primary</h4>
                    <div class="flex flex-wrap gap-1">
                        <div v-for="shade in colorShades" :key="`primary-${shade}`" class="w-8 h-8 rounded"
                            :style="{ backgroundColor: `var(--color-primary-${shade})` }" :title="`primary-${shade}`">
                        </div>
                    </div>
                </div>

                <!-- Secondary colors -->
                <div class="mb-4">
                    <h3 class="font-medium text-tBase-100 capitalize mb-2">Secondary</h3>
                    <div class="flex flex-wrap gap-1">
                        <div v-for="shade in colorShades" :key="`secondary-${shade}`" class="w-8 h-8 rounded"
                            :style="{ backgroundColor: `var(--color-secondary-${shade})` }"
                            :title="`secondary-${shade}`"></div>
                    </div>
                    <div class="w-8 h-8 rounded"
                            :style="{ backgroundColor: `color-secondary-100` }"
                            :title="`secondary-100`"></div>
                </div>

                <!-- Accent colors -->
                <div class="mb-4">
                    <h3 class="font-medium text-tBase-100 capitalize mb-2">Accent</h3>
                    <div class="flex flex-wrap gap-1">
                        <div v-for="shade in colorShades" :key="`accent-${shade}`" class="w-8 h-8 rounded"
                            :style="{ backgroundColor: `var(--color-accent-${shade})` }" :title="`accent-${shade}`">
                        </div>
                    </div>
                </div>

                <!-- Status colors -->
                <div>
                    <h4 class="text-sm font-medium mb-2">Status</h4>
                    <div class="grid grid-cols-4 gap-1">
                        <div class="w-8 h-8 rounded" :style="{ backgroundColor: 'var(--color-success-500)' }"
                            title="success"></div>
                        <div class="w-8 h-8 rounded" :style="{ backgroundColor: 'var(--color-danger-500)' }"
                            title="danger"></div>
                        <div class="w-8 h-8 rounded" :style="{ backgroundColor: 'var(--color-warning-500)' }"
                            title="warning"></div>
                        <div class="w-8 h-8 rounded" :style="{ backgroundColor: 'var(--color-info-500)' }" title="info">
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t border-bgPrimary-200">
                <button @click="selectTheme(theme)" class="w-full px-4 py-2 bg-primary-500 text-white rounded">
                    Apply Theme
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

const themeStore = useThemeStore()
const availableThemes = computed(() => themeStore.availableThemes)
const colorShades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

// Methods
const selectTheme = (theme) => {
    themeStore.setTheme(theme)
}

const formatThemeName = (theme) => {
    return theme.charAt(0).toUpperCase() + theme.slice(1)
}
</script>