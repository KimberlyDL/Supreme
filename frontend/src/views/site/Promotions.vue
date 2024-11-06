<template>
    <div>
      <Navigation />
      <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-4">Promotions</h1>
        <p>This is where current promotions and special offers will be displayed.</p>
      </div>
      <Footer />
    </div>
  </template>
  
  <script setup>
  import Navigation from '@/components/Navigation.vue';
  import Footer from '@/components/Footer.vue'
  </script>