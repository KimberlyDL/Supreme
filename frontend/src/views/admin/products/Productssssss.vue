<!-- frontend\src\views\admin\products\Products.vue -->
<template>
  <div class="flex flex-col md:flex-row space-x-4 w-full min-h-screen">

    <!-- Sidebar for filters -->
    <aside :class="[
      'fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-30',
      isSmallScreen ? '-translate-x-full' : 'translate-x-0',
      { 'md:w-64': !isFilterCollapsed, 'md:w-16': isFilterCollapsed }
    ]">
      <div class="h-full bg-white p-4 shadow-lg overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Filters</h3>
        <div :class="{ 'md:hidden': isFilterCollapsed }">
          <!-- Category filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div>
              <label v-for="category in categories" :key="category" class="flex items-center">
                <input type="checkbox" :value="category" :checked="productStore.filters.categories.includes(category)"
                  @change="toggleCategory(category)"
                  class="rounded border-gray-300 text-primary focus:ring-primary mr-2" />
                <span class="text-sm text-gray-700">{{ category }}</span>
              </label>
            </div>
          </div>

          <!-- Branch filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Branch</label>
            <select v-model="productStore.filters.branch" @change="applyFilters"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option v-for="branch in branches" :key="branch" :value="branch">
                {{ branch }}
              </option>
            </select>
          </div>

          <!-- Price range filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Price Range</label>
            <div class="flex items-center space-x-2">
              <input v-model="productStore.filters.minPrice" type="number" placeholder="Min" @change="applyFilters"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <span>-</span>
              <input v-model="productStore.filters.maxPrice" type="number" placeholder="Max" @change="applyFilters"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>

          <!-- On Sale filter -->
          <div class="mb-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="productStore.filters.onSale" @change="applyFilters"
                class="rounded border-gray-300 text-primary focus:ring-primary">
              <span class="ml-2 text-sm text-gray-700">On Sale</span>
            </label>
          </div>

          <!-- Low Stock filter -->
          <div class="mb-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="productStore.filters.lowStock" @change="applyFilters"
                class="rounded border-gray-300 text-primary focus:ring-primary">
              <span class="ml-2 text-sm text-gray-700">Low Stock</span>
            </label>
          </div>
        </div>
      </div>
    </aside>



    <!-- Product Details Sidebar -->

    <!-- Main content area -->
    <main class="flex-1 md:ml-0">

      <!-- Make this responsive. When the page is small, the icons should be contained in a toggable menu -->

      <!-- Header -->
      <header class="w-full p-4 mb-6 bg-white shadow-md flex justify-between items-center">
        <h1 class="text-xl font-bold">Product Catalog</h1>
        <div class="flex space-x-4">
          <button @click="toggleSidebarDetail"
            class="flex items-center justify-center p-2 bg-gray-200 rounded-md hover:bg-gray-300">
            <Info class="inline-block w-5 h-5" />
          </button>
          <button @click="toggleSidebarFilter"
            class="flex items-center justify-center p-2 bg-gray-200 rounded-md hover:bg-gray-300">
            <!-- class="hidden md:block p-2 bg-primary text-white rounded-md hover:bg-primary-dark"> -->
            <!-- <ListFilterPlus class="inline-block w-5 h-5 mr-2" /> -->
            <Filter class="inline-block w-5 h-5" />
            <!-- {{ isFilterCollapsed ? 'Expand' : 'Collapse' }} Sidebar -->
          </button>
          <button id="addButton" data-dropdown-toggle="dropdownAddButton" data-dropdown-placement="bottom-end"
            data-dropdown-offset-distance="15"
            class="flex items-center justify-center p-2 relative text-gray-900 bg-gradient-to-r from-teal-200 to-lime-200 hover:bg-gradient-to-l hover:from-teal-200 hover:to-lime-200 focus:ring-4 focus:outline-none focus:ring-lime-200 dark:focus:ring-teal-700 rounded-md hover:bg-gray-300">
            <Plus class="inline-block w-5 h-5" />
          </button>

          <div id="dropdownAddButton"
            class="z-10 hidden bg-white divide-y divide-gray-100 rounded-sm shadow-sm w-44 dark:bg-gray-700 dark:divide-gray-600">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownAddButton">
              <li>
                <!-- <a href="#"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a> -->
                <!-- <button @click="openAddProductModal"
                  class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100">
                  <SquarePlus :stroke-width=1 class="hover:text-gray-600" />
                  <span class="flex-1 ml-3 text-left whitespace-nowrap">Add Product</span>
                </button> -->
                <router-link :to="{ name: 'CreateProduct' }"
                  class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100">
                  <SquarePlus :stroke-width=1 class="hover:text-gray-600" />
                  <span class="flex-1 ml-3 text-left whitespace-nowrap">Add Product</span>
                </router-link>
              </li>
              <li>
                <button @click="openAddCategoryModal"
                  class="flex items-center w-full p-2 text-base font-inter font-regular text-gray-900 transition duration-75 rounded-lg group hover:bg-gray-100">
                  <ShoppingBasket :stroke-width=1 class="hover:text-gray-600" />
                  <span class="flex-1 ml-3 text-left whitespace-nowrap">Add Category</span>
                </button>
              </li>
              <li>
                <a href="#"
                  class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
              </li>
            </ul>
            <div class="py-2">
              <a href="#"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Separated
                link</a>
            </div>
          </div>
        </div>
      </header>

      <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="product in productStore.products" :key="product.id" @click="clickProduct(product)"
          class="relative z-10 bg-gray-100 rounded-lg shadow-md cursor-pointer transition duration-200 transform hover:scale-101 hover:shadow-xl hover:bg-white">
          <div class="rounded-lg overflow-hidden">
            <img :src="product.imageUrl || '/placeholder.svg?height=200&width=200'" :alt="product.name"
              class="w-full h-48 object-cover" @dblclick="viewProduct(product)">
          </div>
          <div class="p-4">
            <h2 class="text-lg font-semibold">{{ product.name }}</h2>
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold">${{ product.basePrice.toFixed(2) }}</span>

              <!-- #region Navbar -->
              <div class="relative z-50">
                <!-- 
                <button @click="toggleProductMenu(product.id)" class="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                <div v-if="activeProductMenu === product.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div class="py-1">
                    <button @click="viewProduct(product)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</button>
                    <button @click="editProduct(product)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</button>
                    <button @click="removeProduct(product)"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Remove</button>
                  </div>
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

              <!-- <div class="relative">
                <button :id="`dropdownButton-${product.id}`" :data-dropdown-toggle="`dropdown-${product.id}`"
                  data-dropdown-placement="bottom-end" data-dropdown-offset-distance="15"
                  class="text-gray-500 hover:text-gray-700 relative" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                <div :id="`dropdown-${product.id}`"
                  class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                  <ul class="py-2 text-sm text-gray-700 dark:text-gray-200"
                    :aria-labelledby="`dropdownButton-${product.id}`">
                    <li>
                      <a @click.stop="viewProductDetails(product)" href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">View</a>
                    </li>
                    <li>
                      <a @click.stop="editProduct(product)" href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
                    </li>
                    <li>
                      <a @click.stop="removeProduct(product)" href="#"
                        class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Remove</a>
                    </li>
                  </ul>
                </div>
              </div> -->

              <!-- #endregion -->
            </div>
          </div>
        </div>

      </div>
      <div v-if="productStore.loading" class="text-center mt-4">
        Loading...
      </div>
      <div v-if="!productStore.loading && !productStore.hasMore" class="text-center mt-4">
        No more products to load.
      </div>
    </main>

    <aside :class="[
      'relative transform transition duration-200 ease-in-out z-30 w-500', isDetailsCollapsed ? 'hidden' : 'min-w-[280px] max-w-[500px]', 'flex-shrink flex-grow'
    ]">
      <div>
        <div
          :class="['h-full', 'bg-white', 'p-4', 'shadow-lg', 'overflow-y-auto', { 'md:hidden': isDetailsCollapsed }]">
          <h3 class="text-lg font-semibold mb-4">Product Details</h3>
          <div v-if="selectedProduct">

            <!-- Add carousel here -->
            <div id="product-carousel" class="relative w-full mb-4" data-carousel="static">
              <!-- Carousel wrapper -->
              <div class="relative h-56 overflow-hidden rounded-lg md:h-72">
                <div v-for="(imageUrl, index) in selectedProduct.imageUrls" :key="index"
                  class="hidden duration-700 ease-in-out" :data-carousel-item="index === 0 ? 'active' : ''">
                  <img :src="imageUrl" :alt="`${selectedProduct.name} - Image ${index + 1}`"
                    class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 object-cover"
                    @error="handleImageError($event, `${selectedProduct.id}-${index}`)" />
                </div>
                <!-- Fallback for no images -->
                <div v-if="!selectedProduct.imageUrls?.length" class="hidden duration-700 ease-in-out"
                  data-carousel-item="active">
                  <div class="absolute block w-full h-full flex items-center justify-center bg-gray-200">
                    <Image class="w-12 h-12 text-gray-400" />
                  </div>
                </div>
              </div>
              <!-- Slider indicators -->
              <div v-if="selectedProduct.imageUrls?.length > 1"
                class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
                <button v-for="(_, index) in selectedProduct.imageUrls" :key="index" type="button"
                  class="w-3 h-3 rounded-full" :aria-current="index === 0" :aria-label="`Slide ${index + 1}`"
                  :data-carousel-slide-to="index"></button>
              </div>
              <!-- Slider controls -->
              <button v-if="selectedProduct.imageUrls?.length > 1" type="button"
                class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                data-carousel-prev>
                <span
                  class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M5 1 1 5l4 4" />
                  </svg>
                  <span class="sr-only">Previous</span>
                </span>
              </button>
              <button v-if="selectedProduct.imageUrls?.length > 1" type="button"
                class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
                data-carousel-next>
                <span
                  class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                  <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="m1 9 4-4-4-4" />
                  </svg>
                  <span class="sr-only">Next</span>
                </span>
              </button>
            </div>


            <h2 class="text-lg font-semibold">{{ selectedProduct.name }}</h2>
            <p class="text-sm text-gray-600">{{ selectedProduct.description }}</p>
            <p class="text-lg font-bold">₱{{ selectedProduct.basePrice.toFixed(2) }}</p>
          </div>
          <p v-else class="text-gray-500">Select a product to see the details</p>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
