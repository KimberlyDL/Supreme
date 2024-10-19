const db = require('../config/firebase');  // Firestore configuration

const UserModel = {
  async createUser(userData) {
    const userRef = db.collection('users').doc();  // Create a new document in the 'users' collection
    await userRef.set(userData);  // Save the user data to Firestore
    return userRef.id;  // Return the auto-generated document ID
  },

  async getUserByEmail(email) {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (userSnapshot.empty) {
      return null;  // No user found
    }
    return userSnapshot.docs[0].data();  // Return the first matching user document
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
  }
};

module.exports = UserModel;
