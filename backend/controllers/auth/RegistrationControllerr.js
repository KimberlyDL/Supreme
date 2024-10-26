// backend\controllers\auth\RegistrationControllerr.js

// backend\controllers\auth\RegistrationController.js
const express = require('express');
const { getAuth } = require('firebase-admin/auth');
const router = express.Router();

//models
const UserModel = require('../../models/UserModel');
const BranchModel = require('../../models/BranchModel');

// Registration Controller for Firebase Authentication
const RegistrationController = {
    post: async (req, res) => {
        try {
            const { email, firstName, lastName, password, street, barangay, city, municipality } = req.body;

            // Determine the branch based on location
            let branchName = await BranchModel.determineBranchByLocation(city, municipality);
            if (!branchName) {
                branchName = 'Calapan';
            }

            // Firebase Authentication: create user in Firebase and capture UID
            const auth = getAuth();
            const firebaseUser = await auth.createUser({
                email,
                password,
                displayName: `${firstName} ${lastName}`,
            });

            // Create custom user data in Firestore or your database
            const newUser = {
                email,
                firebaseUid: firebaseUser.uid,  // Store Firebase UID for reference
                role: "customer",
                branchName,
                isVerified: false, // Firebase can handle email verification separately
                isActive: true,
                profile: {
                    firstName: firstName || "",
                    lastName: lastName || "",
                    address: {
                        street: street || "",
                        barangay: barangay || "",
                        city: city || "",
                        municipality: municipality || "",
                    },
                    avatarUrl: null,
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: null,
                notifications: {
                    emailNotifications: true,
                },
            };

            // Save custom user data to your database
            await UserModel.createUser(newUser);

            // Optional: Notify admin and send welcome message to the user
            // (Firebase provides email verification directly)

            return res.status(201).json({ message: 'User created successfully' });

        } catch (error) {
            console.error("Error registering user:", error);
            return res.status(500).json({ message: 'Error registering user', error });
        }
    },
};

module.exports = RegistrationController;