// #region Script
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import router from '@/router';
import { useProductStore } from "@/stores/productStore"
import { useBranchStore } from "@/stores/branchStore"

import { useModalStore } from "@/stores/modalStore";
import AddProductForm from "@/components/modal/AddProductForm.vue";
import AddCategoryForm from "@/components/modal/AddCategoryForm.vue"

import { initDropdowns, initCarousels } from 'flowbite'
import { Dropdown } from 'flowbite';
import { Info, Filter, Plus, SquarePlus, ShoppingBasket, Image, ImageOff } from 'lucide-vue-next';

const modal = useModalStore();

const productStore = useProductStore()
const branchStore = useBranchStore()

const isFilterCollapsed = ref(false);
const isDetailsCollapsed = ref(true);
const isSmallScreen = ref(window.innerWidth < 768)


const categories = ref(['All']);
const branches = ref(['All']);
const selectedProduct = ref();

// Add this to your existing refs
const imageLoadError = ref({});

// Add this function to handle image loading errors
const handleImageError = (event, imageId) => {
  imageLoadError.value[imageId] = true;
  event.target.style.display = 'none';
  // Show fallback icon
  const fallback = document.createElement('div');
  fallback.className = 'absolute inset-0 flex items-center justify-center bg-gray-200';
  fallback.innerHTML = '<div class="w-12 h-12 text-gray-400"><svg>...</svg></div>';
  event.target.parentNode.appendChild(fallback);
};


