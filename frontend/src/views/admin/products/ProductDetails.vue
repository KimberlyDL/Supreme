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
                    <div v-if="isDefaultVarietyOnSale" class="absolute top-4 right-4 z-10">
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
                            <!-- Check if default variety is on sale -->
                            <div v-if="isDefaultVarietyOnSale" class="flex items-center">
                                <span class="text-2xl font-bold text-red-600">₱{{ salePrice.toFixed(2) }}</span>
                                <span class="ml-5 text-xl font-bold line-through text-gray-500">₱{{
                                    regularPrice.toFixed(2) }}</span>
                            </div>
                            <!-- Otherwise just show regular price -->
                            <div v-else class="flex items-center gap-2">
                                <span class="text-2xl font-bold text-gray-900">₱{{ regularPrice.toFixed(2) }}</span>
                                <!-- Show upcoming sale badge if sale starts within a week -->
                                <span v-if="isSaleUpcoming"
                                    class="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Sale Soon
                                </span>
                            </div>
                        </div>

                        <!-- Sale information under price -->
                        <div v-if="defaultVariety?.onSale && defaultVariety?.sale" class="mt-2 text-sm">
                            <!-- For active sales -->
                            <div v-if="isDefaultVarietyOnSale" class="text-green-600">
                                Sale ends on {{ formatDate(defaultVariety.sale.endDate.seconds * 1000) }}
                            </div>
                            <!-- For upcoming sales -->
                            <div v-else-if="isSaleUpcoming" class="text-yellow-600">
                                Sale starts in {{ getDaysUntilSale() }} days ({{
                                    formatDate(defaultVariety.sale.startDate.seconds *
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
                            {{ stockDisplay }}
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
                                        <div v-if="isVarietyOnSale(variety)" class="flex flex-col">
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
                    <div v-if="hasAnySaleActive" class="mt-6">
                        <h2 class="text-lg font-semibold text-gray-800 mb-3">Sale Information</h2>
                        <div class="space-y-3">
                            <!-- Default variety sale info -->
                            <div v-if="defaultVariety?.onSale" class="bg-red-50 border border-red-100 rounded-lg p-4">
                                <div
                                    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 class="font-medium text-gray-800">{{ defaultVariety.name }} <span
                                                class="text-sm text-gray-500">(Default)</span></h3>
                                        <div class="flex items-center mt-1">
                                            <span class="text-gray-700 font-medium">Sale Price:</span>
                                            <span class="ml-2 text-red-600 font-bold text-xl">₱{{
                                                defaultVariety.sale.salePrice.toFixed(2) }}</span>
                                            <span class="ml-2 text-sm line-through text-gray-500">₱{{
                                                defaultVariety.price.toFixed(2)
                                            }}</span>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-1">
                                        <div v-if="isVarietyOnSale(defaultVariety)" class="text-green-600 text-sm">
                                            <span class="font-medium">Sale ends</span> {{
                                                formatDateRelative(defaultVariety.sale.endDate.seconds * 1000) }}
                                        </div>
                                        <div v-else-if="isSaleUpcoming" class="text-amber-600 text-sm">
                                            <span class="font-medium">Sale starts</span> {{
                                                formatDateRelative(defaultVariety.sale.startDate.seconds * 1000) }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Other varieties on sale -->
                            <div v-for="variety in otherVarietiesOnSale" :key="variety.name"
                                class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div
                                    class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                        <h3 class="font-medium text-gray-800">{{ variety.name }}</h3>
                                        <div class="flex items-center mt-1">
                                            <span class="text-gray-700 font-medium">Sale Price:</span>
                                            <span class="ml-2 text-red-600 font-bold text-xl">₱{{
                                                variety.sale.salePrice.toFixed(2)
                                            }}</span>
                                            <span class="ml-2 text-sm line-through text-gray-500">₱{{
                                                variety.price.toFixed(2) }}</span>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-1">
                                        <div v-if="isVarietyOnSale(variety)" class="text-green-600 text-sm">
                                            <span class="font-medium">Sale ends</span> {{
                                                formatDateRelative(variety.sale.endDate.seconds * 1000) }}
                                        </div>
                                        <div v-else class="text-amber-600 text-sm">
                                            <span class="font-medium">Sale starts</span> {{
                                                formatDateRelative(variety.sale.startDate.seconds * 1000) }}
                                        </div>
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

// Get default variety
const defaultVariety = computed(() => {
    return product.value?.varieties?.find(v => v.isDefault) || product.value?.varieties?.[0];
});

// Check if default variety is on sale
const isDefaultVarietyOnSale = computed(() => {
    if (!defaultVariety.value) return false;
    return isVarietyOnSale(defaultVariety.value);
});

// Get regular price
const regularPrice = computed(() => {
    return defaultVariety.value?.price || 0;
});

// Get sale price
const salePrice = computed(() => {
    if (!defaultVariety.value || !isDefaultVarietyOnSale.value) return regularPrice.value;
    return defaultVariety.value.sale.salePrice;
});

// Check if a variety is on sale
const isVarietyOnSale = (variety) => {
    if (!variety?.onSale || !variety?.sale) return false;

    const now = Date.now();
    const startDate = variety.sale.startDate?.seconds * 1000;
    const endDate = variety.sale.endDate?.seconds * 1000;

    return now >= startDate && now <= endDate;
};

// Check if sale is upcoming within a week
const isSaleUpcoming = computed(() => {
    if (!defaultVariety.value?.onSale || !defaultVariety.value?.sale) return false;

    const now = Date.now();
    const startDate = defaultVariety.value.sale.startDate.seconds * 1000;

    // Sale hasn't started yet
    if (now < startDate) {
        // Calculate days until sale starts
        const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
        // Return true if sale starts within 7 days
        return daysUntil <= 7;
    }

    return false;
});

// Check if any variety is on sale
const hasAnySaleActive = computed(() => {
    if (!product.value?.varieties) return false;
    return product.value.varieties.some(v => v.onSale);
});

// Get other varieties that are on sale (excluding default)
const otherVarietiesOnSale = computed(() => {
    if (!product.value?.varieties) return [];
    return product.value.varieties.filter(v =>
        v.onSale && v !== defaultVariety.value
    );
});

// Check if product has low stock
const isLowStock = computed(() => {
    if (!product.value) return false;

    // Check if any variety has low stock
    if (product.value.varieties && product.value.varieties.length > 0) {
        return product.value.varieties.some(v => v.stockQuantity <= 10);
    }

    return false;
});

// Get appropriate stock display text
const stockDisplay = computed(() => {
    if (!product.value) return '';

    if (product.value.varieties && product.value.varieties.length > 0) {
        const totalStock = product.value.varieties.reduce((sum, v) => sum + v.stockQuantity, 0);
        const lowStockVarieties = product.value.varieties.filter(v => v.stockQuantity <= 10);

        if (lowStockVarieties.length > 0) {
            return `${totalStock} units total (${lowStockVarieties.length} varieties low in stock)`;
        }
        return `${totalStock} units total`;
    }

    return '0 units';
});

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

// Get number of days until sale starts
const getDaysUntilSale = () => {
    if (!defaultVariety.value?.sale) return 0;

    const now = Date.now();
    const startDate = defaultVariety.value.sale.startDate.seconds * 1000;

    return Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
};

// Format date in a more user-friendly way
const formatDateRelative = (timestamp) => {
    const now = Date.now();
    const date = new Date(timestamp);
    const diffDays = Math.ceil(Math.abs(date - now) / (1000 * 60 * 60 * 24));

    if (date < now) {
        // Date is in the past
        if (diffDays <= 1) return "today";
        if (diffDays < 7) return `in ${diffDays} days`;
        return `on ${formatDate(timestamp)}`;
    } else {
        // Date is in the future
        if (diffDays <= 1) return "today";
        if (diffDays < 7) return `in ${diffDays} days`;
        return `on ${formatDate(timestamp)}`;
    }
};

// Fix the initializeCarousel function to properly handle the carousel
const initializeCarousel = () => {
    if (!product.value || !product.value.imageUrls || product.value.imageUrls.length === 0) return;

    const images = [];
    const indicators = [];

    // Create arrays for images and indicators
    for (let i = 0; i < product.value.imageUrls.length; i++) {
        const imageEl = document.getElementById(`image-${i + 1}`);
        const indicatorEl = document.getElementById(`carousel-indicator-${i + 1}`);

        if (imageEl) {
            images.push({
                position: i,
                el: imageEl
            });
        }

        if (indicatorEl) {
            indicators.push({
                position: i,
                el: indicatorEl
            });
        }
    }

    const carouselElement = document.getElementById('product-carousel');
    if (!carouselElement || images.length === 0) return;

    // Configure carousel based on number of images
    const options = {
        defaultPosition: 0,
        indicators: product.value.imageUrls.length > 1,
        interval: product.value.imageUrls.length > 1 ? 3000 : 0,
        indicators: {
            activeClasses: 'bg-white dark:bg-gray-800',
            inactiveClasses: 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
            items: indicators,
        },
    };

    // instance options object
    const instanceOptions = {
        id: 'product-carousel',
        override: true
    };

    try {
        carouselInstance.value = new Carousel(carouselElement, images, options, instanceOptions);

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