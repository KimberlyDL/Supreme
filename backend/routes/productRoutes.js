// routes/productRoutes.js
const express = require('express');
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const router = express.Router();
const productController = require('../controllers/productController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit

// Define routes for CRUD operations
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', upload.single('image'), productController.createProduct); // Handle image upload
router.put('/products/:id', upload.single('image'), productController.updateProduct); // Handle image upload
router.delete('/products/:id', productController.deleteProduct);

module.exports = router;
