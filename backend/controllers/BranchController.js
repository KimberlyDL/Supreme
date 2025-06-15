// backend\controllers\BranchController.js
const { db, Timestamp } = require("../config/firebase");
const BranchRepository = require("../repositories/BranchRepository");
const {
  _generateBranchId,
  _generateLogId,
  _generateActivityLogId,
} = require("../utilities/utils");
const { LogService } = require("../services/LogService");
const logService = new LogService();
const branchLogsCollection = "branch_logs";

// #region validation methods
/**
 * Check if a location object has all required string fields.
 * @param {Object} location - The location object.
 * @returns {boolean}
 */
const _isValidLocation = (location) => {
  return (
    location &&
    typeof location === "object" &&
    typeof location.street === "string" &&
    location.street.trim() !== "" &&
    typeof location.barangay === "string" &&
    location.barangay.trim() !== "" &&
    typeof location.municipality === "string" &&
    location.municipality.trim() !== "" &&
    typeof location.province === "string" &&
    location.province.trim() !== ""
  );
};

/**
 * Validate branch data with dynamic fields.
 * @param {Object} data - The branch data object.
 * @param {Array<string>} requiredFields - The fields to check for.
 * @returns {{ valid: boolean, errors: string[] }}
 */
const _validateBranchData = (
  data,
  requiredFields = ["name", "location", "isActive"]
) => {
  const errors = [];

  requiredFields.forEach((field) => {
    if (field === "location") {
      if (!_isValidLocation(data.location)) {
        errors.push(
          "Invalid or missing location: requires street, barangay, municipality, province"
        );
      }
    } else if (field === "isActive") {
      if (typeof data.isActive !== "boolean") {
        errors.push("Invalid branch status");
      }
    } else {
      if (
        !data[field] ||
        typeof data[field] !== "string" ||
        data[field].trim() === ""
      ) {
        errors.push(`Invalid or missing field: ${field}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
// #endregion

const BranchController = {
  // #region add
  addBranch: async (req, res) => {
    try {
      const user = req.user;
      const { name, location } = req.body;

      const validateData = _validateBranchData({ name, location }, [
        "name",
        "location",
      ]);

      if (!validateData.valid)
        return res.status(400).json({
          displayToUser: true,
          message: validateData.errors.join("; "),
        });

      const existingBranches = await BranchRepository.getAllBranches();

      const nameExists = existingBranches.some(
        (branch) => branch.name.toLowerCase() === name.trim().toLowerCase()
      );
      if (nameExists)
        return res.status(400).json({
          displayToUser: true,
          message: "Branch already exist",
        });

      let id = "";
      let unique = false;

      while (!unique) {
        id = _generateBranchId();
        const idExists = existingBranches.some((branch) => branch.id === id);

        if (!idExists) {
          unique = true;
        } else {
          attempts++;
        }
      }

      const branchData = {
        name: name.trim(),
        location: {
          street: location?.street.trim() || "",
          barangay: location?.barangay.trim() || "",
          municipality: location?.municipality.trim() || "",
          province: location?.province.trim() || "",
        },
        isActive: false,
      };

      await BranchRepository.createBranch(id, branchData);

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(id),
        _generateActivityLogId(user.uid),
      ]);

      const logRef = db.collection(branchLogsCollection).doc(logId);
      const batch = db.batch();
      batch.set(logRef, {
        type: "create_branch",
        branchId: id,
        name: branchData.name,
        location: branchData.location,
        isActive: branchData.isActive,
        performedBy: user.uid,
        timestamp: Timestamp.now(),
      });
      batch.commit();

      logService.logAdminActivity(
        {
          activityType: "BRANCH_CREATE",
          user: user,
          action: "CREATE_BRANCH",
          targetResource: "branches",
          resourceId: id,
          details: `Created new branch: ${branchData.name}`,
        },
        [logId],
        activityLogId
      );

      return res.status(201).json({});
    } catch (error) {
      console.error("Error creating branch:", error);
      return res.status(500).json({
        displayToUser: true,
        message: "An unexpected error occurred. Failed to create branch.",
      });
    }
  },
  // #endregion
  // #region edit
  editBranch: async (req, res) => {
    try {
      const branchId = req.params.id;
      const { name, location } = req.body;
      const user = req.user;

      const validateData = _validateBranchData({ name, location }, [
        "name",
        "location",
      ]);

      if (!validateData.valid)
        return res.status(400).json({
          displayToUser: true,
          message: validateData.errors.join("; "),
        });

      const branchData = {
        name: name.trim(),
        location: {
          street: location?.street.trim(),
          barangay: location?.barangay.trim(),
          municipality: location?.municipality.trim(),
          province: location?.province.trim(),
        },
      };

      const updatedBranch = await BranchRepository.updateBranch(
        branchId,
        branchData
      );

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(branchId),
        _generateActivityLogId(user.uid),
      ]);

      const logRef = db.collection(branchLogsCollection).doc(logId);
      const batch = db.batch();
      batch.set(logRef, {
        type: "update_branch",
        branchId: branchId,
        name: updatedBranch.name,
        location: updatedBranch.location,
        isActive: updatedBranch.isActive,
        performedBy: user.uid,
        timestamp: Timestamp.now(),
      });
      batch.commit();

      logService.logAdminActivity(
        {
          activityType: "BRANCH_UPDATE",
          user: user,
          action: "UPDATE_BRANCH",
          targetResource: "branches",
          resourceId: branchId,
          details: `Updated branch: ${updatedBranch.name}`,
        },
        [logId],
        activityLogId
      );

      return res.status(200).json({});
    } catch (error) {
      console.error("Error updating branch:", error);
      return res.status(500).json({
        displayToUser: true,
        message: "An unexpected error occurred. Failed to update branch.",
      });
    }
  },
  // #endregion
  // #region toggle status
  toggleBranchStatus: async (req, res) => {
    try {
      const branchId = req.params.id;
      const { isActive } = req.body;
      const user = req.user;

      const validateData = _validateBranchData({ isActive }, ["isActive"]);

      if (!validateData.valid)
        return res.status(400).json({
          message: validateData.errors.join("; "),
        });

      const existingBranch = await BranchRepository.getBranchById(branchId);
      if (!existingBranch)
        return res.status(400).json({
          success: false,
          message: "Branch not found",
        });

      await BranchRepository.toggleBranchStatus(branchId, isActive);

      const updatedBranch = {
        ...existingBranch,
        isActive,
      };

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(branchId),
        _generateActivityLogId(user.uid),
      ]);

      const logRef = db.collection(branchLogsCollection).doc(logId);
      const batch = db.batch();
      batch.set(logRef, {
        type: "update_branch",
        branchId: branchId,
        name: updatedBranch.name,
        location: updatedBranch.location,
        isActive: updatedBranch.isActive,
        performedBy: user.uid,
        timestamp: Timestamp.now(),
      });
      batch.commit();

      logService.logAdminActivity(
        {
          activityType: "BRANCH_UPDATE",
          user: user,
          action: "UPDATE_BRANCH",
          targetResource: "branches",
          resourceId: branchId,
          details: `Updated branch: ${updatedBranch.name}`,
        },
        [logId],
        activityLogId
      );

      const status = isActive ? "activated" : "deactivated";

      return res.status(200).json({
        displayToUser: true,
        message: `Branch ${status} successfully.`,
      });
    } catch (error) {
      console.error("Error updating branch:", error);
      return res.status(500).json({
        displayToUser: true,
        message:
          "An unexpected error occurred. Failed to change branch status.",
      });
    }
  },
  // #endregion
  // #region delete
  deleteBranch: async (req, res) => {
    try {
      // return res.status(500).json({
      //   displayToUser: true,
      //   message:
      //     "test notif: An unexpected error occurred. Failed to create branch.",
      // });
      const branchId = req.params.id;
      const user = req.user;

      const existingBranch = await BranchRepository.getBranchById(branchId);
      if (!existingBranch)
        return res.status(400).json({
          displayToUser: true,
          message: "Branch not found",
        });

      const result = await BranchRepository.deleteBranch(branchId);

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(branchId),
        _generateActivityLogId(user.uid),
      ]);

      const logRef = db.collection(branchLogsCollection).doc(logId);
      const batch = db.batch();
      batch.set(logRef, {
        type: result.deleted ? "delete_branch" : "deactivate_branch",
        branchId: branchId,
        name: existingBranch.name,
        location: existingBranch.location,
        isActive: existingBranch.isActive,
        performedBy: user.uid,
        timestamp: Timestamp.now(),
      });
      batch.commit();

      logService.logAdminActivity(
        {
          activityType: result.deleted ? "BRANCH_DELETE" : "BRANCH_DEACTIVATE",
          user: user,
          action: result.deleted ? "DELETE_BRANCH" : "DEACTIVATE_BRANCH",
          targetResource: "branches",
          resourceId: branchId,
          details: `branch ${existingBranch.name} ${
            result.deleted ? "deleted" : "deactivated"
          }`,
        },
        [logId],
        activityLogId
      );

      return res.status(200).json({
        displayToUser: true,
        message: result.message,
        // deactivated: result.deactivated,
        // deleted: result.deleted,
      });
    } catch (error) {
      console.error("Error deleting branch:", error);
      return res.status(500).json({
        message: "An unexpected error occurred. Failed to delete branch.",
        error: error.message,
      });
    }
  },
  // #endregion
  // #region getBranches
  // getBranches: async (req, res) => {
  //   try {
  //     const branches = await BranchRepository.getBranches;
  //   } catch (error) {
  //     console.error("Error deleting branch:", error);
  //     return res.status(500).json({
  //       success: false,
  //       message: "Server error: Unable to delete branch",
  //       error: error.message,
  //     });
  //   }
  // },
  // #endregion
};

module.exports = BranchController;
