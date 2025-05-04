<!-- frontend\src\components\ThemePreview.vue -->
<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="theme in availableThemes" :key="theme"
            class="border border-bgPrimary-200 rounded-lg overflow-hidden shadow-md">
            <div class="p-4 border-b border-bgPrimary-200">
                <h3 class="text-lg font-semibold">{{ formatThemeName(theme) }}</h3>
            </div>

            <div class="p-4 space-y-4" :class="`theme-${theme !== 'light' ? theme : ''}`">
                <!-- Primary colors -->
                <div>
                    <h4 class="text-sm font-medium mb-2">Primary</h4>
                    <div class="flex flex-wrap gap-1">
                        <div v-for="shade in colorShades" :key="`primary-${shade}`" class="w-8 h-8 rounded"
                            :class="`bg-primary-${shade}`" :title="`primary-${shade}`"></div>
                    </div>
                </div>

                <!-- Secondary colors -->
                <div>
                    <h4 class="text-sm font-medium mb-2">Secondary</h4>
                    <div class="flex flex-wrap gap-1">
                        <div v-for="shade in colorShades" :key="`secondary-${shade}`" class="w-8 h-8 rounded"
                            :class="`bg-secondary-${shade}`" :title="`secondary-${shade}`"></div>
                    </div>
                </div>

                <!-- Accent colors -->
                <div>
                    <h4 class="text-sm font-medium mb-2">Accent</h4>
                    <div class="flex flex-wrap gap-1">
                        <div v-for="shade in colorShades" :key="`accent-${shade}`" class="w-8 h-8 rounded"
                            :class="`bg-accent-${shade}`" :title="`accent-${shade}`"></div>
                    </div>
                </div>

                <!-- Status colors -->
                <div>
                    <h4 class="text-sm font-medium mb-2">Status</h4>
                    <div class="grid grid-cols-4 gap-1">
                        <div class="bg-success-500 w-8 h-8 rounded" title="success"></div>
                        <div class="bg-danger-500 w-8 h-8 rounded" title="danger"></div>
                        <div class="bg-warning-500 w-8 h-8 rounded" title="warning"></div>
                        <div class="bg-info-500 w-8 h-8 rounded" title="info"></div>
                    </div>
                </div>

                <!-- Text example -->
                <div class="space-y-2">
                    <h4 class="text-sm font-medium mb-2">Text</h4>
                    <p class="text-tBase-100">This is primary text</p>
                    <p class="text-tBase-500">This is secondary text</p>
                    <p class="text-tBase-700">This is tertiary text</p>
                </div>

                <!-- Button examples -->
                <div class="space-y-2">
                    <h4 class="text-sm font-medium mb-2">Buttons</h4>
                    <div class="flex flex-wrap gap-2">
                        <button class="px-4 py-2 bg-primary-500 text-white rounded">Primary</button>
                        <button class="px-4 py-2 bg-secondary-500 text-white rounded">Secondary</button>
                        <button class="px-4 py-2 bg-accent-500 text-white rounded">Accent</button>
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