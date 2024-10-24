// backend\controllers\auth\SessionController.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwtUtils = require('../../utilities/jwtUtils');
const otpUtils = require('../../utilities/otpUtils');
const UserModel = require('../../models/UserModel');

const saltRounds = 10;

const SessionController = {
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
                if (!(user.auth.otp && user.auth.otpCreatedAt)) {
                    await otpUtils.generateAndSendOtp(user);
                    return res.status(200).json({ message: 'A OTP has been sent to your email.' });
                }
                else if (user.auth.otpCreatedAt && otpUtils.isOtpExpired(user.auth.otpCreatedAt)) {
                    await otpUtils.generateAndSendOtp(user);
                    return res.status(200).json({ message: 'OTP expired. A new OTP has been sent to your email.' });
                } else {
                    return res.status(200).json({
                        message: 'Please verify your account. An OTP has already been sent to your email.',
                    });
                }
            }

            const { accessToken, refreshToken } = await jwtUtils.generateTokens(user);

            await UserModel.updateUser(user.id, {
                'auth.refreshToken': refreshToken,
                'auth.tokenIssuedAt': new Date().toISOString(),
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            //make audit - user login
            //make announcements 
            return res.status(200).json({
                message: 'Login successful',
                accessToken,
            });

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: 'Error logging in', error });
        }
    },

    resendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await UserModel.getUserByEmail(email);

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: 'User is already verified.' });
            }

            await UserModel.updateUser(user.id, {
                'auth.otp': null,
                'auth.otpCreatedAt': null,
            });

            await otpUtils.generateAndSendOtp(user);

            return res.status(200).json({
                message: 'A new OTP has been sent to your email.',
            });

        } catch (error) {
            console.error('Error resending OTP:', error);
            return res.status(500).json({ message: 'Error resending OTP', error });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await UserModel.getUserByEmail(email);

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const decryptedOtpPayload = await jwtUtils.decryptJwt(user.auth.otp);
            const storedOtp = decryptedOtpPayload.payload.otp;

            if (storedOtp !== otp || otpUtils.isOtpExpired(user.auth.otpCreatedAt)) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            await UserModel.updateUser(user.id, {
                'auth.isVerified': true,
                'auth.otp': null,
                'auth.otpCreatedAt': null,
            });

            return res.status(200).json({ message: 'Email verified successfully' });

        } catch (error) {
            console.error("OTP Verification error:", error);
            return res.status(500).json({ message: 'Error verifying OTP', error });
        }
    },
    
    refreshTokens: async (req, res) => {
        try {
            const { refreshToken } = req.cookies;
            
            if (!refreshToken) {
                return res.status(401).json({ message: 'Refresh token is missing' });
            }
    
            const decoded = await jwtUtils.verifyRefreshToken(refreshToken);
            const user = await UserModel.getUserById(decoded.userId);
    
            if (!user || user.auth.refreshToken !== refreshToken) {
                return res.status(401).json({ message: 'Invalid refresh token' });
            }
    
            const { accessToken, refreshToken: newRefreshToken } = await jwtUtils.generateTokens(user);
    
            await UserModel.updateUser(user.id, {
                'auth.refreshToken': newRefreshToken,
                'auth.tokenIssuedAt': new Date().toISOString(),
            });
    
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
    
            return res.status(200).json({
                accessToken,
                message: 'Access token refreshed successfully',
            });
    
        } catch (error) {
            console.error('Error refreshing token:', error.message);
            return res.status(403).json({ message: 'Refresh token expired. Please log in again.' });
        }
    },    

    logout: async (req, res) => {
        const { refreshToken } = req.body;

        try {
            const decoded = await jwtUtils.verifyRefreshToken(refreshToken);
            const user = await UserModel.getUserById(decoded.userId);

            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            const exp = decoded.exp;
            await jwtUtils.invalidateRefreshToken(user.id, refreshToken, decoded.exp)

            return res.status(200).json({ message: 'Logout successful' });

        } catch (error) {
            console.error("Logout error:", error);
            return res.status(500).json({ message: 'Error logging out', error });
        }
    },

    cleanBlacklistedTokens: async () => {
        const users = await UserModel.getUsersWithBlacklistedTokens();
        const nowInSeconds = Math.floor(Date.now() / 1000);
    
        for (let user of users) {
            const blacklistTokens = user.auth.blacklistTokens || [];
    
            const validTokens = blacklistTokens.filter((tokenObj) => tokenObj.exp > nowInSeconds);
    
            const hasTokens = validTokens.length > 0;
    
            await UserModel.updateUser(user.id, {
                'auth.blacklistTokens': validTokens,
                'auth.hasBlacklistedTokens': hasTokens
            });
        }
    },
};

module.exports = SessionController;
