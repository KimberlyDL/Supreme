<template>
    <div class="p-4 sm:p-6 max-w-md mx-auto">
        <div class="text-center mb-6">
            <h3 class="text-xl font-semibold text-tBase-100">Move Products</h3>
            <p class="text-sm text-gray-500 mt-1">
                Move {{ productIds.length }} product{{ productIds.length > 1 ? 's' : '' }} to another category
            </p>
        </div>

        <form @submit.prevent="submitForm">
            <div class="mb-4">
                <label for="targetCategory" class="block text-sm font-medium text-tBase-100 mb-1">Target
                    Category</label>
                <select id="targetCategory" v-model="targetCategoryId"
                    class="w-full p-2.5 text-sm text-tBase-100 bg-bgSecondary-0 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    required>
                    <option value="" disabled>Select a category</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                        {{ category.name }}
                    </option>
                </select>
                <p v-if="errors.targetCategory" class="mt-1 text-sm text-danger-500">{{ errors.targetCategory }}</p>
            </div>

            <div class="flex items-center mb-4">
                <input type="checkbox" id="keepInCurrent" v-model="keepInCurrentCategory"
                    class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500" />
                <label for="keepInCurrent" class="ml-2 text-sm font-medium text-tBase-100">
                    Keep in current category (copy instead of move)
                </label>
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <button type="button" @click="$emit('onCancel')"
                    class="px-4 py-2 text-sm font-medium text-tBase-100 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200">
                    Cancel
                </button>
                <button type="submit"
                    class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-300"
                    :disabled="isSubmitting">
                    <span v-if="isSubmitting">Processing...</span>
                    <span v-else>{{ keepInCurrentCategory ? 'Copy' : 'Move' }}</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCategoryStore } from '@/stores/categoryStore';
const categoryStore = useCategoryStore();

const props = defineProps({
    productIds: {
        type: Array,
        required: true
    },
    sourceCategoryId: {
        type: String,
        required: true
    },
    categories: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['onSuccess', 'onCancel']);

const targetCategoryId = ref('');
const keepInCurrentCategory = ref(false);
const errors = ref({});
const isSubmitting = ref(false);

const validateForm = () => {
    errors.value = {};

    if (!targetCategoryId.value) {
        errors.value.targetCategory = 'Please select a target category';
        return false;
    }

    return true;
};

const submitForm = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;

    try {
        await categoryStore.moveProductsBetweenCategories({
            productIds: props.productIds,
            sourceCategoryId: props.sourceCategoryId,
            targetCategoryId: targetCategoryId.value,
            keepInSource: keepInCurrentCategory.value
        });

        emit('onSuccess');
    } catch (error) {
        console.error('Error moving products:', error);
        if (error.response?.data?.error) {
            errors.value.general = error.response.data.error;
        } else {
            errors.value.general = 'An error occurred while moving the products';
        }
    } finally {
        isSubmitting.value = false;
    }
};
</script>
