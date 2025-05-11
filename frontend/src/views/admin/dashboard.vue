<!-- frontend\src\views\admin\dashboard.vue -->
<!-- <template>
  <div class="landing-page">
    <h1>Welcome to Our Website</h1>
    <p>This is the landing page for all users.</p> -->
<!-- Navigation links to other pages -->
<!-- <router-link to="/login">Go to Login</router-link>
    <router-link to="/dashboard">Go to Dashboard</router-link>
  </div>
</template> -->

<!-- <script setup>
</script>

<style scoped>
.landing-page {
  text-align: center;
  margin-top: 50px;
}
</style> -->



<template>
  <div class="landing-page">
    <h1 class="text-3xl font-bold text-tBase-100 mb-4">Welcome to Your Dashboard</h1>
    <p class="text-tBase-400 mb-6">This is the admin dashboard with our new theming system.</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-bgPrimary-0 p-6 rounded-lg shadow-md border border-bgPrimary-200">
        <h2 class="text-xl font-semibold mb-2 text-primary-600">Current Theme</h2>
        <p class="text-tBase-400">You're currently using the <span class="font-medium text-primary-500">{{
          formatThemeName(currentTheme) }}</span> theme in <span class="font-medium">{{ isDarkMode ? 'Dark' : 'Light'
            }}</span> mode.</p>
        <div class="mt-4">
          <button @click="toggleDarkMode"
            class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors">
            Toggle {{ isDarkMode ? 'Light' : 'Dark' }} Mode
          </button>
        </div>
      </div>

      <div class="bg-bgPrimary-0 p-6 rounded-lg shadow-md border border-bgPrimary-200">
        <h2 class="text-xl font-semibold mb-2 text-secondary-600">Theme Settings</h2>
        <p class="text-tBase-400 mb-4">Customize your dashboard appearance.</p>
        <router-link to="/theme-settings"
          class="px-4 py-2 bg-secondary-500 text-white rounded-md hover:bg-secondary-600 transition-colors inline-block">
          Theme Settings
        </router-link>
      </div>

      <div class="bg-bgPrimary-0 p-6 rounded-lg shadow-md border border-bgPrimary-200">
        <h2 class="text-xl font-semibold mb-2 text-accent-600">Quick Actions</h2>
        <p class="text-tBase-400 mb-4">Access frequently used features.</p>
        <div class="flex space-x-2">
          <router-link :to="{ name: 'AdminDashboardEmployees' }"
            class="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors">
            Employees
          </router-link>
          <router-link :to="{ name: 'AdminDashboardProducts' }"
            class="px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors">
            Products
          </router-link>
        </div>
      </div>
    </div>

    <div class="bg-bgPrimary-0 p-6 rounded-lg shadow-md border border-bgPrimary-200">
      <h2 class="text-2xl font-semibold mb-4 text-tBase-100">Theme Preview</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="color in ['primary', 'secondary', 'accent', 'success', 'danger', 'warning', 'info']" :key="color"
          class="space-y-2">
          <h3 class="font-medium text-tBase-100 capitalize">{{ color }}</h3>
          <div class="flex flex-wrap gap-1">
            <div v-for="shade in [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]" :key="`${color}-${shade}`"
              class="w-8 h-8 rounded" :style="{ backgroundColor: `var(--color-${color}-${shade})` }"
              :title="`${color}-${shade}`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

const themeStore = useThemeStore();
const currentTheme = computed(() => themeStore.currentTheme);
const isDarkMode = computed(() => themeStore.isDarkMode);

const toggleDarkMode = () => {
  themeStore.toggleDarkMode();
};

const formatThemeName = (theme) => {
  return theme.charAt(0).toUpperCase() + theme.slice(1);
};
</script>

<style scoped>
.landing-page {
  text-align: left;
}
</style>