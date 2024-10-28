const { db } = require('../config/firebase');

// User Schema
//   const newUser = {
//     email,
//     passwordHash: hashedPassword,
//     role: "customer",
//     branchName: branchName || null,
//     isVerified: false,
//     isActive: true,
//     profile: {
//         firstName: firstName || "",
//         lastName: lastName || "",
//         address: {
//             street: street || "",
//             barangay: barangay || "",
//             city: city || "",
//             municipality: municipality || "",
//         },
//         avatarUrl: null,
//     },
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//     lastLoginAt: null,
//     notifications: {
//         emailNotifications: true,
//     },
//     security: {
//         failedLoginAttempts: 0,
//         lastPasswordChangeAt: new Date().toISOString(),
//     },
//     auth: {
//         refreshToken: null,
//         tokenIssuedAt: null,
//         otp: null,
//         otpCreatedAt: null,
//         blacklistTokens: [
//             { token: null, exp: null }
//         ],
//         hasBlacklistedTokens: false
//     },
//     passwordReset: {
//         resetToken: null,
//         resetExpires: null,
//     }
// };

const UserModel = {
  async createUser(userData) {
    const userRef = db.collection('users').doc();
    await userRef.set(userData);
    return userRef;
  },

  async getUserByEmail(email) {
    // // Query Firestore for a document where the 'email' field matches the provided email
    // const userSnapshot = await db.collection('users').where('email', '==', email).get();
    // if (userSnapshot.empty) {
    //   return null;  // Return null if no user is found
    // }
    // return userSnapshot.docs[0].data();  // Return the user's data

    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return null;  // No user with this email found
    }

    const userDoc = userSnapshot.docs[0];  // Get the first matching document
    const userData = userDoc.data();
    userData.id = userDoc.id;  // Attach the Firestore document ID to the user data

    return userData;

  },

  async getUserById(userId) {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    userData.id = userDoc.id;

    return userData;
  },

  async updateUser(userId, updatedData) {
    const userRef = db.collection('users').doc(userId);
    await userRef.update(updatedData);
    return true;
  },

  async deleteUser(userId) {
    const userRef = db.collection('users').doc(userId);
    await userRef.delete();
    return true;
  },

  async addToken(userId, token) {
    await db.collection('fcmTokens').doc(userId).set({ fcmToken: token }, { merge: true });
    return true;
  },

  async addTokenToBlacklist(userId, token, exp) {
    const user = await UserModel.getUserById(userId);

    const newBlacklistedToken = {
      token: token,
      exp: exp  // Expiration timestamp of the token
    };
  },

  async getUsersWithBlacklistedTokens() {
    return firestore.collection('users').where('auth.hasBlacklistedTokens', '==', true).get();
  },

};

module.exports = UserModel;