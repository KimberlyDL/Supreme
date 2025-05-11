// src/stores/productStore.js
import { defineStore } from 'pinia';
import axios from 'axios';
import { db, auth, storage } from '@/services/firebase';
import { getIdToken } from 'firebase/auth';
import { collection, query, where, orderBy, limit, startAfter, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef } from 'firebase/storage';

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
    lastVisible: null,
    hasMore: true,
    batchSize: 20,
    filters: {
      categories: ["All"],
      branch: 'All',
      onSale: false,
      lowStock: false,
      minPrice: null,
      maxPrice: null,
    },
    unsubscribe: null,
    fetchedProducts: null,
    // unsubscribeProducts: null
  }),
  actions: {

    // #region ProductDetails
    async getProductById(productId) {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();

          // Fetch all image URLs
          const imageUrls = productData.imageUrls?.length
            ? await Promise.all(productData.imageUrls.map(path => getDownloadURL(storageRef(storage, path))))
            : [];

          return {
            id: docSnap.id,
            ...productData,
            imageUrls,
            imageUrl: imageUrls.length ? imageUrls[0] : null
          };
        } else {
          console.log('No such product!');
          return null;
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },

    // #endregion


    // #region Update Product

    // Updated method to get product by ID with both image paths and URLs
    async getProductByIdWithPaths(productId) {
      try {
        const docRef = doc(db, 'products', productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();

          console.log("productData", productData)
          // Store the original image paths
          const imagePaths = productData.imageUrls || [];

          console.log("imagePaths", imagePaths)

          // Generate download URLs for each path
          const imageUrls = imagePaths.length
            ? await Promise.all(imagePaths.map(path => getDownloadURL(storageRef(storage, path))))
            : [];

          return {
            id: docSnap.id,
            ...productData,
            _imageUrls: imagePaths, // Original paths with underscore prefix
            imageUrls: imageUrls,   // Download URLs for display
            imageUrl: imageUrls.length ? imageUrls[0] : null // Main image URL
          };
        } else {
          console.log('No such product!');
          return null;
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    },


    // Replace the updateProduct method with this improved version that correctly handles image paths:

    async updateProduct(productId, formData) {
      try {
        console.log("this is the form data received by the store: ")
        // Log form data entries for debugging
        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`)
        }

        this.loading = true
        this.error = null

        // Get the current user's ID token for authentication
        const idToken = await getIdToken(auth.currentUser)

        // Create a new FormData object for the request
        const requestData = new FormData()

        // Add basic product information
        requestData.append("name", formData.get("name") || "")
        requestData.append("description", formData.get("description") || "")

        // Handle categories - get all category values
        const categories = formData.getAll("categories")
        if (categories && categories.length > 0) {
          categories.forEach((cat, index) => {
            requestData.append(`categories[${index}]`, cat)
          })
        }

        // Extract varieties from the form data
        const varieties = this.extractVarieties(Object.fromEntries(formData.entries()))
        console.log("Extracted varieties:", varieties)

        // Add varieties to the request
        if (varieties && varieties.length > 0) {
          varieties.forEach((variety, index) => {
            // Add basic variety fields
            requestData.append(`varieties[${index}][name]`, variety.name || "Default")
            requestData.append(`varieties[${index}][unit]`, variety.unit || "piece")
            requestData.append(`varieties[${index}][quantity]`, variety.quantity || "1")
            requestData.append(`varieties[${index}][price]`, variety.price || "0")
            requestData.append(`varieties[${index}][stockQuantity]`, variety.stockQuantity || "0")
            requestData.append(`varieties[${index}][isDefault]`, variety.isDefault || "false")
            requestData.append(`varieties[${index}][onSale]`, variety.onSale || "false")

            // Add sale data if this variety is on sale
            if (variety.onSale === "true" && variety.sale) {
              requestData.append(`varieties[${index}][sale][salePrice]`, variety.sale.salePrice || "0")
              requestData.append(`varieties[${index}][sale][startDate]`, variety.sale.startDate || "")
              requestData.append(`varieties[${index}][sale][endDate]`, variety.sale.endDate || "")
            }
          })
        } else {
          // Add a default variety if none exists
          requestData.append("varieties[0][name]", "Default")
          requestData.append("varieties[0][unit]", "piece")
          requestData.append("varieties[0][quantity]", "1")
          requestData.append("varieties[0][price]", "0")
          requestData.append("varieties[0][stockQuantity]", "0")
          requestData.append("varieties[0][isDefault]", "true")
          requestData.append("varieties[0][onSale]", "false")
        }

        // Handle existing image paths - get ALL paths
        const existingImagePaths = formData.getAll("existingImagePaths")
        if (existingImagePaths && existingImagePaths.length > 0) {
          existingImagePaths.forEach((path, index) => {
            if (path && path !== "") {
              requestData.append(`existingImagePaths[${index}]`, path)
            }
          })
        }

        // Handle removed image paths - get ALL paths
        const removedImagePaths = formData.getAll("removedImagePaths")
        if (removedImagePaths && removedImagePaths.length > 0) {
          removedImagePaths.forEach((path, index) => {
            if (path && path !== "") {
              requestData.append(`removedImagePaths[${index}]`, path)
            }
          })
        }

        // Handle new images - get ALL images
        const images = formData.getAll("images[]")
        if (images && images.length > 0) {
          images.forEach((file) => {
            if (file instanceof File) {
              requestData.append("images[]", file)
            }
          })
        }

        console.log("Request data to be sent:")
        for (const [key, value] of requestData.entries()) {
          console.log(`${key}: ${value}`)
        }

        // Make the API request to update the product
        const response = await axios.put(`${apiUrl}products/${productId}`, requestData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        })

        // Update the local product in the store if needed
        const updatedProduct = response.data.product
        const index = this.products.findIndex((p) => p.id === productId)
        if (index !== -1) {
          this.products[index] = updatedProduct
        }

        return updatedProduct
      } catch (error) {
        console.error("Error updating product:", error)
        this.error = error.message || "Failed to update product"
        throw error
      } finally {
        this.loading = false
      }
    },

    // Add this helper method to extract varieties from flattened form data
    extractVarieties(productData) {
      const varieties = []

      for (const key in productData) {
        const match = key.match(/^varieties\[(\d+)\]\[(.+)\]$/)
        if (match) {
          const index = Number(match[1])
          const fieldPath = match[2].split("][").map((f) => f.replace("]", "")) // Split nested fields

          // Ensure variety object exists
          if (!varieties[index]) {
            varieties[index] = {}
          }

          const currentObj = varieties[index]

          // Traverse nested structure
          if (fieldPath.length > 1) {
            // Handle nested fields like sale[salePrice]
            const field = fieldPath[0]
            if (!currentObj[field]) {
              currentObj[field] = {}
            }
            currentObj[field][fieldPath[1]] = productData[key]
          } else {
            // Handle direct fields like name, unit, etc.
            currentObj[fieldPath[0]] = productData[key]
          }
        }
      }

      // Filter out any empty slots that might have been created
      return varieties.filter((v) => v !== null && v !== undefined)
    },
    // #endregion


    // #region Delete Porduct
    async deleteProduct(productId) {
      try {
        this.loading = true;
        this.error = null;

        const idToken = await getIdToken(auth.currentUser);

        await axios.delete(`${apiUrl}products/${productId}`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        // Remove the deleted product from the local store
        this.products = this.products.filter(product => product.id !== productId);
      } catch (error) {
        console.error('Error deleting product:', error);
        this.error = error.message || 'Failed to delete product';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // #endregion

    // #region Fetch Products

    async fetchProducts(isInitial = false) {
      if (isInitial) {
        this.products = []
        this.lastVisible = null
        this.hasMore = true
      }

      if (!this.hasMore) return

      this.loading = true
      try {
        let q = collection(db, "products")
        const constraints = []

        // Apply server-side filters
        if (this.filters.categories.length > 0 && !this.filters.categories.includes("All")) {
          constraints.push(where("category", "array-contains-any", this.filters.categories))
        }

        if (this.filters.branch !== "All") {
          constraints.push(where("branchId", "==", this.filters.branch))
        }

        // Get default variety price for sorting
        constraints.push(orderBy("varieties"))
        constraints.push(limit(this.batchSize))

        if (this.lastVisible) {
          constraints.push(startAfter(this.lastVisible))
        }

        // Build the query with all constraints
        if (constraints.length > 0) {
          q = query(q, ...constraints)
        } else {
          q = query(q, orderBy("varieties"), limit(this.batchSize))
        }

        const snapshot = await getDocs(q)

        const newProducts = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data()

            // Find default variety
            const defaultVariety = data.varieties?.find((v) => v.isDefault) || data.varieties?.[0]

            // Handle images
            const imageUrls = data.imageUrls?.length
              ? await Promise.all(data.imageUrls.map((path) => getDownloadURL(storageRef(storage, path))))
              : []

            return {
              id: doc.id,
              ...data,
              imageUrls,
              imageUrl: imageUrls.length ? imageUrls[0] : null,
              defaultVariety,
            }
          }),
        )

        // Apply client-side filters
        let filteredProducts = newProducts

        // Price filter
        if (this.filters.minPrice !== null && this.filters.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter((product) => {
            const defaultPrice = product.defaultVariety?.price || 0
            return defaultPrice >= Number(this.filters.minPrice)
          })
        }

        if (this.filters.maxPrice !== null && this.filters.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter((product) => {
            const defaultPrice = product.defaultVariety?.price || 0
            return defaultPrice <= Number(this.filters.maxPrice)
          })
        }

        // Sale filter
        if (this.filters.onSale) {
          const now = Date.now()
          filteredProducts = filteredProducts.filter((product) => {
            return product.varieties?.some((variety) => {
              if (variety.onSale && variety.sale) {
                const startDate = variety.sale.startDate?.seconds * 1000
                const endDate = variety.sale.endDate?.seconds * 1000
                return now >= startDate && now <= endDate
              }
              return false
            })
          })
        }

        // Low stock filter
        if (this.filters.lowStock) {
          filteredProducts = filteredProducts.filter((product) => {
            return product.varieties?.some((variety) => variety.stockQuantity <= 10)
          })
        }

        if (isInitial) {
          this.products = filteredProducts
        } else {
          this.products.push(...filteredProducts)
        }

        this.lastVisible = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null
        this.hasMore = newProducts.length === this.batchSize
      } catch (error) {
        console.error("Error fetching products:", error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Helper method to check if a variety is on sale
    isVarietyOnSale(variety) {
      if (!variety?.onSale || !variety?.sale) return false

      const now = Date.now()
      const startDate = variety.sale.startDate?.seconds * 1000
      const endDate = variety.sale.endDate?.seconds * 1000

      return now >= startDate && now <= endDate
    },

    // Get the current price for a variety (considering sales)
    getVarietyPrice(variety) {
      if (this.isVarietyOnSale(variety)) {
        return variety.sale.salePrice
      }
      return variety.price
    },

    // Get the current price for a product (using default variety)
    getProductPrice(product) {
      const defaultVariety = product.varieties?.find((v) => v.isDefault) || product.varieties?.[0]
      if (!defaultVariety) return 0

      return this.getVarietyPrice(defaultVariety)
    },

    // Check if any variety in a product is on sale
    isProductOnSale(product) {
      return product.varieties?.some((variety) => this.isVarietyOnSale(variety)) || false
    },

    // Check if product has low stock
    isLowStock(product) {
      return product.varieties?.some((variety) => variety.stockQuantity <= 10) || false
    },

    // Check if product has low stock
    isOutOfStock(product) {
      return product.varieties?.every((variety) => variety.stockQuantity == 0) || false
    },


    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
      this.fetchProducts(true);
    },

    //#endregion

    //#region Realtime Products

    // from gpt
    async setupRealtimeProducts() {
      // Clear any existing listener
      if (this.unsubscribe) {
        this.unsubscribe();
      }

      const q = query(collection(db, 'products'), orderBy('updatedAt', 'desc'), limit(1000));

      this.unsubscribe = onSnapshot(q, async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          if (change.type === "added" || change.type === "modified") {
            const data = change.doc.data();

            // Find default variety (if any)
            const defaultVariety = data.varieties?.find(v => v.isDefault) || data.varieties?.[0];

            // Get price from default variety or fallback to any legacy basePrice
            const price = defaultVariety?.price || data.basePrice || data.price;

            // Get sale information from default variety or root level
            const sale = defaultVariety?.sale || data.sale;

            // Get stock quantity from default variety or root level
            const stockQuantity = defaultVariety?.stockQuantity || data.stockQuantity;

            // Handle images
            const imageUrls = data.imageUrls?.length
              ? await Promise.all(data.imageUrls.map(path => getDownloadURL(storageRef(storage, path))))
              : [];

            const updatedProduct = {
              id: change.doc.id,
              ...data,
              imageUrls,
              imageUrl: imageUrls.length ? imageUrls[0] : null,
              price, // Use the processed price
              sale,  // Use the processed sale info
              stockQuantity, // Use the processed stock quantity
              defaultVariety // Include the default variety for reference
            };

            console.log('products updated:', this.products);

            const index = this.products.findIndex(p => p.id === updatedProduct.id);
            if (index !== -1) {
              this.products[index] = updatedProduct;
            } else {
              this.products.unshift(updatedProduct);
            }
          }
          if (change.type === "removed") {
            this.products = this.products.filter(p => p.id !== change.doc.id);
          }
        }
      }, (error) => {
        console.error("Error in real-time products listener:", error);
      });

      console.log('products:', this.products);
    },

    stopListening() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
        this.fetchedProducts = [];
      }
    },

    // async stopProductListening() {
    //   if (this.unsubscribeProducts) {
    //     this.unsubscribeProducts();
    //     this.unsubscribeProducts = null;
    //     this.fetchedProducts = [];
    //   }
    // },

    // async setupRealtimeProducts() {
    //   // const auth = getAuth();
    //   // const db = getFirestore();

    //   if (this.unsubscribe) {
    //     this.unsubscribe();
    //   }

    //   this.loading = true;
    //   this.error = null;

    //   try {
    //     const q = query(collection(db, 'products'));

    //     this.unsubscribe = onSnapshot(q, (querySnapshot) => {
    //       const products = [];
    //       querySnapshot.forEach((doc) => {
    //         products.push({ id: doc.id, ...doc.data() });
    //       });
    //       this.products = products;
    //       this.loading = false;
    //     }, (error) => {
    //       console.error('Error fetching products:', error);
    //       this.error = error.message;
    //       this.loading = false;
    //     });
    //   } catch (error) {
    //     console.error('Error setting up real-time listener:', error);
    //     this.error = error.message;
    //     this.loading = false;
    //   }
    // },

    clearRealtimeProducts() {
      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }
      this.products = [];
    },

    //#endregion

    // #region Add Product

    async addProduct(productData) {
      try {
        this.loading = true
        const idToken = await getIdToken(auth.currentUser)

        console.log("Product data to be sent:", productData)

        const formData = new FormData()

        // Add basic product information
        formData.append("name", productData.name)
        formData.append("description", productData.description)

        // Add categories
        if (Array.isArray(productData.category) && productData.category.length > 0) {
          productData.category.forEach((cat) => {
            formData.append("categories", cat)
          })
        } else {
          formData.append("categories", [])
        }

        // Add varieties (new schema)
        if (Array.isArray(productData.varieties)) {
          productData.varieties.forEach((variety, index) => {
            formData.append(`varieties[${index}][name]`, variety.name)
            formData.append(`varieties[${index}][unit]`, variety.unit)
            formData.append(`varieties[${index}][quantity]`, variety.quantity)
            formData.append(`varieties[${index}][price]`, variety.price)
            formData.append(`varieties[${index}][stockQuantity]`, variety.stockQuantity)
            formData.append(`varieties[${index}][isDefault]`, variety.isDefault)

            if (variety.onSale) {
              formData.append(`varieties[${index}][onSale]`, true)
              formData.append(`varieties[${index}][sale][salePrice]`, variety.sale.salePrice)
              formData.append(`varieties[${index}][sale][startDate]`, variety.sale.startDate)
              formData.append(`varieties[${index}][sale][endDate]`, variety.sale.endDate)
            } else {
              formData.append(`varieties[${index}][onSale]`, false)
            }
          })
        }

        // Add images
        if (Array.isArray(productData.images) && productData.images.length > 0) {
          productData.images.forEach((file) => {
            formData.append("images[]", file)
          })
        }

        console.log("Form data entries:", [...formData.entries()])

        const response = await axios.post(`${apiUrl}products`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        })

        return response.data;
      } catch (error) {
        console.error("Error adding product:", error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // async addProduct(productData) {
    //   try {
    //     this.loading = true;
    //     const idToken = await getIdToken(auth.currentUser);

    //     let imageUrl = null;
    //     let fileName = null;

    //     console.log('formdata: ');
    //     console.log(productData);

    //     const formData = new FormData();
    //     // formData.append('sales', JSON.stringify(productData.sales));

    //     // Properly serialize the sale object
    //     formData.append(
    //       "sale",
    //       JSON.stringify({
    //         endDate: productData.sale.endDate,
    //         onSale: productData.sale.onSale,
    //         salePrice: productData.sale.salePrice,
    //         startDate: productData.sale.startDate,
    //       }),
    //     )

    //     formData.append('varietyPrices', JSON.stringify(productData.varietyPrices));
    //     // formData.append('category', productData.category);

    //     formData.append("categories", JSON.stringify(productData.categories || []));

    //     formData.append('stockQuantity', productData.stockQuantity);
    //     formData.append('basePrice', productData.basePrice);
    //     formData.append('description', productData.description);
    //     formData.append('name', productData.name);

    //     formData.append('image', productData.images);

    //     // productData.images.forEach(image => {
    //     //   formData.append('images', image);
    //     // });


    //     // // Handling varietyPrices array
    //     // productData.varietyPrices.forEach((variety, index) => {
    //     //   formData.append(`varietyPrices[${index}][unit]`, variety.unit);
    //     //   formData.append(`varietyPrices[${index}][quantity]`, variety.quantity);
    //     //   formData.append(`varietyPrices[${index}][discountPrice]`, variety.discountPrice);
    //     // });

    //     console.log('requestdata: ');
    //     console.log([...formData.entries()]);

    //     const uploadResponse = await axios.post(`${apiUrl}products`, productData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //         Authorization: `Bearer ${idToken}`,
    //       },
    //     });

    //     // if (productImage) {
    //     //   const formData = new FormData();
    //     //   formData.append('file', productImage);

    //     //   const uploadResponse = await axios.post(`${apiUrl}products`, productData, {
    //     //     headers: {
    //     //       'Content-Type': 'multipart/form-data',
    //     //       Authorization: `Bearer ${idToken}`,
    //     //     },
    //     //   });

    //     //   imageUrl = uploadResponse.data.fileUrl;
    //     //   fileName = uploadResponse.data.fileData.fileName;
    //     // }

    //     // console.log("files", files);

    //     // const response = await axios.post(`${apiUrl}products`, {
    //     //   ...productData,
    //     //   imageUrl,
    //     //   fileName,
    //     // }, {
    //     //   headers: {
    //     //     Authorization: `Bearer ${idToken}`,
    //     //   },
    //     // });

    //     // this.products.push(response.data);
    //   } catch (error) {
    //     console.error('Error adding product:', error);
    //     this.error = error.message;
    //   } finally {
    //     this.loading = false;
    //   }
    // },
    // #endregion

    // async getExistingProductCategories() {
    //   try {
    //     const response = await axios.get(`${apiUrl}store/categories`);
    //     if (response.data) {
    //       return response.data;
    //     }
    //   } catch (error) {
    //     console.error('getExistingProductCategories:', error.message);
    //   }
    // },

    // async addProduct(productData, productImage) {
    //   try {
    //     this.loading = true;
    //     const idToken = await getIdToken(auth.currentUser);

    //     let imageUrl = null;
    //     let fileName = null;

    //     if (productImage) {
    //       const formData = new FormData();
    //       formData.append('file', productImage);

    //       const uploadResponse = await axios.post(`${apiUrl}products`, formData, {
    //         headers: {
    //           'Content-Type': 'multipart/form-data',
    //           Authorization: `Bearer ${idToken}`,
    //         },
    //       });

    //       imageUrl = uploadResponse.data.fileUrl;
    //       fileName = uploadResponse.data.fileData.fileName;
    //     }

    //     console.log("files", files);

    //     // const response = await axios.post(`${apiUrl}products`, {
    //     //   ...productData,
    //     //   imageUrl,
    //     //   fileName,
    //     // }, {
    //     //   headers: {
    //     //     Authorization: `Bearer ${idToken}`,
    //     //   },
    //     // });

    //     // this.products.push(response.data);
    //   } catch (error) {
    //     console.error('Error adding product:', error);
    //     this.error = error.message;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // async updateProduct(productId, productData, productImage) {
    //   try {
    //     this.loading = true;
    //     const idToken = await getIdToken(auth.currentUser);

    //     let imageUrl = productData.imageUrl;
    //     let fileName = productData.fileName;

    //     if (productImage) {
    //       const formData = new FormData();
    //       formData.append('file', productImage);

    //       const uploadResponse = await axios.post(`${apiUrl}products/upload`, formData, {
    //         headers: {
    //           'Content-Type': 'multipart/form-data',
    //           Authorization: `Bearer ${idToken}`,
    //         },
    //       });

    //       imageUrl = uploadResponse.data.fileUrl;
    //       fileName = uploadResponse.data.fileData.fileName;
    //     }

    //     const response = await axios.put(`${apiUrl}products/${productId}`, {
    //       ...productData,
    //       imageUrl,
    //       fileName,
    //     }, {
    //       headers: {
    //         Authorization: `Bearer ${idToken}`,
    //       },
    //     });

    //     const index = this.products.findIndex(p => p.id === productId);
    //     if (index !== -1) {
    //       this.products[index] = response.data;
    //     }
    //   } catch (error) {
    //     console.error('Error updating product:', error);
    //     this.error = error.message;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // async deleteProduct(productId) {
    //   try {
    //     this.loading = true;
    //     const idToken = await getIdToken(auth.currentUser);
    //     await axios.delete(`${apiUrl}products/${productId}`, {
    //       headers: {
    //         Authorization: `Bearer ${idToken}`,
    //       },
    //     });
    //     this.products = this.products.filter(p => p.id !== productId);
    //   } catch (error) {
    //     console.error('Error deleting product:', error);
    //     this.error = error.message;
    //   } finally {
    //     this.loading = false;
    //   }
    // },

    // async uploadImage(productImage) {
    //   try {
    //     // const idToken = await getIdToken(auth.currentUser);
    //     const formData = new FormData();
    //     formData.append('file', productImage);

    //     const response = await axios.post(`${apiUrl}products/upload`, formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //         // Authorization: `Bearer ${idToken}`,
    //       },
    //     });

    //     return response.data; // Contains fileUrl and fileData
    //   } catch (error) {
    //     console.error('Error uploading image:', error);
    //     throw error;
    //   }
    // },
  },
});