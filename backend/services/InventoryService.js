// backend\services\InventoryService.js
const { db, Timestamp, FieldValue } = require("../config/firebase");
const { _generateShortId, _generateLogId, _generateActivityLogId } = require("../utilities/utils");
const { LogService } = require("./LogService");

class InventoryService {
  //#region Constructor and Properties
  constructor() {
    this.branchStocksCollection = "branch_stocks";
    this.inventoryLogsCollection = "inventory_logs";
    this.productsCollection = "products";
    this.logService = new LogService();
  }
  //#endregion

  //#region Helper Methods
  /**
   * Process expiration date to ensure consistent format
   * @param {number|string} dateValue - Date value to process
   * @returns {number} Unix timestamp in seconds
   */
  _processExpirationDate(dateValue) {
    if (!dateValue) return null;

    // If already a number (timestamp), return as is
    if (typeof dateValue === "number") return dateValue;

    // Convert string date to timestamp
    const normalizedDate = new Date(dateValue);
    normalizedDate.setUTCHours(0, 0, 0, 0); // Prevent time-related bugs
    return Math.floor(normalizedDate.getTime() / 1000); // Unix time in seconds
  }

  /**
   * Process array of expiration dates
   * @param {Array} expirationDates - Array of expiration dates
   * @returns {Array} Processed expiration dates
   */
  _processExpirationDates(expirationDates) {
    if (!expirationDates || !Array.isArray(expirationDates)) return [];

    return expirationDates.map((exp) => {
      return {
        date: this._processExpirationDate(exp.date),
        qty: parseInt(exp.qty, 10),
      };
    });
  }

  /**
   * Merge expiration dates, combining quantities for same dates
   * @param {Array} existingDates - Existing expiration dates
   * @param {Array} newDates - New expiration dates to merge
   * @returns {Array} Merged expiration dates
   */
  _mergeExpirationDates(existingDates = [], newDates = []) {
    const mergedDates = [...existingDates];

    newDates.forEach((newExp) => {
      const existingIndex = mergedDates.findIndex(
        (exp) => exp.date === newExp.date
      );

      if (existingIndex >= 0) {
        // Update existing date quantity
        mergedDates[existingIndex].qty += parseInt(newExp.qty, 10);
      } else {
        // Add new expiration date
        mergedDates.push({
          date: newExp.date,
          qty: parseInt(newExp.qty, 10),
        });
      }
    });

    // Sort by date (earliest first)
    return mergedDates.sort((a, b) => a.date - b.date);
  }

  // // Create a base method for inventory logging
  // async createInventoryLog(batch, logData, user) {
  //   const logRef = this.db.collection(this.inventoryLogsCollection).doc();

  //   const baseLogData = {
  //     ...logData,
  //     performedBy: user.uid,
  //     timestamp: Timestamp.now(),
  //   };

  //   batch.set(logRef, baseLogData);
  //   return logRef;
  // }

  //#endregion

  //#region Stock Operations

