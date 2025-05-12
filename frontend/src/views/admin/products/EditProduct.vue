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

    <EditProductForm :productId="productId" :categories="categories" :initialProduct="product" :isEditing="true"
      @submit="handleSubmit" @cancel="goBack" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import EditProductForm from '@components/admin/editProductForm.vue';
import { ArrowLeftIcon } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();

const productId = ref(route.params.id);
const categories = ref([]);
const product = ref(null);

const goBack = () => {
  router.go(-1);
};

const handleSubmit = async (formData) => {
  try {
    console.log('Edit form Data to be sent to the store', formData);

    // Log form data entries for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // console.log('Edit form Data to be sent to the store', formData);

    await productStore.updateProduct(productId.value, formData);
    router.push(`/administrator/products/${productId.value}`);
  } catch (error) {
    console.error('Error updating product:', error);
    alert('Failed to update product: ' + error.message);
  }
};

const loadProduct = async () => {
  try {
    product.value = await productStore.getProductByIdWithPaths(productId.value);
    
    console.log("Loaded product:", product.value);
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product details');
  }
};

onMounted(async () => {
  try {
    await Promise.all([
      categoryStore.fetchCategoryNamesRealtime(),
      loadProduct()
    ]);
    categories.value = categoryStore.fetchedCategories || [];
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

onUnmounted(() => {
  categoryStore.stopListeningCategoryNames();
});
</script>