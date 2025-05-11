const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

//password hashing
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const UserModel = require('../../models/User');
const sendVerificationEmail = require('../../utilities/mail/verifyEmail');

const NotificationService = require('../../services/NotificationService');

const SessionController = {
    // Login logic
    post: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await UserModel.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            if (!user.isVerified) {
                const verificationToken = jwt.sign(
                    { userId: user.id, email: user.email },
                    process.env.VERIFICATION_TOKEN_SECRET,
                    { expiresIn: VERIFICATION_TOKEN_EXPIRES_IN }
                );

                const verificationUrl = `${process.env.FRONTEND_DOMAIN}/verify-email?token=${verificationToken}`;

                await sendVerificationEmail(user.email, verificationUrl);

                return res.status(200).json({
                    message: 'Please verify your account. Verification email sent.',
                    verificationUrl,
                });
            }

            const accessToken = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            const refreshToken = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                REFRESH_TOKEN_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
            );

            await UserModel.updateUser(user.id, {
                'auth.refreshToken': refreshToken,
                'auth.tokenIssuedAt': new Date().toISOString()
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 30 * 24 * 60 * 60 * 1000
            });

            return res.status(200).json({
                message: 'Login successful',
                accessToken,
            });

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: 'Error logging in', error });
        }
    },
    addToken: async (req, res) => {
        const { token } = req.body;
        
        try {
            const userId = 'QBvRDgtQGBseAxkohUIx';
            await UserModel.addToken(userId, token);
            console.log(`FCM token saved for user ${userId}`);
    
            const title = "Welcome!";
            const body = "You have successfully subscribed to push notifications.";
            
            // Use NotificationService to send the notification
            await NotificationService.sendNotification(userId, title, body, token);
    
            // Respond to the client (frontend)
            res.status(200).json({ message: 'Token saved and notification sent.' });
        } catch (error) {
            console.error('Error saving FCM token or sending notification:', error);
            res.status(500).json({ message: 'Error saving FCM token or sending notification.', error });
        }
    }
};

module.exports = SessionController;