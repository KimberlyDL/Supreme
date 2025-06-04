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
const express = require("express");
const router = express.Router();
const BranchController = require("../controllers/BranchController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Create role middleware instance
const accessControl = roleMiddleware();

// === Define Access Control Rules ===
accessControl
  // ✅ Default: allow all authenticated roles to view branches
  .forPattern("*", {
    hasRole: [
      "owner",
      "assistant_manager",
      "manager",
      "inventory_manager",
      "stock_manager",
    ],
  })

  // ✅ Create branch – only owner
  .forPattern("/", {
    // method: "POST",
    hasRole: ["owner"],
  })

  // ✅ Edit branch – assistant_manager can only edit same branch
  .forPattern(/^\/[^\/]+$/, {
    // method: "PUT",
    hasRole: ["owner", "assistant_manager"],
    sameBranch: true,
  })

  // ✅ Toggle status – assistant_manager only for their branch
  .forPattern(/^\/[^\/]+\/toggle-status$/, {
    // method: "PUT",
    hasRole: ["owner", "assistant_manager"],
    sameBranch: true,
  })

  // ✅ Delete – owner only
  .forPattern(/^\/[^\/]+$/, {
    // method: "DELETE",
    hasRole: ["owner"],
  });

// Get the middleware function
const checkAccess = accessControl.getMiddleware();

// // Branch routes
// router.post("/", authMiddleware, BranchController.addBranch);
// router.put("/:id", authMiddleware, BranchController.editBranch);
// router.delete("/:id", authMiddleware, BranchController.deleteBranch);
// router.put(
//   "/:id/toggle-status",
//   authMiddleware,
//   BranchController.toggleBranchStatus
// );





// Public (or minimal role check) routes
// router.get("/", authMiddleware, BranchController.getAllBranches); // allow all roles
// router.get("/:id", authMiddleware, BranchController.getBranchById); // optional

// Protected routes (checkAccess applies rules from above)
router.post("/", authMiddleware, checkAccess, BranchController.addBranch);
router.put("/:id", authMiddleware, checkAccess, BranchController.editBranch);
router.put(
  "/:id/toggle-status",
  authMiddleware,
  checkAccess,
  BranchController.toggleBranchStatus
);
router.delete(
  "/:id",
  authMiddleware,
  checkAccess,
  BranchController.deleteBranch
);
module.exports = router;
