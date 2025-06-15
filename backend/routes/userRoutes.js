require("dotenv").config();
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");

//==========================================
//controllers
//==========================================

const RegistrationController = require("../controllers/RegistrationController");
const UserController = require("../controllers/user/UserController");
const EmployeeController = require("../controllers/employee/EmployeeController.js");

const SettingsController = require("../controllers/UserController");

// account creation
router.post("/account/register-user", RegistrationController.registerUser);
router.post(
  "/account/register-manager",
  RegistrationController.registerManager
);
router.post(
  "/account/register-employee",
  RegistrationController.registerEmployee
);

// After user validated email
router.post(
  "/account/setup-user",
  authMiddleware,
  RegistrationController.setupUser
);

router.post("/save-token", UserController.addToken);

//------------------------------------------
//employee
//------------------------------------------

// router.post('/administrator/employees/create', authMiddleware, checkRoleForAddEmployee, EmployeeController.createEmployee);
// router.put('/administrator/employees/:id', authMiddleware, checkRoleForUpdateEmployee, EmployeeController.updateEmployee);
// router.put('/administrator/employees/:id/deactivate', authMiddleware, checkRoleForToggleActivationEmployee, EmployeeController.deactivateEmployee);
// router.put('/administrator/employees/:id/activate', authMiddleware, checkRoleForToggleActivationEmployee, EmployeeController.activateEmployee);
// router.delete('/administrator/employees/:id', authMiddleware, checkRoleForDeleteEmployee, EmployeeController.deleteEmployee);

router.post(
  "/administrator/employees/create",
  authMiddleware,
  EmployeeController.createEmployee
);
router.put(
  "/administrator/employees/:id",
  authMiddleware,
  EmployeeController.updateEmployee
);
router.put(
  "/administrator/employees/:id/deactivate",
  authMiddleware,
  EmployeeController.deactivateEmployee
);
router.put(
  "/administrator/employees/:id/activate",
  authMiddleware,
  EmployeeController.activateEmployee
);
router.delete(
  "/administrator/employees/:id",
  authMiddleware,
  EmployeeController.deleteEmployee
);

// Get user profile
router.get("/profile", authMiddleware, SettingsController.getProfile);

// Update user profile
router.put(
  "/profile",
  authMiddleware,
  // Logging middleware
  (req, res, next) => {
    console.log('files');
    console.log(req.files);
    console.log('body');
    console.log(req.body);
    next();
  },

  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name is required"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name is required"),
    body("number")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
  ],
  SettingsController.updateProfile
);

// Update notification settings
router.put(
  "/notifications",
  authMiddleware,
  SettingsController.updateNotifications
);

// Change password
router.put(
  "/password",
  authMiddleware,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
  ],
  SettingsController.changePassword
);

// Deactivate account
router.put(
  "/deactivate",
  authMiddleware,
  [body("password").notEmpty().withMessage("Password is required")],
  SettingsController.deactivateAccount
);

module.exports = router;
