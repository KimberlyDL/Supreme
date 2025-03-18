<template>
  <div v-if="isOpen" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Add New Product
        </h3>
        <form @submit.prevent="handleSubmit" class="mt-2 text-left">

          <!-- Image Upload -->
          <div class="mb-4 text-center">
            <label class="block text-sm font-medium text-gray-700">Product Images</label>
            <div class="mt-2 flex flex-wrap gap-2 justify-center">
              <div v-for="(preview, index) in imagePreviews" :key="index"
                class="w-24 h-24 border-2 border-gray-300 rounded-md overflow-hidden">
                <img :src="preview" alt="Product image preview" class="w-full h-full object-cover">
              </div>
            </div>
            <input type="file" multiple @change="handleImageChange" accept="image/*" class="mt-1 block w-full">
          </div>

          <!-- Name -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="productForm.name" type="text" required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          </div>

          <!-- Description -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea v-model="productForm.description"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"></textarea>
          </div>

          <!-- Base Price -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Base Price</label>
            <input v-model.number="productForm.basePrice" type="number" step="0.01" required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          </div>

          <!-- Stock Quantity -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input v-model.number="productForm.stockQuantity" type="number" required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
          </div>

          <!-- <div>
            <label for="branch-filter" class="sr-only">Category</label>
            <select id="branch-filter" v-model="productForm.category"
              class="block w-60 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500">
              <option value="">Select Category</option>
              <option v-for="category in categories" :key="category.uid" :value="category.name">{{ category.name }}
              </option>
            </select>
          </div> -->

          <!-- <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div>
              <label v-for="category in categories" :key="category" class="flex items-center">
                <input type="checkbox" :value="category" :checked="addCategory(category)"
                  @change="toggleCategory(category)"
                  class="rounded border-gray-300 text-primary focus:ring-primary mr-2" />
                <span class="text-sm text-gray-700">{{ category }}</span>
              </label>
            </div>
          </div> -->



          <!-- Category -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Categories</label>
            
            <div class="mt-2 flex flex-wrap gap-2">
              <div v-for="(cat, index) in selectedCategories" :key="index" 
                class="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                {{ cat }}

                <!-- removing category -->
                <button @click="removeCategory(index)" type="button" class="text-primary hover:text-primary/80">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mt-2 flex gap-2">
              <select v-model="selectedCategory" 
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <option value="">Select Category</option>
                <option v-for="category in availableCategories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
              <button @click="addSelectedCategory" type="button" 
                class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Add
              </button>
            </div>
            <div class="mt-2">
              <div class="flex gap-2">
                <input v-model="newCategory" placeholder="Add new category" 
                  class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
                <button @click="addNewCategory" type="button" 
                  class="px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Create
                </button>
              </div>
            </div>
          </div>


          <!-- Variety Prices -->
          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">Variety Prices</h3>
            <div class="flex justify-end">
              <button @click.prevent="addVarietyPrice" type="button"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Add Variety Price
              </button>
            </div>
            <div v-for="(price, index) in productForm.varietyPrices" :key="index" class="flex items-center gap-2 mt-2">
              <input v-model="price.unit" placeholder="Unit"
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
              <input v-model.number="price.quantity" type="number" placeholder="Quantity"
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
              <input v-model.number="price.discountPrice" type="number" step="0.01" placeholder="Discount Price"
                class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
              <button @click.prevent="removeVarietyPrice(index)" type="button"
                class="p-2 text-destructive hover:text-destructive/90">
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <div class="mb-4">
            <h3 class="text-lg font-medium mb-2">Scheduled Sale</h3>

            <!-- Checkbox to enable/disable sale -->
            <div class="flex items-center gap-2">
              <input v-model="productForm.sale.onSale" type="checkbox" id="onSale"
                class="rounded border-gray-300 text-primary focus:ring-primary">
              <label for="onSale" class="text-sm font-medium text-gray-700">Enable Sale</label>
            </div>

            <!-- Sale details (shown only if sale is enabled) -->
            <div v-if="productForm.sale.onSale" class="mt-2 space-y-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">Sale Price</label>
                <input v-model.number="productForm.sale.salePrice" type="number" step="0.01" placeholder="Sale Price"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input v-model="productForm.sale.startDate" type="datetime-local"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input v-model="productForm.sale.endDate" type="datetime-local"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50">
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-2">
            <button @click="closeModal" type="button"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Add Product
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, defineEmits, ref, watch, computed, toRefs } from "vue";
import { TrashIcon } from '@heroicons/vue/24/solid';
import { useProductStore } from '@/stores/productStore';
const productStore = useProductStore();

const props = defineProps({
  isOpen: Boolean,
  initialProduct: Object,
  categories: Array,
});

const { categories } = toRefs(props); // Make props.categories reactive

const emit = defineEmits(["submit", "close"]);

const cat = ref ([]);
const selectedCategories = ref([]);
const selectedCategory = ref('');
const newCategory = ref('');
// const categories = ref([]);

const productForm = ref({
  name: '',
  description: '',
  basePrice: 0,
  stockQuantity: 0,
  categories: selectedCategories.value || [],
  varietyPrices: [],
  sale: {
    onSale: false,
    salePrice: 0,
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date().toISOString().slice(0, 16),
  }
});



// Computed property to filter out already selected categories
// const availableCategories = computed(() => {
//   // return categories.value.filter(cat => !selectedCategories.value.includes(cat.name));
//   return props.categories.filter(cat => !selectedCategories.value.includes(cat.name));
// });

const availableCategories = computed(() => {
  return categories.value.filter(cat => !selectedCategories.value.includes(cat.name));
});

// Methods to add/remove categories
const addSelectedCategory = () => {
  if (selectedCategory.value && !selectedCategories.value.includes(selectedCategory.value)) {
    selectedCategories.value.push(selectedCategory.value);
    selectedCategory.value = '';
  }
  else {
    selectedCategory.value = '';
  }

  console.log(selectedCategories.value);
};

const addNewCategory = () => {
  if (newCategory.value && !selectedCategories.value.includes(newCategory.value)) {
    selectedCategories.value.push(newCategory.value);
    newCategory.value = '';
  }
  else {
    newCategory.value = '';
  }

  console.log(selectedCategories.value);
};

const removeCategory = (index) => {
  selectedCategories.value.splice(index, 1);
};


// // Debugging
// watch(() => props.categories, (newVal) => {
//   console.log("Received categories in AddProductForm:", newVal);
// }, { immediate: true });


const productImages = ref([]);
const imagePreviews = ref([]);

onMounted(async () => {
  // const fetchedCategories = await productStore.getExistingProductCategories();
  // categories.value = fetchedCategories;

  //console.log("fetched category", props.categories);
  // console.log("fetched category", availableCategories.value);
  // this says undefined
})

const handleImageChange = (event) => {
  const files = Array.from(event.target.files);
  productImages.value = files;
  imagePreviews.value = files.map(file => URL.createObjectURL(file));
};

const addVarietyPrice = () => productForm.value.varietyPrices.push({ unit: '', quantity: 0, discountPrice: 0 });
const removeVarietyPrice = (index) => productForm.value.varietyPrices.splice(index, 1);

const handleSubmit = () => {
  emit('submit', { ...productForm.value, images: productImages.value });
  emit('close');
};

const closeModal = () => emit('close');

</script>