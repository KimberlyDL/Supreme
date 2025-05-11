<!-- frontend\src\components\ThemeSwitcher.vue -->
<!-- frontend\src\components\ThemeSwitcher.vue -->
<template>
    <div class="theme-switcher flex items-center"
        :class="{ 'justify-center space-x-2': compact, 'space-x-4': !compact }">
        <!-- Dark mode toggle -->
        <button @click="toggleDarkMode" class="p-2 rounded-full hover:bg-bgPrimary-200 transition-colors"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
            <Sun v-if="isDarkMode" :size="compact ? 18 : 20" />
            <Moon v-else :size="compact ? 18 : 20" />
        </button>

        <!-- Theme selector using Flowbite dropdown -->
        <div class="relative" v-if="!compact">
            <!-- Dropdown button -->
            <button id="theme-dropdown-button" data-dropdown-toggle="theme-dropdown-menu" type="button"
                class="flex items-center space-x-2 p-2 rounded-md hover:bg-bgPrimary-200 transition-colors">
                <span>{{ formatThemeName(currentTheme) }}</span>
                <ChevronDown class="w-4 h-4" />
            </button>

            <!-- Dropdown menu -->
            <div id="theme-dropdown-menu"
                class="hidden z-10 w-48 bg-bgPrimary-0 rounded-lg shadow-lg border border-bgPrimary-200"
                data-popper-placement="top-end">
                <ul class="py-2 text-sm text-tBase-100" aria-labelledby="theme-dropdown-button">
                    <li v-for="theme in availableThemes" :key="theme">
                        <a href="#" @click.prevent="selectTheme(theme)"
                            class="block px-4 py-2 hover:bg-bgPrimary-100 transition-colors"
                            :class="{ 'bg-bgPrimary-100': theme === currentTheme }">
                            {{ formatThemeName(theme) }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Compact theme selector -->
        <div class="relative" v-else>
            <button id="compact-theme-dropdown-button" data-dropdown-toggle="compact-theme-dropdown-menu" type="button"
                class="p-2 rounded-full hover:bg-bgPrimary-200 transition-colors"
                :aria-label="'Change theme, current: ' + formatThemeName(currentTheme)">
                <Palette :size="18" />
            </button>

            <!-- Compact dropdown menu -->
            <div id="compact-theme-dropdown-menu"
                class="hidden z-10 w-40 bg-bgPrimary-0 rounded-lg shadow-lg border border-bgPrimary-200"
                data-popper-placement="left">
                <ul class="py-2 text-sm text-tBase-100" aria-labelledby="compact-theme-dropdown-button">
                    <li v-for="theme in availableThemes" :key="theme">
                        <a href="#" @click.prevent="selectTheme(theme)"
                            class="block px-4 py-2 hover:bg-bgPrimary-100 transition-colors"
                            :class="{ 'bg-bgPrimary-100': theme === currentTheme }">
                            {{ formatThemeName(theme) }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useThemeStore } from '@/stores/themeStore';
import { Sun, Moon, ChevronDown, Palette } from 'lucide-vue-next';
import { Dropdown } from 'flowbite';

const props = defineProps({
    compact: {
        type: Boolean,
        default: false
    }
});

const themeStore = useThemeStore();

// Get values from store
const currentTheme = computed(() => themeStore.currentTheme);
const isDarkMode = computed(() => themeStore.isDarkMode);
const availableThemes = computed(() => themeStore.availableThemes);

// Methods
const toggleDarkMode = () => {
    themeStore.toggleDarkMode();
};

const selectTheme = (theme) => {
    themeStore.setTheme(theme);

    // Close the dropdown after selection
    const dropdownId = props.compact ? 'compact-theme-dropdown-menu' : 'theme-dropdown-menu';
    const dropdownElement = document.getElementById(dropdownId);
    const dropdown = Dropdown.getInstance(dropdownElement);
    if (dropdown) {
        dropdown.hide();
    }
};

const formatThemeName = (theme) => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
};

// Initialize Flowbite dropdowns with custom options
onMounted(() => {
    initializeDropdown();
});

// Re-initialize dropdown when compact mode changes
watch(() => props.compact, () => {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
        initializeDropdown();
    }, 100);
});

const initializeDropdown = () => {
    // Initialize standard dropdown
    if (!props.compact) {
        const targetElement = document.getElementById('theme-dropdown-menu');
        const triggerElement = document.getElementById('theme-dropdown-button');

        if (targetElement && triggerElement) {
            const options = {
                placement: 'top-end',
                triggerType: 'click',
                offsetSkidding: 0,
                offsetDistance: 10,
                delay: 300
            };

            new Dropdown(targetElement, triggerElement, options);
        }
    }
    // Initialize compact dropdown
    else {
        const compactTargetElement = document.getElementById('compact-theme-dropdown-menu');
        const compactTriggerElement = document.getElementById('compact-theme-dropdown-button');

        if (compactTargetElement && compactTriggerElement) {
            const compactOptions = {
                placement: 'left',
                triggerType: 'click',
                offsetSkidding: 0,
                offsetDistance: 10,
                delay: 300
            };

            new Dropdown(compactTargetElement, compactTriggerElement, compactOptions);
        }
    }
};
</script>