// Use computed to track the reactive fetchedCategories from the store
const fetchedCategories = computed(() => branchStore.fetchedCategories)
const fetchedBranches = computed(() => branchStore.fetchedBranches)

// Watch the computed value and update categories when fetchedCategories changes
watch(fetchedCategories, (newCategories) => {
  categories.value = ['All', ...newCategories];
}, { deep: true });

watch(fetchedBranches, (newBranches) => {
  branches.value = ['All', ...newBranches];
}, { deep: true });


const toggleCategory = (category) => {
  const index = productStore.filters.categories.indexOf(category)
  if (index > -1) {
    productStore.filters.categories.splice(index, 1)
  } else {
    productStore.filters.categories.push(category)
  }

  // If 'All' is selected, clear other selections
  if (category === "All" && productStore.filters.categories.includes("All")) {
    productStore.filters.categories = ["All"]
  } else if (productStore.filters.categories.length > 0 && productStore.filters.categories.includes("All")) {
    // If another category is selected and 'All' was previously selected, remove 'All'
    productStore.filters.categories = productStore.filters.categories.filter((c) => c !== "All")
  }

  // If no categories are selected, select 'All'
  if (productStore.filters.categories.length === 0) {
    productStore.filters.categories = ["All"]
  }

  applyFilters()
}

