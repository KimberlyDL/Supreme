<template>
    <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <!-- Image Upload Section -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Product Images</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div v-for="(preview, index) in imagePreviews" :key="index"
                    class="relative group aspect-square border-2 border-gray-300 rounded-md overflow-hidden">
                    <img :src="preview" alt="Product image preview" class="w-full h-full object-cover" />
                    <div
                        class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" @click="removeImage(index)"
                            class="p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                            <TrashIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <!-- Add Image Button -->
                <div class="aspect-square border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
                    @click="triggerFileInput">
                    <PlusIcon class="w-8 h-8 text-gray-400" />
                    <input type="file" ref="fileInput" @change="handleImageChange" accept="image/*" multiple
                        class="hidden" />
                </div>
            </div>
        </div>

        <!-- Product Status -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Product Status</label>
            <label class="inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="productForm.isActive" class="sr-only peer" />
                <div class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4
            peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
            dark:bg-gray-700 peer-checked:after:translate-x-full
            rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white
            after:content-[''] after:absolute after:top-0.5 after:start-[2px]
            after:bg-white after:border-gray-300 after:border after:rounded-full
            after:h-5 after:w-5 after:transition-all dark:border-gray-600
            peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {{ productForm.isActive ? 'Active' : 'Inactive' }}
                </span>
            </label>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
                <input v-model="productForm.name" id="name" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>

            <div class="space-y-2">
                <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                <textarea v-model="productForm.description" id="description" rows="4"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
            </div>
        </div>

        <!-- Categories -->
        <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Categories</label>

            <!-- Selected Categories -->
            <div class="flex flex-wrap gap-2 mb-4">
                <div v-for="(category, index) in selectedCategories" :key="index"
                    class="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                    {{ category }}
                    <button type="button" @click="removeCategory(index)" class="text-primary hover:text-red-500">
                        <XCircleIcon class="h-4 w-4" />
                    </button>
                </div>
                <span v-if="selectedCategories.length === 0" class="text-sm text-gray-500 italic">
                    No categories selected
                </span>
            </div>

            <!-- Add Existing Category -->
            <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">Add Existing Category</label>
                <div class="flex gap-2">
                    <select v-model="selectedCategory"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Select a category</option>
                        <option v-for="category in availableCategories" :key="category" :value="category">
                            {{ category }}
                        </option>
                    </select>
                    <button type="button" @click="addSelectedCategory"
                        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                        :disabled="!selectedCategory">
                        Add
                    </button>
                </div>
                <p v-if="availableCategories.length === 0 && allCategories.length > 0" class="text-sm text-amber-600">
                    All existing categories are already selected
                </p>
            </div>

            <!-- Create New Category -->
            <div class="space-y-2 mt-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <label class="block text-sm font-medium text-gray-700">Create New Category</label>
                <p class="text-sm text-gray-500">Can't find what you need? Create a custom category:</p>
                <div class="flex gap-2">
                    <input v-model="newCategory" placeholder="Enter new category name"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    <button type="button" @click="addNewCategory"
                        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
                        :disabled="!newCategory || selectedCategories.includes(newCategory)">
                        Create
                    </button>
                </div>
            </div>
        </div>

        <!-- Varieties Section -->
        <div class="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-medium">Product Varieties</h3>
                <button type="button" @click="addVariety"
                    class="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center">
                    <PlusIcon class="w-4 h-4 mr-1" />
                    Add Variety
                </button>
            </div>

            <div v-if="productForm.varieties.length === 0" class="text-center py-4 text-gray-500">
                No varieties added yet. Add at least one variety to continue.
            </div>

            <div v-for="(variety, index) in productForm.varieties" :key="index"
                class="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-md mb-4 border border-gray-200">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-medium">Variety #{{ index + 1 }}</h4>
                    <div class="flex items-center space-x-2">
                        <label class="flex items-center cursor-pointer">
                            <input type="checkbox" :checked="variety.isDefault" @change="setDefaultVariety(index)"
                                class="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                            <span class="ml-2 text-sm">Default</span>
                        </label>
                        <button v-if="productForm.varieties.length > 1" type="button" @click="removeVariety(index)"
                            class="text-red-500 hover:text-red-700">
                            <TrashIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Name</label>
                        <input v-model="variety.name" type="text" placeholder="e.g., Small, Medium, Large"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Unit</label>
                        <input v-model="variety.unit" type="text" placeholder="e.g., piece, box, kg"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Quantity</label>
                        <input v-model.number="variety.quantity" type="number" min="1"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Price</label>
                        <input v-model.number="variety.price" type="number" min="0" step="0.01"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <!-- <div class="space-y-1">
                        <label class="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input v-model.number="variety.stockQuantity" type="number" min="0"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div> -->
                </div>

                <!-- Sale Configuration for this Variety -->
                <div class="mt-2">
                    <div class="flex items-center mb-2">
                        <input type="checkbox" v-model="variety.onSale" id="varietyOnSale"
                            class="form-checkbox h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary" />
                        <label for="varietyOnSale" class="ml-2 text-sm font-medium text-gray-700">On Sale</label>
                    </div>

                    <div v-if="variety.onSale"
                        class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-3 bg-white rounded-md">
                        <div class="space-y-1">
                            <label class="block text-sm font-medium text-gray-700">Sale Price</label>
                            <input v-model.number="variety.sale.salePrice" type="number" min="0" step="0.01"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-sm font-medium text-gray-700">Start Date</label>
                            <input v-model="variety.sale.startDate" type="datetime-local"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div class="space-y-1">
                            <label class="block text-sm font-medium text-gray-700">End Date</label>
                            <input v-model="variety.sale.endDate" type="datetime-local"
                                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="$emit('cancel')"
                class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                Cancel
            </button>
            <button type="submit" :disabled="!isFormValid"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                <SaveIcon class="w-4 h-4 mr-2" />
                Save Product
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useCategoryStore } from '@/stores/categoryStore';
//   import { useEmployeeStore } from '../../stores/employeeStore';
import {
    PlusIcon,
    TrashIcon,
    XCircleIcon,
    SaveIcon
} from 'lucide-vue-next';

