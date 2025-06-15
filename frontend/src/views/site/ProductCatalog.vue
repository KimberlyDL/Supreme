<template>
    <div class="min-h-screen bg-bgPrimary-0">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>

        <template v-else>
            <!-- Header Section -->
            <div class="bg-bgSecondary-0 border-b border-gray-200 dark:border-gray-700">
                <div class="container mx-auto px-4 py-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-tBase-100">{{ branchName }} Store</h1>
                            <p class="text-tBase-80 mt-1">{{ branchAddress }}</p>
                        </div>
                        <div class="flex items-center space-x-4">
                            <!-- Branch Switcher -->
                            <select 
                                v-model="selectedBranchSlug" 
                                @change="switchBranch"
                                class="border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-bgPrimary-0 text-tBase-100"
                            >
                                <option v-for="branch in catalogStore.branches" :key="branch.id" :value="branch.slug">
                                    {{ branch.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <!-- Search Bar -->
                    <div class="relative">
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            placeholder="Search products..."
                            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-bgPrimary-0 text-tBase-100" 
                        />
                        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-tBase-60 h-5 w-5" />
                    </div>
                </div>
            </div>

            <div class="container mx-auto px-4 py-8">
                <!-- Special Sections -->
                <NewOffers 
                    :products="catalogStore.products" 
                    @add-to-cart="addToCart"
                    class="mb-8"
                />
                
                <NewArrivals 
                    :products="catalogStore.products" 
                    @add-to-cart="addToCart"
                    class="mb-8"
                />
                
                <PopularProducts 
                    :products="catalogStore.products" 
                    @add-to-cart="addToCart"
                    class="mb-8"
                />

                <!-- Main Content -->
                <div class="flex flex-col lg:flex-row gap-8">
                    <!-- Sidebar Filters -->
                    <div class="w-full lg:w-80 flex-shrink-0">
                        <div class="sticky top-4 bg-bgSecondary-0 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <ProductFilters 
                                :categories="catalogStore.categories" 
                                :selectedCategory="selectedCategory"
                                @select-category="setCategory"
                                @update-filters="updateFilters"
                            />
                        </div>
                    </div>

                    <!-- Product Grid -->
                    <div class="flex-grow">
                        <!-- Results Header -->
                        <div class="flex items-center justify-between mb-6">
                            <div class="text-tBase-80">
                                Showing {{ filteredProducts.length }} products
                                <span v-if="selectedCategory !== 'All'">in "{{ selectedCategory }}"</span>
                                <span v-if="searchQuery">for "{{ searchQuery }}"</span>
                            </div>
                            
                            <!-- View Toggle -->
                            <div class="flex items-center space-x-2">
                                <button 
                                    @click="viewMode = 'grid'"
                                    :class="viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-bgSecondary-0 text-tBase-80'"
                                    class="p-2 rounded-md transition-colors duration-200"
                                >
                                    <Grid3X3 class="h-4 w-4" />
                                </button>
                                <button 
                                    @click="viewMode = 'list'"
                                    :class="viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-bgSecondary-0 text-tBase-80'"
                                    class="p-2 rounded-md transition-colors duration-200"
                                >
                                    <List class="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <!-- No Results -->
                        <div v-if="filteredProducts.length === 0" class="text-center py-12">
                            <div class="text-tBase-40 mb-4">
                                <ShoppingBag class="h-16 w-16 mx-auto" />
                            </div>
                            <h3 class="text-xl font-medium text-tBase-80 mb-2">No products found</h3>
                            <p class="text-tBase-60">
                                Try changing your search or filter criteria
                            </p>
                            <button 
                                @click="clearAllFilters"
                                class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200"
                            >
                                Clear All Filters
                            </button>
                        </div>

                        <!-- Product Grid/List -->
                        <div v-else>
                            <div 
                                v-if="viewMode === 'grid'"
                                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            >
                                <ProductCard 
                                    v-for="product in filteredProducts" 
                                    :key="product.id"
                                    :product="product" 
                                    @add-to-cart="addToCart" 
                                />
                            </div>
                            
                            <div v-else class="space-y-4">
                                <ProductListItem 
                                    v-for="product in filteredProducts" 
                                    :key="product.id"
                                    :product="product" 
                                    @add-to-cart="addToCart" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useCatalogStore } from "@/stores/catalogStore"
import { useCartStore } from "@/stores/cartStore"
import { Search, ShoppingBag, Grid3X3, List } from "lucide-vue-next"
import ProductCard from "@/components/catalog/ProductCard.vue"
import ProductListItem from "@/components/catalog/ProductListItem.vue"
import ProductFilters from "@/components/catalog/ProductFilters.vue"
import NewOffers from "@/components/catalog/NewOffers.vue"
import NewArrivals from "@/components/catalog/NewArrivals.vue"
import PopularProducts from "@/components/catalog/PopularProducts.vue"

const route = useRoute()
const router = useRouter()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()

// Local state
const loading = ref(true)
const searchQuery = ref("")
const selectedCategory = ref("All")
const selectedBranchSlug = ref("")
const viewMode = ref('grid')
const activeFilters = ref({})

// Initialize branch slug from route params or default branch
if (route.params.branchSlug) {
    selectedBranchSlug.value = route.params.branchSlug;
}

// Computed properties
const branchName = computed(() => {
    const branch = catalogStore.branches.find(b => b.slug === selectedBranchSlug.value)
    return branch?.name || 'Product Catalog'
})

const branchAddress = computed(() => {
    const branch = catalogStore.branches.find(b => b.slug === selectedBranchSlug.value)
    return branch?.address || ''
})

const filteredProducts = computed(() => {
    let products = catalogStore.filteredProducts

    // Apply additional filters
    if (activeFilters.value.onSale) {
        products = products.filter(product => 
            product.varieties.some(variety => variety.sale && new Date(variety.sale.endDate) > new Date())
        )
    }

    if (activeFilters.value.newArrivals) {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        products = products.filter(product => new Date(product.createdAt) >= thirtyDaysAgo)
    }

    if (activeFilters.value.mostBought) {
        products = products.filter(product => (product.totalOrders || 0) > 0)
    }

    if (activeFilters.value.inStock) {
        products = products.filter(product => 
            product.varieties.some(v => (v.stockQuantity || 0) > 0)
        )
    }

    if (activeFilters.value.lowStock) {
        products = products.filter(product => 
            product.varieties.some(v => (v.stockQuantity || 0) > 0 && (v.stockQuantity || 0) <= 5)
        )
    }

    // Price range filter
    if (activeFilters.value.priceRange?.min || activeFilters.value.priceRange?.max) {
        products = products.filter(product => {
            const minPrice = Math.min(...product.varieties.map(v => v.price || 0))
            const maxPrice = Math.max(...product.varieties.map(v => v.price || 0))
            
            const filterMin = activeFilters.value.priceRange.min || 0
            const filterMax = activeFilters.value.priceRange.max || Infinity
            
            return maxPrice >= filterMin && minPrice <= filterMax
        })
    }

    // Sort products
    if (activeFilters.value.sortBy) {
        products = [...products].sort((a, b) => {
            switch (activeFilters.value.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'price-low':
                    return getMinPrice(a) - getMinPrice(b)
                case 'price-high':
                    return getMinPrice(b) - getMinPrice(a)
                case 'popularity':
                    return (b.totalOrders || 0) - (a.totalOrders || 0)
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt)
                case 'stock':
                    return getTotalStock(b) - getTotalStock(a)
                default:
                    return 0
            }
        })
    }

    return products
})

