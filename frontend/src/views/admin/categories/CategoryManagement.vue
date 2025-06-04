<template>
    <div class="p-4 bg-bgPrimary-0 min-h-screen">
        <!-- Header with search and filter -->
        <div class="mb-6 flex flex-col md:flex-row gap-4">
            <div class="flex-1">
                <form class="max-w-lg">
                    <div class="flex">
                        <button id="dropdown-button" data-dropdown-toggle="dropdown"
                            class="shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-tBase-100 bg-bgSecondary-0 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-primary-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-primary-700 dark:text-white dark:border-gray-600"
                            type="button">
                            {{ selectedFilter || 'All categories' }}
                            <ChevronDown class="w-2.5 h-2.5 ms-2.5" />
                        </button>
                        <div id="dropdown"
                            class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                            <ul class="py-2 text-sm text-tBase-100 dark:text-gray-200"
                                aria-labelledby="dropdown-button">
                                <li>
                                    <button @click="setFilter(null)" type="button"
                                        class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        All categories
                                    </button>
                                </li>
                                <li v-for="category in categories" :key="category.id">
                                    <button @click="setFilter(category.name)" type="button"
                                        class="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">
                                        {{ category.name }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div class="relative w-full">
                            <input type="search" v-model="searchQuery" id="search-dropdown"
                                class="block p-2.5 w-full z-20 text-sm text-tBase-100 bg-bgSecondary-0 rounded-e-lg border-s-gray-50 border-s-2 border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-s-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-primary-500"
                                placeholder="Search categories and products..." />
                            <button type="submit"
                                class="absolute top-0 end-0 p-2.5 text-sm font-medium h-full text-white bg-primary-500 rounded-e-lg border border-primary-500 hover:bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                                <Search class="w-4 h-4" />
                                <span class="sr-only">Search</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="flex-shrink-0">
                <button @click="openAddCategoryModal"
                    class="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:ring-4 focus:ring-primary-300 flex items-center gap-2">
                    <Plus class="w-4 h-4" />
                    Add Category
                </button>
            </div>
        </div>

        <!-- Categories as tabs -->
        <div class="mb-4 border-b border-gray-200 dark:border-gray-700">
            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center" id="categoryTabs" role="tablist">
                <li v-for="category in filteredCategories" :key="category.id" class="mr-2 relative group"
                    role="presentation">
                    <button @click="selectCategory(category.id)"
                        class="inline-block p-4 border-b-2 rounded-t-lg hover:text-primary-600 hover:border-primary-300 dark:hover:text-primary-300"
                        :class="[
                            selectedCategoryId === category.id
                                ? 'text-primary-600 border-primary-600 dark:text-primary-500 dark:border-primary-500'
                                : 'border-transparent'
                        ]" :id="`category-tab-${category.id}`" :aria-selected="selectedCategoryId === category.id">
                        {{ category.name }}
                    </button>
                    <!-- Edit icon on hover -->
                    <div
                        class="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 flex gap-1">
                        <button @click.stop="openEditCategoryModal(category)"
                            class="text-gray-500 hover:text-primary-500 p-1 rounded-full hover:bg-gray-100">
                            <Edit class="w-3 h-3" />
                        </button>
                    </div>
                </li>
            </ul>
        </div>

        <!-- Selected category content with management options -->
        <div v-if="selectedCategory" class="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">{{ selectedCategory.name }}</h2>
                <div class="flex gap-2">
                    <button @click="openEditCategoryModal(selectedCategory)"
                        class="p-2 text-gray-500 hover:text-primary-500 rounded-full hover:bg-gray-100"
                        title="Edit Category">
                        <Edit class="w-4 h-4" />
                    </button>
                    <button @click="confirmDeleteCategory(selectedCategory.id)"
                        class="p-2 text-gray-500 hover:text-danger-500 rounded-full hover:bg-gray-100"
                        title="Delete Category">
                        <Trash2 class="w-4 h-4" />
                    </button>
                </div>
            </div>

            <!-- Product management toolbar -->
            <div class="flex justify-between items-center mb-4">
                <div class="flex items-center gap-2">
                    <button @click="toggleSelectAll"
                        class="p-2 text-gray-500 hover:text-primary-500 rounded hover:bg-gray-100 flex items-center gap-1">
                        <CheckSquare v-if="isAllSelected" class="w-4 h-4" />
                        <Square v-else class="w-4 h-4" />
                        <span class="text-sm">{{ isAllSelected ? 'Deselect All' : 'Select All' }}</span>
                    </button>
                    <span v-if="selectedProducts.length > 0" class="text-sm text-gray-500">
                        {{ selectedProducts.length }} selected
                    </span>
                </div>
                <div class="flex gap-2">
                    <button v-if="selectedProducts.length > 0" @click="confirmRemoveSelectedProducts"
                        class="p-2 text-danger-500 hover:bg-danger-50 rounded flex items-center gap-1">
                        <Trash2 class="w-4 h-4" />
                        <span class="text-sm">Remove Selected</span>
                    </button>
                    <button v-if="selectedProducts.length > 0" @click="openMoveProductsModal"
                        class="p-2 text-primary-500 hover:bg-primary-50 rounded flex items-center gap-1">
                        <FolderInput class="w-4 h-4" />
                        <span class="text-sm">Move Selected</span>
                    </button>
                </div>
            </div>

            <!-- Products grid -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div v-for="product in filteredProducts" :key="product.id"
                    class="relative bg-white border rounded-lg overflow-hidden group"
                    :class="{ 'ring-2 ring-primary-500': selectedProductIds.includes(product.id) }" draggable="true"
                    @dragstart="handleDragStart($event, product)" @dragover.prevent @drop="handleDrop($event, product)">
                    <!-- Selection checkbox -->
                    <div class="absolute top-2 left-2 z-10">
                        <button @click="toggleProductSelection(product.id)"
                            class="p-1 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100">
                            <CheckSquare v-if="selectedProductIds.includes(product.id)"
                                class="w-4 h-4 text-primary-500" />
                            <Square v-else class="w-4 h-4 text-gray-400" />
                        </button>
                    </div>

                    <!-- Product image -->
                    <div class="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
                            class="w-full h-full object-cover" @error="handleImageError($event, product.id)" />
                        <div v-else class="flex items-center justify-center w-full h-full bg-gray-200">
                            <ImageIcon class="w-8 h-8 text-gray-400" />
                        </div>
                    </div>

                    <!-- Product name -->
                    <div class="p-2">
                        <h3 class="text-sm font-medium truncate">{{ product.name }}</h3>
                    </div>

                    <!-- Action buttons on hover -->
                    <div
                        class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div class="flex gap-2">
                            <button @click="confirmRemoveProduct(product.id)"
                                class="p-2 bg-white rounded-full hover:bg-danger-50 hover:text-danger-500"
                                title="Remove from category">
                                <Trash2 class="w-4 h-4" />
                            </button>
                            <button @click="openMoveProductModal(product)"
                                class="p-2 bg-white rounded-full hover:bg-primary-50 hover:text-primary-500"
                                title="Move to another category">
                                <FolderInput class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="filteredProducts.length === 0" class="col-span-full py-8 text-center text-gray-500">
                    <FolderX class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No products in this category</p>
                    <p class="text-sm mt-1">Drag products from other categories or add new ones</p>
                </div>
            </div>
        </div>

        <!-- Category drop zones (visible when dragging) -->
        <div v-if="isDragging" class="fixed inset-0 bg-black bg-opacity-10 z-40 pointer-events-none">
            <div class="flex h-full">
                <div v-for="category in categories" :key="category.id"
                    class="flex-1 border-r border-gray-200 last:border-r-0 pointer-events-auto"
                    :class="{ 'bg-primary-50': dragOverCategoryId === category.id }"
                    @dragover.prevent="dragOverCategoryId = category.id" @dragleave="dragOverCategoryId = null"
                    @drop="handleCategoryDrop($event, category.id)">
                    <div class="h-full flex items-center justify-center">
                        <div class="text-center p-4">
                            <FolderPlus class="w-8 h-8 mx-auto mb-2"
                                :class="dragOverCategoryId === category.id ? 'text-primary-500' : 'text-gray-400'" />
                            <p class="font-medium">{{ category.name }}</p>
                            <p class="text-sm text-gray-500">Drop to move here</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useModalStore } from '@/stores/modalStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { initDropdowns } from 'flowbite';
