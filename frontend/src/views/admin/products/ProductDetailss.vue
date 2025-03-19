<!-- frontend\src\views\admin\products\ProductDetails.vue -->
<template>
    <div class="container mx-auto px-4 py-8">
        <div v-if="product">
            <div class="mb-6 flex justify-between items-center">
                <button @click="goBack" class="flex items-center text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon class="w-5 h-5 mr-2" />
                    Back to Products
                </button>
                <button @click="editProduct" class="flex items-center text-primary hover:text-primary-dark">
                    <PencilIcon class="w-5 h-5 mr-2" />
                    Edit Product
                </button>
            </div>

            <div class="bg-white shadow-lg rounded-lg overflow-hidden">
                <!-- Product Image Carousel -->
                <div class="relative">
                    <!-- Sale Badge -->
                    <div v-if="isSaleActive(product.sale)" class="absolute top-4 right-4 z-10">
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                            Sale
                        </span>
                    </div>

                    <!-- Low Stock Badge -->
                    <div v-if="isLowStock" class="absolute top-4 left-4 z-10">
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                            Low Stock
                        </span>
                    </div>

                    <!-- Carousel -->
                    <div id="product-carousel" class="relative w-full">
                        <!-- Carousel wrapper -->
                        <div class="relative h-64 md:h-96 overflow-hidden">
                            <template v-if="product.imageUrls && product.imageUrls.length > 0">
                                <div v-for="(imageUrl, index) in product.imageUrls" :key="index"
                                    class="hidden duration-700 ease-in-out" :id="`image-${index + 1}`">
                                    <img :src="imageUrl" :alt="`${product.name} - Image ${index + 1}`"
                                        class="absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 object-contain"
                                        @error="handleImageError($event, `${product.id}-${index}`)" />
                                </div>
                            </template>
                            <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-100">
                                <span class="text-gray-400">No image available</span>
                            </div>
                        </div>

                        <!-- Only show controls and indicators if there are multiple images -->
                        <template v-if="product.imageUrls && product.imageUrls.length > 1">
                            <!-- Slider indicators -->
                            <div
                                class="absolute z-30 flex -translate-x-1/2 space-x-3 rtl:space-x-reverse bottom-5 left-1/2">
                                <button v-for="(_, index) in product.imageUrls" :key="index" type="button"
                                    class="w-3 h-3 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
                                    :id="`carousel-indicator-${index + 1}`" :aria-current="index === 0"
                                    :aria-label="`Slide ${index + 1}`">
                                </button>
                            </div>

                            <!-- Slider controls -->
                            <button type="button" id="data-carousel-prev"
                                class="absolute top-0 start-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none">
                                <span
                                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70">
                                    <svg class="h-4 w-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="M5 1 1 5l4 4" />
                                    </svg>
                                    <span class="hidden">Previous</span>
                                </span>
                            </button>
                            <button type="button" id="data-carousel-next"
                                class="absolute top-0 end-0 z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none">
                                <span
                                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/30 group-hover:bg-white/50 group-focus:ring-4 group-focus:ring-white dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70">
                                    <svg class="h-4 w-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="2" d="m1 9 4-4-4-4" />
                                    </svg>
                                    <span class="hidden">Next</span>
                                </span>
                            </button>
                        </template>
                    </div>
                </div>

                <!-- Product Details -->
                <div class="p-8">
                    <div class="flex justify-between items-center mb-5">
                        <h1 class="text-3xl font-bold text-gray-800">{{ product.name }}</h1>
                    </div>

                    <!-- Price Display with Sale Information -->
                    <div class="mt-4 flex flex-col">
                        <div class="flex items-center">
                            <!-- Check if product has sale and it's currently active -->
                            <div v-if="isSaleActive(product.sale)" class="flex items-center">
                                <span class="text-2xl font-bold text-red-600">₱{{ product.sale.salePrice.toFixed(2)
                                    }}</span>
                                <span class="ml-5 text-xl font-bold line-through text-gray-500">₱{{
                                    product.basePrice.toFixed(2)
                                    }}</span>
                            </div>
                            <!-- Otherwise just show base price -->
                            <div v-else class="flex items-center gap-2">
                                <span class="text-2xl font-bold text-gray-900">₱{{ product.basePrice.toFixed(2)
                                    }}</span>
                                <!-- Show upcoming sale badge if sale starts within a week -->
                                <span v-if="isSaleUpcoming(product.sale)"
                                    class="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Sale Soon
                                </span>
                            </div>
                        </div>

                        <!-- Sale information under price -->
                        <div v-if="product.sale && product.sale.onSale" class="mt-2 text-sm">
                            <!-- For active sales -->
                            <div v-if="isSaleActive(product.sale)" class="text-green-600">
                                Sale ends on {{ formatDate(product.sale.endDate.seconds * 1000) }}
                            </div>
                            <!-- For upcoming sales -->
                            <div v-else-if="isSaleUpcoming(product.sale)" class="text-yellow-600">
                                Sale starts in {{ getDaysUntilSale(product.sale) }} days ({{
                                    formatDate(product.sale.startDate.seconds *
                                1000) }})
                            </div>
                        </div>
                    </div>

                    <!-- Stock Information -->
                    <div class="mt-4 flex items-center">
                        <span class="text-gray-600 font-medium">Stock:</span>
                        <span :class="[
                            'ml-2 font-semibold',
                            isLowStock ? 'text-red-600' : 'text-gray-900'
                        ]">
                            {{ getStockDisplay() }}
                        </span>
                    </div>

                    <!-- Description -->
                    <div class="mt-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                        <p class="text-gray-600">{{ product.description || 'No description available.' }}</p>
                    </div>

                    <!-- Categories -->
                    <div class="mt-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-2">Categories</h2>
                        <div class="flex flex-wrap gap-2">
                            <template v-if="product.category && product.category.length > 0">
                                <span v-for="(cat, index) in product.category" :key="index"
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                    {{ cat }}
                                </span>
                            </template>
                            <template v-else>
                                <span
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                    Uncategorized
                                </span>
                            </template>
                        </div>
                    </div>

                    <!-- Varieties Section -->
                    <div v-if="product.varieties && product.varieties.length > 0" class="mt-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-3">Varieties</h2>
                        <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <div v-for="(variety, index) in product.varieties" :key="index"
                                class="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <h3 class="font-medium text-gray-900">{{ variety.name }}</h3>
                                        <p class="text-sm text-gray-600">{{ variety.quantity }} {{ variety.unit }}</p>
                                    </div>
                                    <div class="text-right">
                                        <div v-if="variety.onSale && isVarietySaleActive(variety)"
                                            class="flex flex-col">
                                            <span class="font-bold text-red-600">₱{{ variety.sale.salePrice.toFixed(2)
                                                }}</span>
                                            <span class="text-sm line-through text-gray-500">₱{{
                                                variety.price.toFixed(2) }}</span>
                                        </div>
                                        <div v-else class="font-bold text-gray-900">₱{{ variety.price.toFixed(2) }}
                                        </div>
                                        <div :class="[
                                            'text-xs mt-1',
                                            variety.stockQuantity <= 10 ? 'text-red-600 font-medium' : 'text-gray-600'
                                        ]">
                                            Stock: {{ variety.stockQuantity }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sale Information Section -->
                    <div v-if="product.sale && product.sale.onSale" class="mt-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-3">Sale Information</h2>
                        <div class="bg-red-50 border border-red-100 rounded-lg p-4">
                            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div class="flex items-center">
                                    <span class="text-gray-700 font-medium">Sale Price:</span>
                                    <span class="ml-2 text-red-600 font-bold text-xl">₱{{
                                        product.sale.salePrice.toFixed(2) }}</span>
                                </div>

                                <div class="flex flex-col md:flex-row gap-4 md:gap-8">
                                    <div>
                                        <span class="text-gray-700 font-medium">From:</span>
                                        <span class="ml-2">{{ formatDate(product.sale.startDate.seconds * 1000)
                                            }}</span>
                                    </div>

                                    <div>
                                        <span class="text-gray-700 font-medium">To:</span>
                                        <span class="ml-2">{{ formatDate(product.sale.endDate.seconds * 1000) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-between p-8 border-t border-gray-200">
                    <button @click="goBack"
                        class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded">
                        Back to Products
                    </button>
                    <button @click="editProduct"
                        class="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded flex items-center">
                        <PencilIcon class="w-4 h-4 mr-2" />
                        Edit Product
                    </button>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mb-4"></div>
            <p class="text-xl text-gray-600">Loading product details...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { Carousel } from 'flowbite';
import { PencilIcon, ArrowLeftIcon } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const productId = ref(null);
const product = ref(null);
const carouselInstance = ref(null);

// Check if any variety has low stock
const isLowStock = computed(() => {
    if (!product.value) return false;

    // Check varieties first
    if (product.value.varieties && product.value.varieties.length > 0) {
        return product.value.varieties.some(v => v.stockQuantity <= 10);
    }

    // Fall back to main product stock
    return product.value.stockQuantity <= 10;
});

// Get appropriate stock display text
const getStockDisplay = () => {
    if (!product.value) return '';

    if (product.value.varieties && product.value.varieties.length > 0) {
        const totalStock = product.value.varieties.reduce((sum, v) => sum + v.stockQuantity, 0);
        const lowStockVarieties = product.value.varieties.filter(v => v.stockQuantity <= 10);

        if (lowStockVarieties.length > 0) {
            return `${totalStock} units total (${lowStockVarieties.length} varieties low in stock)`;
        }
        return `${totalStock} units total`;
    }

    return `${product.value.stockQuantity} units`;
};

const goBack = () => {
    router.push('/administrator/products');
};

const editProduct = () => {
    router.push(`/administrator/products/${productId.value}/edit`);
};

const handleImageError = (event, imageId) => {
    console.error(`Failed to load image: ${imageId}`);
    event.target.src = '/placeholder.svg?height=400&width=400';
};

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    return `${month} ${day}, ${year}`;
};

// Check if a sale is currently active
const isSaleActive = (sale) => {
    if (!sale || !sale.onSale) return false;

    const now = Date.now();
    const startDate = sale.startDate.seconds * 1000;
    const endDate = sale.endDate.seconds * 1000;

    return now >= startDate && now <= endDate;
};

// Check if a variety's sale is active
const isVarietySaleActive = (variety) => {
    if (!variety || !variety.onSale || !variety.sale) return false;

    const now = Date.now();
    const startDate = variety.sale.startDate.seconds * 1000;
    const endDate = variety.sale.endDate.seconds * 1000;

    return now >= startDate && now <= endDate;
};

// Check if a sale is upcoming within a week
const isSaleUpcoming = (sale) => {
    if (!sale || !sale.onSale) return false;

    const now = Date.now();
    const startDate = sale.startDate.seconds * 1000;

    // Sale hasn't started yet
    if (now < startDate) {
        // Calculate days until sale starts
        const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
        // Return true if sale starts within 7 days
        return daysUntil <= 7;
    }

    return false;
};

// Get number of days until sale starts
const getDaysUntilSale = (sale) => {
    if (!sale) return 0;

    const now = Date.now();
    const startDate = sale.startDate.seconds * 1000;

    return Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
};

const initializeCarousel = () => {
    const images = ref([]);
    const indicators = ref([]);

    if (product.value.imageUrls && product.value.imageUrls.length >= 1) {
        // Create arrays for images and indicators
        for (let i = 0; i < product.value.imageUrls.length; i++) {
            images.value.push({
                position: i,
                el: document.getElementById(`image-${i + 1}`)
            });

            indicators.value.push({
                position: i,
                el: document.getElementById(`carousel-indicator-${i + 1}`)
            });
        }
    }

    const carouselElement = document.getElementById('product-carousel');
    if (!carouselElement) return;

    const items = images.value;

    // Configure carousel based on number of images
    const options = {
        defaultPosition: 0,
        indicators: product.value.imageUrls.length > 1,
        interval: product.value.imageUrls.length > 1 ? 3000 : 0,
        indicators: {
            activeClasses: 'bg-white dark:bg-gray-800',
            inactiveClasses: 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
            items: indicators.value,
        },
    };

    // instance options object
    const instanceOptions = {
        id: 'product-carousel',
        override: true
    };

    try {
        carouselInstance.value = new Carousel(carouselElement, items, options, instanceOptions);

        // Only set up controls if there are multiple images
        if (product.value.imageUrls.length > 1) {
            // Set up prev/next buttons
            const prevButton = document.getElementById('data-carousel-prev');
            const nextButton = document.getElementById('data-carousel-next');

            prevButton?.addEventListener('click', () => carouselInstance.value.prev());
            nextButton?.addEventListener('click', () => carouselInstance.value.next());
        }
    } catch (error) {
        console.error('Error initializing carousel:', error);
    }
};

onMounted(async () => {
    productId.value = route.params.id;
    product.value = await productStore.getProductById(productId.value);

    if (product.value && product.value.imageUrls?.length > 0) {
        // Wait for the DOM to be updated
        await nextTick();
        setTimeout(initializeCarousel, 0);
    }
});

onUnmounted(() => {
    // Clean up event listeners and carousel instance
    if (carouselInstance.value) {
        const prevButton = document.getElementById('data-carousel-prev');
        const nextButton = document.getElementById('data-carousel-next');

        prevButton?.removeEventListener('click', () => carouselInstance.value.prev());
        nextButton?.removeEventListener('click', () => carouselInstance.value.next());
    }
});
</script>