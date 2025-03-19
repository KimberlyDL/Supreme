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
        <div
          class="aspect-square border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
          @click="triggerFileInput">
          <PlusIcon class="w-8 h-8 text-gray-400" />
          <input type="file" ref="fileInput" @change="handleImageChange" accept="image/*" multiple class="hidden" />
        </div>
      </div>
    </div>

    <!-- Basic Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700">Product Name</label>
        <input v-model="productForm.name" id="name" type="text" required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
      </div>

      <div class="space-y-2">
        <label for="basePrice" class="block text-sm font-medium text-gray-700">Base Price</label>
        <input v-model.number="productForm.basePrice" id="basePrice" type="number" step="0.01" required
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
      <textarea v-model="productForm.description" id="description" rows="4"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
    </div>

    <!-- Stock Quantity -->
    <div class="space-y-2">
      <label for="stockQuantity" class="block text-sm font-medium text-gray-700">Stock Quantity</label>
      <input v-model.number="productForm.stockQuantity" id="stockQuantity" type="number" required
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
    </div>

    <!-- Categories -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Categories</label>

      <!-- <div class="flex flex-wrap gap-2 mb-2">
        <div v-for="(cat, index) in selectedCategories" :key="index" 
             class="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
          {{ cat }}
          <button @click="removeCategory(index)" type="button" class="text-primary hover:text-primary/80">
            <XCircleIcon class="h-4 w-4" />
          </button>
        </div>
      </div> -->

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

      <!-- <div class="flex gap-2">
        <select v-model="selectedCategory" 
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
          <option value="">Select Category</option>
          <option v-for="category in availableCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <button @click="addSelectedCategory" type="button" 
                class="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
          Add
        </button>
      </div>
      
      <div class="flex gap-2 mt-2">
        <input v-model="newCategory" placeholder="Add new category" 
               class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        <button @click="addNewCategory" type="button" 
                class="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
          Create
        </button>
      </div> -->



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

    <!-- Sale Configuration -->
    <div class="space-y-4 p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Sale Configuration</h3>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="productForm.sale.onSale" class="sr-only peer">
          <div
            class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
          </div>
          <span class="ml-3 text-sm font-medium text-gray-700">{{ productForm.sale.onSale ? 'Enabled' : 'Disabled'
          }}</span>
        </label>
      </div>

      <div v-if="productForm.sale.onSale" class="space-y-4">
        <div class="space-y-2">
          <label for="salePrice" class="block text-sm font-medium text-gray-700">Sale Price</label>
          <input v-model.number="productForm.sale.salePrice" id="salePrice" type="number" step="0.01"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
            <input v-model="productForm.sale.startDate" id="startDate" type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>

          <div class="space-y-2">
            <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
            <input v-model="productForm.sale.endDate" id="endDate" type="datetime-local"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
        </div>
      </div>
    </div>

    <!-- Variety Prices -->
    <div class="space-y-4 p-4 border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Variety Prices</h3>
        <button @click.prevent="addVarietyPrice" type="button"
          class="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center">
          <PlusIcon class="w-4 h-4 mr-1" />
          Add Variety
        </button>
      </div>

      <div v-if="productForm.varietyPrices.length === 0" class="text-center py-4 text-gray-500">
        No variety prices added yet
      </div>

      <div v-for="(price, index) in productForm.varietyPrices" :key="index"
        class="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-md">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Unit</label>
          <input v-model="price.unit" placeholder="e.g., Box, Pack"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Quantity</label>
          <input v-model.number="price.quantity" type="number" placeholder="Quantity"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Price</label>
          <input v-model.number="price.discountPrice" type="number" step="0.01" placeholder="Price"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
        </div>

        <div class="flex items-end">
          <button @click.prevent="removeVarietyPrice(index)" type="button"
            class="w-full px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 flex items-center justify-center">
            <TrashIcon class="w-4 h-4 mr-1" />
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-4">
      <button type="button" @click="$emit('cancel')"
        class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
        Cancel
      </button>
      <button type="submit" class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center">
        <SaveIcon class="w-4 h-4 mr-2" />
        Save Changes
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import {
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  SaveIcon
} from 'lucide-vue-next';

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['submit', 'cancel']);

const productStore = useProductStore();
const categoryStore = useCategoryStore();

// Form state
const productForm = ref({
  name: '',
  description: '',
  basePrice: 0,
  stockQuantity: 0,
  category: [],
  varietyPrices: [],
  sale: {
    onSale: false,
    salePrice: 0,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date().toISOString().slice(0, 16),
  }
});

