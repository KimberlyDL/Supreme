const db = require('../config/db');

// Get all products
const getAllProducts = async () => {
  const [rows] = await db.query('SELECT * FROM products');
  return rows;
};

// Get product by ID
const getProductById = async (id) => {
  const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0];
};

// Create a new product
const createProduct = async (product) => {
  const { name, description, price, quantity, imageUrl } = product;
  const [result] = await db.query(
    'INSERT INTO products (name, description, price, quantity, imageUrl) VALUES (?, ?, ?, ?, ?)',
    [name, description, price, quantity, imageUrl]
  );
  return result.insertId;
};

// Update a product
const updateProduct = async (id, product) => {
  const { name, description, price, quantity, imageUrl } = product;
  await db.query(
    'UPDATE products SET name = ?, description = ?, price = ?, quantity = ?, imageUrl = ? WHERE id = ?',
    [name, description, price, quantity, imageUrl, id]
  );
};

// Delete a product
const deleteProduct = async (id) => {
  await db.query('DELETE FROM products WHERE id = ?', [id]);
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
