// backend/middlewares/checkRoleForBatchManagement.js
const checkRoleForBatchManagement = (req, res, next) => {
    const allowedRoles = ['owner', 'manager', 'stock_manager'];
    if (allowedRoles.includes(req.user.role)) {
      if (req.user.branchId === req.body.branchId) {
        next();
      } else {

        // make log
        res.status(403).json({ message: 'Unauthorized to manage batches for this branch' });
      }
    } else {
      res.status(403).json({ message: 'Unauthorized to manage batches' });
    }
  };
  
  module.exports = checkRoleForBatchManagement;