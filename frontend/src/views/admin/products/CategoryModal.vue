<!-- frontend\src\views\admin\products\CategoryModal.vue -->
<template>
    <FormModal :isOpen="isOpen" :isEditing="isEditing" :editHeaderName="'Edit Category'" :addHeaderName="'Add Category'"
        @close="closeModal" @submit="handleSubmit">
        <template #default>
            <div class="mb-4 text-center">
                <label class="block text-sm font-medium text-gray-700">Category Image</label>
                <div class="mt-2 inline-block w-64 h-64 border-2 border-gray-300 rounded-md">
                    <img :src="imagePreview || '/placeholder.svg?height=256&width=256'" alt="Product image preview"
                        class="w-full h-full object-cover rounded-md">
                </div>
                <input type="file" @change="handleImageChange" accept="image/*" class="mt-1 block w-full">
            </div>
            <div class="mb-4">
                <label for="categoryName" class="block text-sm font-medium text-gray-700">Category Name</label>
                <input type="text" id="categoryName" v-model="categoryForm.name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required>
            </div>
            <div class="mb-4">
                <label for="categoryDescription" class="block text-sm font-medium text-gray-700">Category Name</label>
                <input type="text" id="categoryDescription" v-model="categoryForm.description"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required>
            </div>
        </template>
    </FormModal>
</template>

<script setup>
import { ref } from 'vue';
import FormModal from '@/components/shared/FormModal.vue';

const props = defineProps({
    isOpen: Boolean,
    isEditing: Boolean,
    selectedCategory: Object,
});

const emit = defineEmits(['close', 'submit']);

const categoryForm = ref({
    name: '',
    description: '',
});

const categoryImage = ref(null);
const imagePreview = ref(null);

watch(() => props.selectedCategory, (setSelectedCategoryValue) => {
    if (setSelectedCategoryValue) {
        categoryForm.value = { ...setSelectedCategoryValue };
        imagePreview.value = setSelectedCategoryValue.imageUrl;
    }
}, { immediate: true });

const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        categoryImage.value = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        categoryImage.value = null;
        imagePreview.value = null;
    }
};

const closeModal = () => {
    emit('close');
};

const handleSubmit = () => {
    emit('submit', {
        ...categoryForm.value, image: categoryImage.value
    });
    categoryForm.value = { name: '', description: '' };
    categoryImage.value = null;
    imagePreview.value = null;
};
</script>