// {
//     categoryId: "unique-category-id", // Auto-generated or manually assigned unique ID
//     name: "Category Name", // String - Name of the product category
//     description: "A brief description of the category", // String - Optional description
//     createdAt: Timestamp, // Firestore server timestamp for when the category was created
//     updatedAt: Timestamp, // Firestore server timestamp for the last update
//     parentCategory: "parent-category-id", // String - ID of the parent category if nested (optional)
//     status: "active", // String - Status of the category (e.g., "active", "inactive")
//     imageUrl: "https://example.com/image.jpg", // String - Optional URL for a category image
//     displayOrder: 1 // Number - Optional order for display purposes
//   }

// frontend\src\stores\categoryStore.js

import { defineStore } from "pinia";
import { db, storage, auth } from "@/services/firebase";
// import { collection, query, onSnapshot, orderBy } from "firebase/firestore"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { getIdToken } from "firebase/auth";
import { getDownloadURL, ref as storageRef } from "firebase/storage";
import { useToastStore } from "@/stores/toastStore";
const toast = useToastStore();
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useCategoryStore = defineStore("category", {
  state: () => ({
    fetchedCategories: [],
    categoriesWithProducts: [],
    loading: false,
    error: null,
    unsubscribe: null,
    unsubscribeCategories: null,
  }),

  getters: {
    activeCategories() {
      return this.fetchedCategories.filter((cat) => cat.isActive);
    },
  },

  actions: {
    // productStore
    // editProductStore ay awan
    // async fetchCategoryNamesRealtime() {
    //   if (this.unsubscribe) {
    //     this.unsubscribe()
    //   }

    //   try {
    //     const q = query(collection(db, "categories"), orderBy("name"))

    //     this.unsubscribe = onSnapshot(
    //       q,
    //       (snapshot) => {
    //         this.fetchedCategories = snapshot.docs.map((doc) => ({
    //           id: doc.id,
    //           name: doc.data().name,
    //           isActive: doc.data().isActive,
    //         }))
    //       },
    //       (error) => {
    //         console.error("Error fetching categories:", error)
    //         this.error = error.message
    //       },
    //     )
    //   } catch (error) {
    //     console.error("Error setting up categories listener:", error)
    //     this.error = error.message
    //   }
    // },

    // #region Categories same from the branchStore
    fetchCategoryNamesRealtime() {
      if (this.unsubscribeCategories) {
        this.unsubscribeCategories();
      }

      const categoryRef = query(
        collection(db, "categories"),
        where("isActive", "==", true)
      );

      this.unsubscribeCategories = onSnapshot(
        categoryRef,
        (snapshot) => {
          this.fetchedCategories = snapshot.docs.map((doc) => doc.data().name);
        },
        (error) => {
          console.error("Error in realtime category names listener:", error);
        }
      );
    },

    stopListeningCategoryNames() {
      if (this.unsubscribeCategories) {
        this.unsubscribeCategories();
        this.unsubscribeCategories = null;
      }
    },
    // #endregion

    async fetchCategoryNames() {
      this.loading = true;
      this.fetchedCategories = [];
      try {
        const idToken = await getIdToken(auth.currentUser);

        const response = await axios.get(`${apiUrl}categories/names`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        const uniqueCategories = new Set();

        Object.values(response.data).forEach((name) => {
          uniqueCategories.add(name);
        });

        this.fetchedCategories = Array.from(uniqueCategories);

        this.loading = false;
      } catch (error) {
        console.log(error);
        this.error = "Failed to fetch categories. Please refresh.";
      }
    },

    async fetchCategoriesWithProducts() {
      this.loading = true;
      this.error = null;

      try {
        const idToken = await getIdToken(auth.currentUser);

        const response = await axios.get(`${apiUrl}categories/withproducts`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        const categoriesData = response.data.categories || [];

        // Process each category to get image URLs for products
        const processedCategories = await Promise.all(
          categoriesData.map(async (category) => {
            // Process products to get image URLs
            const productsWithImages = await Promise.all(
              (category.products || []).map(async (product) => {
                // Get image URLs from Firebase Storage
                const imageUrls = product.imagePaths?.length
                  ? await Promise.all(
                      product.imagePaths.map((path) =>
                        getDownloadURL(storageRef(storage, path)).catch(
                          (error) => {
                            console.error(
                              `Error getting URL for ${path}:`,
                              error
                            );
                            return null;
                          }
                        )
                      )
                    )
                  : [];

                // Filter out any null URLs (from errors)
                const validImageUrls = imageUrls.filter((url) => url !== null);

                return {
                  ...product,
                  imageUrls: validImageUrls,
                  imageUrl:
                    validImageUrls.length > 0 ? validImageUrls[0] : null,
                };
              })
            );

            return {
              ...category,
              products: productsWithImages,
            };
          })
        );

        this.categoriesWithProducts = processedCategories;
        return processedCategories;
      } catch (error) {
        console.error("Error fetching categories with products:", error);
        this.error = error.message;
        return [];
      } finally {
        this.loading = false;
      }
    },

    //#region add
    async addCategory(categoryData) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        const payload = {
          name: categoryData.name,
          isActive: categoryData.isActive,
        };

        const response = await axios.post(`${apiUrl}categories/`, payload, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        toast.addToast({
          type: "success",
          message: response.data?.message || "Category successfully added",
          duration: 3000,
        });
        // return response.data;
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 400) {
          const error = new Error(
            displayToUser
              ? msg || "Failed to add category"
              : "Failed to add category"
          );
          error.formError = true;
          throw error;
        } else if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg || "Failed to create category. Please try again later."
            : "Failed to create category. Please try again later.",
          duration: 3000,
        });
      }
    },
    //#endregion add
    //#region update
    async updateCategory(categoryId, categoryData) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        const payload = {
          name: categoryData.name,
          description: categoryData.description,
          isActive: categoryData.isActive,
        };

        const response = await axios.put(
          `${apiUrl}categories/${categoryId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        toast.addToast({
          type: "success",
          message: response.data?.message || "Category successfully updated",
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 400) {
          const error = new Error(
            displayToUser
              ? msg || "Failed to update category"
              : "Failed to update category"
          );
          error.formError = true;
          throw error;
        } else if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg || "Failed to update category. Please try again later."
            : "Failed to update category. Please try again later.",
          duration: 3000,
        });
      }
    },
    //#region deleteCategory
    async deleteCategory(categoryId) {
      try {
        const idToken = await getIdToken(auth.currentUser);

        const response = await axios.delete(
          `${apiUrl}categories/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        toast.addToast({
          type: "success",
          message: response.data?.message || "Category successfully deleted",
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg || "Failed to delete category. Please try again later."
            : "Failed to delete category. Please try again later.",
          duration: 3000,
        });
      }
    },

    //#region moveProductsBetweenCategories
    async moveProductsBetweenCategories(data) {
      try {
        const idToken = await getIdToken(auth.currentUser);
        const response = await axios.post(
          `${apiUrl}products/move-between-categories`,
          {
            ...data
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        toast.addToast({
          type: "success",
          message: response.data?.message || "Category successfully deleted",
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg ||
              "Error moving products between categories. Please try again later."
            : "Error moving products between categories. Please try again later.",
          duration: 3000,
        });
      }
    },

    //#region removeProductFromCategory
    async removeProductFromCategory(productId, categoryId) {
      try {
        const idToken = await getIdToken(auth.currentUser);
        const response = await axios.post(
          `${apiUrl}products/remove-from-category`,
          {
            productId,
            categoryId,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );

        toast.addToast({
          type: "success",
          message:
            response.data?.message ||
            "Product successfully removed from category",
          duration: 3000,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg ||
              "Error removing product from category. Please try again later."
            : "Error removing product from category. Please try again later.",
          duration: 3000,
        });
      }
    },

    //#region removeProductsFromCategory
    async removeProductsFromCategory(productIds, categoryId) {
      try {
        const idToken = await getIdToken(auth.currentUser);
        const response = await axios.post(
          `${apiUrl}products/remove-from-category-bulk`,
          {
            productIds,
            categoryId,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message;
        const displayToUser = error.response?.data?.displayToUser;

        if (status === 401 || status === 403) {
          this.handleUnauthorizedAction();
        }

        toast.addToast({
          type: "error",
          message: displayToUser
            ? msg ||
              "Error removing products from category. Please try again later."
            : "Error removing products from category. Please try again later.",
          duration: 3000,
        });
      }
    },

    stopListeningCategoryNames() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
    },

    async handleUnauthorizedAction() {
      console.log("create handleUnauthorizedAction method");
      // this.error = "You're not authorized to perform this action.";
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: "category-store",
        storage: localStorage,
        paths: ["fetchedCategories"],
      },
    ],
  },
});
