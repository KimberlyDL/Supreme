<!-- frontend\src\layouts\admin\components\navbar.vue -->
<template>
    <nav class="bg-bgPrimary-0 border-b border-bgPrimary-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div class="flex flex-wrap justify-between items-center">
            <div class="flex items-center justify-start">
                <button @click="$emit('toggle-sidebar')" type="button"
                    class="inline-flex items-center p-2 text-sm text-tBase-100 hover:text-tBase-300"
                    aria-label="Toggle sidebar">
                    <EllipsisVertical class="text-primary-500" />
                </button>
                <LogoNavBar class="w-6 h-6" />
            </div>

            <!-- Profile Section -->
            <div class="flex items-center ml-3 relative">
                <button id="profileButton" type="button"
                    class="flex items-center justify-center p-2 relative text-tBase-100 bg-primary-100 hover:bg-primary-200 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-full"
                    aria-expanded="false">
                    <span class="sr-only">Open user menu</span>
                    <img class="w-8 h-8 rounded-full"
                        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo">
                </button>

                <div id="profileDropdown"
                    class="z-50 my-4 text-base list-none bg-bgPrimary-0 divide-y divide-bgPrimary-200 rounded shadow absolute right-0 top-full mt-2">
                    <div class="px-3 py-2 text-sm">
                        <p class="text-sm text-tBase-100" role="none">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-sm font-medium text-tBase-400 truncate" role="none">{{ user.email }}</p>
                    </div>
                    <ul class="py-2 text-sm text-tBase-100" aria-labelledby="profileDropdown">
                        <li>
                            <router-link :to="{ name: 'AdminProfile' }"
                                class="block w-full px-4 py-2 text-left text-sm text-tBase-100 hover:bg-bgPrimary-100"
                                role="menuitem">
                                Profile
                            </router-link>
                        </li>
                        <li>
                            <button @click.stop="signOut"
                                class="block w-full text-left px-4 py-2 text-sm text-tBase-100 hover:bg-bgPrimary-100"
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
import { useAuthStore } from '@/stores/authStore'
import LogoNavBar from '@components/shared/LogoNavbar.vue';
import { EllipsisVertical, Plus } from 'lucide-vue-next';
import { Dropdown } from 'flowbite'

const authStore = useAuthStore()
const { user } = authStore

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
    console.log('Sign out button clicked')

    try {
        await authStore.logout()
        console.log('Signed out successfully')
    } catch (error) {
        console.error('Error during sign out:', error)
    }
}

// Add event listener when component is mounted
onMounted(() => {
    const $profileTargetEl = document.getElementById('profileDropdown')
    const $profileTriggerEl = document.getElementById('profileButton')

    // Set options with your specific configuration
    const options = {
        placement: 'bottom-end',
        triggerType: 'click',
        offsetDistance: 15,
        delay: 300,
    }

    // Create a new Dropdown instance
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