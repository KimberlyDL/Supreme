const jwtUtils = require('./jwtUtils');
const UserModel = require('../models/UserModel');
const sendVerificationEmail = require('./mail/verifyEmail');

const generateAndSendOtp = async (user) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();  // 6-digit OTP

    const encryptedOtp = await jwtUtils.generateEncryptedJwt(user.id, { otp });

    await UserModel.updateUser(user.id, {
        'auth.otp': encryptedOtp,
        'auth.otpCreatedAt': new Date().toISOString(),
    });

    await sendVerificationEmail(user.email, otp);

    return otp;
};

const isOtpExpired = (otpCreatedAt) => {
    const currentTime = new Date();
    const otpTimestamp = new Date(otpCreatedAt);
    const timeDifference = (currentTime - otpTimestamp) / (1000 * 60);  // Time difference in minutes
    return timeDifference > 5;
};

module.exports = {
    generateAndSendOtp,
    isOtpExpired
};
