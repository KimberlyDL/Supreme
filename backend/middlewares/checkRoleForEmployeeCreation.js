// backend\middlewares\checkRoleForEmployeeCreation.js
const { admin } = require('../config/firebase');

const checkRoleForEmployeeCreation = async (req, res, next) => {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const idToken = authorizationHeader.split(' ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const userRole = decodedToken.role;
        const employeeRole = req.body.role;

        // Allow only "owner" to create "manager" role, other roles allowed for "owner" and "manager"
        if ((userRole !== 'owner' && employeeRole === 'manager') ||
            (!['owner', 'manager'].includes(userRole) && ['stock_manager', 'driver'].includes(employeeRole))) {
            return res.status(403).json({ message: 'Unauthorized to create this type of employee' });
        }

        next();
    } catch (error) {
        console.error('Error in role-based access control middleware:', error);
        return res.status(500).json({ message: 'Authorization error', error: error.message });
    }
};

module.exports = checkRoleForEmployeeCreation;
