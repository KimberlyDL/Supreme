<template>
  <div id="toast"></div>
  <div id="modal" class="fixed top-0 right-0 left-0 z-50 justify-center items-center w-full max-h-full"></div>
  <div id="dropdown" class="fixed top-0 left-0 w-full h-0"></div>
  <!-- <div id="sidebar" class="relative z-50"></div> -->
  <div id="app">
    <template v-if="isLoading || authStore.isInitializing">
      <div class="loading-overlay">
        <svg class="loading-icon" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <g>
            <g>
              <path d="M469.333,182.857c-20.197,0-36.571-16.374-36.571-36.571c0-20.197,16.374-36.571,36.571-36.571
                c20.197,0,36.571-16.374,36.571-36.571c0-26.93-21.832-48.762-48.762-48.762c-20.197,0-36.571,16.374-36.571,36.571
                c0,20.197-16.374,36.571-36.571,36.571c-20.197,0-36.571-16.374-36.571-36.571C347.429,27.29,320.139,0,286.476,0
                s-60.952,27.29-60.952,60.952c0,13.723,4.537,26.384,12.189,36.571h36.573c94.106,0,170.667,76.561,170.667,170.667v20.269
                c5.543,2.633,11.741,4.112,18.286,4.112c30.476,0,42.667-24.381,42.667-73.143C505.905,199.231,489.531,182.857,469.333,182.857z"/>
            </g>
          </g>
          <g>
            <g>
              <path d="M274.286,134.095h-85.333v231.619c0,80.791,65.495,146.286,146.286,146.286h73.143V268.19
                C408.381,194.132,348.344,134.095,274.286,134.095z M298.667,268.19h-0.002c-13.442,0-24.379-10.937-24.379-24.381
                c0.005-13.446,10.942-24.381,24.381-24.381c13.444,0,24.381,10.937,24.381,24.381C323.048,257.253,312.11,268.19,298.667,268.19z"/>
            </g>
          </g>
          <g>
            <g>
              <path d="M91.429,304.762c-47.128,0-85.333,38.205-85.333,85.333c0,47.128,38.205,85.333,85.333,85.333
                c23.884,0,45.463-9.824,60.952-25.637v-145.03H91.429z"/>
            </g>
          </g>
          <g>
            <g>
              <polygon points="6.095,134.095 152.381,280.381 152.381,134.095"/>
            </g>
          </g>
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </template>
<template v-else>
      <ModalWrapper />
      <router-view />

      <!-- <div class="container mx-auto py-8">
        <h1 class="text-2xl font-bold mb-6">Image Upload Example</h1>
        <SingleFileUpload />
        <div class="my-6"></div>
        <MultipleFileUpload />
      </div> -->

    </template>

<!-- <ToastManager ref="toastManager" />
    <div class="toast-buttons">
      <button @click="showToast" class="toast-button success">Show Toast</button>
      <button @click="showErrorToast" class="toast-button error">Show Error Toast</button>
    </div> -->
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// import ToastManager from '@/components/utils/notification/ToastManager.vue';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore'
import { onMessageListener } from '@/services/firebase';

import ModalWrapper from "@/components/modal/ModalWrapper.vue";


const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore()
const notification = ref(null);
const toastManager = ref(null);
const isLoading = ref(true);

const showToast = () => {
  if (toastManager.value) {
    toastManager.value.addToast({
      message: 'This is a success notification!',
      type: 'success',
      duration: 5000,
    });
  }
};

const showErrorToast = () => {
  if (toastManager.value) {
    toastManager.value.addToast({
      message: 'This is an error notification!',
      type: 'error',
      duration: 5000,
    });
  }
};

const initializeApp = async () => {
  try {
    // Simulate potential slow initialization
    //await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));

    // Add your actual initialization logic here
    // For example:
    // await checkAuthStatus();
    // await fetchInitialData();

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error during app initialization:', error);
    showErrorToast();
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await initializeApp();

  const theme = themeStore.currentTheme
  const isDark = themeStore.isDarkMode

  // Apply theme classes
  if (isDark) {
    document.documentElement.classList.add('theme-dark')
  }

  if (theme !== 'light') {
    document.documentElement.classList.add(`theme-${theme}`)
  }

  try {
    const payload = await onMessageListener();
    console.log('Foreground notification received:', payload);

    notification.value = {
      title: payload.notification.title,
      body: payload.notification.body,
    };

    showToast();
  } catch (err) {
    console.error('Error receiving foreground notification:', err);
    showErrorToast();
  }


});
</script>



<template>
  <div class="min-h-screen bg-bgPrimary-0 text-tBase-100 transition-colors duration-200">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-icon {
  width: 100px;
  height: 100px;
  animation: fade-zoom 1.5s ease-in-out infinite alternate;
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

.toast-buttons {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toast-button.success {
  background-color: #4CAF50;
}

.toast-button.success:hover {
  background-color: #45a049;
}

.toast-button.error {
  background-color: #f44336;
}

.toast-button.error:hover {
  background-color: #da190b;
}
</style>