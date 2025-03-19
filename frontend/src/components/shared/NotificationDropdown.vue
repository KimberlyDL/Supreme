<script setup>
import { ref } from 'vue';
import { BellIcon, X } from 'lucide-vue-next';

const isOpen = ref(false);
const notifications = ref([
  { id: 1, message: 'New order received', time: '5 minutes ago' },
  { id: 2, message: 'Stock level low for Product X', time: '1 hour ago' },
  { id: 3, message: 'New user registered', time: '2 hours ago' },
  { id: 4, message: 'System update scheduled', time: '1 day ago' },
]);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const markAsRead = (id) => {
  notifications.value = notifications.value.filter(notif => notif.id !== id);
};
</script>

<template>
  <div class="relative">
    <button @click="toggleDropdown" type="button" class="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
      <span class="sr-only">View notifications</span>
      <BellIcon class="w-6 h-6" />
      <div v-if="notifications.length > 0" class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -right-2 dark:border-gray-900">
        {{ notifications.length }}
      </div>
    </button>

    <div v-if="isOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 dark:bg-gray-800">
      <div class="py-2">
        <div class="px-4 py-2 bg-gray-100 dark:bg-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
          <button @click="closeDropdown" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div v-if="notifications.length === 0" class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
          No new notifications
        </div>
        <template v-else>
          <div v-for="notif in notifications" :key="notif.id" class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ notif.message }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ notif.time }}</p>
              </div>
              <button @click="markAsRead(notif.id)" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Mark as read
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style>