const applyFilters = () => {
  productStore.fetchProducts(true)
}

const toggleSidebarFilter = () => {
  isFilterCollapsed.value = !isFilterCollapsed.value;
}

const toggleSidebarDetail = () => {
  isDetailsCollapsed.value = !isDetailsCollapsed.value;

  console.log("scroll", productStore.products);
}

// Modify your clickProduct function to reinitialize the carousel
const clickProduct = (product) => {
  selectedProduct.value = product;
  setTimeout(() => {
    initCarousels();
  }, 0);
};


// #region ProductCardMenu
const activeProductMenu = ref(null)
const dropdownMenu = ref(null);

const toggleProductMenu = (productId) => {
  activeProductMenu.value = activeProductMenu.value === productId ? null : productId;

  console.log('activeProductMenu: ', activeProductMenu.value);
};

// Store dropdown instances
const dropdownInstances = ref(new Map());
const activeDropdownId = ref(null);

// // Initialize dropdown for a specific product
// const initializeDropdown = (productId) => {
//   const targetEl = document.getElementById(`dropdown-${productId}`);
//   const triggerEl = document.getElementById(`dropdownButton-${productId}`);

//   if (!dropdownInstances.value.has(productId)) {
//     // Create new dropdown instance
//     const dropdown = new Dropdown(targetEl, triggerEl, {
//       placement: 'bottom-end',
//       offsetDistance: 10,
//       triggerType: 'click'
//     });

//     dropdownInstances.value.set(productId, dropdown);
//   }

//   // Toggle the dropdown
//   const dropdown = dropdownInstances.value.get(productId);
//   if (dropdown.isVisible()) {
//     dropdown.hide();
//   } else {
//     // Hide all other dropdowns first
//     dropdownInstances.value.forEach((instance, id) => {
//       if (id !== productId && instance.isVisible()) {
//         instance.hide();
//       }
//     });
//     dropdown.show();
//   }
// };

// Toggle dropdown for a specific product
const toggleDropdown = (productId) => {
  const targetEl = document.getElementById(`dropdown-${productId}`);
  const triggerEl = document.getElementById(`dropdownButton-${productId}`);

  if (!dropdownInstances.value.has(productId)) {
    // Create new dropdown instance
    const dropdown = new Dropdown(targetEl, triggerEl, {
      placement: 'bottom-end',
      offsetDistance: 10,
      triggerType: 'click'
    });
    dropdownInstances.value.set(productId, dropdown);
  }

  const dropdown = dropdownInstances.value.get(productId);

  // If this dropdown is already visible, hide it
  if (activeDropdownId.value === productId) {
    dropdown.hide();
    activeDropdownId.value = null;
    return;
  }

  // Hide any other visible dropdown
  if (activeDropdownId.value) {
    const activeDropdown = dropdownInstances.value.get(activeDropdownId.value);
    if (activeDropdown) {
      activeDropdown.hide();
    }
  }

  // Show the clicked dropdown
  dropdown.show();
  activeDropdownId.value = productId;
};

// const handleClickOutside = (event) => {
//   if (dropdownMenu.value && !dropdownMenu.value.contains(event.target)) {
//     activeProductMenu.value = null;
//   }
// };

// // Handle clicking outside to close dropdowns
// const handleClickOutside = (event) => {
//   dropdownInstances.value.forEach((dropdown, productId) => {
//     const targetEl = document.getElementById(`dropdown-${productId}`);
//     const triggerEl = document.getElementById(`dropdownButton-${productId}`);

//     if (dropdown.isVisible() &&
//       !targetEl.contains(event.target) &&
//       !triggerEl.contains(event.target)) {
//       dropdown.hide();
//     }
//   });
// };

// // Handle clicking outside to close dropdowns
// const handleClickOutside = (event) => {
//   if (activeDropdownId.value) {
//     const dropdown = dropdownInstances.value.get(activeDropdownId.value);
//     const targetEl = document.getElementById(`dropdown-${activeDropdownId.value}`);
//     const triggerEl = document.getElementById(`dropdownButton-${activeDropdownId.value}`);

