import { defineStore } from "pinia"
import { formatCurrency } from "@/utils/productUtils"
import axios from 'axios';
import { db, auth } from '@/services/firebase';
import { getIdToken } from "firebase/auth";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useCartStore = defineStore("cart", {
    //#region State
    state: () => ({
        items: [],
    }),
    //#endregion

    //#region Getters
    getters: {
        itemCount: (state) => {
            return state.items.reduce((total, item) => total + item.quantity, 0)
        },

        totalAmount: (state) => {
            return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
        },

        formattedTotal: (state) => {
            return formatCurrency(state.totalAmount)
        },
    },
    //#endregion

    //#region Actions
    actions: {


        addItem(item) {
            this.items.push(item);


            console.log("Item added to cart:", item)

            this.saveCart(item)

            this.items = [];
        },

        // //#region Cart Management
        // addItem(newItem) {
        //     const existingItem = this.items.find(
        //         (item) => item.productId === newItem.productId && item.varietyId === newItem.varietyId,
        //     )

        //     if (existingItem) {
        //         existingItem.quantity += newItem.quantity
        //     } else {
        //         this.items.push({ ...newItem })
        //     }

        //     this.saveCart()
        // },

        updateItemQuantity(productId, varietyId, quantity) {
            const item = this.items.find((item) => item.productId === productId && item.varietyId === varietyId)

            if (item) {
                item.quantity = Math.max(1, quantity)
                this.saveCart()
            }
        },

        removeItem(productId, varietyId) {
            this.items = this.items.filter((item) => !(item.productId === productId && item.varietyId === varietyId))
            this.saveCart()
        },

        clearCart() {
            this.items = []
            this.saveCart()
        },
        //#endregion

        //#region Storage
        loadCart() {
            const savedCart = localStorage.getItem("cart")
            if (savedCart) {
                try {
                    this.items = JSON.parse(savedCart)
                } catch (e) {
                    console.error("Error loading cart from localStorage:", e)
                    this.items = []
                }
            }
        },

        async saveCart(item) {

            // localStorage.setItem("cart", JSON.stringify(this.items))

            // this.items

            this.loading = true;
            this.error = null;

            const idToken = await getIdToken(auth.currentUser)

            try {
                const response = await axios.post(`${apiUrl}cart`, item, {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Error adding cart:', error);
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
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
            },
        ],
    },
    //#endregion
})
