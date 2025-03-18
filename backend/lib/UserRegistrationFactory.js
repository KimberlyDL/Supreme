// backend\lib\UserRegistrationFactory.js
const UserModel = require('../models/UserModel');
const AuthService = require('../lib/AuthService');

const authSerivce = new AuthService();

// userRegistrationFactory.js
class UserRegistrationFactory {
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

class OwnerRegistrationHandler {
    async register(userData) {
        try {
            const role = 'owner';

            const owner = {
                uid: userData.uid,
                email: userData.email,
                role: role,
                branch: "all",
                isActive: false,
                profile: {
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
                },
                lastLoginAt: null,
                notifications: {
                    emailNotifications: true,
                },
                createdAt: null,
                updatedAt: null,
            }

            await UserModel.registerUserAccount(owner);

            return { success: true, role: role };

        } catch (error) {
            console.log("UserRegistrationFatory", error);
            throw new Error("Error in registering user");
        }
    }
}

class AssistantRegistrationHandler {
    async register(userData) {
        try {
            const role = 'assistant manager';

            const assistant = {
                uid: userData.uid,
                email: userData.email,
                role: role,
                branch: userData.branch,
                isActive: false,
                profile: {
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
                },
                lastLoginAt: null,
                notifications: {
                    emailNotifications: true,
                },
                createdAt: null,
                updatedAt: null,
            }

            await UserModel.registerUserAccount(assistant);

            // await authSerivce.handleNewUser(assistant);

            return { success: true, role: role };

        } catch (error) {
            console.log("UserRegistrationFatory", error);
            throw new Error("Error in registering user");
        }
    }
}

class HelperRegistrationHandler {
    async register(userData) {
        try {
            const role = 'helper';

            const helper = {
                uid: userData.uid,
                email: userData.email,
                role: role,
                branch: userData.branch,
                isActive: false,
                profile: {
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
                },
                lastLoginAt: null,
                notifications: {
                    emailNotifications: true,
                },
                createdAt: null,
                updatedAt: null,
            }

            await UserModel.registerUserAccount(helper);

            // await authSerivce.handleNewUser(helper);

            return { success: true, role: role };

        } catch (error) {
            console.log("UserRegistrationFatory", error);
            throw new Error("Error in registering user");
        }
    }
}

class ClientRegistrationHandler {
    async register(userData) {
        try {
            const role = 'client';

            const client = {
                uid: userData.uid,
                email: userData.email,
                role: role,
                isActive: false,
                profile: {
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
                },
                lastLoginAt: null,
                notifications: {
                    emailNotifications: true,
                },
                createdAt: null,
                updatedAt: null,
            }

            await UserModel.registerUserAccount(client);

            // await authSerivce.handleNewUser(client);

            return { success: true, role: role };

        } catch (error) {
            console.log("UserRegistrationFatory", error);
            throw new Error("Error in registering user");
        }
    }
}

module.exports = UserRegistrationFactory;