  /**
   * Add stock to a branch
   * @param {Object} stockData - Stock data to add
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Result of the operation
   */
  async addStock(stockData, user) {
    const batch = db.batch();

    try {
      // Process expiration date (single date support for backward compatibility)
      if (stockData.expirationDate) {
        stockData.expirationDate = this._processExpirationDate(
          stockData.expirationDate
        );
      }

      // Process multiple expiration dates
      if (
        stockData.expirationDates &&
        Array.isArray(stockData.expirationDates)
      ) {
        stockData.expirationDates = this._processExpirationDates(
          stockData.expirationDates
        );
      }

      // Get the branch stock document
      const stockRef = db
        .collection(this.branchStocksCollection)
        .where("branchId", "==", stockData.branchId)
        .where("productId", "==", stockData.productId)
        .where("varietyId", "==", stockData.varietyId)
        .limit(1);

      const stockSnapshot = await stockRef.get();

      let stockDoc;
      let oldQuantity = 0;
      let newQuantity = parseInt(stockData.quantity, 10);

      // If stock exists, update it
      if (!stockSnapshot.empty) {
        stockDoc = stockSnapshot.docs[0];
        const existingStockData = stockDoc.data();
        oldQuantity = existingStockData.quantity || 0;
        newQuantity += oldQuantity;

        // Update existing expirationDates or add new ones
        let expirationDates = existingStockData.expirationDates || [];

        // Handle single expiration date (backward compatibility)
        if (existingStockData.expirationDate) {
          expirationDates = this._mergeExpirationDates(expirationDates, [
            {
              date: existingStockData.expirationDate,
              qty: parseInt(existingStockData.quantity, 10),
            },
          ]);
        }

        // Handle multiple expiration dates
        if (
          stockData.expirationDates &&
          Array.isArray(stockData.expirationDates)
        ) {
          expirationDates = this._mergeExpirationDates(
            expirationDates,
            stockData.expirationDates
          );
        }

        // Update the stock document
        batch.update(
          db.collection(this.branchStocksCollection).doc(stockDoc.id),
          {
            quantity: newQuantity,
            expirationDates: expirationDates,
            updatedAt: Timestamp.now(),
          }
        );
      } else {
        const inventoryId = _generateShortId("INV");
        // Create new stock document
        const newStockRef = db
          .collection(this.branchStocksCollection)
          .doc(inventoryId);

        let expirationDates = [];

        // Handle single expiration date (backward compatibility)
        if (stockData.expirationDate) {
          expirationDates.push({
            date: stockData.expirationDate,
            qty: parseInt(stockData.quantity, 10),
          });
        }

        // Handle multiple expiration dates
        if (
          stockData.expirationDates &&
          Array.isArray(stockData.expirationDates)
        ) {
          expirationDates = stockData.expirationDates;
        }

        batch.set(newStockRef, {
          branchId: stockData.branchId,
          productId: stockData.productId,
          varietyId: stockData.varietyId,
          quantity: newQuantity,
          expirationDates: expirationDates,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        stockDoc = { id: newStockRef.id };
      }

      // Prepare log IDs in parallel
      const [logId, activityLogId] = await Promise.all([
        _generateLogId(stockDoc.id ? stockDoc.id : inventoryId),
        _generateActivityLogId(user.uid),
      ]);

      // const logId = _generateLogId(stockDoc.id ? stockDoc.id : inventoryId);
      // Create inventory log
      const logRef = db.collection(this.inventoryLogsCollection).doc(logId);

      batch.set(logRef, {
        type: "add_stock",
        branchId: stockData.branchId,
        productId: stockData.productId,
        varietyId: stockData.varietyId,
        quantity: parseInt(stockData.quantity, 10),
        oldQuantity: oldQuantity,
        newQuantity: newQuantity,
        expirationDate: stockData.expirationDate || null,
        expirationDates: stockData.expirationDates || null,
        performedBy: user.uid,
        reason: stockData.reason || "Stock addition",
        timestamp: Timestamp.now(),
      });

      // Commit the batch
      await batch.commit();

      await this.logService.logAdminActivity(
        {
          activityType: "INVENTORY_ADD",
          user: user,
          action: "ADD_STOCK",
          targetResource: "branch_stocks",
          resourceId: stockDoc.id,
          details: `Added ${stockData.quantity} units to branch ${stockData.branchId}`,
        },
        [logId],
        activityLogId
      );

      // // Log the activity
      // await this.logService.logActivity({
      //   activityType: "INVENTORY_ADD",
      //   user: user,
      //   action: "ADD_STOCK",
      //   targetResource: "branch_stocks",
      //   resourceId: stockDoc.id,
      //   details: `Added ${stockData.quantity} units to branch ${stockData.branchId}`,
      //   changes: {
      //     oldQuantity,
      //     newQuantity,
      //     expirationDate: stockData.expirationDate || null,
      //     expirationDates: stockData.expirationDates || null,
      //   },
      // });

      return {
        success: true,
        stockId: stockDoc.id,
        oldQuantity,
        newQuantity,
      };
    } catch (error) {
      console.error("Error adding stock:", error);

      // Log the error
      await this.logService.logError({
        errorType: "INVENTORY_ERROR",
        user: user,
        action: "ADD_STOCK",
        targetResource: "branch_stocks",
        message: error.message,
        stack: error.stack,
      });

      const err = new Error(error);
      err.isLogged = true;
      throw err;
    }
  }

  //#region Deduct Stock

  /**
   * Deduct stock from a branch
   * @param {Object} stockData - Stock data to deduct
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Result of the operation
   */

  //#endregion
  async deductStock(stockData, user) {
    const batch = db.batch();

    try {
      // Process expiration date
      if (stockData.expirationDate) {
        stockData.expirationDate = this._processExpirationDate(
          stockData.expirationDate
        );
      }

      // Get the branch stock document
      const stockRef = db
        .collection(this.branchStocksCollection)
        .where("branchId", "==", stockData.branchId)
        .where("productId", "==", stockData.productId)
        .where("varietyId", "==", stockData.varietyId)
        .limit(1);

      const stockSnapshot = await stockRef.get();

      if (stockSnapshot.empty) {
        throw new Error("Stock not found");
      }

      const stockDoc = stockSnapshot.docs[0];
      const existingStockData = stockDoc.data();
      const oldQuantity = existingStockData.quantity || 0;
      const deductQuantity = parseInt(stockData.quantity, 10);

      if (deductQuantity > oldQuantity) {
        throw new Error("Insufficient stock");
      }

      const newQuantity = oldQuantity - deductQuantity;

      // Update expirationDates
      let expirationDates = existingStockData.expirationDates || [];

      if (stockData.expirationDate) {
        // Deduct from specific expiration date
        const dateIndex = expirationDates.findIndex(
          (exp) => exp.date === stockData.expirationDate
        );

        if (dateIndex >= 0) {
          if (expirationDates[dateIndex].qty >= deductQuantity) {
            expirationDates[dateIndex].qty -= deductQuantity;

            // Remove date if quantity is 0
            if (expirationDates[dateIndex].qty === 0) {
              expirationDates.splice(dateIndex, 1);
            }
          } else {
            throw new Error("Insufficient stock for this expiration date");
          }
        } else {
          throw new Error("Expiration date not found");
        }
      } else {
        // Use FIFO (First In, First Out)
        let remainingToDeduct = deductQuantity;

        while (remainingToDeduct > 0 && expirationDates.length > 0) {
          // Sort by date (earliest first)
          expirationDates.sort((a, b) => a.date - b.date);

          const firstDate = expirationDates[0];

          if (firstDate.qty <= remainingToDeduct) {
            // Deduct entire quantity from this date
            remainingToDeduct -= firstDate.qty;
            expirationDates.shift(); // Remove first date
          } else {
            // Deduct partial quantity
            firstDate.qty -= remainingToDeduct;
            remainingToDeduct = 0;
          }
        }

        if (remainingToDeduct > 0) {
          throw new Error("Insufficient stock to deduct");
        }
      }

      // Update the stock document
      if (newQuantity === 0) {
        // Delete the document if quantity is 0
        batch.delete(
          db.collection(this.branchStocksCollection).doc(stockDoc.id)
        );
      } else {
        batch.update(
          db.collection(this.branchStocksCollection).doc(stockDoc.id),
          {
            quantity: newQuantity,
            expirationDates: expirationDates,
            updatedAt: Timestamp.now(),
          }
        );
      }

      // Prepare log IDs in parallel
      const [logId, activityLogId] = await Promise.all([
        _generateLogId(stockDoc.id),
        _generateActivityLogId(user.uid),
      ]);

      // const logId = _generateLogId(stockDoc.id);

      // Create inventory log
      const logRef = db.collection(this.inventoryLogsCollection).doc(logId);

      batch.set(logRef, {
        type: "deduct_stock",
        branchId: stockData.branchId,
        productId: stockData.productId,
        varietyId: stockData.varietyId,
        quantity: deductQuantity,
        oldQuantity: oldQuantity,
        newQuantity: newQuantity,
        expirationDates: stockData.expirationDates || null,
        performedBy: user.uid,
        reason: stockData.reason || "Stock deduction",
        timestamp: Timestamp.now(),
      });

      // Commit the batch
      await batch.commit();

      await this.logService.logAdminActivity(
        {
          activityType: "INVENTORY_DEDUCT",
          user: user,
          action: "DEDUCT_STOCK",
          targetResource: "branch_stocks",
          resourceId: stockDoc.id,
          details: `Deducted ${deductQuantity} units from branch ${stockData.branchId}`,
        },
        [logId],
        activityLogId
      );

      // // Log the activity
      // await this.logService.logActivity({
      //   activityType: "INVENTORY_DEDUCT",
      //   user: user,
      //   action: "DEDUCT_STOCK",
      //   targetResource: "branch_stocks",
      //   resourceId: stockDoc.id,
      //   details: `Deducted ${deductQuantity} units from branch ${stockData.branchId}`,
      //   changes: {
      //     oldQuantity,
      //     newQuantity,
      //     expirationDates: stockData.expirationDates || null,
      //   },
      // });

      return {
        success: true,
        stockId: stockDoc.id,
        oldQuantity,
        newQuantity,
      };
    } catch (error) {
      console.error("Error deducting stock:", error);

      // Log the error
      await this.logService.logError({
        errorType: "INVENTORY_ERROR",
        user: user,
        action: "DEDUCT_STOCK",
        targetResource: "branch_stocks",
        message: error.message,
        stack: error.stack,
      });

      const err = new Error(error);
      err.isLogged = true;
      throw err;
    }
  }

  //#region Reject Stock
  /**
   * Reject stock from a branch
   * @param {Object} stockData - Stock data to reject
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Result of the operation
   */
  async rejectStock(stockData, user) {
    const batch = db.batch();

    try {
      // Process expiration date
      if (stockData.expirationDates) {
        stockData.expirationDates = this._processExpirationDates(
          stockData.expirationDates
        );
      }

      console.log("Rejecting stock:", stockData);

      // Get the branch stock document
      const stockRef = db
        .collection(this.branchStocksCollection)
        .where("branchId", "==", stockData.branchId)
        .where("productId", "==", stockData.productId)
        .where("varietyId", "==", stockData.varietyId)
        .limit(1);

      const stockSnapshot = await stockRef.get();

      if (stockSnapshot.empty) {
        throw new Error("Stock not found");
      }

      const stockDoc = stockSnapshot.docs[0];
      const existingStockData = stockDoc.data();
      const oldQuantity = existingStockData.quantity || 0;
      const rejectQuantity = parseInt(stockData.quantity, 10);

      if (rejectQuantity > oldQuantity) {
        throw new Error("Insufficient stock");
      }

      const newQuantity = oldQuantity - rejectQuantity;

      // Update expirationDates
      let expirationDates = existingStockData.expirationDates || [];

      console.log("Expiration dates before rejection:", expirationDates);

      console.log(
        "Expiration dates from rejection :",
        stockData.expirationDates
      );

      if (Array.isArray(stockData.expirationDates)) {
        for (const rejected of stockData.expirationDates) {
          const dateIndex = expirationDates.findIndex(
            (exp) => exp.date === rejected.date
          );

          if (dateIndex >= 0) {
            const currentQty = expirationDates[dateIndex].qty;

            if (currentQty >= rejected.qty) {
              expirationDates[dateIndex].qty -= rejected.qty;

              // Remove entry if qty becomes zero
              if (expirationDates[dateIndex].qty === 0) {
                expirationDates.splice(dateIndex, 1);
              }
            } else {
              throw new Error(
                `Insufficient stock for date ${rejected.date}: trying to reject ${rejected.qty}, only ${currentQty} available`
              );
            }
          } else {
            throw new Error(
              `Expiration date ${rejected.date} not found in existing stock`
            );
          }
        }
      }

      // Update the stock document
      if (newQuantity === 0) {
        // Delete the document if quantity is 0
        batch.delete(
          db.collection(this.branchStocksCollection).doc(stockDoc.id)
        );
      } else {
        batch.update(
          db.collection(this.branchStocksCollection).doc(stockDoc.id),
          {
            quantity: newQuantity,
            expirationDates: expirationDates,
            updatedAt: Timestamp.now(),
          }
        );
      }

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(stockDoc.id),
        _generateActivityLogId(user.uid),
      ]);

      // const logId = _generateLogId(stockDoc.id);

      // Create inventory log
      const logRef = db.collection(this.inventoryLogsCollection).doc(logId);

      batch.set(logRef, {
        type: "reject_stock",
        branchId: stockData.branchId,
        productId: stockData.productId,
        varietyId: stockData.varietyId,
        quantity: rejectQuantity,
        oldQuantity: oldQuantity,
        newQuantity: newQuantity,
        expirationDates: stockData.expirationDates || null,
        performedBy: user.uid,
        reason: stockData.reason || "Stock rejection",
        rejectReason: stockData.rejectReason || "other",
        timestamp: Timestamp.now(),
      });

      // Commit the batch
      await batch.commit();

      await this.logService.logAdminActivity(
        {
          activityType: "INVENTORY_REJECT",
          user: user,
          action: "REJECT_STOCK",
          targetResource: "branch_stocks",
          resourceId: stockDoc.id,
          details: `Rejected ${rejectQuantity} units from branch ${stockData.branchId}`,
        },
        [logId],
        activityLogId
      );

      // // Log the activity
      // await this.logService.logActivity({
      //   activityType: "",
      //   user: user,
      //   action: "REJECT_STOCK",
      //   targetResource: "branch_stocks",
      //   resourceId: stockDoc.id,
      //   details: `Rejected ${rejectQuantity} units from branch ${stockData.branchId}`,
      //   changes: {
      //     oldQuantity,
      //     newQuantity,
      //     expirationDates: stockData.expirationDates,
      //     reason: stockData.reason,
      //     rejectReason: stockData.rejectReason,
      //   },
      // });

      return {
        success: true,
        stockId: stockDoc.id,
        oldQuantity,
        newQuantity,
      };
    } catch (error) {
      console.error("Error rejecting stock:", error);

      // Log the error
      await this.logService.logError({
        errorType: "INVENTORY_ERROR",
        user: user,
        action: "REJECT_STOCK",
        targetResource: "branch_stocks",
        message: error.message,
        stack: error.stack,
      });

      const err = new Error(error);
      err.isLogged = true;
      throw err;
    }
  }

