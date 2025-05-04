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
                                <input type="checkbox" :value="category"
                                    :checked="productStore.filters.categories.includes(category)"
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
                            <input v-model="productStore.filters.minPrice" type="number" placeholder="Min"
                                @change="applyFilters" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            <span>-</span>
                            <input v-model="productStore.filters.maxPrice" type="number" placeholder="Max"
                                @change="applyFilters" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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

        <!-- Main content area -->
        <main :class="[
            'flex-1',
            { 'md:pr-[320px]': !isDetailsCollapsed && !isSmallScreen }
        ]">
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
                        <Filter class="inline-block w-5 h-5" />
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
                        </ul>
                    </div>
                </div>
            </header>

            <!-- Product Grid - adjust columns based on details panel -->
            <div class="relative z-10 grid gap-4 p-4" :class="[
                isDetailsCollapsed || isSmallScreen ?
                    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            ]">
                <ProductCard v-for="product in productStore.products" :key="product.id" :product="product"
                    @toggleDetails="toggleDetails" @view="viewProduct" @toggle-menu="toggleDropdown" />

                <!-- Dropdown menus for each product -->
                <div v-for="product in productStore.products" :key="`dropdown-${product.id}`">
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
            </div>

            <!-- Loading and End of List States -->
            <div v-if="productStore.loading" class="text-center mt-4 p-4">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent">
                </div>
                <p class="mt-2 text-gray-600">Loading products...</p>
            </div>
            <div v-if="!productStore.loading && !productStore.hasMore" class="text-center mt-4 p-4">
                <p class="text-gray-600">No more products to load.</p>
            </div>
        </main>

        <!-- Product Details Sidebar -->
        <aside :class="[
            'fixed top-0 right-0 h-full w-[320px] transform transition-transform duration-200 ease-in-out z-30',
            isDetailsCollapsed ? 'translate-x-full' : 'translate-x-0',
            { 'hidden': isSmallScreen }
        ]">
            <ProductDetailsSidePanel :product="selectedProduct" @view="viewProduct" @edit="editProduct"
                @close="toggleSidebarDetail" />
        </aside>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import router from '@/router';
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useBranchStore } from "@/stores/branchStore";
import { useModalStore } from "@/stores/modalStore";
import ProductCard from "@/components/shared/ProductCard.vue";
import ProductDetailsSidePanel from "@/components/shared/ProductDetailsSidePanel.vue";
import AddProductForm from "@/components/modal/AddProductForm.vue";
import AddCategoryForm from "@/components/modal/AddCategoryForm.vue";
import { initDropdowns, initCarousels } from 'flowbite';
import { Dropdown } from 'flowbite';
import { Info, Filter, Plus, SquarePlus, ShoppingBasket, Image } from 'lucide-vue-next';

const modal = useModalStore();
const productStore = useProductStore();
const branchStore = useBranchStore();
const categoryStore = useCategoryStore();

const isFilterCollapsed = ref(false);
const isDetailsCollapsed = ref(true);
const isSmallScreen = ref(window.innerWidth < 768);

const categories = ref(['All']);
const branches = ref(['All']);
const selectedProduct = ref(null);
const imageLoadError = ref({});

// Add these variables
const showFullDescription = ref(false);

// Handle image loading errors
const handleImageError = (event, imageId) => {
    imageLoadError.value[imageId] = true;
    event.target.src = '/placeholder.svg?height=200&width=200';
};

// Check if a product is on sale
const isProductOnSale = (product) => {
    if (!product.sale || !product.sale.onSale) return false;

    const now = Date.now();
    const startDate = product.sale.startDate.seconds * 1000;
    const endDate = product.sale.endDate.seconds * 1000;

    return now >= startDate && now <= endDate;
};

// // Use computed to track the reactive fetchedCategories from the store
// const fetchedCategories = computed(() => branchStore.fetchedCategories);
// const fetchedBranches = computed(() => branchStore.fetchedBranches);

// Use computed to track the reactive fetchedCategories from the store
const fetchedCategories = computed(() => categoryStore.fetchedCategories);
const fetchedBranches = computed(() => branchStore.fetchedBranches);

// Watch the computed value and update categories when fetchedCategories changes
watch(fetchedCategories, (newCategories) => {
    categories.value = ['All', ...newCategories];
}, { deep: true });

watch(fetchedBranches, (newBranches) => {
    branches.value = ['All', ...newBranches];
}, { deep: true });

const toggleCategory = (category) => {
    const index = productStore.filters.categories.indexOf(category);
    if (index > -1) {
        productStore.filters.categories.splice(index, 1);
    } else {
        productStore.filters.categories.push(category);
    }

    // If 'All' is selected, clear other selections
    if (category === "All" && productStore.filters.categories.includes("All")) {
        productStore.filters.categories = ["All"];
    } else if (productStore.filters.categories.length > 0 && productStore.filters.categories.includes("All")) {
        // If another category is selected and 'All' was previously selected, remove 'All'
        productStore.filters.categories = productStore.filters.categories.filter((c) => c !== "All");
    }

    // If no categories are selected, select 'All'
    if (productStore.filters.categories.length === 0) {
        productStore.filters.categories = ["All"];
    }

    applyFilters();
};

