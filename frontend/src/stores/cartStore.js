import { defineStore } from "pinia";
import { formatCurrency } from "@/utils/productUtils";
import axios from "axios";
import { auth } from "@/services/firebase";
import { getIdToken } from "firebase/auth";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useCartStore = defineStore("cart", {
  //#region State
  state: () => ({
    items: [],
    loading: false,
    error: null,
    sessionId: null,
    branchId: null,
  }),
  //#endregion

  //#region Getters
  getters: {
    itemCount: (state) => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    totalAmount: (state) => {
      return state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    },

    formattedTotal: (state) => {
      return formatCurrency(state.totalAmount);
    },

    itemsByCategory: (state) => {
      const grouped = {};
      state.items.forEach((item) => {
        const category = item.category || "Other";
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(item);
      });
      return grouped;
    },
  },
  //#endregion

  //#region Actions
  actions: {
    //#region Cart Management
    async addItem(newItem) {
      this.loading = true;
      this.error = null;

      try {
        // Generate session ID if not exists
        if (!this.sessionId) {
          this.sessionId = this.generateSessionId();
        }

        // Set branch ID
        this.branchId = newItem.branch;

        // Check if item already exists in cart
        const existingItemIndex = this.items.findIndex(
          (item) =>
            item.productId === newItem.productId &&
            item.varietyId === newItem.varietyId
        );

        let cartItem;
        if (existingItemIndex >= 0) {
          // Update existing item
          this.items[existingItemIndex].quantity += newItem.quantity;
          cartItem = this.items[existingItemIndex];
        } else {
          // Add new item
          cartItem = {
            id: this.generateItemId(),
            ...newItem,
            addedAt: new Date().toISOString(),
          };
          this.items.push(cartItem);
        }

        // Save to backend
        await this.saveCartToBackend();

        // Track analytics
        await this.trackAddToCart(newItem.productId, newItem.varietyId);

        console.log("Item added to cart:", cartItem);
      } catch (error) {
        console.error("Error adding item to cart:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateItemQuantity(productId, varietyId, quantity) {
      const itemIndex = this.items.findIndex(
        (item) => item.productId === productId && item.varietyId === varietyId
      );

      if (itemIndex >= 0) {
        if (quantity <= 0) {
          await this.removeItem(productId, varietyId);
        } else {
          this.items[itemIndex].quantity = quantity;
          this.items[itemIndex].updatedAt = new Date().toISOString();
          await this.saveCartToBackend();
        }
      }
    },

    async removeItem(productId, varietyId) {
      const itemIndex = this.items.findIndex(
        (item) => item.productId === productId && item.varietyId === varietyId
      );

      if (itemIndex >= 0) {
        this.items.splice(itemIndex, 1);
        await this.saveCartToBackend();
      }
    },

    async clearCart() {
      this.items = [];
      await this.saveCartToBackend();
    },
    //#endregion

    //#region Backend Integration
    async saveCartToBackend() {
      if (!this.sessionId) return;

      try {
        const cartData = {
          sessionId: this.sessionId,
          branchId: this.branchId,
          items: this.items,
          totalAmount: this.totalAmount,
          itemCount: this.itemCount,
          updatedAt: new Date().toISOString(),
        };

        // If user is authenticated, include auth token
        const headers = { "Content-Type": "application/json" };
        if (auth.currentUser) {
          const idToken = await getIdToken(auth.currentUser);
          headers.Authorization = `Bearer ${idToken}`;
        }

        await axios.post(`${apiUrl}/cart/save`, cartData, { headers });

        // Also save to localStorage as backup
        localStorage.setItem(
          "cart-session",
          JSON.stringify({
            sessionId: this.sessionId,
            branchId: this.branchId,
            items: this.items,
          })
        );
      } catch (error) {
        console.error("Error saving cart to backend:", error);
        // Fallback to localStorage only
        localStorage.setItem(
          "cart-session",
          JSON.stringify({
            sessionId: this.sessionId,
            branchId: this.branchId,
            items: this.items,
          })
        );
      }
    },

    async loadCartFromBackend() {
      try {
        // Try to load from localStorage first
        const savedCart = localStorage.getItem("cart-session");
        if (savedCart) {
          const cartData = JSON.parse(savedCart);
          this.sessionId = cartData.sessionId;
          this.branchId = cartData.branchId;
          this.items = cartData.items || [];
        }

        // If we have a session ID, try to sync with backend
        if (this.sessionId) {
          const response = await axios.get(`${apiUrl}/cart/${this.sessionId}`);
          if (response.data.cart) {
            this.items = response.data.cart.items || [];
            this.branchId = response.data.cart.branchId;
          }
        }
      } catch (error) {
        console.error("Error loading cart from backend:", error);
        // Continue with localStorage data
      }
    },

    async trackAddToCart(productId, varietyId) {
      try {
        await axios.post(`${apiUrl}/analytics/add-to-cart`, {
          productId,
          varietyId,
          branchId: this.branchId,
          sessionId: this.sessionId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error tracking add to cart:", error);
      }
    },
    //#endregion

    //#region Order Processing
    async createOrder(orderDetails) {
      this.loading = true;
      this.error = null;

      try {
        const headers = { "Content-Type": "application/json" };
        if (auth.currentUser) {
          const idToken = await getIdToken(auth.currentUser);
          headers.Authorization = `Bearer ${idToken}`;
        }

        const orderData = {
          sessionId: this.sessionId,
          branchId: this.branchId,
          items: this.items,
          totalAmount: this.totalAmount,
          ...orderDetails,
          createdAt: new Date().toISOString(),
        };

        const response = await axios.post(
          `${apiUrl}/orders/create`,
          orderData,
          { headers }
        );

        // Clear cart after successful order
        await this.clearCart();

        return response.data;
      } catch (error) {
        console.error("Error creating order:", error);
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    //#endregion

    //#region Utility Methods
    generateSessionId() {
      return (
        "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      );
    },

    generateItemId() {
      return (
        "item_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      );
    },

    getItemById(itemId) {
      return this.items.find((item) => item.id === itemId);
    },

    hasItem(productId, varietyId) {
      return this.items.some(
        (item) => item.productId === productId && item.varietyId === varietyId
      );
    },
    //#endregion
  },
  //#endregion

  //#region Persistence
  persist: {
    enabled: true,
    strategies: [
      {
        key: "cart-store",
        storage: localStorage,
        paths: ["sessionId", "branchId"],
      },
    ],
  },
  //#endregion
});
