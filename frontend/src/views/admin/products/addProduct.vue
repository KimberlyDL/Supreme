<!-- frontend\src\views\admin\products\AddProductt.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
        <div class="mb-6 flex justify-between items-center">
            <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon class="w-5 h-5 mr-2" />
                Back to Products
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>

        <ProductForm :categories="categories" @submit="handleSubmit" @cancel="goBack" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import ProductForm from '@components/admin/addProductForm.vue';
import { ArrowLeftIcon } from 'lucide-vue-next';

const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();

const categories = ref([]);

const goBack = () => {
    router.push('/administrator/products');
};

const handleSubmit = async (formData) => {
    try {
        console.log('Form Data to be sent to the store', formData);
        await productStore.addProduct(formData);
        router.push('/administrator/products');
    } catch (error) {
        console.error('Error adding product:', error);
        // Handle error (e.g., show error message to user)
    }
};

onMounted(async () => {
    try {
        await categoryStore.fetchCategoryNamesRealtime();
        categories.value = categoryStore.fetchedCategories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
});

onUnmounted(() => {
    categoryStore.stopListeningCategoryNames();
});
</script>