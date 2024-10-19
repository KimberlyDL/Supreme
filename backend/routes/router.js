require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { check, validationResult, body } = require('express-validator');
const router = express.Router();

// var { uploadProductImage, uploadUserAvatar } = require("../config/multer");



//====================
//controllers
//====================

let SessionController = require("../controller/SessionController");
let RegistrationController = require("../controller/RegistrationController");



//====================
// middlewares and validation
//====================

const { validateEdit, validateFullRegistration, validateSignUp, validateLogIn } = require('../validations/userValidation');
const isEmailAlreadyTaken = require('../middlewares/isEmailAlreadyTaken');

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




//====================
//routers
//====================



//---------------------
//user
//---------------------

//registration
router.post('/signup', signUpMiddleware, RegistrationController.post);
// router.get('/forgotpassword', RegisterController.forgotpassword);
// router.get('/resetpassword', RegisterController.resetpassword);
//router.destroy('/delete-account', RegisterController.destroy);

//session or auth
router.post('/login', SessionController.post);
//router.destroy('/logout', SessionController.destroy);

//profile




module.exports = router;