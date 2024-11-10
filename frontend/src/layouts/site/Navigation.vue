<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { MenuIcon } from 'lucide-vue-next';
import LogoNavBar from '@components/shared/LogoNavbar.vue';
import ProfileDropdown from '@components/shared/ProfileDropdown.vue';
import NotificationDropdown from '@components/shared/NotificationDropdown.vue';

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<template>
  <nav class="bg-white border-gray-200 dark:bg-gray-900">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <LogoNavBar />
      <div class="flex items-center md:order-2">
        <template v-if="authStore.isLoggedIn">
          <NotificationDropdown class="mr-3" />
          <ProfileDropdown />
          <button @click="toggleMobileMenu" type="button" class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <MenuIcon class="w-6 h-6" />
          </button>
        </template>
        <template v-else>
          <router-link :to="{ name: 'Login' }" class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 mr-1 md:mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">Login</router-link>
          <router-link :to="{ name: 'Register' }" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 mr-1 md:mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Sign up</router-link>
        </template>
      </div>
      <div :class="['items-center justify-between w-full md:flex md:w-auto md:order-1', { 'hidden': !mobileMenuOpen }]" id="mobile-menu-2">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
          <li>
            <router-link :to="{ name: 'Home' }" class="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Home</router-link>
          </li>
          <!-- <li>
            <router-link :to="{ name: 'About' }" class="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">About</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Services' }" class="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Services</router-link>
          </li>
          <li>
            <router-link :to="{ name: 'Contact' }" class="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Contact</router-link>
          </li> -->
        </ul>
      </div>
    </div>
  </nav>
</template>