require('dotenv').config();
const express = require('express');
const router = express.Router();


//==========================================
//controllers
//==========================================

const RegistrationController = require("../controllers/RegistrationController");
const UserController = require("../controllers/user/UserController");
const EmployeeController = require('../controllers/employee/EmployeeController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

// account creation
router.post('/account/register-user', RegistrationController.registerUser);
router.post('/account/register-manager', RegistrationController.registerManager);
router.post('/account/register-employee', RegistrationController.registerEmployee);

// After user validated email
router.post('/account/setup-user', authMiddleware, RegistrationController.setupUser);


router.post('/save-token', UserController.addToken);


//------------------------------------------
//employee
//------------------------------------------

// router.post('/administrator/employees/create', authMiddleware, checkRoleForAddEmployee, EmployeeController.createEmployee);
// router.put('/administrator/employees/:id', authMiddleware, checkRoleForUpdateEmployee, EmployeeController.updateEmployee);
// router.put('/administrator/employees/:id/deactivate', authMiddleware, checkRoleForToggleActivationEmployee, EmployeeController.deactivateEmployee);
// router.put('/administrator/employees/:id/activate', authMiddleware, checkRoleForToggleActivationEmployee, EmployeeController.activateEmployee);
// router.delete('/administrator/employees/:id', authMiddleware, checkRoleForDeleteEmployee, EmployeeController.deleteEmployee);

router.post('/administrator/employees/create', authMiddleware, EmployeeController.createEmployee);
router.put('/administrator/employees/:id', authMiddleware, EmployeeController.updateEmployee);
router.put('/administrator/employees/:id/deactivate', authMiddleware, EmployeeController.deactivateEmployee);
router.put('/administrator/employees/:id/activate', authMiddleware, EmployeeController.activateEmployee);
router.delete('/administrator/employees/:id', authMiddleware, EmployeeController.deleteEmployee);
