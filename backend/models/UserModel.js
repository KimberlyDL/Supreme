// backend\models\UserModel.js
const { db, Timestamp } = require('../config/firebase');

const UserModel = {
  async createUser(userData) {
    const userRef = db.collection('users').doc();
    await userRef.set(userData);
    return userRef;
  },

  async registerUserAccount(userData) {
    try {
      userData.createdAt = Timestamp.now();
      userData.updatedAt = Timestamp.now();

      const userRef = db.collection('users').doc(userData.uid);
      await userRef.set(userData);

      // return userData.uid;
    } catch (error) {
      throw new Error(error);
    }
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

  // Assuming you have already initialized your Firestore instance as 'db'
  async getAccountById(userId) {
    // Create document references for each collection
    const userRef = db.collection('users').doc(userId);
    const employeeRef = db.collection('employees').doc(userId);
    const adminRef = db.collection('admin').doc(userId);

    // Fetch all documents concurrently
    const [userSnap, employeeSnap, adminSnap] = await Promise.all([
      userRef.get(),
      employeeRef.get(),
      adminRef.get()
    ]);

    // Decide on the priority order.
    // For example, if you want to check 'admin' first, then 'employee', then 'user':
    if (adminSnap.exists) {
      return { collection: 'admin', data: adminSnap.data() };
    } else if (employeeSnap.exists) {
      return { collection: 'employees', data: employeeSnap.data() };
    } else if (userSnap.exists) {
      return { collection: 'users', data: userSnap.data() };
    } else {
      throw new Error('No user found in any collection');
    }
  },


  async activateUser(userId) {
    try {
      const userRef = db.collection('users').doc(userId);

      await userRef.update({
        "isActive": true
      });

      return true;

    } catch (err) {
      const error = new Error(err.message);
      error.name = 'ActivateUserError';
      throw error;
    }
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