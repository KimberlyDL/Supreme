// backend\lib\UserService.js
const User = require('../models/User');

class UserService {
    static getRegistrationHandler(userType) {
        switch (userType) {
            case 'owner':
                // 1 for client
                return new OwnerRegistrationHandler();
            case 'client':
                // 1 for client
                return new ClientRegistrationHandler();
            case 'assistant manager':
                // 2 for assistant manager
                return new AssistantRegistrationHandler();
            case 'helper':
                // 3 for helper
                return new HelperRegistrationHandler();
            default:
                throw new Error(`Unsupported user type: ${userType}`);
        }
    }

}

class RegistrationHandler {
    async register(userData, role, branch = null) {
        try {
            const user = {
                uid: userData.uid,
                email: userData.email,

                role: role,
                branch: branch ,

                emailVerified: false,
                isActive: false,

                profile: createDefaultProfile(),
                lastLoginAt: null,
                notifications: {
                    emailNotifications: true,
                },
                createdAt: null,
                updatedAt: null,
            };

            // const owner = {
            //     uid: userData.uid,
            //     email: userData.email,
            //     role: role,
            //     branch: "all",
            //     isActive: false,
            //     profile: {
            //         firstName: "",
            //         lastName: "",
            //         address: {
            //             street: "",
            //             barangay: "",
            //             municipality: "",
            //             province: "",
            //         },
            //         avatarUrl: null,
            //         number: '',
            //     },
            //     lastLoginAt: null,
            //     notifications: {
            //         emailNotifications: true,
            //     },
            //     createdAt: null,
            //     updatedAt: null,
            // }

            await User.registerUserAccount(user);

            return { success: true, role: role };
        } catch (error) {
            console.log("UserRegistrationFatory", error);
            throw new Error("Error in registering user");
        }
    }

    createDefaultProfile() {
        return {
            firstName: "",
            lastName: "",
            address: {
                street: "",
                barangay: "",
                municipality: "",
                province: "",
            },
            avatarUrl: null,
            number: '',
        };
    }
}

// Role-Specific Handlers

class OwnerRegistrationHandler extends RegistrationHandler {
    async register(userData) {
        return super.register(userData, 'owner'); // owners have 'all' as branch
    }
}

class ClientRegistrationHandler extends RegistrationHandler {
    async register(userData) {
        return super.register(userData, 'client');
    }
}

class AssistantRegistrationHandler extends RegistrationHandler {
    async register(userData) {
        return super.register(userData, 'assistant manager', userData.branch);
    }
}

class HelperRegistrationHandler extends RegistrationHandler {

    async register(userData) {
        return super.register(userData, 'helper', userData.branch);
    }
}
module.exports = UserService;
