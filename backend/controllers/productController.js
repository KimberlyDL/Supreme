const Product = require('../models/productModel');
const path = require('path');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null; // Get the image URL

    // Validate image size
    if (req.file && req.file.size > 2 * 1024 * 1024) { // Limit to 2MB
      return res.status(400).json({ message: 'Image size exceeds 2MB limit' });
    }

    const productId = await Product.createProduct({ name, description, price, quantity, imageUrl });
    
    // Send a success response with product details
    res.status(201).json({
      message: 'Product successfully added',
      product: {
        id: productId,
        name,
        description,
        price,
        quantity,
        imageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;
    const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null; // Get the new image URL

    await Product.updateProduct(req.params.id, { name, description, price, quantity, imageUrl });
    res.status(200).json({ message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
