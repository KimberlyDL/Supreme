// src/stores/inventoryStore.js
import { defineStore } from "pinia";
import { computed, watch } from "vue";
import { db, auth, storage } from "@/services/firebase";
import { getIdToken } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { useAuthStore } from "@/stores/authStore";
import { useBranchStore } from "@/stores/branchStore";
import { useProductStore } from "@/stores/productStore";
import axios from "axios";
import { getFreshToken } from "@/services/authService";
import { stockManagement } from "./stockManagement";
import { useToastStore } from "@/stores/toastStore";

// API base URL - Note: no trailing slash to match the format in the example
const API_URL = import.meta.env.VITE_API_BASE_URL;

//#region Helper Functions
// Improved debounce function that preserves 'this' context
function debounce(func, wait) {
  let timeout;

  return function (...args) {
    const context = this; // Store the context

    const later = () => {
      clearTimeout(timeout);
      func.apply(context, args); // Apply the stored context
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
//#endregion

export const useInventoryStore = defineStore("inventory", {
  //#region State
  state: () => ({
    selectedBranchId: null,
    branchStock: [],
    inventoryLogs: [],

    loading: false,
    error: null,
    success: null,
    message: null,

    // branchStock
    unsubscribeStock: null,

    _currentBranchId: null,
    _listenerStatus: {
      products: false,
      branches: false,
      stock: false,
    },
  }),
  //#endregion

  //#region Getters
  getters: {
    getActiveProducts() {
      const productStore = useProductStore();
      return productStore.productsForInventory.filter(
        (p) => p?.isActive !== false
      );
    },

    getActiveBranches() {
      const branchStore = useBranchStore();
      return branchStore.fetchedbranches.filter((b) => b?.isActive !== false);
    },

    // getBranchStock: (state) => state.branchStock,
    getInventoryLogs: (state) => state.inventoryLogs,

    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getSuccess: (state) => state.success,
    getMessage: (state) => state.message,

    getProductBranchStock: (state) => {
      const productStore = useProductStore();
      const activeProducts = productStore.productsForInventory.filter(
        (p) => p?.isActive !== false
      );

      return state.branchStock.map((item) => {
        const product = activeProducts.find((p) => p.id === item.productId);
        const variety = product?.varieties?.find(
          (v) => v.id === item.varietyId
        );
        return {
          ...item,
          productName: product?.name || "Unknown Product",
          varietyName: variety?.name || "Default",
          displayName: `${product?.name || "Unknown Product"} - ${
            variety?.name || "Default"
          }`,
        };
      });
    },
  },
  //#endregion

  actions: {
    async initializeListeners() {
      const branchStore = useBranchStore();

      if (!this._listenerStatus.branches) {
        await branchStore.setupRealtimeActiveBranches();
        this._listenerStatus.branches = true;
      }

      const productStore = useProductStore();

      if (!this._listenerStatus.products) {
        await productStore.setupRealtimeActiveProducts();
        this._listenerStatus.products = true;
      }
    },

    unsubscribeBranches() {
      const branchStore = useBranchStore();

      branchStore.stopListening();

      this._listenerStatus = {
        branches: false,
      };
    },

    unsubscribeProducts() {
      const productStore = useProductStore();

      productStore.stopListening();

      this._listenerStatus = {
        products: false,
      };
    },

    //#region Branch Stock Management
    // Set selected branch
    setSelectedBranch(branchId) {
      this.selectedBranchId = branchId;
      if (branchId) {
        this.setupBranchStockListener(branchId);
      } else {
        this.clearStockListener();
        this.branchStock = [];
      }
    },

    // Clear stock listener
    clearStockListener() {
      if (this.unsubscribeStock) {
        console.log("Clearing previous stock listener");
        this.unsubscribeStock();
        this.unsubscribeStock = null;

        this.branchStock = [];
      }
      this._currentBranchId = null;
    },

    // New method to refresh branch stock data with latest product info
    _refreshBranchStockData() {
      const productStore = useProductStore();
      const products = productStore.productsForInventory;

      // Update each stock item with fresh product data
      this.branchStock = this.branchStock.map((stockItem) => {
        const productData = products.find((p) => p.id === stockItem.productId);
        const varietyData = productData?.varieties?.find(
          (v) => v.id === stockItem.varietyId
        );

        return {
          ...stockItem,
          product: productData || null,
          variety: varietyData || null,
          productName: productData ? productData.name : "Unknown Product",
          varietyName: varietyData ? varietyData.name : "Default",
          displayName: `${
            productData ? productData.name : "Unknown Product"
          } - ${varietyData ? varietyData.name : "Default"}`,
        };
      });
    },

    setupProductDataWatcher() {
      const productStore = useProductStore();

      // Watch for changes in product data
      watch(
        () => productStore.productsForInventory,
        () => {
          // If we have branch stock data and a current branch, refresh the data
          if (this.branchStock.length > 0 && this._currentBranchId) {
            console.log("Products changed, refreshing branch stock data");
            this._refreshBranchStockData();
          }
        },
        { deep: true }
      );
    },

    _formatExpirationDates(expirationDates) {
      return expirationDates.map((exp) => {
        let dateObj;
        if (typeof exp.date === "number") {
          dateObj = new Date(exp.date * 1000);
        } else {
          dateObj = new Date(exp.date);
        }

        return {
          ...exp,
          dateObj,
          formattedDate: dateObj.toLocaleDateString(),
        };
      });
    },

    _setupBranchStockListenerImpl(branchId, forced = false) {
      // validation
      const authStore = useAuthStore();
      if (!authStore.isLoggedIn || !authStore.isAdmin) {
        console.error("Unauthorized access to branch stock data");
        return;
      }

      if (
        this.unsubscribeStock &&
        this._currentBranchId === branchId &&
        !forced
      ) {
        console.log("Already listening to this branch, skipping setup");
        return;
      }

      // Clear previous listener if exists
      this.clearStockListener();

      // Store current branch ID for comparison
      this._currentBranchId = branchId;

      this.loading = true;

      console.log(`Setting up stock listener for branch: ${branchId}`);

      try {
        // Create query for branch stocks
        const q = query(
          collection(db, "branch_stocks"),
          where("branchId", "==", branchId)
        );

        // Set up real-time listener
        this.unsubscribeStock = onSnapshot(
          q,
          async (snapshot) => {
            // Check if this is still the current branch
            if (this._currentBranchId !== branchId) {
              console.log(
                "Branch changed during listener execution, ignoring update"
              );
              return;
            }

            // console.log(
            //   `Stock update received for branch ${branchId}, changes: ${
            //     snapshot.docChanges().length
            //   }`
            // );

            const stockItems = [...this.branchStock];

            let hasChanges = false;

            // Process each change
            for (const change of snapshot.docChanges()) {
              const doc = change.doc;
              const stockData = doc.data();
              const stockId = doc.id;

              try {
                const products = this.getActiveProducts;
                const productData = products.find(
                  (p) => p.id === stockData.productId
                );
                const varietyData = productData?.varieties?.find(
                  (v) => v.id === stockData.varietyId
                );

                // Format expiration dates for display
                const formattedExpirationDates =
                  this._formatExpirationDates(stockData.expirationDates) || [];

                const updatedStock = {
                  id: stockId,
                  ...stockData,
                  product: productData || null,
                  variety: varietyData || null,
                  productName: productData
                    ? productData.name
                    : "Unknown Product",
                  varietyName: varietyData ? varietyData.name : "Default",
                  displayName: `${
                    productData ? productData.name : "Unknown Product"
                  } - ${varietyData ? varietyData.name : "Default"}`,
                  expirationDates: formattedExpirationDates,
                };

                const index = stockItems.findIndex(
                  (item) => item.id === stockId
                );

                if (change.type === "added") {
                  if (index === -1) {
                    stockItems.push(updatedStock);
                    hasChanges = true;
                  }
                } else if (change.type === "modified") {
                  if (index !== -1) {
                    stockItems[index] = updatedStock;
                    hasChanges = true;
                  }
                } else if (change.type === "removed") {
                  if (index !== -1) {
                    stockItems.splice(index, 1);
                    hasChanges = true;
                  }
                }
              } catch (error) {
                console.error("Error processing stock item:", error);
              }
            }

            if (hasChanges) {
              console.log(
                `Updating branch stock with ${stockItems.length} items`
              );
              this.branchStock = [...stockItems];
            }

            this.loading = false;
          },
          (error) => {
            console.error("Error in real-time stock updates:", error);
            this.error = error.message;
            this.loading = false;
          }
        );

        this.setupProductDataWatcher();
      } catch (error) {
        console.error("Error setting up stock listener:", error);
        this.error = error.message;
        this.loading = false;
      }
    },

    // Then create the debounced version that calls the implementation
    setupBranchStockListener: debounce(function (branchId) {
      this._setupBranchStockListenerImpl(branchId);
    }, 300),
    //#endregion

    //#region API Operations

    async addStock(stockData) {
      this.loading = true;
      this.clearMessages();

      try {
        const response = await stockManagement.addStock(stockData);
        // this.success = true;
        // this.message = response.message;

        const toast = useToastStore();
        toast.addToast({
          type: "success",
          message: response.message,
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;

        if (status === 400) {
          this.error = msg || "Some required fields are missing.";
        } else if (status === 401 || status === 403) {
          this.error = "You're not authorized to perform this action.";
        } else {
          this.error = msg || "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    async deductStock(stockData) {
      this.loading = true;
      this.clearMessages();

      try {
        const response = await stockManagement.deductStock(stockData);
        // this.success = true;
        // this.message = response.message;

        const toast = useToastStore();
        toast.addToast({
          type: "success",
          message: response.message,
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;

        if (status === 400) {
          this.error = msg || "Some required fields are missing.";
        } else if (status === 401 || status === 403) {
          this.error = "You're not authorized to perform this action.";
        } else {
          this.error = msg || "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    async rejectStock(stockData) {
      this.loading = true;
      this.clearMessages();

      try {
        const response = await stockManagement.rejectStock(stockData);
        // this.success = true;
        // this.message = response.message;

        const toast = useToastStore();
        toast.addToast({
          type: "success",
          message: response.message,
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;

        if (status === 400) {
          this.error = msg || "Some required fields are missing.";
        } else if (status === 401 || status === 403) {
          this.error = "You're not authorized to perform this action.";
        } else {
          this.error = msg || "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    async transferStock(transferData) {
      this.loading = true;
      this.clearMessages();

      try {
        const response = await stockManagement.transferStock(transferData);
        // this.success = true;
        // this.message = response.message;

        const toast = useToastStore();
        toast.addToast({
          type: "success",
          message: response.message,
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;

        if (status === 400) {
          this.error = msg || "Some required fields are missing.";
        } else if (status === 401 || status === 403) {
          this.error = "You're not authorized to perform this action.";
        } else {
          this.error = msg || "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    async adjustStock(adjustData) {
      this.loading = true;
      this.clearMessages();

      try {

        const response = await stockManagement.adjustStock(adjustData);
        // this.success = true;
        // this.message = response.message;

        const toast = useToastStore();
        toast.addToast({
          type: "success",
          message: response.message,
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;

        if (status === 400) {
          this.error = msg || "Some required fields are missing.";
        } else if (status === 401 || status === 403) {
          this.error = "You're not authorized to perform this action.";
        } else {
          this.error = msg || "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },

    //#endregion

    async fetchInventoryLogsFromAPI(params = {}) {
      try {
        this.loading = true;
        this.error = null;

        // Get the current user's ID token for authentication
        const token = await getIdToken(auth.currentUser);

        // Prepare query parameters
        const queryParams = new URLSearchParams();

        if (params.branchId) queryParams.append("branchId", params.branchId);
        if (params.type) queryParams.append("type", params.type);
        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.lastVisible)
          queryParams.append("lastVisible", params.lastVisible);

        const response = await axios.get(
          `${API_URL}inventory/logs?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 30000, // 30 second timeout
          }
        );

        console.log(response);
        
        if (response.status === 200 && response.data) {
          const logsData = response.data.data.logs || [];
          const hasMore = response.data.data.hasMore || false;
          const totalCount = response.data.data.totalCount || logsData.length;

          // Process logs to ensure proper date formatting
          const processedLogs = logsData.map((log) => ({
            ...log,
            timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
            formattedTimestamp: log.timestamp
              ? new Date(log.timestamp).toLocaleString()
              : "N/A",
          }));

          // Update store state
          if (!params.lastVisible) {
            // Initial load
            this.inventoryLogs = processedLogs;
          } else {
            // Pagination - append to existing logs
            this.inventoryLogs = [...this.inventoryLogs, ...processedLogs];
          }

          this.success = true;
          this.message =
            response.data.message || "Inventory logs loaded successfully";

          return {
            success: true,
            data: {
              logs: processedLogs,
              hasMore,
              totalCount,
              lastVisible: response.data.data.lastVisible,
            },
            message: this.message,
          };
        } else {
          throw new Error(
            response.data.message || "Failed fetching inventory logs"
          );
        }
      } catch (error) {
        console.error("Error fetching inventory logs:", error);

        let errorMessage = "Failed to fetch inventory logs";

        if (error.response) {
          // Server responded with error status
          errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
          console.error("Server error details:", error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          errorMessage = "Network error: Unable to reach server";
          console.error("Network error details:", error.request);
        } else {
          // Something else happened
          errorMessage = error.message || "Unknown error occurred";
          console.error("Other error details:", error);
        }

        this.error = errorMessage;

        return {
          success: false,
          message: errorMessage,
          data: {
            logs: [],
            hasMore: false,
            totalCount: 0,
            lastVisible: null,
          },
        };
      } finally {
        this.loading = false;
      }
    },

    //#region Message Management
    // Clear messages
    clearMessages() {
      this.error = null;
      this.success = null;
      this.message = null;
    },

    // Set messages
    setError(error) {
      this.error = error;
    },

    setSuccess(success) {
      this.success = success;
    },

    setMessage(message) {
      this.message = message;
    },

    //#endregion

    //#region Cleanup
    // Enhanced cleanup method
    cleanup() {
      this.unsubscribeBranches();
      this.unsubscribeProducts();

      this.clearStockListener();
      this._listenerStatus.stock = false;

      this.inventoryLogs = [];
      this.loading = false;
    },
    //#endregion
  },

  // Persist selected branch ID
  persist: {
    enabled: true,
    strategies: [
      {
        key: "inventory-session",
        storage: sessionStorage,
        paths: [
          "selectedBranchId",
          "branchStock",
          "inventoryLogs",
          "loading",
          "error",
          "success",
          "message",
          "unsubscribeStock",
          "_currentBranchId",
          "_listenerStatus",
        ],
      },
    ],
  },
});
