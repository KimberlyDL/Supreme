<!-- frontend\src\layouts\site\Navigation.vue -->
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { MenuIcon, XIcon } from 'lucide-vue-next';
import LogoNavBar from '@components/shared/LogoNavbar.vue';
import ProfileDropdown from '@components/shared/ProfileDropdown.vue';
import NotificationDropdown from '@components/shared/NotificationDropdown.vue';

const authStore = useAuthStore();
const sidebarOpen = ref(false);
const teleportTarget = ref(null);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;

  if (sidebarOpen.value) {
    document.body.classList.add('no-scroll');
  } else {
    document.body.classList.remove('no-scroll');
  }
};

const closeSidebar = () => {
  sidebarOpen.value = false;

  document.body.classList.remove('no-scroll');
};

onMounted(() => {
  nextTick(() => {
    teleportTarget.value = document.getElementById('sidebar');
  });
  window.addEventListener('resize', closeSidebar);
});

onUnmounted(() => {
  window.removeEventListener('resize', closeSidebar);
});
</script>

<template>
  <div class="navigation-wrapper">
    <nav class="bg-white border-gray-200 dark:bg-gray-900 relative z-50">
      <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <LogoNavBar />
        <div class="flex items-center md:order-2">
          <template v-if="authStore.isLoggedIn">
            <NotificationDropdown class="mr-3" />
            <ProfileDropdown />
          </template>
          <template v-else>
            <router-link :to="{ name: 'Login' }" class="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 mr-1 md:mr-2 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800">Login</router-link>
            <router-link :to="{ name: 'Register' }" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:px-5 md:py-2.5 mr-1 md:mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Sign up</router-link>
          </template>
          <button @click="toggleSidebar" type="button" class="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="mobile-menu-2" aria-expanded="false">
            <span class="sr-only">Open main menu</span>
            <MenuIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="hidden w-full md:block md:w-auto md:order-1">
          <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
            <li>
              <router-link :to="{ name: 'Home' }" class="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Home</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'About' }" class="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">About</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'Services' }" class="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Services</router-link>
            </li>
            <li>
              <router-link :to="{ name: 'Contact' }" class="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">Contact</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <Teleport v-if="teleportTarget" to="#sidebar">
      <div @click="closeSidebar" class="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out md:hidden" :class="{ 'opacity-100': sidebarOpen, 'opacity-0 pointer-events-none': !sidebarOpen }"></div>
      <div class="fixed top-0 left-0 z-40 h-screen w-64 overflow-y-auto transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 md:hidden" :class="{ 'translate-x-0': sidebarOpen, '-translate-x-full': !sidebarOpen }">
        <div class="p-4 pt-20"> <!-- Added padding-top to push content below the header -->
          <h5 class=" mt-2 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">Menu</h5>
          <!-- <button @click="closeSidebar" type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 absolute top-2.5 right-2.5 inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white">
            <XIcon class="w-5 h-5" />
            <span class="sr-only">Close menu</span>
          </button> -->
          <div class="py-4 overflow-y-auto">
            <ul class="space-y-2 font-medium">
              <li>
                <router-link :to="{ name: 'Home' }" @click="closeSidebar" class="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span class="ml-3">Home</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'About' }" @click="closeSidebar" class="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span class="ml-3">About</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Services' }" @click="closeSidebar" class="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span class="ml-3">Services</span>
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Contact' }" @click="closeSidebar" class="flex items-center py-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                  <span class="ml-3">Contact</span>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.navigation-wrapper {
  position: relative;
}

.no-scroll {
  overflow: hidden;
}
</style>