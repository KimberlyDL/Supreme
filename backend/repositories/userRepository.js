// backend\repositories\userRepository.js
const admin = require("firebase-admin");
const { db, Timestamp } = require("../config/firebase");

class UserRepository {
  constructor() {
    // this.db = admin.firestore();
    this.collection = db.collection("users");
  }

  async findById(userId) {
    try {
      const doc = await this.collection.doc(userId).get();
      if (!doc.exists) {
        return null;
      }
      return { uid: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async update(userId, updateData) {
    try {
      updateData.updatedAt = Timestamp.now();
      await this.collection.doc(userId).update(updateData);
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async create(userId, userData) {
    try {
      const newUser = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.collection.doc(userId).set(newUser);
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const snapshot = await this.collection.where("email", "==", email).get();
      if (snapshot.empty) {
        return null;
      }
      const doc = snapshot.docs[0];
      return { uid: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }
}

module.exports = new UserRepository();
