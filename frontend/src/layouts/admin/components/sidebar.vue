<!-- frontend\src\layouts\admin\components\sidebar.vue -->
<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-20 flex flex-col w-64 transition-all duration-300 ease-in-out bg-white border-r border-gray-200',
    { '-translate-x-full': !isOpen, 'translate-x-0': isOpen },
  ]">
    <div class="flex items-center justify-between p-4 pt-10">
      <button @click="$emit('toggle-sidebar')" type="button" </button>
    </div>
    <div class="flex flex-col flex-1 overflow-y-auto">
      <nav class="flex-1 px-3 py-4 space-y-1">
        <router-link :to="{ name: 'AdminDashboard' }"
          class="flex items-center p-2 text-base font-inter font-regular text-gray-900 rounded-lg hover:bg-gray-100">
          <LayoutDashboard :stroke-width=1 class="hover:text-gray-600" />
          <span class="ml-3">Dashboard</span>
        </router-link>

        <router-link :to="{ name: 'AdminDashboardBranches' }"
          class="flex items-center p-2 text-base font-inter font-regular text-gray-900 rounded-lg hover:bg-gray-100">
          <Store :stroke-width=1 class="hover:text-gray-600" />
          <span class="ml-3">Branches</span>
        </router-link>

        <router-link :to="{ name: 'AdminDashboardEmployees' }"
          class="flex items-center p-2 text-base font-inter font-regular text-gray-900 rounded-lg hover:bg-gray-100">
          <UsersRound  :stroke-width=1 class="hover:text-gray-600" />
          <span class="ml-3">Employees</span>
        </router-link>

        <!-- <router-link :to="{ name: 'AdminDashboardUser' }"
          class="flex items-center p-2 text-base font-inter font-regular text-gray-900 rounded-lg hover:bg-gray-100">
          <Users  :stroke-width=1 class="hover:text-gray-600" />
          <span class="ml-3">Users</span>
        </router-link> -->

        <!-- <router-link :to="{ name: 'AdminDashboardEmployeeCreate' }"
          class="flex items-center p-2 text-base font-inter font-regular text-gray-900 rounded-lg hover:bg-gray-100">
          <svg class="w-6 h-6 text-gray-500 transition duration-75" fill="currentColor" viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z">
            </path>
          </svg>
          <span class="ml-3">Create Employee</span>
        </router-link> -->

        <!-- Product Management Dropdown -->
        <div class="relative">
          <button @click="toggleProductDropdown"
            class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100"
            :aria-expanded="isProductDropdownOpen">
            <ShoppingBasket :stroke-width=1 class="hover:text-gray-600" />
            <span class="flex-1 ml-3 text-left whitespace-nowrap">Products</span>
          </button>
          <ul v-show="isProductDropdownOpen" class="py-2 space-y-2">
            <li>
              <router-link :to="{ name: 'AdminDashboardProducts' }"
                class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100">
                Products
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'AdminDashboardProductManagement' }"
                class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100">
                Inventory
              </router-link>
            </li>
            <li>
              <router-link :to="{ name: 'AdminDashboardProductManagement' }"
                class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg pl-11 group hover:bg-gray-100">
                Product Categories
              </router-link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { LayoutDashboard, Store, UsersRound, Users, ShoppingBasket} from 'lucide-vue-next';

defineProps({
  isOpen: {
    type: Boolean,
    default: true,
  },
});

defineEmits(['toggle-sidebar']);

const isProductDropdownOpen = ref(false);

const toggleProductDropdown = () => {
  isProductDropdownOpen.value = !isProductDropdownOpen.value;
};
</script>