// Image handling
const fileInput = ref(null);
const productImages = ref([]);
const imagePreviews = ref([]);
// const removedImageUrls = ref([]);
// const existingImageUrls = ref([]);
const removedImagePaths = ref([]); // Store paths instead of URLs
const existingImagePaths = ref([]); // Store paths
const existingImageUrls = ref([]); // Store URLs for display

// // Categories
// const selectedCategories = ref([]);
// const selectedCategory = ref('');
// const newCategory = ref('');

// // Computed property to filter out already selected categories
// const availableCategories = computed(() => {
//   return props.categories.filter(cat => !selectedCategories.value.includes(cat));
// });

// // Methods to add/remove categories
// const addSelectedCategory = () => {
//   if (selectedCategory.value && !selectedCategories.value.includes(selectedCategory.value)) {
//     selectedCategories.value.push(selectedCategory.value);
//     selectedCategory.value = '';
//   }
// };

// const addNewCategory = () => {
//   if (newCategory.value && !selectedCategories.value.includes(newCategory.value)) {
//     selectedCategories.value.push(newCategory.value);
//     newCategory.value = '';
//   }
// };

// const removeCategory = (index) => {
//   selectedCategories.value.splice(index, 1);
// };



// Categories
const selectedCategories = ref([]);
const selectedCategory = ref('');
const newCategory = ref('');

// Watch for changes in categories from props
watch(() => props.categories, (newCategories) => {
  if (newCategories && newCategories.length > 0) {
    console.log('Available categories updated:', newCategories);
  }
}, { immediate: true });

