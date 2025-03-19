<template>
  <nav class="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
    <div class="flex flex-wrap justify-between items-center">
      <div class="flex items-center justify-start">
        <button @click="$emit('toggle-sidebar')" type="button"
          class="inline-flex items-center p-2 text-sm text-gray-950 hover:text-gray-800" aria-label="Toggle sidebar">
          <EllipsisVertical class="hover:text-gray-600" />
        </button>
        <LogoNavBar class="w-6 h-6" />
      </div>

      <!-- Profile Section -->
      <div class="flex items-center ml-3 relative">

        <button id="profileButton" type="button"
          class="flex items-center justify-center p-2 relative text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 rounded-full hover:bg-gray-300"
          aria-expanded="false">
          <span class="sr-only">Open user menu</span>
          <img class="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
            alt="user photo">
        </button>

        <div id="profileDropdown"
          class="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-0 top-full mt-2">
          <div class="px-3 py-2 text-sm">
            <p class="text-sm text-gray-900 dark:text-white" role="none">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">{{ user.email }}</p>
          </div>
          <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="profileDropdown">
            <li>
              <router-link :to="{ name: 'AdminProfile' }" class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600
                dark:hover:text-white" role="menuitem">
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

        <!-- Dropdown Menu -->
        <!-- <div v-if="isProfileMenuOpen"
          class="z-50 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded shadow dark:bg-gray-700 dark:divide-gray-600 absolute right-0 top-full mt-2"
          id="dropdown-2">
          <div class="px-4 py-3" role="none">
            <p class="text-sm text-gray-900 dark:text-white" role="none">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="text-sm font-medium text-gray-900 truncate dark:text-gray-300" role="none">{{ user.email }}</p>
          </div>
          <ul class="py-1" role="none">
            <li>
              <router-link :to="{ name: 'AdminProfile' }" class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600
                dark:hover:text-white" role="menuitem">
                Profile
              </router-link>
            </li>
            <li>
              <button @click.stop="signOut"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                role="menuitem">Sign out</button>
            </li>
          </ul>
        </div> -->
      </div>
    </div>
  </nav>

  <!-- <div id="navBarDropdown"
    class="z-20 hidden bg-white divide-y divide-gray-100 rounded-sm shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600">
    <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="profileDropdown">
      <li>
        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
      </li>
      <li>
        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
      </li>
      <li>
        <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
      </li>
    </ul>
    <div class="py-2">
      <a href="#"
        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
        Separated link
      </a>
    </div>

  </div> -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'  // Import Pinia auth store
import LogoNavBar from '@components/shared/LogoNavbar.vue';
import { EllipsisVertical, Plus } from 'lucide-vue-next';
import { Dropdown } from 'flowbite'
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

  // const $targetEl = document.getElementById('navBarDropdown')
  // const $triggerEl = document.getElementById('navbarAddButton')

  const $profileTargetEl = document.getElementById('profileDropdown')
  const $profileTriggerEl = document.getElementById('profileButton')

  // Set options with your specific configuration
  const options = {
    placement: 'bottom-end',
    triggerType: 'click',
    offsetDistance: 15,
    delay: 300,
    // onHide: () => {
    //   console.log('dropdown has been hidden')
    // },
    // onShow: () => {
    //   console.log('dropdown has been shown')
    // }
  }

  // Create a new Dropdown instance
  // const dropdown = new Dropdown($targetEl, $triggerEl, options)
  const profileMenu = new Dropdown($profileTargetEl, $profileTriggerEl, options)

  profileMenu.hide();

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
