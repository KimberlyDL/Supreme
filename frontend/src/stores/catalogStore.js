import { defineStore } from "pinia"
import { useInventoryStore } from "@/stores/inventoryStore"
import { useBranchStore } from "@/stores/branchStore"
import { useProductStore } from "@/stores/productStore"
import { groupStockByProduct, filterProductsByCategory } from "@/utils/productUtils"
import { watch, nextTick } from "vue" // Add nextTick import

//#region Helper Functions
// Improved debounce function that preserves 'this' context
function debounce(func, wait) {
    let timeout

    return function (...args) {
        const later = () => {
            clearTimeout(timeout)
            func.apply(this, args)
        }

        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}
//#endregion

export const useCatalogStore = defineStore("catalog", {
    //#region State
    state: () => ({
        selectedCategory: "All",
        searchQuery: "",
        selectedBranchId: null,
        isInitialized: false,
        loading: false,
        error: null,
        // Add a local cache of processed products to improve reactivity
        _processedProducts: [],
    }),
    //#endregion

    //#region Getters
    getters: {
        // Access stores directly in getters
        products() {
            const inventoryStore = useInventoryStore()
            // const groupedProducts = groupStockByProduct(inventoryStore.branchStock)
            // return filterProductsByCategory(groupedProducts, this.selectedCategory)


            // Create a new array to ensure Vue detects the change
            const groupedProducts = groupStockByProduct(inventoryStore.branchStock)

            // Update our local cache for better reactivity
            this._processedProducts = groupedProducts

            return filterProductsByCategory(groupedProducts, this.selectedCategory)
        },

        filteredProducts() {
            if (!this.searchQuery) return this.products

            const query = this.searchQuery.toLowerCase()
            return this.products.filter(
                (product) =>
                    product.name.toLowerCase().includes(query) ||
                    product.description?.toLowerCase().includes(query) ||
                    product.varieties.some((v) => v.name.toLowerCase().includes(query)),
            )
        },

        categories() {
            const categorySet = new Set(["All"])

            this.products.forEach((product) => {
                if (product.category && Array.isArray(product.category)) {
                    product.category.forEach((cat) => categorySet.add(cat))
                }
            })

            return Array.from(categorySet)
        },

        branches() {
            const branchStore = useBranchStore()
            return branchStore.fetchedbranches.filter((b) => b.isActive)
        },
    },
    //#endregion

    //#region Actions
    actions: {
        //#region Initialization
        async initialize() {
            if (this.isInitialized) return

            this.loading = true
            this.error = null

            try {
                // Access stores directly in actions
                const branchStore = useBranchStore() //Move the hook call here to prevent conditional hook call
                const productStore = useProductStore()
                const inventoryStore = useInventoryStore()

                // Initialize branch store
                await branchStore.setupRealtimeActiveBranches()

                // Initialize product store
                await productStore.setupRealtimeActiveProducts()

                // Set default branch if not already set
                if (!this.selectedBranchId && this.branches.length > 0) {
                    this.selectedBranchId = this.branches[0].id
                }

                // Set up inventory listener for the selected branch
                if (this.selectedBranchId) {
                    inventoryStore.setSelectedBranch(this.selectedBranchId)
                }

                // Set up watchers for reactive updates
                this._setupWatchers()

                this.isInitialized = true
            } catch (error) {
                console.error("Error initializing catalog:", error)
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        // Add a new method to set up watchers for reactive updates
        _setupWatchers() {
            const inventoryStore = useInventoryStore()
            const productStore = useProductStore()

            // Watch for changes in branch stock
            watch(
                () => inventoryStore.branchStock,
                () => {
                    console.log("Branch stock changed, updating catalog products")
                    // Force a reactivity update by creating a new array
                    this._processedProducts = [...groupStockByProduct(inventoryStore.branchStock)]
                },
                { deep: true }
            )

            // Watch for changes in products
            watch(
                () => productStore.productsForInventory,
                () => {
                    console.log("Products changed, updating catalog")
                    // If we have branch stock, refresh the processed products
                    if (inventoryStore.branchStock.length > 0) {
                        this._processedProducts = [...groupStockByProduct(inventoryStore.branchStock)]
                    }
                },
                { deep: true }
            )
        },
        //#endregion

        //#region Filter and Search
        setCategory(category) {
            this.selectedCategory = category
        },

        setSearchQuery(query) {
            this.searchQuery = query
        },
        //#endregion

        //#region Branch Management
        async setBranch(branchId) {
            this.selectedBranchId = branchId
            const inventoryStore = useInventoryStore()

            // Clear existing stock before setting new branch
            inventoryStore.clearStockListener()

            // Wait for the next tick to ensure Vue updates the UI
            await nextTick()

            await inventoryStore.setSelectedBranch(branchId)
        },
        //#endregion

        //#region Cleanup
        cleanup() {
            const inventoryStore = useInventoryStore()
            const productStore = useProductStore()
            const branchStore = useBranchStore()

            inventoryStore.clearStockListener()
            productStore.stopListening()
            branchStore.stopListening()
            this.isInitialized = false
        },
        //#endregion
    },
    //#endregion

    //#region Persistence
    persist: {
        enabled: true,
        strategies: [
            {
                key: "catalog-store",
                storage: localStorage,
                paths: ["selectedBranchId", "selectedCategory"],
            },
        ],
    },
    //#endregion
})
