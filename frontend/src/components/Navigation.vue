<template>
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex flex-wrap justify-between items-center">
          <div class="flex items-center space-x-4 md:space-x-8">
            <router-link to="/" class="text-2xl font-bold text-green-600">Supreme Agrivet</router-link>
            <button class="md:hidden text-gray-600 hover:text-green-600" @click="toggleMobileMenu">
              <MenuIcon class="h-6 w-6" />
            </button>
          </div>
          <div class="hidden md:flex md:items-center md:space-x-4 w-full md:w-auto" :class="{ 'block': mobileMenuOpen }">
            <router-link to="/" class="text-gray-600 hover:text-green-600 flex items-center"><HomeIcon class="h-5 w-5 mr-1" /> Home</router-link>
            <div class="relative group">
              <router-link to="/catalog" class="text-gray-600 hover:text-green-600 flex items-center">
                <ShoppingCartIcon class="h-5 w-5 mr-1" />
                Product Catalog
                <ChevronDownIcon class="h-4 w-4 ml-1" />
              </router-link>
              <div class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Feed</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Chicks</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Medicines</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Equipment</a>
                </div>
              </div>
            </div>
            <router-link to="/orders-tracking" class="text-gray-600 hover:text-green-600 flex items-center"><TruckIcon class="h-5 w-5 mr-1" /> Orders & Tracking</router-link>
            <router-link to="/promotions" class="text-gray-600 hover:text-green-600 flex items-center"><TagIcon class="h-5 w-5 mr-1" /> Promotions</router-link>
            <router-link to="/support-tutorials" class="text-gray-600 hover:text-green-600 flex items-center"><BookOpenIcon class="h-5 w-5 mr-1" /> Support & Tutorials</router-link>
          </div>
          <div class="flex items-center space-x-4">
            <button class="text-gray-600 hover:text-green-600">
              <BellIcon class="h-6 w-6" />
            </button>
            <button class="text-gray-600 hover:text-green-600">
              <UserIcon class="h-6 w-6" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { ChevronDownIcon, BellIcon, UserIcon, HomeIcon, ShoppingCartIcon, TagIcon, BookOpenIcon, TruckIcon, MenuIcon } from 'lucide-vue-next'
  
  const mobileMenuOpen = ref(false)
  
  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }
  </script>