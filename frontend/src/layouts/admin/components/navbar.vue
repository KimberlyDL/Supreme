<template>
  <nav class="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
    <div class="flex flex-wrap justify-between items-center">
      <div class="flex items-center justify-start">
        <button @click="$emit('toggle-sidebar')" type="button"
          class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-label="Toggle sidebar">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <a href="#" class="flex items-center justify-between ml-4">
          <img src="https://flowbite.com/docs/images/logo.svg" class="mr-3 h-8" alt="Flowbite Logo" />
          <span class="self-center text-2xl font-semibold whitespace-nowrap">Flowbite</span>
        </a>
      </div>

      <!-- Profile Section -->
      <div class="flex items-center ml-3 relative">
        <button @click.stop="toggleProfileMenu" type="button"
          class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          id="user-menu-button-2" aria-expanded="false">
          <span class="sr-only">Open user menu</span>
          <img class="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            alt="user photo">
        </button>

        <!-- Dropdown Menu -->
        <div v-if="isProfileMenuOpen"
          class="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-0 top-full mt-2"
          id="dropdown-2">
          <div class="px-4 py-3" role="none">
            <p class="text-sm text-gray-900 dark:text-white" role="none">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">{{ user.email }}</p>
          </div>
          <ul class="py-1" role="none">
            <li>
              <router-link :to="{ name: 'AdminProfile' }"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600
                dark:hover:text-white"
                role="menuitem">
                Profile
              </router-link>
            </li>
            <li>
              <button @click.stop="signOut"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem">Sign out</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'  // Import Pinia auth store

const authStore = useAuthStore()  // Use the store instance
const { user } = authStore  // Destructure the user object from the store

const isProfileMenuOpen = ref(false)

const toggleProfileMenu = () => {
  isProfileMenuOpen.value = !isProfileMenuOpen.value
}

// Close the profile menu when clicking outside
const closeProfileMenu = (event) => {
  if (!event.target.closest('#user-menu-button-2')) {
    isProfileMenuOpen.value = false
  }
}

// Call signOut from Pinia store when user clicks sign out button
const signOut = async () => {
  console.log('Sign out button clicked')  // Add debug log

  try {
    await authStore.logout()  // Call logout method from Pinia store
    console.log('Signed out successfully')
  } catch (error) {
    console.error('Error during sign out:', error)
  }
}

// Add event listener when component is mounted
onMounted(() => {
  document.addEventListener('click', closeProfileMenu)
})

// Remove event listener when component is unmounted
onUnmounted(() => {
  document.removeEventListener('click', closeProfileMenu)
})
</script>

<style scoped>
/* Optional: Ensure dropdown opens smoothly */
#dropdown-2 {
  transition: opacity 0.2s ease;
}
</style>
