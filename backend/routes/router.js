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

// const SessionController = require("../controllers/auth/SessionController");
const RegistrationController = require("../controllers/auth/RegistrationController");
// const AdminProfileController = require("../controllers/admin/AdminProfileController");
const UserController = require("../controllers/user/UserController");
const BranchController = require('../controllers/shop/BranchController.js');
const EmployeeController = require('../controllers/employee/EmployeeController.js');

//==========================================
// middlewares and validation
//==========================================

const { validateEdit, validateFullRegistration, validateSignUp, validateLogIn } = require('../utilities/validations/userValidation');
const isEmailAlreadyTaken = require('../middlewares/isEmailAlreadyTaken');
const isOwner = require('../middlewares/isOwner');
const verifyToken = require('../middlewares/verifyTokenForClaim');

// const checkUserExists = require('../middlewares/checkUserExists');
// const { isAdmin, isUser } = require('../middlewares/checkAuthorization');
// const isAuthenticated = require('../middlewares/isAuthenticated');

const signUpMiddleware = [
    validateSignUp,
    isEmailAlreadyTaken
];

// const fullRegistrationMiddleware = [
//     validateFullRegistration,
//     checkUserExists
// ];

// const isValidUser = [
//     isAuthenticated,
//     isUser
// ];

// const isValidAdmin = [
//     isAuthenticated,
//     isAdmin
// ];




//==========================================
//routers
//==========================================



//------------------------------------------
//user
//------------------------------------------

//registration
router.post('/signup', signUpMiddleware, RegistrationController.createAdmin);
router.get('/account/verify-email', RegistrationController.sendVerificationLink);
router.post('/account/setUserClaim', verifyToken,RegistrationController.setUserClaim);
// router.get('/forgotpassword', RegisterController.forgotpassword);
// router.get('/resetpassword', RegisterController.resetpassword);
//router.destroy('/delete-account', RegisterController.destroy);

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
//employee
//------------------------------------------

router.post('/administrator/upload', EmployeeController.uploadImage);
router.post('/administrator/employees/create', EmployeeController.createEmployee);


module.exports = router;



// router.post('/admin/profile/upload-image', AdminProfileController.uploadProfileImage)
// router.post('/admin/profile/update-address', AdminProfileController.updateAddressInfo)
// router.post('/admin/profile/update-password', AdminProfileController.updatePassword)
