const { check, body, validationResult } = require('express-validator');

const validateSignUp = [
  // Validate first name
  check('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name should not be blank'),

  // Validate last name
  check('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name should not be blank'),

  // Validate email
  check('email')
    .isEmail()
    .withMessage('Must be a valid email'),

  // Validate password length
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  // Confirm password matches
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  // Validate street
  check('street')
    .trim()
    .notEmpty()
    .withMessage('Street should not be blank'),

  // Validate barangay
  check('barangay')
    .trim()
    .notEmpty()
    .withMessage('Barangay should not be blank'),

  // Validate municipality
  check('municipality')
    .trim()
    .notEmpty()
    .withMessage('Municipality should not be blank'),

  // Validate province
  check('province')
    .trim()
    .notEmpty()
    .withMessage('Province should not be blank'),

  // Check for validation result
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    next();
  }
];


// Validation for Full Registration
const validateFullRegistration = [
  check('firstName').notEmpty().withMessage('First name should not be blank'),
  check('lastName').notEmpty().withMessage('Last name should not be blank'),
  check('username').notEmpty().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  check('email').isEmail().withMessage('Must be a valid email'),
  check('phone').isMobilePhone().withMessage('Must be a valid phone number'),
  check('address').notEmpty().isLength({ min: 10 }).withMessage('Address must be at least 10 characters long'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    next();  // Proceed to the next middleware if no errors
  }
];

// Validation for Edit
const validateEdit = [
  check('firstName').notEmpty().withMessage('First name should not be blank'),
  check('lastName').notEmpty().withMessage('Last name should not be blank'),
  check('username').notEmpty().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  check('phone').isMobilePhone().withMessage('Must be a valid phone number'),
  check('address').notEmpty().isLength({ min: 10 }).withMessage('Address must be at least 10 characters long'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    next();  // Proceed to the next middleware if no errors
  }
];

// Validation for Log In
const validateLogIn = [
  check('email').isEmail().withMessage('Must be a valid email'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }

    next();  // Proceed to the next middleware if no errors
  }
];

module.exports = {
  validateFullRegistration,
  validateSignUp,
  validateLogIn,
  validateEdit
};
