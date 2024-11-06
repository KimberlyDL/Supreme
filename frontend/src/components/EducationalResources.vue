<template>
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">Educational Resources</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="resource in educationalResources" :key="resource.id" class="bg-white rounded-lg shadow-md overflow-hidden">
            <img :src="resource.thumbnail" :alt="resource.title" class="w-full h-48 object-cover">
            <div class="p-6">
              <h3 class="text-xl font-semibold mb-2">{{ resource.title }}</h3>
              <p class="text-gray-600 mb-4">{{ resource.description }}</p>
              <button class="text-green-600 font-semibold hover:text-green-700">Watch Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const educationalResources = ref([
    { id: 1, title: 'Proper Chick Care', description: 'Learn the  essentials of caring for day-old chicks', thumbnail: '/placeholder.svg?height=200&width=300' },
    { id: 2, title: 'Effective Vaccination Techniques', description: 'Master the art of vaccinating your poultry', thumbnail: '/placeholder.svg?height=200&width=300' },
    { id: 3, title: 'Optimizing Feed Efficiency', description: 'Strategies to improve feed conversion rates', thumbnail: '/placeholder.svg?height=200&width=300' },
  ])
  </script>