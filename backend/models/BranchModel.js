// backend\models\BranchModel.js
const { db } = require('../config/firebase');

// Branch Schema
// const newBranch = {
//   name: name || "",
//   location: {
//     street: street || "",
//     barangay: barangay || "",
//     municipality: municipality || "",
//     province: province || "",
//   },
//   contact: contact || "",
//   manager: manager || "",
//   isActive: true,
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
// };

const BranchModel = {
    async createBranch(branchData) {
        const branchRef = db.collection('branches').doc();
        branchData.createdAt = new Date().toISOString();
        branchData.updatedAt = new Date().toISOString();
        await branchRef.set(branchData);
        return branchRef.id;
    },

    async getBranchById(branchId) {
        const branchRef = db.collection('branches').doc(branchId);
        const branchDoc = await branchRef.get();

        if (!branchDoc.exists) {
            return null;
        }

        const branchData = branchDoc.data();
        branchData.id = branchDoc.id;

        return branchData;
    },

    async getBranchByName(name) {
        const branchSnapshot = await db.collection('branches').where('name', '==', name).get();
        if (branchSnapshot.empty) {
            return null;
        }

        const branchDoc = branchSnapshot.docs[0];
        const branchData = branchDoc.data();
        branchData.id = branchDoc.id;

        return branchData;
    },

    async updateBranch(branchId, updatedData) {
        const branchRef = db.collection('branches').doc(branchId);
        updatedData.updatedAt = new Date().toISOString();
        await branchRef.update(updatedData);
        return true;
    },

    async hasOperations(branchId) {
        const salesSnapshot = await db.collection('sales').where('branchId', '==', branchId).get();
        const operationsSnapshot = await db.collection('operations').where('branchId', '==', branchId).get();

        return !salesSnapshot.empty || !operationsSnapshot.empty;
    },

    async deleteBranch(branchId) {
        const branchRef = db.collection('branches').doc(branchId);

        const hasOperations = await this.hasOperations(branchId);

        if (hasOperations) {
            await branchRef.update({
                isActive: false,
                updatedAt: new Date().toISOString(),
            });
            return { message: 'Branch marked as inactive, operations exist' };
        } else {
            await branchRef.delete();
            return { message: 'Branch deleted successfully, no operations found' };
        }
    },

    // async determineBranchByLocation(municipality, province) {
    //     const branchSnapshot = await db.collection('branches')
    //         .where('location.municipality', '==', municipality)
    //         .where('location.province', '==', province)
    //         .get();

    //     if (!branchSnapshot.empty) {
    //         const branchDoc = branchSnapshot.docs[0]; // Assuming we take the first match
    //         const branchData = branchDoc.data();
    //         return branchData.name;
    //     }
    //     return null;
    // }
};

module.exports = BranchModel;
