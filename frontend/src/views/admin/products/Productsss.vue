<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-100">
    <!-- Sidebar toggle button -->
    <button @click="toggleSidebar"
      class="md:hidden fixed top-4 left-4 z-20 p-2 bg-primary text-white rounded-md hover:bg-primary-dark">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Sidebar for filters -->
    <aside :class="[
      'fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-30',
      isSmallScreen ? '-translate-x-full' : 'translate-x-0',
      { 'md:w-64': !isSidebarCollapsed, 'md:w-16': isSidebarCollapsed }
    ]">
      <div class="h-full bg-white p-4 shadow-lg overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">Filters</h3>
        <div :class="{ 'md:hidden': isSidebarCollapsed }">
          <!-- Category filter -->
          <div class="mb-4">
            <!-- <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div class="space-y-2">
              <label v-for="category in allCategories" :key="category" class="flex items-center">
                <input
                  type="checkbox"
                  :value="category"
                  v-model="filters.categories"
                  @change="toggleCategory(category)"
                  class="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                />
                <span class="text-sm text-gray-700">{{ category }}</span>
              </label>
            </div> -->


            <!-- Category Filters -->
            <label class="block text-sm font-medium text-gray-700 mb-2">Categories</label>
            <div>
              <!-- <label>
                <input type="checkbox" value="all" v-model="filters.categories" @change="resetCategories" /> All
              </label>
              <label v-for="category in uniqueCategories" :key="category">
                <input type="checkbox" :value="category" v-model="filters.categories"
                  @change="toggleCategory(category)" />
                {{ category }}
              </label> -->
              <label v-for="category in categories" :key="category" class="flex items-center">
                <input type="checkbox" :value="category" :checked="filters.categories.includes(category)"
                  @change="toggleCategory(category)"
                  class="rounded border-gray-300 text-primary focus:ring-primary mr-2" />
                <span class="text-sm text-gray-700">{{ category }}</span>
              </label>
            </div>

          </div>


          <!-- Branch filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Branch</label>
            <select v-model="filters.branch" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">All Branches</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>
          <!-- Price range filter -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Price Range</label>
            <div class="flex items-center space-x-2">
              <input v-model="filters.minPrice" type="number" placeholder="Min"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              <span>-</span>
              <input v-model="filters.maxPrice" type="number" placeholder="Max"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
          <!-- On Sale filter -->
          <div class="mb-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="filters.onSale"
                class="rounded border-gray-300 text-primary focus:ring-primary">
              <span class="ml-2 text-sm text-gray-700">On Sale</span>
            </label>
          </div>
          <!-- Low Stock filter -->
          <div class="mb-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="filters.lowStock"
                class="rounded border-gray-300 text-primary focus:ring-primary">
              <span class="ml-2 text-sm text-gray-700">Low Stock</span>
            </label>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 p-4 md:ml-0">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Product Catalog</h1>
        <button @click="toggleSidebar"
          class="hidden md:block p-2 bg-primary text-white rounded-md hover:bg-primary-dark">
          {{ isSidebarCollapsed ? 'Expand' : 'Collapse' }} Sidebar
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="product in filteredProducts" :key="product.id"
          class="bg-white rounded-lg shadow-md overflow-hidden">
          <img :src="product.imageUrl || '/placeholder.svg?height=200&width=200'" :alt="product.name"
            class="w-full h-48 object-cover">
          <div class="p-4">
            <h2 class="text-lg font-semibold">{{ product.name }}</h2>
            <p class="text-sm text-gray-600 mb-2">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold">${{ product.basePrice.toFixed(2) }}</span>
              <div class="relative">
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
                    <a href="#" @click.prevent="viewProduct(product)"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View</a>
                    <a href="#" @click.prevent="editProduct(product)"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Edit</a>
                    <a href="#" @click.prevent="removeProduct(product)"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Remove</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import { useProductStore } from "@/stores/productStore"
import { useBranchStore } from "@/stores/branchStore"

const productStore = useProductStore()
const branchStore = useBranchStore()

const isSidebarCollapsed = ref(false)
const isSmallScreen = ref(window.innerWidth < 768)
const activeProductMenu = ref(null)

const products = ref([]);
// Branch filter
const selectedBranch = ref('all')

const categories = ref(['All']);
// const mainCategories = ref([]);
const branches = ref(['All'])

// Pagination state
const currentPage = ref(1)
const itemsPerPage = 5
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const filters = ref({
  categories: [],
  branch: "",
  onSale: false,
  lowStock: false,
  minPrice: "",
  maxPrice: "",
})

