<template>
    <aside :class="[
      'bg-gray-800 text-white flex-shrink-0 transition-all duration-300 ease-in-out',
      isSidebarOpen ? 'w-64' : 'w-20'
    ]">
      <div class="p-4 flex items-center justify-between">
        <h1 :class="['font-semibold transition-all duration-300', isSidebarOpen ? 'text-2xl' : 'text-lg']">
          {{ isSidebarOpen ? 'Admin Panel' : 'AP' }}
        </h1>
        <button @click="toggleSidebar" class="text-white focus:outline-none">
          <ChevronLeftIcon v-if="isSidebarOpen" class="h-6 w-6" />
          <ChevronRightIcon v-else class="h-6 w-6" />
        </button>
      </div>
      <nav class="mt-8">
        <router-link 
          v-for="route in routes" 
          :key="route.path" 
          :to="route.path" 
          class="block py-2 px-4 hover:bg-gray-700 cursor-pointer" 
          :class="{ 'bg-gray-700': $route.path === route.path }"
        >
          <component :is="route.icon" class="inline-block mr-2" :class="{ 'mr-0': !isSidebarOpen }" />
          <span v-if="isSidebarOpen">{{ route.name }}</span>
        </router-link>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { ChevronLeftIcon, ChevronRightIcon, HomeIcon, UsersIcon, PackageIcon } from 'lucide-vue-next'
  
  const route = useRoute()
  const isSidebarOpen = ref(true)
  
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }
  
  const routes = [
    { path: '/admin', name: 'Dashboard', icon: HomeIcon },
    { path: '/admin/users', name: 'Users', icon: UsersIcon },
    { path: '/admin/products', name: 'Products', icon: PackageIcon },
  ]
  </script>