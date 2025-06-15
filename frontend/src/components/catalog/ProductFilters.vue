<template>
    <div class="space-y-6">
        <!-- Category Filter -->
        <div>
            <h3 class="text-lg font-semibold mb-3 text-tBase-100">Categories</h3>
            <div class="flex flex-wrap gap-2">
                <button v-for="category in categories" :key="category" @click="selectCategory(category)"
                    class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200" :class="[
                        selectedCategory === category
                            ? 'bg-primary-600 text-white'
                            : 'bg-bgSecondary-0 text-tBase-80 hover:bg-bgSecondary-10'
                    ]">
                    {{ category }}
                </button>
            </div>
        </div>

        <!-- Sale Filter -->
        <div>
            <h3 class="text-lg font-semibold mb-3 text-tBase-100">Special Offers</h3>
            <div class="space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="filters.onSale" @change="updateFilters"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-tBase-80">On Sale</span>
                    <Tag class="h-4 w-4 text-red-500" />
                </label>

                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="filters.newArrivals" @change="updateFilters"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-tBase-80">New Arrivals</span>
                    <Sparkles class="h-4 w-4 text-blue-500" />
                </label>

                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="filters.mostBought" @change="updateFilters"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-tBase-80">Most Popular</span>
                    <TrendingUp class="h-4 w-4 text-green-500" />
                </label>
            </div>
        </div>

        <!-- Stock Filter -->
        <div>
            <h3 class="text-lg font-semibold mb-3 text-tBase-100">Availability</h3>
            <div class="space-y-2">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="filters.inStock" @change="updateFilters"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-tBase-80">In Stock</span>
                    <Package class="h-4 w-4 text-green-500" />
                </label>

                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="filters.lowStock" @change="updateFilters"
                        class="rounded border-gray-300 text-primary-600 focus:ring-primary-500">
                    <span class="text-sm text-tBase-80">Low Stock</span>
                    <AlertTriangle class="h-4 w-4 text-orange-500" />
                </label>
            </div>
        </div>

        <!-- Price Range Filter -->
        <div>
            <h3 class="text-lg font-semibold mb-3 text-tBase-100">Price Range</h3>
            <div class="space-y-3">
                <div class="flex items-center space-x-2">
                    <input type="number" v-model="filters.priceRange.min" @input="updateFilters" placeholder="Min"
                        class="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <span class="text-tBase-60">-</span>
                    <input type="number" v-model="filters.priceRange.max" @input="updateFilters" placeholder="Max"
                        class="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500">
                </div>
            </div>
        </div>

        <!-- Sort Options -->
        <div>
            <h3 class="text-lg font-semibold mb-3 text-tBase-100">Sort By</h3>
            <select v-model="filters.sortBy" @change="updateFilters"
                class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-bgPrimary-0 text-tBase-100">
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="popularity">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="stock">Stock Level</option>
            </select>
        </div>

        <!-- Clear Filters -->
        <button @click="clearFilters"
            class="w-full px-4 py-2 text-sm font-medium text-tBase-80 bg-bgSecondary-0 hover:bg-bgSecondary-10 rounded-md transition-colors duration-200">
            Clear All Filters
        </button>
    </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Tag, Sparkles, TrendingUp, Package, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
    categories: {
        type: Array,
        required: true,
    },
    selectedCategory: {
        type: String,
        default: "All",
    },
})

const emit = defineEmits(['select-category', 'update-filters'])

const filters = reactive({
    onSale: false,
    newArrivals: false,
    mostBought: false,
    inStock: false,
    lowStock: false,
    priceRange: {
        min: null,
        max: null
    },
    sortBy: 'name'
})

function selectCategory(category) {
    emit('select-category', category)
}

function updateFilters() {
    emit('update-filters', { ...filters })
}

function clearFilters() {
    Object.assign(filters, {
        onSale: false,
        newArrivals: false,
        mostBought: false,
        inStock: false,
        lowStock: false,
        priceRange: { min: null, max: null },
        sortBy: 'name'
    })
    updateFilters()
}
</script>