// const uniqueCategories = computed(() => [...new Set(products.value.map(p => p.category))]);

// const allCategories = computed(() => {
//   const categories = [...new Set(productStore.products.map((product) => product.category))]
//   return ["All", ...categories]
// })

// Use computed to track the reactive `fetchedCategories` from the store
const fetchedCategories = computed(() => branchStore.fetchedCategories)
const fetchedBranches = computed(() => branchStore.fetchedBranches)

// Watch the computed value and update `mainCategories` when `fetchedCategories` changes
// watch(fetchedCategories, (newCategories) => {
//   mainCategories.value = newCategories;
// }, { deep: true });
// Watch the computed value and update categories when fetchedCategories changes
watch(fetchedCategories, (newCategories) => {
  categories.value = ['All', ...newCategories];
}, { deep: true });

watch(fetchedBranches, (newBranches) => {
  branches.value = ['All', ...newBranches]
}, { deep: true });

const toggleCategory = (category) => {
  const index = filters.value.categories.indexOf(category)
  if (index > -1) {
    filters.value.categories.splice(index, 1)
  } else {
    filters.value.categories.push(category)
  }

  // If 'All' is selected, clear other selections
  if (category === "All" && filters.value.categories.includes("All")) {
    filters.value.categories = ["All"]
  } else if (filters.value.categories.length > 0 && filters.value.categories.includes("All")) {
    // If another category is selected and 'All' was previously selected, remove 'All'
    filters.value.categories = filters.value.categories.filter((c) => c !== "All")
  }

  // If no categories are selected, select 'All'
  if (filters.value.categories.length === 0) {
    filters.value.categories = ["All"]
  }
};

// // Watch for changes in activeTab or selectedBranch
// watch([activeTab, selectedBranch], () => {
//   currentPage.value = 1 // Reset to first page when filters change
// })

// // Paginated users based on the current page
// const paginatedUsers = computed(() => {
//   const start = (currentPage.value - 1) * itemsPerPage
//   const end = start + itemsPerPage
//   return filteredUsers.value.slice(start, end)
// })

// // Pagination methods
// const previousPage = () => {
//   if (currentPage.value > 1) currentPage.value--
// };

// const nextPage = () => {
//   if (currentPage.value < totalPages.value) currentPage.value++
// };

const filteredProducts = computed(() => {
  return productStore.products.filter((product) => {
    if (
      filters.value.categories.length > 0 &&
      !filters.value.categories.includes("All") &&
      !filters.value.categories.includes(product.category)
    )
      return false
    if (filters.value.branch && product.branchId !== filters.value.branch) return false
    if (filters.value.onSale && !product.onSale) return false
    if (filters.value.lowStock && product.stockQuantity > 10) return false
    if (filters.value.minPrice && product.basePrice < Number.parseFloat(filters.value.minPrice)) return false
    if (filters.value.maxPrice && product.basePrice > Number.parseFloat(filters.value.maxPrice)) return false
    return true
  })
})


const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const toggleProductMenu = (productId) => {
  activeProductMenu.value = activeProductMenu.value === productId ? null : productId
}

const viewProduct = (product) => {
  // Implement view product logic
  console.log("View product:", product)
}

const editProduct = (product) => {
  // Implement edit product logic
  console.log("Edit product:", product)
}

const removeProduct = (product) => {
  // Implement remove product logic
  console.log("Remove product:", product)
}

const handleResize = () => {
  isSmallScreen.value = window.innerWidth < 768
  if (!isSmallScreen.value) {
    isSidebarCollapsed.value = false
  }
}

onMounted(async () => {

  branchStore.fetchBranchesRealtime();
  branchStore.fetchCategoriesRealtime();

  productStore.setupRealtimeProducts();

  window.addEventListener("resize", handleResize);
})

onUnmounted(() => {

  branchStore.stopListening()

  window.removeEventListener("resize", handleResize);
})

watch(isSmallScreen, (newValue) => {
  if (!newValue) {
    isSidebarCollapsed.value = false
  }
})




// import { ref, computed, onMounted, onUnmounted, watch } from "vue"
// import { useProductStore } from "@/stores/productStore"
// import { useBranchStore } from "@/stores/branchStore"

// const productStore = useProductStore()
// const branchStore = useBranchStore()

// const isSidebarCollapsed = ref(false)
// const isSmallScreen = ref(window.innerWidth < 768)
// const activeProductMenu = ref(null)

