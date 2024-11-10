// backend/middlewares/checkRoleForBatchManagement.js
const checkRoleForBatchManagement = (req, res, next) => {
    const allowedRoles = ['owner', 'manager', 'stock_manager'];
    if (allowedRoles.includes(req.user.role)) {
      // Check if the user is authorized for the specific branch
      if (req.user.role === 'owner' || req.user.branchId === req.body.branchId) {
        next();
      } else {
        res.status(403).json({ message: 'Unauthorized to manage batches for this branch' });
      }
    } else {
      res.status(403).json({ message: 'Unauthorized to manage batches' });
    }
  };
  
  module.exports = checkRoleForBatchManagement;