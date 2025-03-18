<!-- frontend\src\views\admin\products\EditProduct.vue -->

<template>
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6 flex justify-between items-center">
        <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Product
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>
      
      <EditProductForm 
        :productId="productId" 
        :categories="categories" 
        @submit="handleSubmit"
        @cancel="goBack"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useProductStore } from '@/stores/productStore';
  import EditProductForm from './EditProductForm.vue';
  import { ArrowLeftIcon } from 'lucide-vue-next';
  
  const route = useRoute();
  const router = useRouter();
  const productStore = useProductStore();
  
  const productId = ref(route.params.id);
  const categories = ref([]);
  
  const goBack = () => {
    // router.push(`/administrator/products/${productId.value}`);
    router.go(-1)
  };
  
  const handleSubmit = async (formData) => {
    try {

      console.log('Edit form Data to be send to the store', formData);

      await productStore.updateProduct(productId.value, formData);
      router.push(`/administrator/products/${productId.value}`);
      
    } catch (error) {
      console.error('Error updating product:', error);
      // Handle error (e.g., show error message to user)
    }
  };
  
  onMounted(() => {
  });
  
  onUnmounted(() => {
  });
  </script>
  
  