<template>
    <div class="flex h-screen bg-gray-100">
        <!-- Sidebar -->
        <Sidebar :is-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

        <!-- Main Content -->
        <div class="flex flex-col flex-1 overflow-hidden">
            <!-- Navbar -->
            <Navbar @toggle-sidebar="toggleSidebar" />

            <!-- Page Content -->
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                <slot></slot>
            </main>

            <!-- Footer -->
            <Footer />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from './components.sidebar.vue'
import Navbar from './components.navbar.vue'
import Footer from './components.footer.vue'

const isSidebarOpen = ref(true)

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}
</script>