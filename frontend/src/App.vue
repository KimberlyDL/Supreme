<!-- frontend\src\App.vue -->
<!-- src/App.vue -->
<template>
    <div id="toast-root"></div>
    <div id="modal" class="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full max-h-full"></div>
    <div id="dropdown" class="fixed top-0 left-0 w-full h-0"></div>
    <div id="app" class="min-h-screen bg-bgPrimary-0 text-tBase-100 transition-colors duration-200">
        <template v-if="isLoading || authStore.isInitializing">
            <div class="loading-overlay bg-bgPrimary-0">
                <svg class="loading-icon text-primary-500" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                </svg>
                <span class="sr-only">Loading...</span>
            </div>
        </template>
        <template v-else>
            <ModalWrapper />
            <router-view />
            <ToastContainer />
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { onMessageListener } from '@/services/firebase';
import ModalWrapper from "@/components/modal/ModalWrapper.vue";
import ToastContainer from '@/components/ui/ToastContainer.vue'

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();
const notification = ref(null);
const toastManager = ref(null);
const isLoading = ref(true);

// Function to apply theme to document root
const applyThemeToDocument = () => {
    console.log('Applying theme:', themeStore.currentTheme, 'Dark mode:', themeStore.isDarkMode);

    // First, remove any existing theme classes
    document.documentElement.classList.forEach(className => {
        if (className.startsWith('theme-')) {
            document.documentElement.classList.remove(className);
        }
    });

    // Apply dark mode if enabled
    if (themeStore.isDarkMode) {
        document.documentElement.classList.add('theme-dark');
    }

    // Apply theme if not default light theme
    if (themeStore.currentTheme !== 'light') {
        document.documentElement.classList.add(`theme-${themeStore.currentTheme}`);
    }
};

// Watch for theme changes
watch(() => themeStore.currentTheme, applyThemeToDocument);
watch(() => themeStore.isDarkMode, applyThemeToDocument);

const initializeApp = async () => {
    try {
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error during app initialization:', error);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await initializeApp();

    // Apply theme on initial mount
    applyThemeToDocument();

    try {
        const payload = await onMessageListener();
        console.log('Foreground notification received:', payload);

        notification.value = {
            title: payload.notification.title,
            body: payload.notification.body,
        };
    } catch (err) {
        console.error('Error receiving foreground notification:', err);
    }
});
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-icon {
    width: 100px;
    height: 100px;
    animation: fade-zoom 1.5s ease-in-out infinite alternate;
    fill: currentColor;
}

@keyframes fade-zoom {
    0% {
        opacity: 0.2;
        transform: scale(0.8);
    }

    100% {
        opacity: 1;
        transform: scale(1.1);
    }
}
</style>