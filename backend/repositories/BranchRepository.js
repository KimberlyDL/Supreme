// backend\repositories\BranchRepositories.js
const { db, Timestamp } = require("../config/firebase");

const BranchRepository = {
  // Create Branch
  async createBranch(branchId, branchData) {
    try {
      const branchRef = db.collection("branches").doc(branchId);
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
      const existingBranches = await this.getAllBranches();

      const existingBranch  = existingBranches.find(
        (branch) => branch.id === branchId
      );
      if (!existingBranch ) throw new Error("Branch not found");

      const nameExists = existingBranches.some(
        (branch) => branch.name.toLowerCase() === updatedData.name.trim().toLowerCase()
      );
      if (nameExists) throw new Error("Branch name already exist");
      
      updatedData.updatedAt = Timestamp.now();

      const branchRef = db.collection("branches").doc(branchId);
      await branchRef.update(updatedData);

      const updatedBranch = { ...existingBranch, ...updatedData };

      return {id: branchId, ...updatedBranch };
    } catch (error) {
      throw new Error(`Error updating branch: ${error.message}`);
    }
  },

  // Update Branch
  async toggleBranchStatus(branchId, isActive) {
    try {
      // // Correct validation
      // if (typeof isActive !== "boolean") {
      //   throw new Error("Invalid value for isActive. Must be true or false.");
      // }
      const branchRef = db.collection("branches").doc(branchId);
      await branchRef.update({
        isActive,
        updatedAt: Timestamp.now(),
      });
      return;
    } catch (error) {
      throw new Error(`Error updating branch: ${error.message}`);
    }
  },

  // Check if branch has operations
  async hasOperations(branchId) {
    try {
      // Check for products associated with this branch
      const productsSnapshot = await db
        .collection("products")
        .where("branchId", "==", branchId)
        .limit(1)
        .get();

      if (!productsSnapshot.empty) {
        return true;
      }

      // Check for sales associated with this branch
      const salesSnapshot = await db
        .collection("sales")
        .where("branchId", "==", branchId)
        .limit(1)
        .get();

      if (!salesSnapshot.empty) {
        return true;
      }

      // Check for operations associated with this branch
      const operationsSnapshot = await db
        .collection("operations")
        .where("branchId", "==", branchId)
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
      const branchRef = db.collection("branches").doc(branchId);
      const branchDoc = await branchRef.get();

      if (!branchDoc.exists) {
        throw new Error("Branch not found");
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
          message: "Branch marked as inactive, operations exist",
          deactivated: true,
        };
      } else {
        // If no operations, delete the branch
        await branchRef.delete();
        return {
          success: true,
          message: "Branch deleted successfully, no operations found",
          deleted: true,
        };
      }
    } catch (error) {
      throw new Error(`Error deleting branch: ${error.message}`);
    }
  },

  //#region GetBranchByName
  async getBranchByName(name) {
    try {
      const snapshot = await db
        .collection("branches")
        .where("name", "==", name)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }

      return null;
    } catch (error) {
      throw new Error(`Error getting branch: ${error.message}`);
    }
  },

  async getAllBranches() {
    try {
      const snapshot = await db.collection("branches").get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      throw new Error(`Error retrieving branches: ${error.message}`);
    }
  },

  async getBranchById(branchId) {
    try {
      const doc = await db.collection("branches").doc(branchId).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error getting branch by ID: ${error.message}`);
    }
  },
};

module.exports = BranchRepository;
