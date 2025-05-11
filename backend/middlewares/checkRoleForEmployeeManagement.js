const EmployeeService = require('../../services/EmployeeService');

const checkRoleForEmployee = async (req, res, next) => {
    const employeeService = new EmployeeService();
    try {
        if (!req.user) {
            return res.status(403).json({ message: "Action not allowed." });
        }

        const userRole = req.user.role.toLowerCase();
        const userBranch = req.user.branchName;
        const targetEmployeeRole = req.body.role || req.params.role;
        const targetEmployeeBranch = req.body.branchName || req.params.branchName;
        const action = req.method + " " + req.route.path;

        const rolePermissions = {
            "POST /administrator/employees/create": { allowedRoles: ['owner', 'manager'], restrictManager: true },
            "PUT /administrator/employees/:id": { allowedRoles: ['owner', 'manager'], restrictManager: true },
            "PUT /administrator/employees/:id/deactivate": { allowedRoles: ['owner', 'manager'], restrictManager: true },
            "PUT /administrator/employees/:id/activate": { allowedRoles: ['owner', 'manager'], restrictManager: true },
            "DELETE /administrator/employees/:id": { allowedRoles: ['owner', 'manager'], restrictManager: true }
        };

        const permission = rolePermissions[action];

        const actionString = defineAction(action);

        if (!permission) {
            return res.status(403).json({ message: "Action not allowed." });
        }

        if (!permission.allowedRoles.includes(userRole)) {
            await employeeService.logUnauthorizedAction(req.user, action, `Unauthorized access attempt to ${actionString} an employee`);
            return res.status(403).json({ message: "Unauthorized access." });
        }

        if (permission.restrictManager && userRole !== 'owner' && targetEmployeeRole === 'manager') {
            await employeeService.logUnauthorizedAction(req.user, action, `Manager tried to ${actionString} another manager`);
            return res.status(403).json({ message: "Unauthorized access." });
        }


        if (permission.restrictManager && userRole === 'manager' && targetEmployeeBranch && targetEmployeeBranch !== userBranch) {
            await employeeService.logUnauthorizedAction(req.user, action, `Manager tried to ${actionString} an employee from another branch`);
            return res.status(403).json({ message: "Unauthorized access." });
        }

        next();

    } catch (error) {
        console.error('Error in role-based middleware:', error);
        await employeeService.logError(req.user, 'ROLE_CHECK_ERROR', 'Error occurred during role-based access control', error);
        return res.status(500).json({ message: 'Authorization error', error: error.message });
    }
};


const defineAction = (action) => {
    if (action.startsWith("POST /administrator/employees/create")) {
        return "create";
    }

    if (action.startsWith("PUT /administrator/employees/") && action.includes("/deactivate")) {
        return "deactivate";
    }

    if (action.startsWith("PUT /administrator/employees/") && action.includes("/activate")) {
        return "activate";
    }

    if (action.startsWith("PUT /administrator/employees/")) {
        return "update";
    }

    if (action.startsWith("DELETE /administrator/employees/")) {
        return "delete";
    }

    return null;
};

module.exports = checkRoleForEmployee;