import {
    Search, Plus, Edit, Trash2, CheckSquare, Square,
    FolderInput, FolderPlus, FolderX, ChevronDown, ImageIcon
} from 'lucide-vue-next';
import AddCategoryForm from '@/components/modal/AddCategoryForm.vue';
import EditCategoryForm from '@/components/modal/EditCategoryForm.vue';
import MoveProductForm from '@/components/modal/MoveProductForm.vue';

const modal = useModalStore();
const categoryStore = useCategoryStore();

// State
const categories = ref([]);
const selectedCategoryId = ref(null);
const searchQuery = ref('');
const selectedFilter = ref(null);
const selectedProductIds = ref([]);
const isDragging = ref(false);
const dragOverCategoryId = ref(null);
const imageLoadError = ref({});
const isLoading = ref(false);

// Computed
const selectedCategory = computed(() => {
    return categories.value.find(cat => cat.id === selectedCategoryId.value) || null;
});

const filteredCategories = computed(() => {
    if (!selectedFilter.value) return categories.value;
    return categories.value.filter(cat => cat.name.toLowerCase().includes(selectedFilter.value.toLowerCase()));
});

const filteredProducts = computed(() => {
    if (!selectedCategory.value) return [];

    let products = selectedCategory.value.products || [];

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        products = products.filter(product =>
            product.name.toLowerCase().includes(query)
        );
    }

    return products;
});

