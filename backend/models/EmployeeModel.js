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

  async deactivateEmployee(employeeId) {
    return this.updateEmployee(employeeId, { isActive: false });
  },

  async activateEmployee(employeeId) {
    return this.updateEmployee(employeeId, { isActive: true });
  },

  async deleteEmployee(employeeId) {
    try {
      const employeeRef = db.collection('employees').doc(employeeId);
      await employeeRef.delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting employee from Firestore: ' + error.message);
    }
  },
};

module.exports = EmployeeModel;