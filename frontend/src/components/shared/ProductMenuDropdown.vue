<script setup>
import { defineProps, ref } from 'vue';
import { editProduct } from '../../../../backend/controllers/product/ProductController';

const props = defineProps({
    productId: string
});

const isDropdownOpen = ref(false);

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value;
};

const handleAction = (action) => {
    console.log(`Performing ${action} on`, props.product);
    isDropdownOpen.value = false; // Close dropdown after selecting an option
};
</script>

<template>
    <div class="relative">
        <!-- <button @click.stop.prevent="viewProduct(product)" class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
            ⋮
        </button>
        <div v-if="isDropdownOpen" class="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
            <button @click.stop.prevent="editProduct(productId)"
                class="block w-full px-4 py-2 text-left hover:bg-gray-100">Edit</button>
            <button @click.stop.prevent="confirmDeleteProduct(productId)"
                class="block w-full px-4 py-2 text-left hover:bg-gray-100">Delete</button>
        </div> -->


        <button :id="`dropdownButton-${product.id}`" type="button" class="text-gray-500 hover:text-gray-700"
            @click="toggleDropdown(product.id)">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
        </button>

        <!-- Dropdown menu -->
        <div :id="`dropdown-${product.id}`"
            class="z-50 hidden right-0 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
                <li>
                    <button @click.stop.prevent="viewProduct(product)"
                        class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        View
                    </button>
                </li>
                <li>
                    <button @click.stop.prevent="editProduct(product)"
                        class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        Edit
                    </button>
                </li>
                <li>
                    <button @click.stop.prevent="confirmDelete(product.id)"
                        class="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                        Remove
                    </button>
                </li>
            </ul>
        </div>

    </div>
</template>