// Fetch categories if not provided through props
const fetchCategories = async () => {
  try {
    if (!props.categories || props.categories.length === 0) {
      console.error('Fetching categories');
      await categoryStore.fetchCategoryNamesRealtime();


    }
    else {
      console.error('categories passcondition');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Get all categories from the store
const allCategories = computed(() => {
  return categoryStore.fetchedCategories || [];
});

// Computed property to filter out already selected categories
const availableCategories = computed(() => {
  return allCategories.value.filter(cat => !selectedCategories.value.includes(cat));
});

// Methods for handling categories
const addSelectedCategory = () => {
  if (selectedCategory.value && !selectedCategories.value.includes(selectedCategory.value)) {
    selectedCategories.value.push(selectedCategory.value);
    selectedCategory.value = '';
  }
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

// const handleImageChange = (event) => {
//   const files = Array.from(event.target.files);

//   // Add new files to productImages
//   productImages.value = [...productImages.value, ...files];

//   // Create and add new previews
//   const newPreviews = files.map(file => URL.createObjectURL(file));
//   imagePreviews.value = [...imagePreviews.value, ...newPreviews];
// };

const handleImageChange = (event) => {
  const files = Array.from(event.target.files);
  productImages.value.push(...files);

  // Create and add new previews
  const newPreviews = files.map(file => URL.createObjectURL(file));
  imagePreviews.value.push(...newPreviews);
};

// const removeImage = (index) => {
//   // Check if this is an existing image
//   if (index < existingImageUrls.value.length) {
//     removedImageUrls.value.push(existingImageUrls.value[index]);
//     existingImageUrls.value.splice(index, 1);
//   } else {
//     // Adjust index for new images
//     const newImageIndex = index - existingImageUrls.value.length;
//     productImages.value.splice(newImageIndex, 1);
//   }

//   // Remove from previews
//   imagePreviews.value.splice(index, 1);
// };

const removeImage = (index) => {
  if (index < existingImageUrls.value.length) {
    // If removing an existing image, store its path for deletion
    removedImagePaths.value.push(existingImagePaths.value[index]);
    existingImagePaths.value.splice(index, 1);
    existingImageUrls.value.splice(index, 1);
  } else {
    // If removing a new image
    const newImageIndex = index - existingImageUrls.value.length;
    URL.revokeObjectURL(imagePreviews.value[index]);
    productImages.value.splice(newImageIndex, 1);
    imagePreviews.value.splice(index, 1);
  }
};

// Variety price methods
const addVarietyPrice = () => {
  productForm.value.varietyPrices.push({
    unit: '',
    quantity: 0,
    discountPrice: 0
  });
};

const removeVarietyPrice = (index) => {
  productForm.value.varietyPrices.splice(index, 1);
};

// // Form submission
// const handleSubmit = () => {
//   // Update categories in form
//   productForm.value.category = selectedCategories.value;

//   // Prepare data for submission
//   const formData = {
//     ...productForm.value,
//     images: productImages.value,
//     removedImageUrls: removedImageUrls.value
//   };

//   // Emit the submit event with the form data
//   emit('submit', formData);
// };

// Form submission
const handleSubmit = () => {
  // Update categories in form
  productForm.value.category = selectedCategories.value;

  // Prepare data for submission
  const formData = {
    ...productForm.value,
    images: productImages.value, // New image files
    removedImagePaths: removedImagePaths.value, // Paths of images to remove
    existingImagePaths: existingImagePaths.value // Paths of images to keep
  };

  emit('submit', formData);
};

// // Load product data
// const loadProductData = async () => {
//   try {
//     const product = await productStore.getProductById(props.productId);

//     if (product) {
//       // Set basic product data
//       productForm.value.name = product.name || '';
//       productForm.value.description = product.description || '';
//       productForm.value.basePrice = product.basePrice || 0;
//       productForm.value.stockQuantity = product.stockQuantity || 0;

//       // Set categories
//       selectedCategories.value = Array.isArray(product.category) ? [...product.category] : [];

//       // Set variety prices
//       productForm.value.varietyPrices = Array.isArray(product.varietyPrices)
//         ? product.varietyPrices.map(p => ({ ...p }))
//         : [];

//       // Set sale data
//       if (product.sale) {
//         productForm.value.sale = {
//           onSale: product.sale.onSale || false,
//           salePrice: product.sale.salePrice || 0,
//           startDate: product.sale.startDate ? new Date(product.sale.startDate.seconds * 1000).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
//           endDate: product.sale.endDate ? new Date(product.sale.endDate.seconds * 1000).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
//         };
//       }

//       // Set images
//       if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
//         existingImageUrls.value = [...product.imageUrls];
//         imagePreviews.value = [...product.imageUrls];
//       }
//     }
//   } catch (error) {
//     console.error('Error loading product data:', error);
//   }
// };


// Load product data
const loadProductData = async () => {
  try {
    // const product = await productStore.getProductById(props.productId);
    // Use the new method instead of getProductById
    const product = await productStore.getProductByIdWithPaths(props.productId);

    if (product) {
      // Set basic product data
      productForm.value.name = product.name || '';
      productForm.value.description = product.description || '';
      productForm.value.basePrice = product.basePrice || 0;
      productForm.value.stockQuantity = product.stockQuantity || 0;

      // Set categories
      selectedCategories.value = Array.isArray(product.category) ? [...product.category] : [];

      // Set variety prices
      productForm.value.varietyPrices = Array.isArray(product.varietyPrices)
        ? product.varietyPrices.map(p => ({ ...p }))
        : [];

      // Set sale data
      if (product.sale) {
        productForm.value.sale = {
          onSale: product.sale.onSale || false,
          salePrice: product.sale.salePrice || 0,
          startDate: product.sale.startDate ?
            new Date(product.sale.startDate.seconds * 1000).toISOString().slice(0, 16) :
            new Date().toISOString().slice(0, 16),
          endDate: product.sale.endDate ?
            new Date(product.sale.endDate.seconds * 1000).toISOString().slice(0, 16) :
            new Date().toISOString().slice(0, 16)
        };
      }

      // // Set images - store both paths and URLs
      // if (product._imageUrls && Array.isArray(product._imageUrls)) {
      //   existingImagePaths.value = [...product._imageUrls]; // Original paths from DB
      //   existingImageUrls.value = [...product.imageUrls]; // Download URLs
      //   imagePreviews.value = [...product.imageUrls]; // For display
      // }

      // Set images - now using _imageUrls for paths
      if (product._imageUrls && Array.isArray(product._imageUrls)) {
        existingImagePaths.value = [...product._imageUrls]; // Original paths from DB
        existingImageUrls.value = [...product.imageUrls];   // Download URLs
        imagePreviews.value = [...product.imageUrls];       // For display
      }
    }
  } catch (error) {
    console.error('Error loading product data:', error);
  }
};

// Initialize component
onMounted(async () => {
  await fetchCategories();
  // Load product data
  await loadProductData();
});

// Add this to ensure we clean up when the component is unmounted
onUnmounted(() => {
  // Stop listening for category changes
  categoryStore.stopListeningCategoryNames();
});


// // Watch for changes in categories from props
// watch(() => props.categories, (newCategories) => {
//   if (newCategories && newCategories.length > 0) {
//     // Update available categories
//   }
// }, { deep: true });

// Watch for changes in categories from props
watch(() => props.categories, (newCategories) => {
  if (newCategories && newCategories.length > 0) {
    console.log('Available categories updated:', newCategories);
  }
}, { immediate: true });

</script>
