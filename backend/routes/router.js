require('dotenv').config();
const express = require('express');
const multer = require('multer');
const router = express.Router();

// var { uploadProductImage, uploadUserAvatar } = require("../config/multer");



//==========================================
//controllers
//==========================================

const SessionController = require("../controllers/auth/SessionController");
const RegistrationController = require("../controllers/auth/RegistrationController");
const UserController = require("../controllers/user/UserController");
const BranchController = require('../controllers/shop/BranchController.js');

//==========================================
// middlewares and validation
//==========================================

const { validateEdit, validateFullRegistration, validateSignUp, validateLogIn } = require('../utilities/validations/userValidation');
const isEmailAlreadyTaken = require('../middlewares/isEmailAlreadyTaken');
const isOwner = require('../middlewares/isOwner');

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
router.post('/signup', signUpMiddleware, RegistrationController.post);
router.get('/account/verify-email', RegistrationController.verifyEmail);
// router.get('/forgotpassword', RegisterController.forgotpassword);
// router.get('/resetpassword', RegisterController.resetpassword);
//router.destroy('/delete-account', RegisterController.destroy);

//session or auth
router.post('/login', SessionController.post);
//router.destroy('/logout', SessionController.destroy);

//profile


//notif
router.post('/save-token', UserController.addToken);


//------------------------------------------
//branch
//------------------------------------------

router.post('/administrator/branches', isOwner,BranchController.addBranch);
router.get('/administrator/branches/:id', isOwner, BranchController.getBranch);
router.get('/administrator/branches', isOwner, BranchController.getAllBranches);
router.put('/administrator/branches/:id', isOwner, BranchController.editBranch);
router.delete('/administrator/branches/:id', isOwner, BranchController.deleteBranch);

module.exports = router;