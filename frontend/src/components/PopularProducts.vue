<template>
    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-8 text-center">Popular Products & New Arrivals</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="product in popularProducts" :key="product.id" class="bg-white rounded-lg shadow-md p-6">
            <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover rounded-md mb-4">
            <h3 class="text-xl font-semibold mb-2">{{ product.name }}</h3>
            <p class="text-gray-600 mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-green-600 font-bold">{{ product.price }}</span>
              <span :class="{'text-green-600': product.inStock, 'text-red-600': !product.inStock}">
                {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const popularProducts = ref([
    { id: 1, name: 'Premium Chicken Feed', description: 'High-quality feed for optimal growth', price: '$29.99', inStock: true, image: '/placeholder.svg?height=200&width=300' },
    { id: 2, name: 'Day-Old Chicks', description: 'Healthy chicks for your farm', price: '$2.50 each', inStock: true, image: '/placeholder.svg?height=200&width=300' },
    { id: 3, name: 'Poultry Vaccine Kit', description: 'Essential vaccines for disease prevention', price: '$49.99', inStock: false, image: '/placeholder.svg?height=200&width=300' },
  ])
  </script>