// const filters = ref({
//   category: "",
//   branch: "",
//   onSale: false,
//   lowStock: false,
//   minPrice: "",
//   maxPrice: "",
// })

// const categories = computed(() => {
//   return [...new Set(productStore.products.map((product) => product.category))]
// })

// const branches = computed(() => branchStore.branches)

// const filteredProducts = computed(() => {
//   return productStore.products.filter((product) => {
//     if (filters.value.category && product.category !== filters.value.category) return false
//     if (filters.value.branch && product.branchId !== filters.value.branch) return false
//     if (filters.value.onSale && !product.onSale) return false
//     if (filters.value.lowStock && product.stockQuantity > 10) return false
//     if (filters.value.minPrice && product.basePrice < Number.parseFloat(filters.value.minPrice)) return false
//     if (filters.value.maxPrice && product.basePrice > Number.parseFloat(filters.value.maxPrice)) return false
//     return true
//   })
// })

// const toggleSidebar = () => {
//   isSidebarCollapsed.value = !isSidebarCollapsed.value
// }

// const toggleProductMenu = (productId) => {
//   activeProductMenu.value = activeProductMenu.value === productId ? null : productId
// }

// const viewProduct = (product) => {
//   // Implement view product logic
//   console.log("View product:", product)
// }

// const editProduct = (product) => {
//   // Implement edit product logic
//   console.log("Edit product:", product)
// }

// const removeProduct = (product) => {
//   // Implement remove product logic
//   console.log("Remove product:", product)
// }

// const handleResize = () => {
//   isSmallScreen.value = window.innerWidth < 768
//   if (!isSmallScreen.value) {
//     isSidebarCollapsed.value = false
//   }
// }

// onMounted(async () => {
//   await productStore.setupRealtimeProducts()
//   await branchStore.fetchBranchesRealtime()
//   window.addEventListener("resize", handleResize)
// })

// onUnmounted(() => {
//   window.removeEventListener("resize", handleResize)
// })

// watch(isSmallScreen, (newValue) => {
//   if (!newValue) {
//     isSidebarCollapsed.value = false
//   }
// })



// import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
// import { useProductStore } from '@/stores/productStore'
// import { useBranchStore } from '@/stores/branchStore'

// const productStore = useProductStore()
// const branchStore = useBranchStore()

// const isSidebarCollapsed = ref(false)
// const isSmallScreen = ref(window.innerWidth < 768)
// const activeProductMenu = ref(null)

// const filters = ref({
//   category: '',
//   branch: '',
//   onSale: false,
//   lowStock: false
// })

// const categories = computed(() => {
//   return [...new Set(productStore.products.map(product => product.category))]
// })

// const branches = computed(() => branchStore.branches)

// const filteredProducts = computed(() => {
//   return productStore.products.filter(product => {
//     if (filters.value.category && product.category !== filters.value.category) return false
//     if (filters.value.branch && product.branchId !== filters.value.branch) return false
//     if (filters.value.onSale && !product.onSale) return false
//     if (filters.value.lowStock && product.stockQuantity > 10) return false
//     return true
//   })
// })

// const toggleSidebar = () => {
//   if (isSmallScreen.value) {
//     isSmallScreen.value = !isSmallScreen.value
//   } else {
//     isSidebarCollapsed.value = !isSidebarCollapsed.value
//   }
// }

// const toggleProductMenu = (productId) => {
//   activeProductMenu.value = activeProductMenu.value === productId ? null : productId
// }

// const viewProduct = (product) => {
//   // Implement view product logic
//   console.log('View product:', product)
// }

// const editProduct = (product) => {
//   // Implement edit product logic
//   console.log('Edit product:', product)
// }

// const removeProduct = (product) => {
//   // Implement remove product logic
//   console.log('Remove product:', product)
// }

// const handleResize = () => {
//   isSmallScreen.value = window.innerWidth < 768
//   if (!isSmallScreen.value) {
//     isSidebarCollapsed.value = false
//   }
// }

// onMounted(async () => {
//   await productStore.setupRealtimeProducts()
//   await branchStore.fetchBranchesRealtime()
//   window.addEventListener('resize', handleResize)
// })

// onUnmounted(() => {
//   window.removeEventListener('resize', handleResize)
// })

// watch(isSmallScreen, (newValue) => {
//   if (!newValue) {
//     isSmallScreen.value = false
//   }
// })
</script>