const applyFilters = () => {
    productStore.fetchProducts(true);
};

const toggleSidebarFilter = () => {
    isFilterCollapsed.value = !isFilterCollapsed.value;
};

const toggleSidebarDetail = () => {
    isDetailsCollapsed.value = !isDetailsCollapsed.value;
};

// Store dropdown instances
const dropdownInstances = ref(new Map());
const activeDropdownId = ref(null);

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

const viewProduct = (product) => {
    if (product) {
        console.log('hello');
        selectedProduct.value = product;

        setTimeout(() => {
            router.push({ name: 'ProductDetails', params: { id: product.id } });
        }, 10);
    }
};

const toggleDetails = (product) => {
    if (product) {
        selectedProduct.value = product;

        if (!isSmallScreen.value) {
            isDetailsCollapsed.value = false;
            setTimeout(() => {
                initCarousels();
            }, 0);
        } else {
            // On mobile, navigate directly to product details page
            setTimeout(() => {
                router.push({ name: 'ProductDetails', params: { id: product.id } });
            }, 10);
        }
    }
}

const editProduct = (product) => {
    setTimeout(() => {
        router.push(`/administrator/products/${product.id}/edit`);
    }, 10);
};

const deletingProduct = ref(false);

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
};

// Handle window resize
const handleResize = () => {
    isSmallScreen.value = window.innerWidth < 768;
    if (!isSmallScreen.value) {
        isFilterCollapsed.value = false;
    } else {
        // On mobile, always collapse the details panel
        isDetailsCollapsed.value = true;
    }
};

// // Handle infinite scroll
// const handleScroll = () => {
//     {
//         isFilterCollapsed.value = false;
//     }
// };

// Handle infinite scroll
const handleScroll = () => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.offsetHeight;

    if (scrollPosition >= documentHeight - 200 && !productStore.loading && productStore.hasMore) {
        productStore.fetchProducts();
    }
};

watch(isSmallScreen, (newValue) => {
    if (!newValue) {
        isFilterCollapsed.value = false;
    }
});

// Add Product Modal
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
            // await productStore.updateProduct(editingProduct.value.id, formData, formData.image);
        } else {
            await productStore.addProduct(formData);
        }
        modal.close();
    } catch (error) {
        console.error('Error submitting product:', error);
        // Handle error (e.g., show error message to user)
    }
};

// Add Category Modal
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
        modal.close();
    } catch (error) {
        console.error('Error submitting category:', error);
    }
};

// Add these computed properties
const truncatedDescription = computed(() => {
    if (!selectedProduct.value?.description) return '';
    return selectedProduct.value.description.length > 100
        ? selectedProduct.value.description.substring(0, 100) + '...'
        : selectedProduct.value.description;
});

const isDescriptionTruncated = computed(() => {
    return selectedProduct.value?.description && selectedProduct.value.description.length > 100;
});

// Add these methods
const isVarietyOnSale = (variety) => {
    if (!variety?.onSale || !variety?.sale) return false;

    const now = Date.now();
    const startDate = variety.sale.startDate?.seconds * 1000;
    const endDate = variety.sale.endDate?.seconds * 1000;

    return now >= startDate && now <= endDate;
};

const isProductLowStock = (product) => {
    if (!product) return false;

    // Check if any variety has low stock
    if (product.varieties && product.varieties.length > 0) {
        return product.varieties.some(v => v.stockQuantity <= 10);
    }

    // Fall back to main product stock
    return product.stockQuantity <= 10;
};

const getStockDisplay = (product) => {
    if (!product) return '';

    if (product.varieties && product.varieties.length > 0) {
        const totalStock = product.varieties.reduce((sum, v) => sum + v.stockQuantity, 0);
        const lowStockVarieties = product.varieties.filter(v => v.stockQuantity <= 10);

        if (lowStockVarieties.length > 0) {
            return `${totalStock} units (${lowStockVarieties.length} varieties low)`;
        }
        return `${totalStock} units`;
    }

    return `${product.stockQuantity} units`;
};

onMounted(() => {
    initDropdowns();
    initCarousels();

    branchStore.fetchBranchesRealtime();
    // branchStore.fetchCategoriesRealtime();
    categoryStore.fetchCategoryNamesRealtime();

    productStore.fetchProducts(true);
    productStore.setupRealtimeProducts();

    console.log('Product Store:', productStore.products);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);

    // initDropdowns();
    // initCarousels();

    // branchStore.fetchBranchesRealtime();
    // branchStore.fetchCategoriesRealtime();
    // productStore.fetchProducts(true);
    // productStore.setupRealtimeProducts();

    // window.addEventListener("resize", handleResize);
    // window.addEventListener("scroll", handleScroll);
    // document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
    productStore.stopListening();
    branchStore.stopListening();
    categoryStore.stopListeningCategoryNames();
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("scroll", handleScroll);
    cleanup();
    modal.close();

    // productStore.stopListening();
    // window.removeEventListener("resize", handleResize);
    // window.removeEventListener("scroll", handleScroll);
    // cleanup();
    // modal.close();
});
</script>