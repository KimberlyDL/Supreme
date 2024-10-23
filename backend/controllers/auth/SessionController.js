const fs = require('fs');
const path = require('path');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

//password hashing
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const UserModel = require('../../models/UserModel');
const sendVerificationEmail = require('../../utilities/mail/verifyEmail');


const checkUserExists = async (userEmail) => {
    try {
        return await User.findOne({ where: { email: userEmail } }) || false;
    } catch (error) {
        console.error("Error fetching user:", error);
        return false;
    }
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;

const VERIFICATION_TOKEN_SECRET = process.env.VERIFICATION_TOKEN_SECRET;
const VERIFICATION_TOKEN_EXPIRES_IN = process.env.VERIFICATION_TOKEN_EXPIRES_IN;


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

    refresh: async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is required' });
        }

        try {
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await UserModel.getUserById(decoded.userId);

            if (!user || user.auth.refreshToken !== refreshToken) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }

            const newAccessToken = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                accessToken: newAccessToken
            });

        } catch (error) {
            console.error("Error refreshing token:", error);
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
    },

    // Logout logic (invalidate refresh token)
    logout: async (req, res) => {
        const { refreshToken } = req.body;

        try {
            // Find the user with the provided refresh token
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const user = await UserModel.getUserById(decoded.userId);

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            // Invalidate the refresh token
            await UserModel.updateUser(user.id, {
                'auth.refreshToken': null,  // Clear the refresh token
                'auth.blacklistTokens': [...(user.auth.blacklistTokens || []), refreshToken] // Add to blacklist
            });

            return res.status(200).json({ message: 'Logout successful' });

        } catch (error) {
            console.error("Logout error:", error);
            return res.status(500).json({ message: 'Error logging out', error });
        }
    }
};

module.exports = SessionController;