  //#endregion

  //#region Transfer Stock
  /**
   * Transfer stock between branches
   * @param {Object} transferData - Transfer data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Result of the operation
   */
  async transferStock(transferData, user) {
    const batch = db.batch();

    try {
      // Process expiration date
      if (transferData.expirationDates) {
        transferData.expirationDates = this._processExpirationDates(
          transferData.expirationDates
        );
      }

      console.log("transferring stock:", transferData);
      //
      // Get the source branch stock document
      const sourceStockRef = db
        .collection(this.branchStocksCollection)
        .where("branchId", "==", transferData.sourceBranchId)
        .where("productId", "==", transferData.productId)
        .where("varietyId", "==", transferData.varietyId)
        .limit(1);

      const sourceStockSnapshot = await sourceStockRef.get();

      if (sourceStockSnapshot.empty) {
        throw new Error("Source stock not found");
      }

      const sourceStockDoc = sourceStockSnapshot.docs[0];
      const sourceStockData = sourceStockDoc.data();
      const sourceOldQuantity = sourceStockData.quantity || 0;
      const transferQuantity = parseInt(transferData.quantity, 10);

      console.log("sourceOldQuantity:", sourceStockData);

      if (transferQuantity > sourceOldQuantity) {
        throw new Error("Insufficient stock in source branch");
      }

      const sourceNewQuantity = sourceOldQuantity - transferQuantity;

      // Update source expirationDates
      let sourceExpirationDates = sourceStockData.expirationDates || [];
      let transferredExpirationDates = [];

      if (Array.isArray(transferData.expirationDates)) {
        for (const transfer of transferData.expirationDates) {
          const dateIndex = sourceExpirationDates.findIndex(
            (exp) => exp.date === transfer.date
          );

          if (dateIndex >= 0) {
            const currentQty = sourceExpirationDates[dateIndex].qty;

            if (currentQty >= transfer.qty) {
              // Add to transferred dates
              transferredExpirationDates.push({
                date: sourceExpirationDates[dateIndex].date,
                qty: transferQuantity,
              });
              sourceExpirationDates[dateIndex].qty -= transfer.qty;

              // Remove entry if qty becomes zero
              if (sourceExpirationDates[dateIndex].qty === 0) {
                sourceExpirationDates.splice(dateIndex, 1);
              }
            } else {
              throw new Error(
                `Insufficient stock for date ${transfer.date}: trying to transfer ${transfer.qty}, only ${currentQty} available`
              );
            }
          } else {
            throw new Error(
              `Expiration date ${transfer.date} not found in existing stock`
            );
          }
        }
      } else {
        throw new Error("No expirationDates provided.");
      }

      // Update the source stock document
      if (sourceNewQuantity === 0) {
        // Delete the document if quantity is 0
        batch.delete(
          db.collection(this.branchStocksCollection).doc(sourceStockDoc.id)
        );
      } else {
        batch.update(
          db.collection(this.branchStocksCollection).doc(sourceStockDoc.id),
          {
            quantity: sourceNewQuantity,
            expirationDates: sourceExpirationDates,
            updatedAt: Timestamp.now(),
          }
        );
      }

      // Get or create destination branch stock document
      const destStockRef = db
        .collection(this.branchStocksCollection)
        .where("branchId", "==", transferData.destBranchId)
        .where("productId", "==", transferData.productId)
        .where("varietyId", "==", transferData.varietyId)
        .limit(1);

      const destStockSnapshot = await destStockRef.get();

      let destStockDoc;
      let destOldQuantity = 0;
      let destNewQuantity = transferQuantity;
      let destExpirationDates = [];

      if (!destStockSnapshot.empty) {
        // Update existing destination stock
        destStockDoc = destStockSnapshot.docs[0];
        const destStockData = destStockDoc.data();
        destOldQuantity = destStockData.quantity || 0;
        destNewQuantity = destOldQuantity + transferQuantity;
        destExpirationDates = destStockData.expirationDates || [];

        // Merge expiration dates
        destExpirationDates = this._mergeExpirationDates(
          destExpirationDates,
          transferredExpirationDates
        );

        batch.update(
          db.collection(this.branchStocksCollection).doc(destStockDoc.id),
          {
            quantity: destNewQuantity,
            expirationDates: destExpirationDates,
            updatedAt: Timestamp.now(),
          }
        );
      } else {
        // Create new destination stock
        const newDestStockRef = db
          .collection(this.branchStocksCollection)
          .doc();
        destStockDoc = { id: newDestStockRef.id };
        destExpirationDates = transferredExpirationDates;

        batch.set(newDestStockRef, {
          branchId: transferData.destBranchId,
          productId: transferData.productId,
          varietyId: transferData.varietyId,
          quantity: destNewQuantity,
          expirationDates: destExpirationDates,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(stockDoc.id),
        _generateActivityLogId(user.uid),
      ]);
      // const logId = _generateLogId(sourceStockDoc.id);

      // Create inventory log
      const logRef = db.collection(this.inventoryLogsCollection).doc(logId);

      batch.set(logRef, {
        type: "transfer_stock",
        sourceBranchId: transferData.sourceBranchId,
        destBranchId: transferData.destBranchId,
        productId: transferData.productId,
        varietyId: transferData.varietyId,
        quantity: transferQuantity,
        sourceOldQuantity: sourceOldQuantity,
        sourceNewQuantity: sourceNewQuantity,
        destOldQuantity: destOldQuantity,
        destNewQuantity: destNewQuantity,
        expirationDates: transferData.expirationDates || null,
        transferredExpirationDates: transferredExpirationDates,
        performedBy: user.uid,
        reason: transferData.reason || "Stock transfer",
        timestamp: Timestamp.now(),
      });

      // Commit the batch
      await batch.commit();

      await this.logService.logAdminActivity(
        {
          activityType: "INVENTORY_TRANSFER",
          user: user,
          action: "TRANSFER_STOCK",
          targetResource: "branch_stocks",
          resourceId: sourceStockDoc.id,
          details: `Transferred ${transferQuantity} units from branch ${transferData.sourceBranchId} to branch ${transferData.destBranchId}`,
        },
        [logId],
        activityLogId
      );

      // // Log the activity
      // await this.logService.logActivity({
      //   activityType: "INVENTORY_TRANSFER",
      //   user: user,
      //   action: "TRANSFER_STOCK",
      //   targetResource: "branch_stocks",
      //   resourceId: sourceStockDoc.id,
      //   details: `Transferred ${transferQuantity} units from branch ${transferData.sourceBranchId} to branch ${transferData.destBranchId}`,
      //   changes: {
      //     sourceOldQuantity,
      //     sourceNewQuantity,
      //     destOldQuantity,
      //     destNewQuantity,
      //     expirationDates: transferData.expirationDates,
      //     transferredExpirationDates,
      //   },
      // });

      return {
        success: true,
        sourceStockId: sourceStockDoc.id,
        destStockId: destStockDoc.id,
        sourceOldQuantity,
        sourceNewQuantity,
        destOldQuantity,
        destNewQuantity,
      };
    } catch (error) {
      console.error("Error transferring stock:", error);

      // Log the error
      await this.logService.logError({
        errorType: "INVENTORY_ERROR",
        user: user,
        action: "TRANSFER_STOCK",
        targetResource: "branch_stocks",
        message: error.message,
        stack: error.stack,
      });

      const err = new Error(error);
      err.isLogged = true;
      throw err;
    }
  }

  //#endregion

  //#region Adjust Stock
  /**
   * Adjust stock count
   * @param {Object} adjustData - Adjustment data
   * @param {Object} user - User performing the action
   * @returns {Promise<Object>} Result of the operation
   */
  async adjustStock(adjustData, user) {
    const batch = db.batch();

    try {
      // Process expiration dates
      if (
        adjustData.expirationDates &&
        Array.isArray(adjustData.expirationDates)
      ) {
        adjustData.expirationDates = this._processExpirationDates(
          adjustData.expirationDates
        );
      }

      // Get the branch stock document
      const stockRef = db
        .collection(this.branchStocksCollection)
        .where("branchId", "==", adjustData.branchId)
        .where("productId", "==", adjustData.productId)
        .where("varietyId", "==", adjustData.varietyId)
        .limit(1);

      const stockSnapshot = await stockRef.get();

      if (stockSnapshot.empty) {
        const error = new Error("Stock not found");
        error.displayToUi = true;
        throw error;
      }

      const stockDoc = stockSnapshot.docs[0];
      const stockData = stockDoc.data();
      const oldQuantity = stockData.quantity || 0;
      const newQuantity = parseInt(adjustData.newQuantity, 10);

      // Determine adjustment type
      const adjustmentType = adjustData.adjustmentType || "count_adjustment";

      // Handle different adjustment scenarios
      if (newQuantity === oldQuantity) {
        // No change in quantity, just update expiration dates if provided
        if (
          adjustData.expirationDates &&
          adjustData.expirationDates.length > 0
        ) {
          const totalReductionQty = adjustData.expirationDates.reduce(
            (sum, exp) => sum + exp.qty,
            0
          );
          if (totalReductionQty !== newQuantity) {
            const error = new Error(
              `Sum of expiration date quantities (${totalReductionQty}) must match the quantity (${newQuantity})`
            );

            error.displayToUi = true;
            throw error;
          }

          batch.update(
            db.collection(this.branchStocksCollection).doc(stockDoc.id),
            {
              expirationDates: adjustData.expirationDates,
              updatedAt: Timestamp.now(),
            }
          );
        } else {
          // No changes to make
          return {
            success: true,
            stockId: stockDoc.id,
            oldQuantity,
            newQuantity,
            message: "No changes were made",
          };
        }
      } else if (newQuantity > oldQuantity) {
        // Increasing stock quantity
        if (
          !adjustData.expirationDates ||
          adjustData.expirationDates.length === 0
        ) {
          const error = new Error(
            "Expiration dates are required when increasing stock quantity"
          );
          error.displayToUi = true;
          throw error;
        }

        // Validate that sum of expiration date quantities matches the increase
        let totalExpQty = adjustData.expirationDates.reduce(
          (sum, exp) => sum + exp.qty,
          0
        );
        totalExpQty -= oldQuantity;
        const increaseAmount = newQuantity - oldQuantity;

        if (totalExpQty !== increaseAmount) {
          const error = new Error(
            `Sum of expiration date quantities (${totalExpQty}) must match the increase amount (${increaseAmount})`
          );
          error.displayToUi = true;
          throw error;
        }

        // // Merge with existing expiration dates
        // const mergedExpirationDates = this._mergeExpirationDates(
        //     stockData.expirationDates || [],
        //     adjustData.expirationDates
        // );

        batch.update(
          db.collection(this.branchStocksCollection).doc(stockDoc.id),
          {
            quantity: newQuantity,
            expirationDates: adjustData.expirationDates,
            updatedAt: Timestamp.now(),
          }
        );
      } else {
        // Decreasing stock quantity
        const decreaseAmount = oldQuantity - newQuantity;

        // Update expiration dates using FIFO if no specific dates provided
        let updatedExpirationDates = [...(stockData.expirationDates || [])];

        if (
          adjustData.expirationDates &&
          adjustData.expirationDates.length > 0
        ) {
          const totalReductionQty = adjustData.expirationDates.reduce(
            (sum, exp) => sum + exp.qty,
            0
          );
          if (totalReductionQty !== decreaseAmount) {
            const error = new Error(
              `Sum of expiration date quantities (${totalReductionQty}) must match the decrease amount (${decreaseAmount})`
            );
            error.displayToUi = true;
            throw error;
          }

          // Specific dates provided for reduction
          for (const dateToReduce of adjustData.expirationDates) {
            const existingIndex = updatedExpirationDates.findIndex(
              (exp) => exp.date === dateToReduce.date
            );

            if (existingIndex === -1) {
              const error = new Error(
                `Expiration date not found: ${new Date(
                  dateToReduce.date * 1000
                ).toLocaleDateString()}`
              );
              error.displayToUi = true;
              throw error;
            }

            if (updatedExpirationDates[existingIndex].qty < dateToReduce.qty) {
              const error = new Error(
                `Insufficient quantity for expiration date: ${new Date(
                  dateToReduce.date * 1000
                ).toLocaleDateString()}`
              );
              error.displayToUi = true;
              throw error;
            }

            updatedExpirationDates[existingIndex].qty -= dateToReduce.qty;

            // Remove if quantity is 0
            if (updatedExpirationDates[existingIndex].qty === 0) {
              updatedExpirationDates.splice(existingIndex, 1);
            }
          }
        } else {
          // Use FIFO to reduce quantities
          let remainingToDecrease = decreaseAmount;

          // Sort by date (earliest first)
          updatedExpirationDates.sort((a, b) => a.date - b.date);

          while (remainingToDecrease > 0 && updatedExpirationDates.length > 0) {
            if (updatedExpirationDates[0].qty <= remainingToDecrease) {
              // Remove entire quantity from this date
              remainingToDecrease -= updatedExpirationDates[0].qty;
              updatedExpirationDates.shift();
            } else {
              // Remove partial quantity
              updatedExpirationDates[0].qty -= remainingToDecrease;
              remainingToDecrease = 0;
            }
          }
        }

        if (newQuantity === 0) {
          // Delete the document if quantity is 0
          batch.delete(
            db.collection(this.branchStocksCollection).doc(stockDoc.id)
          );
        } else {
          batch.update(
            db.collection(this.branchStocksCollection).doc(stockDoc.id),
            {
              quantity: newQuantity,
              expirationDates: updatedExpirationDates,
              updatedAt: Timestamp.now(),
            }
          );
        }
      }

      const [logId, activityLogId] = await Promise.all([
        _generateLogId(stockDoc.id),
        _generateActivityLogId(user.uid),
      ]);
      // const logId = _generateLogId(stockDoc.id);

      // Create inventory log
      const logRef = db.collection(this.inventoryLogsCollection).doc(logId);

      batch.set(logRef, {
        type: "adjust_stock",
        adjustmentType: adjustmentType,
        branchId: adjustData.branchId,
        productId: adjustData.productId,
        varietyId: adjustData.varietyId,
        oldQuantity: oldQuantity,
        newQuantity: newQuantity,
        expirationDates: adjustData.expirationDates || null,
        performedBy: user.uid,
        reason: adjustData.reason || "Stock adjustment",
        timestamp: Timestamp.now(),
      });

      // Commit the batch
      await batch.commit();

      await this.logService.logAdminActivity(
        {
          activityType: "INVENTORY_ADJUST",
          user: user,
          action: "ADJUST_STOCK",
          targetResource: "branch_stocks",
          resourceId: stockDoc.id,
          details: `Adjusted stock from ${oldQuantity} to ${newQuantity} units in branch ${adjustData.branchId}`,
        },
        [logId],
        activityLogId
      );

      // // Log the activity
      // await this.logService.logActivity({
      //   activityType: "INVENTORY_ADJUST",
      //   user: user,
      //   action: "ADJUST_STOCK",
      //   targetResource: "branch_stocks",
      //   resourceId: stockDoc.id,
      //   details: `Adjusted stock from ${oldQuantity} to ${newQuantity} units in branch ${adjustData.branchId}`,
      //   changes: {
      //     oldQuantity,
      //     newQuantity,
      //     adjustmentType,
      //     expirationDates: adjustData.expirationDates,
      //   },
      // });

      return {
        success: true,
        stockId: stockDoc.id,
        oldQuantity,
        newQuantity,
      };
    } catch (error) {
      console.error("Error adjusting stock:", error);

      await this.logService.logError({
        errorType: "INVENTORY_ERROR",
        user: user,
        action: "ADJUST_STOCK",
        targetResource: "branch_stocks",
        message: error.message,
        stack: error.stack,
      });

      const err = new Error(error);
      err.isLogged = true;
      throw err;
    }
  }
  //#endregion

  //#region Get Inventory Logs
  /**
   * Get inventory logs for a branch with proper pagination
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Inventory logs with pagination info
   */
  async getInventoryLogs({
    branchId,
    type,
    startDate,
    endDate,
    limit = 50,
    lastVisible = null,
  }) {
    try {
      // Start building the query
      let queryRef = db.collection("inventory_logs");

      // Add branch filter
      if (branchId) {
        queryRef = queryRef.where("branchId", "==", branchId);
      }

      // Add type filter
      if (type) {
        queryRef = queryRef.where("type", "==", type);
      }

      // Add date filters
      if (startDate) {
        queryRef = queryRef.where(
          "timestamp",
          ">=",
          Timestamp.fromDate(new Date(startDate))
        );
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); // include full day
        queryRef = queryRef.where("timestamp", "<", Timestamp.fromDate(end));
      }

      // IMPORTANT: Add orderBy before pagination
      queryRef = queryRef.orderBy("timestamp", "desc");

      // Handle pagination
      if (lastVisible) {
        const lastDocRef = await db
          .collection("inventory_logs")
          .doc(lastVisible)
          .get();
        if (lastDocRef.exists) {
          queryRef = queryRef.startAfter(lastDocRef);
        }
      }

      // Apply limit
      queryRef = queryRef.limit(limit);

      const snapshot = await queryRef.get();

      // Process the results
      const logs = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Fetch user details if performedBy exists
        let createdBy = null;
        if (data.performedBy) {
          try {
            const userDoc = await db
              .collection("users")
              .doc(data.performedBy)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              createdBy = {
                uid: data.performedBy,
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email || "",
              };
            }
          } catch (userError) {
            console.warn(
              `Could not fetch user details for ${data.performedBy}:`,
              userError
            );
          }
        }

        logs.push({
          id: doc.id,
          ...data,
          createdBy,
          timestamp: data.timestamp?.toDate() || null,
          formattedTimestamp: data.timestamp?.toDate().toLocaleString() || "",
        });
      }

      const hasMore = snapshot.docs.length === limit;
      const newLastVisible =
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1].id
          : null;

      return {
        logs,
        lastVisible: newLastVisible,
        hasMore,
        totalCount: logs.length,
      };
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
      const err = new Error(`Failed to fetch inventory logs: ${error.message}`);
      err.isLogged = true;
      throw err;
    }
  }

  //#endregion
}

module.exports = { InventoryService };
