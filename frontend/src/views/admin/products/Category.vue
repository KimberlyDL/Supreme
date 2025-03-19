<!-- frontend\src\views\admin\products\Category.vue -->
<template>
    <div>
        <h1 class="text-2xl font-bold mb-4">Category Management</h1>
        
        <!-- Loading and Error States -->
        <div v-if="categoryStore.loading" class="text-center py-4">
            Loading...
            <span class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
        </div>
        
        <div v-if="categoryStore.error" class="text-center py-4 text-destructive">
            {{ categoryStore.error }}
        </div>

        <!-- Category List -->
        <div v-if="!categoryStore.loading && !categoryStore.error" class="mb-8">
            <h2 class="text-xl font-semibold mb-2">Categories</h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <li v-for="category in categoryStore.categories" :key="category.id" class="bg-white shadow rounded-lg p-4">
                    <img :src="category.imageUrl || '/placeholder.svg?height=100&width=100'" alt="Category image"
                        class="w-full h-32 object-cover rounded-md mb-2">
                    <h3 class="font-medium text-lg">{{ category.name }}</h3>
                    <p class="text-sm text-gray-600">{{ category.description }}</p>
                    <div class="mt-2 flex justify-end space-x-2">
                        <button @click="openEditCategoryModal(category)" class="p-2 text-primary hover:text-primary/90">
                            <PencilIcon class="h-5 w-5" />
                        </button>
                        <button @click="deleteCategory(category.id)" class="p-2 text-destructive hover:text-destructive/90">
                            <TrashIcon class="h-5 w-5" />
                        </button>
                    </div>
                </li>
            </ul>
            <button @click="openAddCategoryModal" class="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Add Category
            </button>
        </div>

        <!-- Modals -->
        <CategoryModal
            :isOpen="isCategoryModalOpen"
            :isEditing="isEditingCategory"
            :selectedCategory="selectedCategory"
            @close="closeCategoryModal"
            @submit="handleCategorySubmit"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCategoryStore } from '@/stores/categoryStore';
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/solid';
import CategoryModal from './CategoryModal.vue';

const categoryStore = useCategoryStore();

const isCategoryModalOpen = ref(false);
const isEditingCategory = ref(false);
const selectedCategory = ref(null);

onMounted(() => {
    categoryStore.fetchCategories();
});

const openAddCategoryModal = () => {
    isEditingCategory.value = false;
    selectedCategory.value = null;
    isCategoryModalOpen.value = true;
};

const openEditCategoryModal = (category) => {
    isEditingCategory.value = true;
    selectedCategory.value = category;
    isCategoryModalOpen.value = true;
};

const closeCategoryModal = () => {
    isCategoryModalOpen.value = false;
};

const handleCategorySubmit = (categoryData) => {
    if (isEditingCategory.value) {
        categoryStore.updateCategory(selectedCategory.value.id, categoryData);
    } else {
        categoryStore.addCategory(categoryData);
    }

    // 
    closeCategoryModal();
};

const deleteCategory = (categoryId) => {
    if (confirm('Are you sure you want to delete this category?')) {
        categoryStore.deleteCategory(categoryId);
    }
};
</script>