// const props = defineProps({
//     // initialProduct: {
//     //   type: Object,
//     //   default: () => ({})
//     // },
//     categories: {
//         type: Array,
//         default: () => []
//     },
//     // isEditing: {
//     //   type: Boolean,
//     //   default: false
//     // }
// });

const emit = defineEmits(['submit', 'cancel']);

const categoryStore = useCategoryStore();
//   const employeeStore = useEmployeeStore();

// // Product Active state
// const isActive = ref(false);

// Form state
const productForm = ref({
    name: '',
    description: '',
    category: [],
    varieties: [],
    isActive: false
});

// Image handling
const fileInput = ref(null);
const productImages = ref([]);
const imagePreviews = ref([]);

// Categories
const selectedCategories = ref([]);
const selectedCategory = ref('');
const newCategory = ref('');

// Get all categories from the store or props
const allCategories = computed(() => {
    return categoryStore.fetchedCategories || [];
});

// Computed property to filter out already selected categories
const availableCategories = computed(() => {
    return allCategories.value.filter(cat => !selectedCategories.value.includes(cat));
});

// // for adding stock
// const branch = computed(() => {
//     return branches.value.filter()
// })

// Form validation
const isFormValid = computed(() => {
    return (
        productForm.value.name.trim() !== '' &&
        productForm.value.varieties.length > 0 &&
        productForm.value.varieties.every(v =>
            v.name.trim() !== '' &&
            v.unit.trim() !== '' &&
            v.quantity > 0 &&
            v.price >= 0 &&
            // v.stockQuantity >= 0 &&
            (!v.onSale || (v.sale && v.sale.salePrice >= 0 && v.sale.startDate && v.sale.endDate))
        )
        &&
        typeof productForm.value.isActive === 'boolean'
    );
});

// Methods for handling categories
const addSelectedCategory = () => {
    if (selectedCategory.value && !selectedCategories.value.includes(selectedCategory.value)) {
        selectedCategories.value.push(selectedCategory.value);
    }
    selectedCategory.value = '';
};

const addNewCategory = () => {
    if (newCategory.value && !selectedCategories.value.includes(newCategory.value)) {
        selectedCategories.value.push(newCategory.value);
        newCategory.value = '';
    }
};

const removeCategory = (index) => {
    selectedCategories.value.splice(index, 1);
};

// Image handling methods
const triggerFileInput = () => {
    fileInput.value.click();
};

const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    productImages.value.push(...files);

    // Create and add new previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    imagePreviews.value.push(...newPreviews);
};

