// backend/middlewares/checkRoleForProductManagement.js
const checkRoleForProductManagement = (req, res, next) => {
    const allowedRoles = ['owner', 'manager', 'stock_manager'];
    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Unauthorized to manage products' });
    }
  };
  
  module.exports = checkRoleForProductManagement;