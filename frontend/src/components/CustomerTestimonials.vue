<template>
    <section class="bg-gray-100 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">What Our Customers Say</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div v-for="testimonial in testimonials" :key="testimonial.id" class="bg-white rounded-lg shadow-md p-6">
            <p class="text-gray-600 mb-4">"{{ testimonial.quote }}"</p>
            <div class="flex items-center">
              <img :src="testimonial.avatar" :alt="testimonial.name" class="w-12 h-12 rounded-full mr-4">
              <div>
                <h4 class="font-semibold">{{ testimonial.name }}</h4>
                <p class="text-gray-600">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const testimonials = ref([
    { id: 1, quote: 'Supreme Agrivet has revolutionized how we manage our poultry farm. The inventory system is a game-changer!', name: 'John Doe', role: 'Poultry Farmer', avatar: '/placeholder.svg?height=100&width=100' },
    { id: 2, quote: 'The educational resources provided have helped us improve our farming practices significantly.', name: 'Jane Smith', role: 'Agricultural Consultant', avatar: '/placeholder.svg?height=100&width=100' },
  ])
  </script>