const selectedProducts = computed(() => {
    if (!selectedCategory.value || !selectedCategory.value.products) return [];
    return selectedCategory.value.products.filter(p => selectedProductIds.value.includes(p.id));
});

const isAllSelected = computed(() => {
    if (!selectedCategory.value || !selectedCategory.value.products || selectedCategory.value.products.length === 0) return false;
    return selectedCategory.value.products.every(p => selectedProductIds.value.includes(p.id));
});

// Methods
const fetchCategories = async () => {
    try {
        isLoading.value = true;
        const fetchedCategories = await categoryStore.fetchCategoriesWithProducts();
        categories.value = fetchedCategories || [];

        // Select first category if none selected
        if (categories.value.length > 0 && !selectedCategoryId.value) {
            selectedCategoryId.value = categories.value[0].id;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    } finally {
        isLoading.value = false;
    }
};

const selectCategory = (categoryId) => {
    selectedCategoryId.value = categoryId;
    selectedProductIds.value = [];
};

const setFilter = (filter) => {
    selectedFilter.value = filter;

    console.log('filter clicked')
};

const toggleProductSelection = (productId) => {
    const index = selectedProductIds.value.indexOf(productId);
    if (index > -1) {
        selectedProductIds.value.splice(index, 1);
    } else {
        selectedProductIds.value.push(productId);
    }
};

const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedProductIds.value = [];
    } else if (selectedCategory.value && selectedCategory.value.products) {
        selectedProductIds.value = selectedCategory.value.products.map(p => p.id);
    }
};

const handleImageError = (event, productId) => {
    imageLoadError.value[productId] = true;
    event.target.src = '/placeholder.svg?height=200&width=200';
};

// Drag and drop functionality
const handleDragStart = (event, product) => {
    isDragging.value = true;
    event.dataTransfer.setData('productId', product.id);
    event.dataTransfer.setData('sourceCategoryId', selectedCategoryId.value);

    // If the product is selected, we're dragging all selected products
    if (selectedProductIds.value.includes(product.id)) {
        event.dataTransfer.setData('selectedProducts', JSON.stringify(selectedProductIds.value));
    } else {
        // Otherwise just this product
        selectedProductIds.value = [product.id];
        event.dataTransfer.setData('selectedProducts', JSON.stringify([product.id]));
    }
};

