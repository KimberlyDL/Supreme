<template>
    <div class="flex h-screen bg-gray-100">
      <AdminSidebar />
      <div class="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </template>
  
  <script setup>
  import AdminSidebar from '@/components/AdminSidebar.vue'
  import AdminHeader from '@/components/AdminHeader.vue'
  </script>