const { admin } = require('../../config/firebase');
const EmployeeService = require('../../services/EmployeeService');

const checkRoleForEmployeeCreation = async (req, res, next) => {
    const employeeService = new EmployeeService();
    try {
        const allowedRoles = ['owner', 'manager'];

        const userRole = req.user.Role;
        const userBranch = req.user.branchName;
        const addEmployeeRole = req.body.role;
        const addEmployeeBranch = req.body.branchName;

        if (!allowedRoles.includes(userRole)) {
            await employeeService.logUnauthorizedAction(req.user, 'UPDATE_EMPLOYEE', 'Unauthorized user attempted to update an employee account');
            return res.status(403).json({ message: 'Unauthorized to update employees' });
        }

        if (userRole !== 'owner' && addEmployeeRole === 'manager') {
            await employeeService.logUnauthorizedAction(req.user, 'UPDATE_MANAGER', 'Unauthorized manager attempted to update a manager account');
            return res.status(403).json({ message: 'Only the owner can update a manager' });
        }

        if (userRole === 'manager' && addEmployeeBranch !== userBranch) {
            await employeeService.logUnauthorizedAction(req.user, 'UPDATE_EMPLOYEE_DIFFERENT_BRANCH', 'Manager attempted to update an employee account for a different branch');
            return res.status(403).json({ message: 'Managers can only update employees within their branch' });
        }

        next();
    } catch (error) {
        console.error('Error in role-based access control middleware:', error);
        await employeeService.logError(req.user, 'ROLE_CHECK_ERROR', 'Error occurred during role-based access control', error);
        return res.status(500).json({ message: 'Authorization error', error: error.message });
    }
};

module.exports = checkRoleForEmployeeCreation;