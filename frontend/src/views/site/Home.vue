<template>
    <div>
      <Navigation />
      <HeroSection />
      <PopularProducts />
      <CustomerTestimonials />
      <EducationalResources />
      <Footer />
    </div>
  </template>
  
  <script setup>
  import Navigation from '@/components/Navigation.vue';
  import HeroSection from '@/components/HeroSection.vue'
  import PopularProducts from '@/components/PopularProducts.vue'
  import CustomerTestimonials from '@/components/CustomerTestimonials.vue'
  import EducationalResources from '@/components/EducationalResources.vue'
  import Footer from '@/components/Footer.vue'
  </script>