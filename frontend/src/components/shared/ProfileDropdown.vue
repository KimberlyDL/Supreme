<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { UserIcon, MailIcon, ListCheckIcon } from 'lucide-vue-next';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push({ name: 'Home' });
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<template>
  <div class="relative">
    <button type="button" class="flex items-center text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
      <span class="sr-only">Open user menu</span>
      <img class="w-8 h-8 rounded-full" :src="authStore.user.avatarUrl || '/placeholder.svg?height=32&width=32'" :alt="authStore.user.firstName">
    </button>
    <!-- User dropdown menu -->
    <div class="absolute right-0 z-50 hidden mt-2 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown">
      <div class="px-4 py-3">
        <span class="block text-sm text-gray-900 dark:text-white">{{ authStore.user.firstName }} {{ authStore.user.lastName }}</span>
        <span class="block text-sm text-gray-500 truncate dark:text-gray-400">{{ authStore.user.email }}</span>
      </div>
      <ul class="py-2" aria-labelledby="user-menu-button">
        <li>
          <router-link :to="{ name: 'Home' }" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
            <UserIcon class="inline-block w-5 h-5 mr-2" />
            My Profile
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'Home' }" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
            <MailIcon class="inline-block w-5 h-5 mr-2" />
            My Account
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'Home' }" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
            <ListCheckIcon class="inline-block w-5 h-5 mr-2" />
            My Tasks
          </router-link>
        </li>
        <li>
          <a @click.prevent="handleLogout" href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
            Sign out
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>