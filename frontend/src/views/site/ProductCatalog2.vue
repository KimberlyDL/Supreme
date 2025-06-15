<!-- frontend\src\views\site\ProductCatalog.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>

        <template v-else>
            <!-- Header Section -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-4">Product Catalog</h1>

                <!-- Branch Selector -->
                <BranchSelector :branches="catalogStore.branches" v-model="selectedBranchId" />

                <!-- Search Bar -->
                <div class="relative mb-6">
                    <input v-model="searchQuery" type="text" placeholder="Search products..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex flex-col md:flex-row gap-8">
                <!-- Sidebar -->
                <div class="w-full md:w-64 flex-shrink-0">
                    <CategoryFilter :categories="catalogStore.categories" :selectedCategory="selectedCategory"
                        @select-category="setCategory" />
                </div>

                <!-- Product Grid -->
                <div class="flex-grow">
                    <div v-if="catalogStore.filteredProducts.length === 0" class="text-center py-12">
                        <div class="text-gray-400 mb-4">
                            <ShoppingBag class="h-16 w-16 mx-auto" />
                        </div>
                        <h3 class="text-xl font-medium text-gray-700 mb-2">No products found</h3>
                        <p class="text-gray-500">
                            Try changing your search or filter criteria
                        </p>
                    </div>

                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <ProductCard v-for="product in catalogStore.filteredProducts" :key="product.id"
                            :product="product" @add-to-cart="addToCart" />
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue"
import { useCatalogStore } from "@/stores/catalogStore"
import { useCartStore } from "@/stores/cartStore"
import { Search, ShoppingBag } from "lucide-vue-next"
import ProductCard from "@/components/catalog/ProductCard.vue"
import CategoryFilter from "@/components/catalog/CategoryFilter.vue"
import BranchSelector from "@/components/catalog/BranchSelector.vue"

// Store initialization
const catalogStore = useCatalogStore()
const cartStore = useCartStore()

// Local state
const loading = ref(true)
const searchQuery = ref("")
const selectedCategory = ref("All")
const selectedBranchId = ref(null)

// Watch for search query changes
watch(searchQuery, (newQuery) => {
    catalogStore.setSearchQuery(newQuery)
})

// Watch for category changes
watch(selectedCategory, (newCategory) => {
    catalogStore.setCategory(newCategory)
})

// Watch for branch changes
watch(selectedBranchId, (newBranchId) => {
    if (newBranchId) {
        catalogStore.setBranch(newBranchId)
    }
})

// Watch for filtered products changes
watch(
    () => catalogStore.filteredProducts,
    (newProducts) => {
        console.log("Filtered Products Updated:", newProducts)
    },
)

// Methods
function setCategory(category) {
    selectedCategory.value = category
}

function addToCart(item) {
    item = {
        ...item,
        branch: selectedBranchId.value, // Default quantity to 1
    }

    console.log("Adding to cart:", item);

    cartStore.addItem(item)
    // Toast notification or alert here if needed
}

// Lifecycle hooks
onMounted(async () => {
    await catalogStore.initialize()
    selectedBranchId.value = catalogStore.selectedBranchId
    loading.value = false
})

onUnmounted(() => {
    catalogStore.cleanup()
})

</script>