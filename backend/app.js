// backend\app.js
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const router = require("./routes/router");
const productRoutes = require("./routes/productRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const orderRoutes = require("./routes/orderRoutes")
const branchRoutes = require("./routes/branchRoutes")
const inventoryRoutes = require("./routes/inventoryRoutes")
const cartRoutes = require("./routes/cartRoutes")
const logRoutes = require('./routes/logRoutes');
const productCategoryRoutes = require("./routes/productCategoryRoutes")

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(fileUpload()); 


// app.use(fileUpload({
//     useTempFiles: true,
//     tempFileDir: '/tmp/',
//     createParentPath: true
// }));

const corsOptions = {
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.static('public'));

app.use('/', router);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/orders', orderRoutes);
app.use('/branches', branchRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/cart', cartRoutes);
app.use('/logs', logRoutes);
app.use("/products", productCategoryRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));