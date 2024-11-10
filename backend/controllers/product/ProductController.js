// backend/controllers/ProductController.js
const { bucket } = require('../../config/firebase');
const { v4: uuidv4 } = require('uuid');
const ProductModel = require('../../models/ProductModel');
const UploadModel = require('../../models/UploadModel');
const ProductService = require('../../services/ProductService');

const productService = new ProductService();

const ProductController = {
  uploadImage: async (req, res) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json('No files were uploaded.');
      }

      const file = req.files.file;

      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const fileName = `${uuidv4()}_${sanitizedFileName}`;
      const fileUpload = bucket.file(`product-images/${fileName}`);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.on('error', (err) => {
        console.log('There was an error successfully.');
        console.error('Error during upload:', err);
        return res.status(500).json({ error: 'Failed to upload image' });
      });

      stream.on('finish', async () => {
        try {
          console.log('Stream finished successfully.');

          await fileUpload.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/product-images/${fileName}`;

          const fileData = {
            fileName: fileName,
            fileUrl: publicUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadTime: new Date(),
            category: "product_image",
            isActive: true,
            metadata: {
              width: 400,
              height: 400,
              tags: ['product']
            }
          };

          const savedFileData = await UploadModel.saveFileData(fileData);

          return res.status(200).json({ message: 'Image upload successful', fileUrl: publicUrl, fileData: savedFileData });
        } catch (error) {
          console.error('Error saving file data to Firestore:', error);
          return res.status(500).json({ error: 'Failed to save file data' });
        }

      });

      stream.end(file.data);

    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const products = await ProductModel.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  addProduct: async (req, res) => {
    try {
      const productData = req.body;
      const newProduct = await ProductModel.createProduct(productData);
      const { logId, notificationId } = await productService.handleNewProduct(newProduct, req);

      res.status(201).json({
        message: 'Product created successfully',
        productData: newProduct,
        logId,
        notificationId
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add product' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      const updatedProduct = await ProductModel.updateProduct(id, productData);
      const { logId, notificationId } = await productService.handleProductUpdate(updatedProduct, req);

      res.json({
        message: 'Product updated successfully',
        productData: updatedProduct,
        logId,
        notificationId
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      await ProductModel.deleteProduct(id);
      const { logId, notificationId } = await productService.handleProductDelete(id, req);

      res.json({
        message: 'Product deleted successfully',
        logId,
        notificationId
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },
};

module.exports = ProductController;