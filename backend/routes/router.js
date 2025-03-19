// backend\routes\router.js
require('dotenv').config();
const express = require('express');
// const multer = require('multer');
const router = express.Router();

// var { uploadProductImage, uploadUserAvatar } = require("../config/multer");



//==========================================
//controllers
//==========================================

const RegistrationController = require("../controllers/auth/RegistrationController");
const UserController = require("../controllers/user/UserController");
const BranchController = require('../controllers/shop/BranchController.js');
const EmployeeController = require('../controllers/employee/EmployeeController.js');
//const ProductController = require('../controllers/product/ProductController');
const BatchController = require('../controllers/product/BatchController');
//const CategoryController = require('../controllers/shop/CategoryController.js');
//const OrderController = require('../controllers/shop/OrderController.js');
//==========================================
// middlewares and validation
//==========================================

const { validateEdit, validateFullRegistration, validateSignUp, validateLogIn } = require('../utilities/validations/userValidation');
const isOwner = require('../middlewares/isOwner');
const verifyToken = require('../middlewares/verifyToken');

const checkRoleForAddEmployee = require('../middlewares/employee/checkRoleForAddEmployee');
const checkRoleForUpdateEmployee = require('../middlewares/employee/checkRoleForUpdateEmployee');
const checkRoleForDeleteEmployee = require('../middlewares/employee/checkRoleForDeleteEmployee');
const checkRoleForToggleActivationEmployee = require('../middlewares/employee/checkRoleForToggleActivationEmployee');

const checkRoleForProductManagement = require('../middlewares/checkRoleForProductManagement');
const checkRoleForBatchManagement = require('../middlewares/checkRoleForBatchManagement');

const orderAuthorization = require('../middlewares/orderAuthorization');



//------------------------------------------
//groups
//------------------------------------------

// const signUpMiddleware = [
//     validateSignUp,
//     isEmailAlreadyTaken
// ];

//==========================================
//routers
//==========================================



//------------------------------------------
//user
//------------------------------------------

//registration
//router.post('/signup', signUpMiddleware, RegistrationController.createAdmin);
router.post('/account/register-user', RegistrationController.registerUser);
router.post('/account/register-manager', RegistrationController.registerManager);
router.post('/account/register-employee', RegistrationController.registerEmployee);
router.post('/account/setup-user', verifyToken, RegistrationController.setupUser);

// router.get('/account/verify-email', RegistrationController.sendVerificationLink);
// router.post('/account/setUserClaim', verifyToken, RegistrationController.setUserClaim);


// router.post('/account/logRegistration', verifyToken, RegistrationController.logUserRegistration);
// router.post('/account/createNotification', verifyToken, RegistrationController.createNotificationForNewUser);

//session or auth
// router.post('/login', SessionController.post);
//router.destroy('/logout', SessionController.destroy);

//profile


//notif
router.post('/save-token', UserController.addToken);


//------------------------------------------
//branch
//------------------------------------------

router.get('/store/branches', BranchController.getBranches);

router.post('/administrator/branches', isOwner, BranchController.addBranch);
router.get('/administrator/branches/:id', isOwner, BranchController.getBranch);
router.get('/administrator/branches', isOwner, BranchController.getAllBranches);
router.put('/administrator/branches/:id', isOwner, BranchController.editBranch);
router.delete('/administrator/branches/:id', isOwner, BranchController.deleteBranch);
router.put('/administrator/branches/:id/toggle-status', isOwner, BranchController.toggleBranchStatus);


// //------------------------------------------
// //product
// //------------------------------------------

// // app.use('/api/products', productRoutes);
// // app.use('/api/batches', batchRoutes);

// // product base
// // router.get('/store/categories', ProductController.getCategories);
// router.get('/products/', verifyToken, ProductController.getAllProducts);
// router.post('/products', verifyToken, checkRoleForProductManagement, ProductController.addProduct);
// // router.post('/products/upload', verifyToken, checkRoleForProductManagement, ProductController.uploadImage);
// router.post('/products', verifyToken, checkRoleForProductManagement, ProductController.addProduct);
// // router.put('/products/:id', verifyToken, checkRoleForProductManagement, ProductController.updateProduct);
// router.delete('/products/:id', verifyToken, checkRoleForProductManagement, ProductController.deleteProduct);
// router.put("/products/:id", verifyToken, ProductController.editProduct);



// batch
router.get('/batches/', verifyToken, BatchController.getBatches);
router.post('/batches/', verifyToken, checkRoleForBatchManagement, BatchController.addBatch);
router.put('/batches/:id', verifyToken, checkRoleForBatchManagement, BatchController.updateBatch);
router.delete('/batches/:id', verifyToken, checkRoleForBatchManagement, BatchController.deleteBatch);


// //------------------------------------------
// //orders
// //------------------------------------------
// router.post('/orders/create', orderAuthorization, OrderController.createOrder);

// //------------------------------------------
// //categories
// //------------------------------------------

// // router.get('/categories', verifyToken, CategoryController.getCategories);
// router.post('/categories', verifyToken, checkRoleForProductManagement, CategoryController.addCategory);
// // router.put('/categories/:id', verifyToken, checkRoleForProductManagement, CategoryController.updateCategory);
// // router.delete('/categories/:id', verifyToken, checkRoleForProductManagement, CategoryController.deleteCategory);

//------------------------------------------
//employee
//------------------------------------------

//router.post('/administrator/upload', verifyToken, checkRoleForEmployee, EmployeeController.uploadImage);
router.post('/administrator/employees/create', verifyToken, checkRoleForAddEmployee, EmployeeController.createEmployee);
router.put('/administrator/employees/:id', verifyToken, checkRoleForUpdateEmployee, EmployeeController.updateEmployee);
router.put('/administrator/employees/:id/deactivate', verifyToken, checkRoleForToggleActivationEmployee, EmployeeController.deactivateEmployee);
router.put('/administrator/employees/:id/activate', verifyToken, checkRoleForToggleActivationEmployee, EmployeeController.activateEmployee);
router.delete('/administrator/employees/:id', verifyToken, checkRoleForDeleteEmployee, EmployeeController.deleteEmployee);


// router.post('/admin/profile/upload-image', AdminProfileController.uploadProfileImage)
// router.post('/admin/profile/update-address', AdminProfileController.updateAddressInfo)
// router.post('/admin/profile/update-password', AdminProfileController.updatePassword)

// router.delete('products/upload', ProductController.seeProduct);



// changes kunwari ulit

module.exports = router;