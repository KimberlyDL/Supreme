// backend/middlewares/checkRoleForBatchManagement.js
const checkRoleForBatchManagement = (req, res, next) => {
    const allowedRoles = ['owner', 'manager', 'stock_manager'];
    if (allowedRoles.includes(req.user.role)) {
        next();
    } else {
        // make log for failed authorization
        res.status(403).json({ message: 'Unauthorized to manage categories' });
    }
};

module.exports = checkRoleForBatchManagement;