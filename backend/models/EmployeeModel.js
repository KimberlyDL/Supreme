const { db } = require('../config/firebase');

const EmployeeModel = {
  async createEmployee(employeeData) {
    try {
      const employeeRef = db.collection('employees').doc(employeeData.uid); // Use Firebase Auth UID as document ID
      await employeeRef.set(employeeData);
      return employeeData;
    } catch (error) {
      throw new Error('Error saving employee data to Firestore: ' + error.message);
    }
  },

  async getEmployeeByEmail(email) {
    const employeeSnapshot = await db.collection('employees').where('email', '==', email).get();
    if (employeeSnapshot.empty) {
      return null; 
    }

    const employeeDoc = employeeSnapshot.docs[0];
    const employeeData = employeeDoc.data();
    employeeData.id = employeeDoc.id;

    return employeesData;

  },

  async getEmployeeById(employeeId) {
    const employeeRef = db.collection('employees').doc(employeeId);
    const employeeDoc = await employeeRef.get();

    if (!employeeDoc.exists) {
      return null;
    }

    const employeeData = employeeDoc.data();
    employeeData.id = employeeDoc.id;

    return employeeData;
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

};

module.exports = EmployeeModel;