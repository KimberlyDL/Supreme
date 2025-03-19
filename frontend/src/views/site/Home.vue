<!-- frontend\src\views\site\Home.vue -->
<template>
  <div class="landing-page">
    <!-- <Navigation :isLoggedIn="isLoggedIn" :user="user" /> -->
    <Navigation />
    <div id="sidebar" class="relative"></div>
    <HeroSection />
    <FeaturesSection />
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Navigation from '@layouts/site/Navigation.vue';
import HeroSection from '@layouts/site/HeroSection.vue';
import FeaturesSection from '@layouts/site/FeaturesSection.vue';
import Footer from '@layouts/site/Footer.vue';

const isLoggedIn = ref(false);
// const user = ref({
//   name: 'John Doe',
//   email: 'john@example.com',
//   avatar: '/placeholder.svg?height=32&width=32'
// });

// Add any necessary logic for authentication status here
</script>
