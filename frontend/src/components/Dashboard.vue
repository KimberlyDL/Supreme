<template>
    <div class="mt-4">
      <div class="flex flex-wrap -mx-6">
        <div class="w-full px-6 sm:w-1/2 xl:w-1/3">
          <div class="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
            <div class="p-3 rounded-full bg-indigo-600 bg-opacity-75">
              <UsersIcon class="h-8 w-8 text-white" />
            </div>
            <div class="mx-5">
              <h4 class="text-2xl font-semibold text-gray-700">8,282</h4>
              <div class="text-gray-500">New Users</div>
            </div>
          </div>
        </div>
        <div class="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 sm:mt-0">
          <div class="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
            <div class="p-3 rounded-full bg-orange-600 bg-opacity-75">
              <ShoppingCartIcon class="h-8 w-8 text-white" />
            </div>
            <div class="mx-5">
              <h4 class="text-2xl font-semibold text-gray-700">200,521</h4>
              <div class="text-gray-500">Total Orders</div>
            </div>
          </div>
        </div>
        <div class="w-full mt-6 px-6 sm:w-1/2 xl:w-1/3 xl:mt-0">
          <div class="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
            <div class="p-3 rounded-full bg-pink-600 bg-opacity-75">
              <DollarSignIcon class="h-8 w-8 text-white" />
            </div>
            <div class="mx-5">
              <h4 class="text-2xl font-semibold text-gray-700">$215,542</h4>
              <div class="text-gray-500">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { UsersIcon, ShoppingCartIcon, DollarSignIcon } from 'lucide-vue-next'
  </script>