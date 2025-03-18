// backend/controllers/ProductController.js
const { bucket, Timestamp } = require('../../config/firebase');
const { v4: uuidv4 } = require('uuid');
const sharp = require("sharp")
const ProductModel = require('../../models/ProductModel');
const UploadModel = require('../../models/UploadModel');
const CategoryModel = require('../../models/CategoryModel');

const ProductService = require('../../services/ProductService');
const UploadImages = require('../../lib/UploadImages');

const productService = new ProductService();

const ProductController = {
  getAllProducts: async (req, res) => {
    try {
      const products = await ProductModel.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  // getCategories: async (req, res) => {
  //   try {
  //     const categories = await CategoryModel.getAllCategories();
  //     res.json(categories);
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to fetch categories' });
  //   }
  // },


  // #region Add Product
  addProduct: async (req, res) => {
    try {
      const productData = req.body;
      const productFiles = req.files?.["images[]"];
      console.log('productData', productData);
      console.log('productFiles', productFiles);

      if (!req.files && (!req.files.image && !req.files.images)) {
        return res.status(400).json({ error: 'Profile image is required' });
      }

      let images;

      if (!productFiles) {
        // images = productFiles
        return res.status(400).json({ error: 'Profile image is required' });
      }

      images = Array.isArray(productFiles) ? productFiles : [productFiles];

      console.log('images', images);

      let imageUrls = [];

      // Upload images to Firebase Storage
      for (const image of images) {
        try {
          // Optimize image before upload
          const processedImageBuffer = await sharp(image.data)
            .resize(1000, 1000, {
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 80 }) // Convert to JPEG and compress
            .toBuffer()

          const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, "_")
          const fileName = `${uuidv4()}_${sanitizedFileName}`
          const fileUpload = bucket.file(`uploads/${fileName}`)

          // Upload file using a promise to handle stream properly
          await new Promise((resolve, reject) => {
            const stream = fileUpload.createWriteStream({
              metadata: {
                contentType: "image/jpeg", // We converted to JPEG above
                metadata: {
                  originalFileName: image.name,
                  originalMimeType: image.mimetype,
                },
              },
              resumable: false, // Disable resumable uploads for smaller files
            })

            stream.on("error", (error) => {
              console.error("Upload error:", error)
              reject(error)
            })

            stream.on("finish", async () => {
              try {
                // await fileUpload.makePublic()
                // const imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`
                const imageUrl = `uploads/${fileName}`;
                imageUrls.push(imageUrl)
                resolve()
              } catch (error) {
                reject(error)
              }
            })

            // Write the processed buffer and end the stream
            stream.end(processedImageBuffer)
          })
        } catch (error) {
          console.error("Error processing image:", error)
          return res.status(500).json({
            error: "Failed to process image",
            details: error.message,
          })
        }
        //   .resize(1000, 1000, {
        //     fit: "inside",
        //     withoutEnlargement: true,
        //   })
        //   .jpeg({ quality: 80 }) // Convert to JPEG and compress
        //   .toBuffer()

        // const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, '_');
        // const fileName = `${uuidv4()}_${sanitizedFileName}`;
        // const fileUpload = bucket.file(`uploads/${fileName}`);

        // // // Process image with sharp
        // // const processedImageBuffer = await sharp(image.data)
        // //   .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
        // //   .toBuffer()

        // const stream = fileUpload.createWriteStream({
        //   metadata: { contentType: image.mimetype },
        // });

        // // After upload finishes, generate public URL
        // await new Promise((resolve, reject) => {
        //   const stream = fileUpload.createWriteStream({
        //     metadata: {
        //       contentType: "image/jpeg", // We converted to JPEG above
        //       metadata: {
        //         originalFileName: image.name,
        //         originalMimeType: image.mimetype,
        //       },
        //     },
        //     resumable: false, // Disable resumable uploads for smaller files
        //   })

        //   // Handle stream errors
        //   stream.on('error', (err) => {
        //     console.error('Error during upload:', err);
        //     return res.status(500).json({ error: 'Failed to upload image' });
        //   });

        //   stream.on('finish', async () => {
        //     try {
        //       await fileUpload.makePublic();
        //       const imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`;
        //       imageUrls.push(imageUrl);
        //       resolve();
        //     } catch (error) {
        //       reject(error);
        //     }
        //   });

        //   // Stream the file buffer to Firebase Storage
        //   stream.end(image.data);
        // });
      }


      // Parse categories from the request
      let categories = []

      if (productData['categories[]']) {
        try {
          // Convert single category string to array
          let cat = [];
          if (Array.isArray(productData['categories[]'])) {
            cat = productData['categories[]'];
          } else {
            cat = [productData['categories[]']];
          }

          // Add categories
          for (const c of cat) {
            console.log('ccategories:', c);

            categories.push(c);
          }
        } catch (error) {
          console.error("Error parsing categories:", error)
        }
      }

      // Check for new categories and add them to the database
      for (const category of categories) {
        try {
          // Check if the category already exists
          const existingCategory = await CategoryModel.isCategoryExist(category)

          if (!existingCategory) {
            await CategoryModel.addCategory({
              name: category,
              isActive: true,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          }
        } catch (error) {
          console.error(`Error processing category ${category}:`, error)
        }
      }

      const varietyPrices = [];
      let index = 0;

      // Loop through productData to reconstruct varietyPrices array
      while (productData[`varietyPrices[${index}][unit]`]) {
        varietyPrices.push({
          unit: productData[`varietyPrices[${index}][unit]`],
          quantity: Number(productData[`varietyPrices[${index}][quantity]`]),
          discountPrice: Number(productData[`varietyPrices[${index}][discountPrice]`]),
        });
        index++;
      }

      let sale = null;

      if (productData['sale[onSale]'] === 'true') {
        sale = {
          onSale: true,
          salePrice: Number(productData['sale[salePrice]']),
          startDate: Timestamp.fromDate(new Date(productData['sale[startDate]'])),
          endDate: Timestamp.fromDate(new Date(productData['sale[endDate]'])),
        };
      }

      // Prepare product data
      const product = {
        name: productData.name,
        description: productData.description,
        basePrice: Number(productData.basePrice),
        imageUrls: imageUrls,
        varietyPrices,
        stockQuantity: Number(productData.stockQuantity) || 0,
        category: categories,
        sale,
      };

      console.log('product', product);

      const newProduct = await ProductModel.createProduct(product);

      return res.status(201).json({
        message: 'Product created successfully',
        productData: newProduct,
      });

    } catch (error) {
      console.error('Failed to add product:', error);
      return res.status(500).json({ error: 'Failed to add product' });
    }
  },

  // #endregion

  // editProduct: async (req, res) => {
  //   try {
  //     const productData = req.body;
  //     const productFiles = req.files?.["images[]"];
  //     console.log('productData', productData);
  //     console.log('productFiles', productFiles);
  //   } catch (error) {
  //     console.error('Failed to add product:', error);
  //     return res.status(500).json({ error: 'Failed to add product' });
  //   }
  // },

  // #region Edit Product
  async editProduct(req, res) {
    try {
      const { id } = req.params
      const productData = req.body

      const productFiles = req.files?.["images[]"]
      console.log('id:', id);
      console.log('productData', productData);
      console.log('productFiles', productFiles);
      // Get current product data

      const currentProduct = await ProductModel.getProductById(id)
      if (!currentProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Handle new image uploads
      const newImagePaths = []
      if (productFiles) {

        const images = Array.isArray(productFiles) ? productFiles : [productFiles]

        console.log('images', images);

        for (const image of images) {
          try {
            // Optimize image before upload
            const processedImageBuffer = await sharp(image.data)
              .resize(1000, 1000, {
                fit: "inside",
                withoutEnlargement: true,
              })
              .jpeg({ quality: 80 })
              .toBuffer()

            const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, "_")
            const fileName = `${uuidv4()}_${sanitizedFileName}`
            const imagePath = `uploads/${fileName}`
            const fileUpload = bucket.file(imagePath)

            // Upload file
            await new Promise((resolve, reject) => {
              const stream = fileUpload.createWriteStream({
                metadata: {
                  contentType: "image/jpeg",
                  metadata: {
                    originalFileName: image.name,
                    originalMimeType: image.mimetype,
                  },
                },
                resumable: false,
              })

              stream.on("error", reject)
              stream.on("finish", () => resolve())
              stream.end(processedImageBuffer)
            })

            newImagePaths.push(imagePath)
          } catch (error) {
            console.error("Error processing image:", error)
            return res.status(500).json({
              error: "Failed to process image",
              details: error.message
            });
          }
        }
      }

      // Ensure removedImagePaths is always an array
      let removedImagePaths = productData.removedImagePaths;
      if (!Array.isArray(removedImagePaths)) {
        removedImagePaths = removedImagePaths ? [removedImagePaths] : [];
      }
      // Handle removed images
      if (removedImagePaths.length > 0) {
        await Promise.all(
          removedImagePaths.map(async (path) => {
            try {
              const fileRef = bucket.file(path)
              await fileRef.delete()
            } catch (error) {
              console.error(`Error deleting image ${path}:`, error)
            }
          }),
        )
      }

      let existingImagePaths = productData.existingImagePaths;
      if (!Array.isArray(existingImagePaths)) {
        existingImagePaths = existingImagePaths ? [existingImagePaths] : [];
      }

      // if (productData.existingImagePaths) {
      //   try {
      //     let path = [];
      //     path = Array.isArray(productData.existingImagePaths) ? productData.existingImagePaths : [productData.existingImagePaths];

      //     for (const p of path) {
      //       console.log('existing path:', p);
      //       existingImages.push(p);
      //     }
      //   } catch (error) {
      //     console.error("Error parsing categories:", error)
      //   }
      // }


      // Combine existing and new image paths
      const updatedImagePaths = [...existingImagePaths, ...newImagePaths];
      console.log('new paths', updatedImagePaths);

      // // Parse sale dates if present
      // let sale = null
      // if (productData.sale) {
      //   sale = {
      //     onSale: productData.sale.onSale,
      //     salePrice: Number(productData.sale.salePrice),
      //     startDate: productData.sale.startDate ? Timestamp.fromDate(new Date(productData.sale.startDate)) : null,
      //     endDate: productData.sale.endDate ? Timestamp.fromDate(new Date(productData.sale.endDate)) : null,
      //   }
      // }

      //// Prepare updated product data
      // const updatedProduct = {
      //   name: productData.name,
      //   description: productData.description,
      //   basePrice: Number(productData.basePrice),
      //   stockQuantity: Number(productData.stockQuantity),
      //   category: productData.category,
      //   imageUrls: updatedImagePaths,
      //   varietyPrices: productData.varietyPrices,
      //   sale,
      //   updatedAt: Timestamp.now(),
      // }

      // let categories = [];

      // if (productData['category[]']) {
      //   try {
      //     let cat = Array.isArray(productData['category[]']) ? productData['category[]'] : [productData['category[]']];
      //     categories = [...cat];
      //   } catch (error) {
      //     console.error("Error parsing categories:", error);
      //   }
      // }

      // for (const category of categories) {
      //   try {
      //     const existingCategory = await CategoryModel.isCategoryExist(category);
      //     if (!existingCategory) {
      //       await CategoryModel.addCategory({
      //         name: category,
      //         isActive: true,
      //         createdAt: Timestamp.now(),
      //         updatedAt: Timestamp.now(),
      //       });
      //     }
      //   } catch (error) {
      //     console.error(`Error processing category ${category}:`, error);
      //   }
      // }

      // Parse categories from the request
      let categories = []

      if (productData.categories) {
        try {
          // Convert single category string to array
          let cat = [];
          if (Array.isArray(productData.categories)) {
            cat = productData.categories;
          } else {
            cat = [productData.categories];
          }

          // Add categories
          for (const c of cat) {
            console.log('ccategories:', c);

            categories.push(c);
          }
        } catch (error) {
          console.error("Error parsing categories:", error)
        }
      }

      // Check for new categories and add them to the database
      for (const category of categories) {
        try {
          // Check if the category already exists
          const existingCategory = await CategoryModel.isCategoryExist(category)

          if (!existingCategory) {
            await CategoryModel.addCategory({
              name: category,
              isActive: true,
              createdAt: Timestamp.now(),
              updatedAt: Timestamp.now(),
            });
          }
        } catch (error) {
          console.error(`Error processing category ${category}:`, error)
        }
      }


      let varietyPrices = [];
      let index = 0;

      // Reconstruct varietyPrices array from indexed request fields
      while (productData[`varietyPrices[${index}][unit]`]) {
        varietyPrices.push({
          unit: productData[`varietyPrices[${index}][unit]`],
          quantity: Number(productData[`varietyPrices[${index}][quantity]`]),
          discountPrice: Number(productData[`varietyPrices[${index}][discountPrice]`]),
        });
        index++;
      }


      let sale = null;
      if (productData['sale[onSale]'] !== undefined) {
        sale = {
          onSale: productData['sale[onSale]'] === 'true', // Convert to boolean
          salePrice: Number(productData['sale[salePrice]']),
          startDate: productData['sale[startDate]'] ? Timestamp.fromDate(new Date(productData['sale[startDate]'])) : null,
          endDate: productData['sale[endDate]'] ? Timestamp.fromDate(new Date(productData['sale[endDate]'])) : null,
        };
      }

      const updatedProduct = {
        name: productData.name,
        description: productData.description,
        basePrice: Number(productData.basePrice),
        stockQuantity: Number(productData.stockQuantity),
        category: categories.length > 0 ? categories : [],
        imageUrls: updatedImagePaths,
        varietyPrices: varietyPrices.length > 0 ? varietyPrices : [],
        sale: sale ? sale : null,
        updatedAt: Timestamp.now(),
      };


      // Update product in database
      const result = await ProductModel.updateProduct(id, updatedProduct)

      return res.status(200).json({
        message: 'Product updated successfully',
        product: result
      });
    } catch (error) {
      console.error("Failed to update product:", error)
      return res.status(500).json({ error: 'Failed to update product' });
    }
  },

  // #endregion


  // #region Delete Product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      // 1️⃣ Retrieve product data
      const product = await ProductModel.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // 2️⃣ Extract image URLs (assumes product.imageUrls is an array of file paths)
      const imagePaths = product.imageUrls || [];

      console.log('paths to be deleted: ', imagePaths);

      // 3. Delete images from Firebase Storage
      if (imagePaths.length > 0) {
        const uploadHandler = new UploadImages()
        const deleteResults = await uploadHandler.deleteMultipleImages(imagePaths)

        // Log any failures
        const failures = deleteResults.filter((result) => !result.success)
        if (failures.length > 0) {
          console.error("Failed to delete some images:", failures)
        }
      }

      // 4️⃣ Delete image metadata from Firestore 'uploads' collection
      await UploadImages.deleteImagesFromUploads(imagePaths);

      // 5️⃣ Delete product from Firestore
      await ProductModel.deleteProduct(id);

            return res.status(200).json({
        message: "Product and associated images deleted successfully",
        deletedImages: imagePaths,
      })

    } catch (error) {
      console.error('Failed to delete product:', error);
      return res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  // #endregion

  // addProductBackUpdcode: async (req, res) => {
  //   try {
  //     const productData = req.body;
  //     const productFiles = req.files["images[]"];
  //     console.log(productData);
  //     console.log('productFiles', productFiles);

  //     if (!req.files && (!req.files.image && !req.files.images)) {
  //       return res.status(400).json({ error: 'Profile image is required' });
  //     }

  //     let images;

  //     if (!productFiles) {
  //       // images = productFiles
  //       return res.status(400).json({ error: 'Profile image is required' });
  //     }

  //     images = Array.isArray(productFiles) ? productFiles : [productFiles];


  //     console.log('images', images);

  //     let imageUrls = [];

  //     // Upload images to Firebase Storage
  //     for (const image of images) {
  //       try {
  //         // Optimize image before upload
  //         const processedImageBuffer = await sharp(image.data)
  //           .resize(1000, 1000, {
  //             fit: "inside",
  //             withoutEnlargement: true,
  //           })
  //           .jpeg({ quality: 80 }) // Convert to JPEG and compress
  //           .toBuffer()

  //         const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, "_")
  //         const fileName = `${uuidv4()}_${sanitizedFileName}`
  //         const fileUpload = bucket.file(`uploads/${fileName}`)

  //         // Upload file using a promise to handle stream properly
  //         await new Promise((resolve, reject) => {
  //           const stream = fileUpload.createWriteStream({
  //             metadata: {
  //               contentType: "image/jpeg", // We converted to JPEG above
  //               metadata: {
  //                 originalFileName: image.name,
  //                 originalMimeType: image.mimetype,
  //               },
  //             },
  //             resumable: false, // Disable resumable uploads for smaller files
  //           })

  //           stream.on("error", (error) => {
  //             console.error("Upload error:", error)
  //             reject(error)
  //           })

  //           stream.on("finish", async () => {
  //             try {
  //               await fileUpload.makePublic()
  //               const imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`
  //               imageUrls.push(imageUrl)
  //               resolve()
  //             } catch (error) {
  //               reject(error)
  //             }
  //           })

  //           // Write the processed buffer and end the stream
  //           stream.end(processedImageBuffer)
  //         })
  //       } catch (error) {
  //         console.error("Error processing image:", error)
  //         return res.status(500).json({
  //           error: "Failed to process image",
  //           details: error.message,
  //         })
  //       }
  //       // const processedImageBuffer = await sharp(image.data)
  //       //   .resize(1000, 1000, {
  //       //     fit: "inside",
  //       //     withoutEnlargement: true,
  //       //   })
  //       //   .jpeg({ quality: 80 }) // Convert to JPEG and compress
  //       //   .toBuffer()

  //       // const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, '_');
  //       // const fileName = `${uuidv4()}_${sanitizedFileName}`;
  //       // const fileUpload = bucket.file(`uploads/${fileName}`);

  //       // // // Process image with sharp
  //       // // const processedImageBuffer = await sharp(image.data)
  //       // //   .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
  //       // //   .toBuffer()

  //       // const stream = fileUpload.createWriteStream({
  //       //   metadata: { contentType: image.mimetype },
  //       // });

  //       // // After upload finishes, generate public URL
  //       // await new Promise((resolve, reject) => {
  //       //   const stream = fileUpload.createWriteStream({
  //       //     metadata: {
  //       //       contentType: "image/jpeg", // We converted to JPEG above
  //       //       metadata: {
  //       //         originalFileName: image.name,
  //       //         originalMimeType: image.mimetype,
  //       //       },
  //       //     },
  //       //     resumable: false, // Disable resumable uploads for smaller files
  //       //   })

  //       //   // Handle stream errors
  //       //   stream.on('error', (err) => {
  //       //     console.error('Error during upload:', err);
  //       //     return res.status(500).json({ error: 'Failed to upload image' });
  //       //   });

  //       //   stream.on('finish', async () => {
  //       //     try {
  //       //       await fileUpload.makePublic();
  //       //       const imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`;
  //       //       imageUrls.push(imageUrl);
  //       //       resolve();
  //       //     } catch (error) {
  //       //       reject(error);
  //       //     }
  //       //   });

  //       //   // Stream the file buffer to Firebase Storage
  //       //   stream.end(image.data);
  //       // });
  //     }

  //     const varietyPrices = [];
  //     let index = 0;

  //     // Loop through productData to reconstruct varietyPrices array
  //     while (productData[`varietyPrices[${index}][unit]`]) {
  //       varietyPrices.push({
  //         unit: productData[`varietyPrices[${index}][unit]`],
  //         quantity: Number(productData[`varietyPrices[${index}][quantity]`]),
  //         discountPrice: Number(productData[`varietyPrices[${index}][discountPrice]`]),
  //       });
  //       index++;
  //     }

  //     const sales = [];
  //     let i = 0;

  //     // Loop through productData to reconstruct varietyPrices array
  //     while (productData[`sales[${i}][salePrice]`]) {
  //       sales.push({
  //         salePrice: Number(productData[`sales[${i}][salePrice]`]),
  //         startDate: Timestamp.fromDate(new Date(productData[`sales[${i}][startDate]`])),
  //         endDate: Timestamp.fromDate(new Date(productData[`sales[${i}][endDate]`])),
  //       });
  //       i++;
  //     }

  //     // Prepare product data
  //     const product = {
  //       name: productData.name,
  //       description: productData.description,
  //       basePrice: Number(productData.basePrice),
  //       imageUrls: imageUrls,
  //       varietyPrices,
  //       stockQuantity: Number(productData.stockQuantity) || 0,
  //       category: productData.category || "",
  //       sales,
  //     };

  //     console.log('product', product);

  //     const newProduct = await ProductModel.createProduct(product);

  //     return res.status(201).json({
  //       message: 'Product created successfully',
  //       productData: newProduct,
  //     });

  //   } catch (error) {
  //     console.error('Failed to add product:', error);
  //     return res.status(500).json({ error: 'Failed to add product' });
  //   }
  // },

  // addProduct: async (req, res) => {
  //   try {
  //     const productData = req.body;
  //     // const productImage = req.files.image;
  //     // const productImages = req.files.images;
  //     const productFiles = req.files["images[]"];
  //     console.log(productData);
  //     // console.log('productImages', productImages);
  //     // console.log('productImage', productImage);
  //     console.log('productFiles', productFiles);

  //     if (!req.files && (!req.files.image && !req.files.images)) {
  //       return res.status(400).json({ error: 'Profile image is required' });
  //     }

  //     let images;

  //     if (productFiles) {
  //       images = productFiles
  //     }

  //     let imageUrls = [];

  //     // Upload images to Firebase Storage
  //     for (const image of images) {
  //       try {
  //         // Optimize image before upload
  //         const processedImageBuffer = await sharp(image.data)
  //           .resize(1000, 1000, {
  //             fit: "inside",
  //             withoutEnlargement: true,
  //           })
  //           .jpeg({ quality: 80 }) // Convert to JPEG and compress
  //           .toBuffer()

  //         const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, "_")
  //         const fileName = `${uuidv4()}_${sanitizedFileName}`
  //         const fileUpload = bucket.file(`uploads/${fileName}`)

  //         // Upload file using a promise to handle stream properly
  //         await new Promise((resolve, reject) => {
  //           const stream = fileUpload.createWriteStream({
  //             metadata: {
  //               contentType: "image/jpeg", // We converted to JPEG above
  //               metadata: {
  //                 originalFileName: image.name,
  //                 originalMimeType: image.mimetype,
  //               },
  //             },
  //             resumable: false, // Disable resumable uploads for smaller files
  //           })

  //           stream.on("error", (error) => {
  //             console.error("Upload error:", error)
  //             reject(error)
  //           })

  //           stream.on("finish", async () => {
  //             try {
  //               await fileUpload.makePublic()
  //               const imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`
  //               imageUrls.push(imageUrl)
  //               resolve()
  //             } catch (error) {
  //               reject(error)
  //             }
  //           })

  //           // Write the processed buffer and end the stream
  //           stream.end(processedImageBuffer)
  //         })
  //       } catch (error) {
  //         console.error("Error processing image:", error)
  //         return res.status(500).json({
  //           error: "Failed to process image",
  //           details: error.message,
  //         })
  //       }





  //       // // Optimize image before upload
  //       // const processedImageBuffer = await sharp(image.data)
  //       //   .resize(1000, 1000, {
  //       //     fit: "inside",
  //       //     withoutEnlargement: true,
  //       //   })
  //       //   .jpeg({ quality: 80 }) // Convert to JPEG and compress
  //       //   .toBuffer()

  //       // const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.]/g, '_');
  //       // const fileName = `${uuidv4()}_${sanitizedFileName}`;
  //       // const fileUpload = bucket.file(`uploads/${fileName}`);

  //       // // // Process image with sharp
  //       // // const processedImageBuffer = await sharp(image.data)
  //       // //   .resize(1000, 1000, { fit: "inside", withoutEnlargement: true })
  //       // //   .toBuffer()

  //       // const stream = fileUpload.createWriteStream({
  //       //   metadata: { contentType: image.mimetype },
  //       // });

  //       // // After upload finishes, generate public URL
  //       // await new Promise((resolve, reject) => {
  //       //   const stream = fileUpload.createWriteStream({
  //       //     metadata: {
  //       //       contentType: "image/jpeg", // We converted to JPEG above
  //       //       metadata: {
  //       //         originalFileName: image.name,
  //       //         originalMimeType: image.mimetype,
  //       //       },
  //       //     },
  //       //     resumable: false, // Disable resumable uploads for smaller files
  //       //   })

  //       //   // Handle stream errors
  //       //   stream.on('error', (err) => {
  //       //     console.error('Error during upload:', err);
  //       //     return res.status(500).json({ error: 'Failed to upload image' });
  //       //   });

  //       //   stream.on('finish', async () => {
  //       //     try {
  //       //       await fileUpload.makePublic();
  //       //       const imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`;
  //       //       imageUrls.push(imageUrl);
  //       //       resolve();
  //       //     } catch (error) {
  //       //       reject(error);
  //       //     }
  //       //   });

  //       //   // Stream the file buffer to Firebase Storage
  //       //   stream.end(image.data);
  //       // });
  //     }

  //     const varietyPrices = [];
  //     let index = 0;

  //     // Loop through productData to reconstruct varietyPrices array
  //     while (productData[`varietyPrices[${index}][unit]`]) {
  //       varietyPrices.push({
  //         unit: productData[`varietyPrices[${index}][unit]`],
  //         quantity: Number(productData[`varietyPrices[${index}][quantity]`]),
  //         discountPrice: Number(productData[`varietyPrices[${index}][discountPrice]`]),
  //       });
  //       index++;
  //     }

  //     const sales = [];
  //     let i = 0;

  //     // Loop through productData to reconstruct varietyPrices array
  //     while (productData[`sales[${i}][salePrice]`]) {
  //       sales.push({
  //         salePrice: Number(productData[`sales[${i}][salePrice]`]),
  //         startDate: Timestamp.fromDate(new Date(productData[`sales[${i}][startDate]`])),
  //         endDate: Timestamp.fromDate(new Date(productData[`sales[${i}][endDate]`])),
  //       });
  //       index++;
  //     }

  //     // Prepare product data
  //     const product = {
  //       name: productData.name,
  //       description: productData.description,
  //       basePrice: Number(productData.basePrice),
  //       imageUrls: imageUrls,
  //       varietyPrices,
  //       stockQuantity: Number(productData.stockQuantity) || 0,
  //       category: productData.category || "",
  //       sales,
  //     };

  //     console.log('product', product);

  //     // Save product using ProductModel
  //     const newProduct = await ProductModel.createProduct(product);

  //     return res.status(201).json({
  //       message: 'Product created successfully',
  //       productData: newProduct,
  //     });


  //     // #region Old Codes


  //     // // Handle image upload
  //     // const sanitizedFileName = productImage.name.replace(/[^a-zA-Z0-9.]/g, '_');
  //     // fileName = `${uuidv4()}_${sanitizedFileName}`;
  //     // const fileUpload = bucket.file(`uploads/${fileName}`);

  //     // const stream = fileUpload.createWriteStream({
  //     //   metadata: {
  //     //     contentType: productImage.mimetype,
  //     //   },
  //     // });

  //     // stream.on('error', (err) => {
  //     //   console.error('Error during upload:', err);
  //     //   return res.status(500).json({ error: 'Failed to upload image' });
  //     // });

  //     // stream.on('finish', async () => {
  //     //   try {
  //     //     await fileUpload.makePublic();
  //     //     imageUrl = `https://storage.googleapis.com/${bucket.name}/uploads/${fileName}`;

  //     //     const productData = {
  //     //       productImageUrl: imageUrl,
  //     //     }
  //     //     const newProduct = await ProductModel.createProduct(productData);
  //     //     const { logId, notificationId } = await productService.handleNewProduct(newProduct, req);

  //     //     return res.status(201).json({
  //     //       message: 'Product created successfully',
  //     //       productData: newProduct,
  //     //       logId,
  //     //       notificationId
  //     //     });

  //     //   } catch (error) {
  //     //     console.error('Error creating product:', error);
  //     //     return res.status(500).json({ error: 'Failed to save product' });
  //     //   }
  //     // });

  //     // // Stream the file buffer to Firebase Storage
  //     // stream.end(profileImage.data);

  //     // #endregion

  //   } catch (error) {
  //     console.error('Failed to add product:', error);
  //     return res.status(500).json({ error: 'Failed to add product' });
  //   }
  // },

  // updateProduct: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const productData = req.body;
  //     const updatedProduct = await ProductModel.updateProduct(id, productData);
  //     const { logId, notificationId } = await productService.handleProductUpdate(updatedProduct, req);

  //     res.json({
  //       message: 'Product updated successfully',
  //       productData: updatedProduct,
  //       logId,
  //       notificationId
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to update product' });
  //   }
  // },

  // deleteProduct: async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     await ProductModel.deleteProduct(id);
  //     const { logId, notificationId } = await productService.handleProductDelete(id, req);

  //     res.json({
  //       message: 'Product deleted successfully',
  //       logId,
  //       notificationId
  //     });
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to delete product' });
  //   }
  // },


  // seeProduct: async (req, res) => {
  //   try {
  //     console.log(req.file.files);
  //     // const { id } = req.params;
  //     // await ProductModel.deleteProduct(id);
  //     // const { logId, notificationId } = await productService.handleProductDelete(id, req);

  //     // res.json({
  //     //   message: 'Product deleted successfully',
  //     //   logId,
  //     //   notificationId
  //     // });
  //   } catch (error) {
  //     res.status(500).json({ error: 'Failed to delete product' });
  //   }
  // },
};

module.exports = ProductController;