// Watch for route changes
watch(() => route.params.branchSlug, async (newSlug) => {
    if (newSlug && newSlug !== selectedBranchSlug.value) {
        selectedBranchSlug.value = newSlug
        await setBranchFromSlug(newSlug)
    }
}, { immediate: true })

// Watch for search query changes
watch(searchQuery, (newQuery) => {
    catalogStore.setSearchQuery(newQuery)
})

// Watch for category changes
watch(selectedCategory, (newCategory) => {
    catalogStore.setCategory(newCategory)
})

// Methods
function setCategory(category) {
    selectedCategory.value = category
}

function updateFilters(filters) {
    activeFilters.value = filters
}

function clearAllFilters() {
    selectedCategory.value = "All"
    searchQuery.value = ""
    activeFilters.value = {}
}

function getMinPrice(product) {
    return Math.min(...product.varieties.map(v => v.price || 0))
}

function getTotalStock(product) {
    return product.varieties.reduce((sum, v) => sum + (v.stockQuantity || 0), 0)
}

async function setBranchFromSlug(slug) {
    const branch = catalogStore.branches.find(b => b.slug === slug)
    if (branch) {
        await catalogStore.setBranch(branch.id)
    }
}

function switchBranch() {
    router.push(`/products/${selectedBranchSlug.value}`)
}

function addToCart(item) {
    const branch = catalogStore.branches.find(b => b.slug === selectedBranchSlug.value)
    item = {
        ...item,
        branch: branch?.id,
    }

    console.log("Adding to cart:", item)
    cartStore.addItem(item)
}

// Lifecycle hooks
onMounted(async () => {
    await catalogStore.initialize()
    
    // Set branch from route or default
    if (route.params.branchSlug) {
        selectedBranchSlug.value = route.params.branchSlug
        await setBranchFromSlug(route.params.branchSlug)
    } else if (catalogStore.branches.length > 0) {
        selectedBranchSlug.value = catalogStore.branches[0].slug
        router.replace(`/products/${selectedBranchSlug.value}`)
    }
    
    loading.value = false
})

onUnmounted(() => {
    catalogStore.cleanup()
})
</script>
