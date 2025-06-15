import { defineStore } from "pinia";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useBranchStore } from "@/stores/branchStore";
import { useProductStore } from "@/stores/productStore";
import {
  groupStockByProduct,
  filterProductsByCategory,
} from "@/utils/productUtils";
import { watch, nextTick } from "vue";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

//#region Helper Functions
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Calculate popularity score for products
function calculatePopularityScore(product, analytics = {}) {
  let score = 0;

  // Factor 1: Stock movement (lower stock = more popular)
  const totalStock = product.varieties.reduce(
    (sum, v) => sum + (v.stockQuantity || 0),
    0
  );
  const maxStock = product.varieties.reduce(
    (sum, v) => sum + (v.maxStock || 100),
    0
  );
  const stockMovement = maxStock - totalStock;
  score += stockMovement * 0.3;

  // Factor 2: Number of varieties (more varieties = more popular)
  score += product.varieties.length * 10;

  // Factor 3: Price range (mid-range products tend to be more popular)
  const avgPrice =
    product.varieties.reduce((sum, v) => sum + (v.price || 0), 0) /
    product.varieties.length;
  if (avgPrice >= 50 && avgPrice <= 200) {
    score += 20;
  }

  // Factor 4: Recently updated products get a boost
  const daysSinceUpdate =
    (new Date() - new Date(product.updatedAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate <= 7) {
    score += 15;
  }

  // Factor 5: Products with sales get a boost
  const hasActiveSale = product.varieties.some(
    (v) => v.sale && new Date(v.sale.endDate) > new Date()
  );
  if (hasActiveSale) {
    score += 25;
  }

  // Factor 6: Use analytics data if available
  if (analytics[product.id]) {
    score += (analytics[product.id].views || 0) * 0.1;
    score += (analytics[product.id].cartAdds || 0) * 2;
    score += (analytics[product.id].purchases || 0) * 5;
  }

  return Math.round(score);
}
//#endregion

export const useCatalogStore = defineStore("catalog", {
  //#region State
  state: () => ({
    selectedCategory: "All",
    searchQuery: "",
    selectedBranchId: null,
    selectedBranchSlug: "",
    isInitialized: false,
    loading: false,
    error: null,
    _processedProducts: [],

    // New state for enhanced features
    productAnalytics: {},
    popularProducts: [],
    newArrivals: [],
    onSaleProducts: [],
    filters: {
      onSale: false,
      newArrivals: false,
      mostBought: false,
      inStock: false,
      lowStock: false,
      priceRange: { min: null, max: null },
      sortBy: "name",
    },
  }),
  //#endregion

  //#region Getters
  getters: {
    products() {
      const inventoryStore = useInventoryStore();
      const groupedProducts = groupStockByProduct(inventoryStore.branchStock);

      // Enhance products with popularity scores and analytics
      const enhancedProducts = groupedProducts.map((product) => ({
        ...product,
        popularityScore: calculatePopularityScore(
          product,
          this.productAnalytics
        ),
        isNewArrival: this.isNewArrival(product),
        hasActiveSale: this.hasActiveSale(product),
        totalStock: product.varieties.reduce(
          (sum, v) => sum + (v.stockQuantity || 0),
          0
        ),
      }));

      this._processedProducts = enhancedProducts;
      return filterProductsByCategory(enhancedProducts, this.selectedCategory);
    },

    filteredProducts() {
      let products = this.products;

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        products = products.filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.varieties.some((v) => v.name.toLowerCase().includes(query))
        );
      }

      // Apply additional filters
      if (this.filters.onSale) {
        products = products.filter((product) => product.hasActiveSale);
      }

      if (this.filters.newArrivals) {
        products = products.filter((product) => product.isNewArrival);
      }

      if (this.filters.mostBought) {
        products = products.filter((product) => product.popularityScore > 50);
      }

      if (this.filters.inStock) {
        products = products.filter((product) => product.totalStock > 0);
      }

      if (this.filters.lowStock) {
        products = products.filter(
          (product) => product.totalStock > 0 && product.totalStock <= 10
        );
      }

      // Price range filter
      if (this.filters.priceRange.min || this.filters.priceRange.max) {
        products = products.filter((product) => {
          const prices = product.varieties.map((v) => v.price || 0);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);

          const filterMin = this.filters.priceRange.min || 0;
          const filterMax =
            this.filters.priceRange.max || Number.POSITIVE_INFINITY;

          return maxPrice >= filterMin && minPrice <= filterMax;
        });
      }

      // Sort products
      return this.sortProducts(products);
    },

    categories() {
      const categorySet = new Set(["All"]);
      this.products.forEach((product) => {
        if (product.category && Array.isArray(product.category)) {
          product.category.forEach((cat) => categorySet.add(cat));
        }
      });
      return Array.from(categorySet);
    },

    branches() {
      const branchStore = useBranchStore();
      return branchStore.fetchedbranches
        .filter((b) => b.isActive)
        .map((branch) => ({
          ...branch,
          slug: this.generateSlug(branch.name),
        }));
    },

    // Get products on sale
    saleProducts() {
      return this.products
        .filter((product) => product.hasActiveSale)
        .sort(
          (a, b) =>
            this.getDiscountPercentage(b) - this.getDiscountPercentage(a)
        );
    },

    // Get new arrival products
    newArrivalProducts() {
      return this.products
        .filter((product) => product.isNewArrival)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    // Get popular products
    mostPopularProducts() {
      return this.products
        .filter((product) => product.popularityScore > 0)
        .sort((a, b) => b.popularityScore - a.popularityScore);
    },
  },
  //#endregion

  //#region Actions
  actions: {
    //#region Initialization
    async initialize() {
      if (this.isInitialized) return;

      const branchStore = useBranchStore();
      const productStore = useProductStore();
      const inventoryStore = useInventoryStore();

      this.loading = true;
      this.error = null;

      try {
        // Initialize stores
        await branchStore.setupRealtimeActiveBranches();
        await productStore.setupRealtimeActiveProducts();

        // Load product analytics
        await this.loadProductAnalytics();

        // Set default branch if not already set
        if (!this.selectedBranchId && this.branches.length > 0) {
          this.selectedBranchId = this.branches[0].id;
          this.selectedBranchSlug = this.branches[0].slug;
        }

        // Set up inventory listener for the selected branch
        if (this.selectedBranchId) {
          inventoryStore.setSelectedBranch(this.selectedBranchId);
        }

        this._setupWatchers();
        this.isInitialized = true;
      } catch (error) {
        console.error("Error initializing catalog:", error);
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    _setupWatchers() {
      const inventoryStore = useInventoryStore();
      const productStore = useProductStore();

      watch(
        () => inventoryStore.branchStock,
        () => {
          console.log("Branch stock changed, updating catalog products");
          this._processedProducts = [
            ...groupStockByProduct(inventoryStore.branchStock),
          ];
        },
        { deep: true }
      );

      watch(
        () => productStore.productsForInventory,
        () => {
          console.log("Products changed, updating catalog");
          if (inventoryStore.branchStock.length > 0) {
            this._processedProducts = [
              ...groupStockByProduct(inventoryStore.branchStock),
            ];
          }
        },
        { deep: true }
      );
    },
    //#endregion

    //#region Filter and Search
    setCategory(category) {
      this.selectedCategory = category;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

    clearFilters() {
      this.filters = {
        onSale: false,
        newArrivals: false,
        mostBought: false,
        inStock: false,
        lowStock: false,
        priceRange: { min: null, max: null },
        sortBy: "name",
      };
      this.selectedCategory = "All";
      this.searchQuery = "";
    },
    //#endregion

    //#region Branch Management
    async setBranch(branchId) {
      this.selectedBranchId = branchId;
      const branch = this.branches.find((b) => b.id === branchId);
      if (branch) {
        this.selectedBranchSlug = branch.slug;
      }

      const inventoryStore = useInventoryStore();
      inventoryStore.clearStockListener();
      await nextTick();
      await inventoryStore.setSelectedBranch(branchId);
    },

    async setBranchBySlug(slug) {
      const branch = this.branches.find((b) => b.slug === slug);
      if (branch) {
        await this.setBranch(branch.id);
      }
    },
    //#endregion

    //#region Analytics and Tracking
    async loadProductAnalytics() {
      try {
        if (!this.selectedBranchId) return;

        const response = await axios.get(
          `${apiUrl}/analytics/products/${this.selectedBranchId}`
        );
        this.productAnalytics = response.data.analytics || {};
      } catch (error) {
        console.error("Error loading product analytics:", error);
        this.productAnalytics = {};
      }
    },

    async trackProductView(productId) {
      try {
        await axios.post(`${apiUrl}/analytics/product-view`, {
          productId,
          branchId: this.selectedBranchId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error tracking product view:", error);
      }
    },

    async trackAddToCart(productId, varietyId) {
      try {
        await axios.post(`${apiUrl}/analytics/add-to-cart`, {
          productId,
          varietyId,
          branchId: this.selectedBranchId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error tracking add to cart:", error);
      }
    },
    //#endregion

    //#region Helper Methods
    generateSlug(name) {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    },

    isNewArrival(product) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(product.createdAt) >= thirtyDaysAgo;
    },

    hasActiveSale(product) {
      return product.varieties.some(
        (variety) => variety.sale && new Date(variety.sale.endDate) > new Date()
      );
    },

    getDiscountPercentage(product) {
      const saleVariety = product.varieties.find(
        (v) => v.sale && new Date(v.sale.endDate) > new Date()
      );
      if (!saleVariety) return 0;

      const discount =
        ((saleVariety.price - saleVariety.sale.salePrice) / saleVariety.price) *
        100;
      return Math.round(discount);
    },

    sortProducts(products) {
      const sortedProducts = [...products];

      switch (this.filters.sortBy) {
        case "name":
          return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        case "price-low":
          return sortedProducts.sort(
            (a, b) => this.getMinPrice(a) - this.getMinPrice(b)
          );
        case "price-high":
          return sortedProducts.sort(
            (a, b) => this.getMinPrice(b) - this.getMinPrice(a)
          );
        case "popularity":
          return sortedProducts.sort(
            (a, b) => b.popularityScore - a.popularityScore
          );
        case "newest":
          return sortedProducts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        case "stock":
          return sortedProducts.sort((a, b) => b.totalStock - a.totalStock);
        default:
          return sortedProducts;
      }
    },

    getMinPrice(product) {
      const prices = product.varieties.map((v) => v.price || 0);
      return Math.min(...prices);
    },
    //#endregion

    //#region Cleanup
    cleanup() {
      const inventoryStore = useInventoryStore();
      const productStore = useProductStore();
      const branchStore = useBranchStore();

      inventoryStore.clearStockListener();
      productStore.stopListening();
      branchStore.stopListening();
      this.isInitialized = false;
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
        paths: [
          "selectedBranchId",
          "selectedBranchSlug",
          "selectedCategory",
          "filters",
        ],
      },
    ],
  },
  //#endregion
});
