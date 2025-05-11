// backend\models\BranchModel.js
const { db, Timestamp } = require('../config/firebase');

const BranchModel = {
    // Create Branch
    async createBranch(branchData) {
        try {
            // Validate branch data
            if (!branchData.name || branchData.name.trim() === '') {
                throw new Error('Branch name is required');
            }

            if (!branchData.location || !branchData.location.street || !branchData.location.barangay ||
                !branchData.location.municipality || !branchData.location.province) {
                throw new Error('Complete location details are required');
            }

            // Check if branch name already exists
            const branchSnapshot = await db.collection('branches')
                .where('name', '==', branchData.name)
                .get();

            if (!branchSnapshot.empty) {
                throw new Error('Branch name already exists');
            }

            const branchRef = db.collection('branches').doc();
            branchData.createdAt = Timestamp.now();
            branchData.updatedAt = Timestamp.now();
            await branchRef.set(branchData);
            return branchRef.id;
        } catch (error) {
            throw new Error(`Error creating branch: ${error.message}`);
        }
    },

    // Update Branch
    async updateBranch(branchId, updatedData) {
        try {
            // Validate branch data
            if (updatedData.name && updatedData.name.trim() === '') {
                throw new Error('Branch name cannot be empty');
            }

            if (updatedData.location &&
                (!updatedData.location.street || !updatedData.location.barangay ||
                    !updatedData.location.municipality || !updatedData.location.province)) {
                throw new Error('Complete location details are required');
            }

            // Check if branch exists
            const branchRef = db.collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();

            if (!branchDoc.exists) {
                throw new Error('Branch not found');
            }

            // Check if new branch name already exists (if name is being updated)
            if (updatedData.name && updatedData.name !== branchDoc.data().name) {
                const nameCheckSnapshot = await db.collection('branches')
                    .where('name', '==', updatedData.name)
                    .get();

                if (!nameCheckSnapshot.empty) {
                    throw new Error('Branch name already exists');
                }
            }

            // Update the branch
            updatedData.updatedAt = Timestamp.now();
            await branchRef.update(updatedData);
            return branchId;
        } catch (error) {
            throw new Error(`Error updating branch: ${error.message}`);
        }
    },

    // Update Branch
    async toggleBranchStatus(branchRef, isActive) {
        try {

            console.log(isActive);

            // Correct validation
            if (typeof isActive !== "boolean") {
                throw new Error("Invalid value for isActive. Must be true or false.");
            }

            await branchRef.update({
                isActive,
                updatedAt: Timestamp.now(),
            });
            // return branchId;

        } catch (error) {
            throw new Error(`Error updating branch: ${error.message}`);
        }
    },

    // Check if branch has operations
    async hasOperations(branchId) {
        try {
            // Check for products associated with this branch
            const productsSnapshot = await db.collection('products')
                .where('branchId', '==', branchId)
                .limit(1)
                .get();

            if (!productsSnapshot.empty) {
                return true;
            }

            // Check for sales associated with this branch
            const salesSnapshot = await db.collection('sales')
                .where('branchId', '==', branchId)
                .limit(1)
                .get();

            if (!salesSnapshot.empty) {
                return true;
            }

            // Check for operations associated with this branch
            const operationsSnapshot = await db.collection('operations')
                .where('branchId', '==', branchId)
                .limit(1)
                .get();

            return !operationsSnapshot.empty;
        } catch (error) {
            throw new Error(`Error checking branch operations: ${error.message}`);
        }
    },

    // Delete Branch
    async deleteBranch(branchId) {
        try {
            // Check if branch exists
            const branchRef = db.collection('branches').doc(branchId);
            const branchDoc = await branchRef.get();

            if (!branchDoc.exists) {
                throw new Error('Branch not found');
            }

            // Check if branch has operations
            const hasOperations = await this.hasOperations(branchId);

            if (hasOperations) {
                // If branch has operations, mark it as inactive instead of deleting
                await branchRef.update({
                    isActive: false,
                    updatedAt: Timestamp.now(),
                });
                return {
                    success: true,
                    message: 'Branch marked as inactive, operations exist',
                    deactivated: true
                };
            } else {
                // If no operations, delete the branch
                await branchRef.delete();
                return {
                    success: true,
                    message: 'Branch deleted successfully, no operations found',
                    deleted: true
                };
            }
        } catch (error) {
            throw new Error(`Error deleting branch: ${error.message}`);
        }
    }
};

module.exports = BranchModel;