const handleDrop = (event) => {
    // This handles product reordering within the same category
    // Not implementing for now as it's not in the requirements
    isDragging.value = false;
    dragOverCategoryId.value = null;
};

const handleCategoryDrop = async (event, targetCategoryId) => {
    isDragging.value = false;
    dragOverCategoryId.value = null;

    const sourceCategoryId = event.dataTransfer.getData('sourceCategoryId');
    const selectedProductsData = event.dataTransfer.getData('selectedProducts');

    if (sourceCategoryId === targetCategoryId) return;

    try {
        const productIds = JSON.parse(selectedProductsData);

        // Call store method to move products between categories
        await categoryStore.moveProductsBetweenCategories(
            productIds,
            sourceCategoryId,
            targetCategoryId
        );

        // Refresh categories after move
        await fetchCategories();

        // Clear selection
        selectedProductIds.value = [];
    } catch (error) {
        console.error('Error moving products between categories:', error);
    }
};

// Modal functions
const openAddCategoryModal = () => {
    modal.open(AddCategoryForm, {
        isOpen: true,
    }, {
        onSuccess: () => {
            fetchCategories();
            modal.close();
        },
        onCancel: () => modal.close()
    });
};

const openEditCategoryModal = (category) => {
    modal.open(EditCategoryForm, {
        isOpen: true,
        category: { ...category }
    }, {
        onSuccess: () => {
            fetchCategories();
            modal.close();
        },
        onCancel: () => modal.close()
    });
};

const openMoveProductModal = (product) => {
    modal.open(MoveProductForm, {
        isOpen: true,
        productIds: [product.id],
        sourceCategoryId: selectedCategoryId.value,
        categories: categories.value.filter(c => c.id !== selectedCategoryId.value)
    }, {
        onSuccess: () => {
            fetchCategories();
            modal.close();
        },
        onCancel: () => modal.close()
    });
};

const openMoveProductsModal = () => {
    if (selectedProductIds.value.length === 0) return;

    modal.open(MoveProductForm, {
        isOpen: true,
        productIds: selectedProductIds.value,
        sourceCategoryId: selectedCategoryId.value,
        categories: categories.value.filter(c => c.id !== selectedCategoryId.value)
    }, {
        onSuccess: () => {
            fetchCategories();
            selectedProductIds.value = [];
            modal.close();
        },
        onCancel: () => modal.close()
    });
};

const confirmDeleteCategory = async (categoryId) => {
    if (confirm('Are you sure you want to delete this category? This will not delete the products.')) {
        try {
            await categoryStore.deleteCategory(categoryId);
            await fetchCategories();

            if (selectedCategoryId.value === categoryId) {
                selectedCategoryId.value = categories.value.length > 0 ? categories.value[0].id : null;
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    }
};

const confirmRemoveProduct = async (productId) => {
    if (confirm('Are you sure you want to remove this product from the category?')) {
        try {
            await categoryStore.removeProductFromCategory(productId, selectedCategoryId.value);
            await fetchCategories();
        } catch (error) {
            console.error('Error removing product from category:', error);
        }
    }
};

const confirmRemoveSelectedProducts = async () => {
    if (selectedProductIds.value.length === 0) return;

    if (confirm(`Are you sure you want to remove ${selectedProductIds.value.length} products from this category?`)) {
        try {
            await categoryStore.removeProductsFromCategory(selectedProductIds.value, selectedCategoryId.value);
            await fetchCategories();
            selectedProductIds.value = [];
        } catch (error) {
            console.error('Error removing products from category:', error);
        }
    }
};

// Lifecycle hooks
onMounted(() => {
    initDropdowns();
    fetchCategories();

    // Add event listener to reset dragging state
    document.addEventListener('dragend', resetDragState);
});

onUnmounted(() => {
    document.removeEventListener('dragend', resetDragState);
});

const resetDragState = () => {
    isDragging.value = false;
    dragOverCategoryId.value = null;
};
</script>