//     if (!targetEl.contains(event.target) && !triggerEl.contains(event.target)) {
//       dropdown.hide();
//       activeDropdownId.value = null;
//     }
//   }
// };

// Handle clicking outside to close dropdowns
const handleClickOutside = (event) => {
  if (activeDropdownId.value) {
    const dropdown = dropdownInstances.value.get(activeDropdownId.value);
    const targetEl = document.getElementById(`dropdown-${activeDropdownId.value}`);
    const triggerEl = document.getElementById(`dropdownButton-${activeDropdownId.value}`);

    if (!targetEl.contains(event.target) && !triggerEl.contains(event.target)) {
      dropdown.hide();
      activeDropdownId.value = null;
    }
  }
};

// Clean up function
const cleanup = () => {
  document.removeEventListener('click', handleClickOutside);
  dropdownInstances.value.clear();
  activeDropdownId.value = null;
};

// const viewProduct = (product) => {
//   // Implement view product logic
//   console.log("View product:", product)
// }

const viewProduct = (product) => {
  // router.push({ name: 'ProductDetails', params: { id: product.id } })
  setTimeout(() => {
    router.push({ name: 'ProductDetails', params: { id: product.id } });
  }, 10);
}

const editProduct = (product) => {
  setTimeout(() => {
    router.push(`/administrator/products/${product.id}/edit`);
  }, 10)
}

// const viewProduct = (product) => {
//   // Use router.push instead of router.replace if you want back button to work
//   router.push({ name: 'ProductDetails', params: { id: product.id } });
// }

// const editProduct = (product) => {
//   router.push({ name: 'EditProduct', params: { id: product.id } });
// }

const deletingProduct = ref(false)

const confirmDelete = async (productId) => {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      deletingProduct.value = true;
      await productStore.deleteProduct(productId);
      alert('Product deleted successfully.');
    } catch (error) {
      alert('Error deleting product: ' + error.message);
    } finally {
      deletingProduct.value = false;
    }
  }
}

// #endregion

// #region scrollingResizing
const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 768
  if (!isSmallScreen.value) {
    isFilterCollapsed.value = false
  }
}

const handleScroll = () => {
  const scrollPosition = window.innerHeight + window.scrollY
  const documentHeight = document.documentElement.offsetHeight

  if (scrollPosition >= documentHeight - 200 && !productStore.loading && productStore.hasMore) {
    productStore.fetchProducts()
  }
}

watch(isSmallScreen, (newValue) => {
  if (!newValue) {
    isFilterCollapsed.value = false
  }
})
// #endregion

// #region addProduct

const isEditing = ref(false);
const editingProduct = ref(null);

function openAddProductModal() {
  modal.open(AddProductForm, {
    isOpen: true,
    categories: fetchedCategories.value || [],
  }, { submit: handleSubmit, close: modal.close });
}

const handleSubmit = async (formData) => {
  try {
    if (isEditing.value) {
      //await productStore.updateProduct(editingProduct.value.id, formData, formData.image);
    } else {
      await productStore.addProduct(formData);
    }
    modal.close();
  } catch (error) {
    console.error('Error submitting product:', error);
    // Handle error (e.g., show error message to user)
  }
};
// #endregion

// #region AddCategory
function openAddCategoryModal() {

  modal.open(AddCategoryForm, {
    isEditing: false,
    initialCategory: null,
    isOpen: true,
  }, { submit: handleCategorySubmit, close: modal.close });
}

const handleCategorySubmit = async () => {
  try {
    console.log('CategoryAdded');
    // await branchStore.fetchCategoriesRealtime();
    modal.close();
  } catch (error) {
    console.error('Error submitting category:', error);
  }
};
// #endregion

onMounted(() => {
  initDropdowns();
  initCarousels();

  branchStore.fetchBranchesRealtime();
  branchStore.fetchCategoriesRealtime();
  productStore.fetchProducts(true);

  productStore.setupRealtimeProducts();

  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handleScroll);

  document.addEventListener("click", handleClickOutside); //for product card's menu
})

onUnmounted(() => {
  productStore.stopListening();
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("scroll", handleScroll);

  //for product card's menu
  //document.removeEventListener("click", handleClickOutside); 
  cleanup();

  // for add product modal
  modal.close();
})

// #endregion
</script>