const removeImage = (index) => {
    // Remove from previews and revoke object URL
    URL.revokeObjectURL(imagePreviews.value[index]);
    imagePreviews.value.splice(index, 1);

    // Remove from productImages if it's a new image
    if (index < productImages.value.length) {
        productImages.value.splice(index, 1);
    }
};

// Variety methods
const addVariety = () => {
    const isFirst = productForm.value.varieties.length === 0;
    productForm.value.varieties.push({
        // id: 'temp_' + Date.now(), // Will be replaced with a real ID when saved
        name: isFirst ? 'Default' : '',
        unit: 'piece',
        quantity: 1,
        price: 0,
        // stockQuantity: 0,
        isDefault: isFirst, // First variety is default
        onSale: false,
        sale: {
            salePrice: 0,
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
        }
    });
};

// Initialize with default variety if none exists
if (productForm.value.varieties.length === 0) {
    addVariety();
}

const removeVariety = (index) => {
    const wasDefault = productForm.value.varieties[index].isDefault;
    productForm.value.varieties.splice(index, 1);

    // If we removed the default variety, set a new default
    if (wasDefault && productForm.value.varieties.length > 0) {
        productForm.value.varieties[0].isDefault = true;
    }
};

const setDefaultVariety = (index) => {
    // Ensure only one variety is marked as default
    productForm.value.varieties.forEach((v, i) => {
        v.isDefault = i === index;
    });
};

// Form submission
const handleSubmit = () => {
    // Update categories in form
    productForm.value.category = selectedCategories.value;

    // Prepare data for submission
    const formData = {
        ...productForm.value,
        images: productImages.value
    };

    emit('submit', formData);
};

// // Initialize component with data if editing
// watch(() => props.initialProduct, (newValue) => {
//     if (newValue && Object.keys(newValue).length > 0) {
//         // Set basic product data
//         productForm.value.name = newValue.name || '';
//         productForm.value.description = newValue.description || '';

//         // Set categories
//         selectedCategories.value = Array.isArray(newValue.category) ? [...newValue.category] : [];

//         // Set varieties (transform from old format if needed)
//         if (Array.isArray(newValue.varieties) && newValue.varieties.length > 0) {
//             productForm.value.varieties = newValue.varieties.map(v => ({ ...v }));
//         } else if (Array.isArray(newValue.varietyPrices) && newValue.varietyPrices.length > 0) {
//             // Convert old varietyPrices to new varieties format
//             productForm.value.varieties = newValue.varietyPrices.map((vp, index) => ({
//                 // id: 'temp_' + Date.now() + index,
//                 name: vp.unit || 'Variety ' + (index + 1),
//                 unit: vp.unit || 'piece',
//                 quantity: vp.quantity || 1,
//                 price: vp.discountPrice || newValue.basePrice || 0,
//                 // stockQuantity: newValue.stockQuantity || 0,
//                 isDefault: index === 0,
//                 onSale: false,
//                 sale: {
//                     salePrice: 0,
//                     startDate: new Date().toISOString().slice(0, 16),
//                     endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
//                 }
//             }));
//         } else {
//             // Create a default variety from base product
//             productForm.value.varieties = [{
//                 id: 'temp_' + Date.now(),
//                 name: 'Default',
//                 unit: 'piece',
//                 quantity: 1,
//                 price: newValue.basePrice || 0,
//                 // stockQuantity: newValue.stockQuantity || 0,
//                 isDefault: true,
//                 onSale: newValue.sale?.onSale || false,
//                 sale: newValue.sale ? {
//                     salePrice: newValue.sale.salePrice || 0,
//                     startDate: newValue.sale.startDate ?
//                         new Date(newValue.sale.startDate.seconds * 1000).toISOString().slice(0, 16) :
//                         new Date().toISOString().slice(0, 16),
//                     endDate: newValue.sale.endDate ?
//                         new Date(newValue.sale.endDate.seconds * 1000).toISOString().slice(0, 16) :
//                         new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
//                 } : {
//                     salePrice: 0,
//                     startDate: new Date().toISOString().slice(0, 16),
//                     endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
//                 }
//             }];
//         }

//         // Set image previews if available
//         if (Array.isArray(newValue.imageUrls) && newValue.imageUrls.length > 0) {
//             imagePreviews.value = [...newValue.imageUrls];
//         }
//     }
// }, { immediate: true });


onMounted(() => {
    categoryStore.fetchCategoryNamesRealtime();
});

onUnmounted(() => {
    categoryStore.stopListeningCategoryNames();
});
</script>