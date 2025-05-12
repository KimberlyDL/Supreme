//------------------------------------------
//branch
//------------------------------------------

// // para sa registerEmp form
// router.get('/store/branches', BranchController.getBranches);

// router.post('/administrator/branches', isOwner, BranchController.addBranch);
// // router.get('/administrator/branches/:id', isOwner, BranchController.getBranch);
// // router.get('/administrator/branches', isOwner, BranchController.getAllBranches);
// router.put('/administrator/branches/:id', isOwner, BranchController.editBranch);
// router.delete('/administrator/branches/:id', isOwner, BranchController.deleteBranch);

// router.put('/administrator/branches/:id/toggle-status', isOwner, BranchController.toggleBranchStatus);

// router.put('/administrator/branches/:id/deactivate', isOwner, BranchController.deactivate);
// router.put('/administrator/branches/:id/activate', isOwner, BranchController.activate);

// backend\routes\administrator\branches.js
const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/BranchController');
const authMiddleware = require("../middlewares/authMiddleware")

// Branch routes
router.post('/', authMiddleware, BranchController.addBranch);
router.put('/:id', authMiddleware, BranchController.editBranch);
router.delete('/:id', authMiddleware, BranchController.deleteBranch);
router.put('/:id/toggle-status', authMiddleware, BranchController.toggleBranchStatus);

module.exports = router;