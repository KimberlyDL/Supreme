// backend\utilities\jwtUtils.js
const { SignJWT, jwtVerify, EncryptJWT, jwtDecrypt } = require('jose');
const UserModel = require('../models/UserModel');
const crypto = require('crypto');

// Load the secrets from the environment variables
const JWT_SECRET = Buffer.from(process.env.JWT_SECRET, 'utf-8');  // For signed JWTs
const REFRESH_TOKEN_SECRET = Buffer.from(process.env.REFRESH_TOKEN_SECRET, 'utf-8');
const VERIFICATION_TOKEN_SECRET = Buffer.from(process.env.VERIFICATION_TOKEN_SECRET, 'utf-8');
const ENCRYPTION_SECRET = Buffer.from(process.env.ENCRYPTION_SECRET, 'hex'); // For encrypted JWTs (AES-256)

const OTP_EXPIRATION_TIME = "5m";
const FRONTEND_DOMAIN = process.env.FRONTEND_DOMAIN;
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;



// Function to generate a random secret (256-bit key)
const generateSecret = () => {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes = 256 bits
};

// // Generate Encrypted JWT (using AES-256-GCM)
// const generateEncryptedJwt = async (subject, payload) => {
//     try {
//         const token = await new EncryptJWT(payload)
//             .setProtectedHeader({ alg: "dir", enc: "A256GCM" })  // Direct encryption using AES-256-GCM
//             .setIssuedAt()  // Set issued at time
//             .setSubject(subject)  // Set subject claim
//             .setIssuer(BACKEND_DOMAIN)  // Set issuer claim
//             .setAudience(FRONTEND_DOMAIN)  // Set audience claim
//             .setExpirationTime("1d")  // Set expiration time (1 day)
//             .encrypt(ENCRYPTION_SECRET);  // Encrypt with the secret key

//         return token;  // Return the encrypted JWT
//     } catch (error) {
//         throw new Error('Error generating encrypted JWT: ' + error.message);
//     }
// };

// // Decrypt and verify an encrypted JWT
// const decryptJwt = async (jwt) => {
//     try {
//         const options = {
//             issuer: BACKEND_DOMAIN,
//             audience: FRONTEND_DOMAIN,
//             contentEncryptionAlgorithms: ["A256GCM"],  // Specify encryption algorithm
//             keyManagementAlgorithms: ["dir"],  // Use direct encryption
//         };

//         const { payload, protectedHeader } = await jwtDecrypt(jwt, ENCRYPTION_SECRET, options);
//         return { payload, protectedHeader };  // Return decrypted payload and header
//     } catch (error) {
//         throw new Error('Error decrypting JWT: ' + error.message);
//     }
// };

const generateEncryptedJwt = async (subject, payload) => {
    try {
        const token = await new EncryptJWT(payload)
            .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
            .setIssuedAt()
            .setSubject(subject)
            .setExpirationTime(OTP_EXPIRATION_TIME)
            .encrypt(ENCRYPTION_SECRET);

        return token;
    } catch (error) {
        throw new Error('Error generating encrypted OTP: ' + error.message);
    }
};

// Function to decrypt an encrypted JWT (used for decrypting OTP)
const decryptJwt = async (encryptedJwt) => {
    try {
        const { payload } = await jwtDecrypt(encryptedJwt, ENCRYPTION_SECRET);
        return { payload };
    } catch (error) {
        throw new Error('Error decrypting JWT: ' + error.message);
    }
};


// Generate Email Verification Token (Signed and Encrypted)
const generateEmailVerificationToken = async (user) => {
    const verificationToken = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(VERIFICATION_TOKEN_SECRET);

    const encryptedToken = await generateEncryptedJwt(user.id, { token: verificationToken });
    return encryptedToken;
};

// Decrypt and verify Email Verification Token
const decryptAndVerifyEmailVerificationToken = async (encryptedToken) => {
    try {
        const { payload } = await decryptJwt(encryptedToken);
        const { token } = payload;

        const decoded = await jwtVerify(token, VERIFICATION_TOKEN_SECRET);
        return decoded.payload;
    } catch (error) {
        throw new Error("Invalid or expired token");
    }
};

// Generate access and refresh tokens
const generateTokens = async (user) => {
    const accessToken = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('15m')
        .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({ userId: user.id, email: user.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(REFRESH_TOKEN_SECRET);

    return { accessToken, refreshToken };
};

// Verify access token (signed)
const verifyAccessToken = async (token) => {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch (error) {
        if (error.code === 'ERR_JWT_EXPIRED') {
            throw new Error('TokenExpired');
        } else {
            throw new Error('TokenInvalid');
        }
    }
};

// Verify refresh token
const verifyRefreshToken = async (token) => {
    try {
        const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET);
        return payload;
    } catch (error) {
        throw new Error('RefreshTokenInvalid');
    }
};

// Blacklist token (logout)
// const blacklistToken = async (userId, refreshToken) => {
//     const user = await UserModel.getUserById(userId);
//     if (user) {
//         await UserModel.updateUser(user.id, {
//             'auth.blacklistTokens': [...(user.auth.blacklistTokens || []), refreshToken],
//             'auth.refreshToken': null,
//         });
//     }
// };

// Blacklist token (logout)
// const addTokenToBlacklist = async (userId, token, exp) => {
//     const user = await UserModel.getUserById(userId);

//     const newBlacklistedToken = {
//         token: token,
//         exp: exp  // Expiration timestamp of the token
//     };

//     await UserModel.updateUser(userId, {
//         'auth.blacklistTokens': [...(user.auth.blacklistTokens || []), newBlacklistedToken],
//         'auth.hasBlacklistedTokens': true  // Set the flag to true
//     });
// };

const invalidateRefreshToken = async (userId, refreshToken, exp) => {
    const newBlacklistedToken = {
        token: refreshToken,
        exp: exp
    };

    await UserModel.updateUser(userId, {
        'auth.refreshToken': null,
        'auth.blacklistTokens': [...(user.auth.blacklistTokens || []), newBlacklistedToken],
        'auth.hasBlacklistedTokens': true
    });
};

const cleanBlacklistedTokens = async (userId, validTokens, hasTokens) => {
    await UserModel.updateUser(user.id, {
        'auth.blacklistTokens': validTokens,
        'auth.hasBlacklistedTokens': hasTokens
    });

};

// Clean up old tokens in the blacklist (could be scheduled)
// const cleanBlacklistedTokens = async () => {
//     const users = await UserModel.getAllUsers();
//     for (let user of users) {
//         if (user.auth.blacklistTokens) {
//             const validTokens = user.auth.blacklistTokens.filter((token) => {
//                 try {
//                     jwtVerify(token, REFRESH_TOKEN_SECRET);
//                     return true;
//                 } catch (e) {
//                     return false;
//                 }
//             });
//             await UserModel.updateUser(user.id, { 'auth.blacklistTokens': validTokens });
//         }
//     }
// };



const refreshTokens = async (refreshToken) => {
    try {
        const decoded = await verifyRefreshToken(refreshToken);
        const user = await UserModel.getUserById(decoded.userId);

        if (!user || user.auth.refreshToken !== refreshToken) {
            throw new Error('InvalidRefreshToken');
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

        await UserModel.updateUser(user.id, {
            'auth.refreshToken': newRefreshToken,
            'auth.tokenIssuedAt': new Date().toISOString(),
        });

        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    generateSecret,
    generateEmailVerificationToken,
    decryptAndVerifyEmailVerificationToken,
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    decryptJwt,
    invalidateRefreshToken,
    refreshTokens,
    cleanBlacklistedTokens,
};
