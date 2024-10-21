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


//controller
const RegistrationController = {
    post: async (req, res) => {
        try {
            const { email, firstName, lastName, password, branchId, street, barangay, city, municipality} = req.body;

            //already checked in the middlewares
            // Check if the user already exists in Firestore
            // const existingUser = await UserModel.getUserByEmail(email);
            // if (existingUser) {
            //     return res.status(400).json({ message: 'Email is already taken' });
            // }

            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create a new user
            const newUser = {
                email,
                passwordHash: hashedPassword,
                role: "customer",
                branchId: branchId || null,
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
                    verificationToken: null,
                    blacklistTokens: [],
                },
                passwordReset: {
                    resetToken: null,
                    resetExpires: null,
                }
            };

            const userId = await UserModel.createUser(newUser);

            return res.status(201).json({ message: 'User created successfully', userId });

        } catch (error) {

            console.error("Error registering user:", error);
            return res.status(500).json({ message: 'Error registering user', error });
        }

    },

    verifyEmail: async (req, res) => {
        try {
            const { token } = req.query; // Token is passed as a query parameter

            // Verify the token
            const decoded = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);

            // Retrieve the user ID from the token
            const { userId } = decoded;

            // Fetch the user by ID
            const user = await UserModel.getUserById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the user is already verified
            if (user.isVerified) {
                return res.status(400).json({ message: 'User is already verified' });
            }

            // Update the user's verification status
            await UserModel.updateUser(userId, { isVerified: true });

            // Send a success response
            return res.status(200).json({ message: 'Email successfully verified' });

        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({ message: 'Verification token expired' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(400).json({ message: 'Invalid token' });
            }
            console.error("Error verifying email:", error);
            return res.status(500).json({ message: 'Server error', error });
        }
    },
}


module.exports = RegistrationController;