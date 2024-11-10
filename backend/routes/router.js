// backend\routes\router.js
require('dotenv').config();
const express = require('express');
// const multer = require('multer');
const router = express.Router();

// var { uploadProductImage, uploadUserAvatar } = require("../config/multer");
const fileUpload = require('express-fileupload');
router.use(fileUpload()); 



//==========================================
//controllers
//==========================================

const RegistrationController = require("../controllers/auth/RegistrationController");
const UserController = require("../controllers/user/UserController");
const BranchController = require('../controllers/shop/BranchController.js');
const EmployeeController = require('../controllers/employee/EmployeeController.js');
const ProductController = require('../controllers/product/ProductController');
const BatchController = require('../controllers/product/BatchController');

//==========================================
// middlewares and validation
//==========================================

const { validateEdit, validateFullRegistration, validateSignUp, validateLogIn } = require('../utilities/validations/userValidation');
const isOwner = require('../middlewares/isOwner');
const verifyToken = require('../middlewares/verifyTokenForClaim');
const checkRoleForEmployeeCreation = require('../middlewares/checkRoleForEmployeeCreation');
const checkRoleForProductManagement = require('../middlewares/checkRoleForProductManagement');
const checkRoleForBatchManagement = require('../middlewares/checkRoleForBatchManagement');


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
router.get('/account/verify-email', RegistrationController.sendVerificationLink);
router.post('/account/setUserClaim', verifyToken, RegistrationController.setUserClaim);
router.post('/account/logRegistration', verifyToken, RegistrationController.logUserRegistration);
router.post('/account/createNotification', verifyToken, RegistrationController.createNotificationForNewUser);

//session or auth
// router.post('/login', SessionController.post);
//router.destroy('/logout', SessionController.destroy);

//profile


//notif
router.post('/save-token', UserController.addToken);


//------------------------------------------
//branch
//------------------------------------------

router.post('/administrator/branches', isOwner, BranchController.addBranch);
router.get('/administrator/branches/:id', isOwner, BranchController.getBranch);
router.get('/administrator/branches', isOwner, BranchController.getAllBranches);
router.put('/administrator/branches/:id', isOwner, BranchController.editBranch);
router.delete('/administrator/branches/:id', isOwner, BranchController.deleteBranch);
router.put('/administrator/branches/:id/toggle-status', isOwner, BranchController.toggleBranchStatus);


//------------------------------------------
//product
//------------------------------------------

// app.use('/api/products', productRoutes);
// app.use('/api/batches', batchRoutes);

// product base
router.get('/products/', verifyToken, ProductController.getAllProducts);
router.post('/products', verifyToken, checkRoleForProductManagement, ProductController.addProduct);
router.post('/products/upload', verifyToken, checkRoleForProductManagement, ProductController.uploadImage);
router.post('/products', verifyToken, checkRoleForProductManagement, ProductController.addProduct);
router.put('/products/:id', verifyToken, checkRoleForProductManagement, ProductController.updateProduct);
router.delete('/products/:id', verifyToken, checkRoleForProductManagement, ProductController.deleteProduct);

// batch
router.get('/batches/', verifyToken, BatchController.getBatches);
router.post('/batches/', verifyToken, checkRoleForBatchManagement, BatchController.addBatch);
router.put('/batches/:id', verifyToken, checkRoleForBatchManagement, BatchController.updateBatch);
router.delete('/batches/:id', verifyToken, checkRoleForBatchManagement, BatchController.deleteBatch);

//------------------------------------------
//employee
//------------------------------------------

router.post('/administrator/upload', checkRoleForEmployeeCreation, EmployeeController.uploadImage);
router.post('/administrator/employees/create', checkRoleForEmployeeCreation, EmployeeController.createEmployee);
router.put('/administrator/employees/:id', checkRoleForEmployeeCreation, EmployeeController.updateEmployee);
router.put('/administrator/employees/:id/deactivate', checkRoleForEmployeeCreation, EmployeeController.deactivateEmployee);
router.put('/administrator/employees/:id/activate', checkRoleForEmployeeCreation, EmployeeController.activateEmployee);
router.delete('/administrator/employees/:id', checkRoleForEmployeeCreation, EmployeeController.deleteEmployee);


// router.post('/admin/profile/upload-image', AdminProfileController.uploadProfileImage)
// router.post('/admin/profile/update-address', AdminProfileController.updateAddressInfo)
// router.post('/admin/profile/update-password', AdminProfileController.updatePassword)


module.exports = router;