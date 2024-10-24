// backend\controllers\auth\RegistrationController.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

//password hashing
const bcrypt = require('bcryptjs');
const saltRounds = 10;

//validator and checks
const { validationResult } = require('express-validator');

//models
const UserModel = require('../../models/UserModel');
const BranchModel = require('../../models/BranchModel');


//controller
const RegistrationController = {
    post: async (req, res) => {
        try {
            console.log('Request body (Registration Controller backend): ');
            console.log(req.body);
            const { email, firstName, lastName, password, street, barangay, city, municipality} = req.body;

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            let branchName = await BranchModel.determineBranchByLocation(city, municipality);
            if (!branchName) {
              branchName = 'Calapan';
            }
            console.log(branchName);

            // Create a new user
            const newUser = {
                email,
                passwordHash: hashedPassword,
                role: "customer",
                branchName: branchName || null,
                isVerified: false,
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
                security: {
                    failedLoginAttempts: 0,
                    lastPasswordChangeAt: new Date().toISOString(),
                },
                auth: {
                    refreshToken: null,
                    tokenIssuedAt: null,
                    otp: null,
                    otpCreatedAt: null,
                    blacklistTokens: [
                        { token: null, exp: null }
                    ],
                    hasBlacklistedTokens: false
                },
                passwordReset: {
                    resetToken: null,
                    resetExpires: null,
                }
            };

            const userId = await UserModel.createUser(newUser);

            //make notif
            //notify admin a user is registered,
            // notify user greetings?

            return res.status(201).json({ message: 'User created successfully'});

        } catch (error) {

            console.error("Error registering user:", error);
            return res.status(500).json({ message: 'Error registering user', error });
        }

    },
}


module.exports = RegistrationController;