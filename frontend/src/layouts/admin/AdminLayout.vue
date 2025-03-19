<!-- frontend\src\layouts\admin\AdminLayout.vue -->
<template>
  <div class="flex h-screen bg-slate-200">
    <!-- Sidebar -->
    <Sidebar :is-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

    <!-- Main Content -->
    <div class="flex flex-col flex-1 overflow-hidden transition-all duration-300 ease-in-out"
      :class="{ 'ml-0 md:ml-64': isSidebarOpen, 'ml-0': !isSidebarOpen }">
      <!-- Navbar -->
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-6 mt-16">
        <router-view /> <!-- This is crucial for displaying child components -->
      </main>

      <!-- Footer -->
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@layouts/admin/components/sidebar.vue'
import Navbar from '@layouts/admin/components/navbar.vue'
import Footer from '@layouts/admin/components/footer.vue'

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}
</script>