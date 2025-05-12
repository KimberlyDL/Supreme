
// backend\services\InventoryService.js
const { db, Timestamp, FieldValue } = require('../config/firebase');
const { LogService } = require('./LogService');

class InventoryService {
    constructor() {
        this.branchStocksCollection = 'branch_stocks';
        this.inventoryLogsCollection = 'inventory_logs';
        this.productsCollection = 'products';
        this.logService = new LogService();
    }

    /**
     * Add stock to a branch
     * @param {Object} stockData - Stock data to add
     * @param {Object} user - User performing the action
     * @returns {Promise<Object>} Result of the operation
     */
    async addStock(stockData, user) {

        const batch = db.batch();

        try {

            // console.log('Adding stock:', stockData);

            // return;
            // // Check if user has permission to add stock to this branch
            // if (user.role !== 'owner' && user.branchId !== stockData.branchId) {
            //     throw new Error('You can only add stock to your assigned branch');
            // }

            if (stockData.expirationDate) {
                // ✅ Normalize to midnight UTC and convert to timestamp (milliseconds)
                const normalizedDate = new Date(stockData.expirationDate);
                normalizedDate.setUTCHours(0, 0, 0, 0); // Prevent time-related bugs
                const timestamp = Math.floor(normalizedDate.getTime() / 1000); // Unix time in milliseconds

                stockData.expirationDate = timestamp; // Store as compact & timezone-safe number

                console.log('Normalized expiration date:', stockData.expirationDate);
            }

            // Get the branch stock document
            const stockRef = db.collection(this.branchStocksCollection)
                .where('branchId', '==', stockData.branchId)
                .where('varietyId', '==', stockData.varietyId)
                .limit(1);

            const stockSnapshot = await stockRef.get();

            let stockDoc;
            let oldQuantity = 0;
            let newQuantity = parseInt(stockData.quantity, 10);

            // If stock exists, update it
            if (!stockSnapshot.empty) {
                stockDoc = stockSnapshot.docs[0];
                const stockData = stockDoc.data();
                oldQuantity = stockData.quantity || 0;
                newQuantity += oldQuantity;

                // Update existing expirationDates or add new ones
                let expirationDates = stockData.expirationDates || [];

                if (stockData.expirationDate) {
                    // // Find if this expiration date already exists
                    // const existingDateIndex = expirationDates.findIndex(
                    //     item => item.date === stockData.expirationDate
                    // );

                    // if (existingDateIndex >= 0) {
                    //     // Update existing date quantity
                    //     expirationDates[existingDateIndex].qty += parseInt(stockData.quantity, 10);
                    // } else {
                    //     // Add new expiration date
                    //     expirationDates.push({
                    //         date: stockData.expirationDate,
                    //         qty: parseInt(stockData.quantity, 10)
                    //     });
                    // }

                    // // Sort by date (earliest first)
                    // expirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));



                    // // ✅ Normalize to midnight UTC and convert to timestamp (milliseconds)
                    // const normalizedDate = new Date(stockData.expirationDate);
                    // normalizedDate.setUTCHours(0, 0, 0, 0); // Prevent time-related bugs
                    // const timestamp = normalizedDate.getTime(); // Unix time in milliseconds


                    // Find if this expiration date already exists
                    const existingDateIndex = expirationDates.findIndex(
                        item => item.date === stockData.expirationDate
                    );

                    if (existingDateIndex >= 0) {
                        // Update existing date quantity
                        expirationDates[existingDateIndex].qty += parseInt(stockData.quantity, 10);
                    } else {
                        // Add new expiration date
                        expirationDates.push({
                            date: timestamp, // 🔥 Stored as compact & timezone-safe number
                            qty: parseInt(stockData.quantity, 10)
                        });
                    }

                    // Sort by date (earliest first)
                    expirationDates.sort((a, b) => a.date - b.date);
                }

                // Update the stock document
                batch.update(db.collection(this.branchStocksCollection).doc(stockDoc.id), {
                    quantity: newQuantity,
                    expirationDates: expirationDates,
                    updatedAt: Timestamp.now()
                });

            } else {
                // // Create new stock document
                // const newStockRef = db.collection(this.branchStocksCollection).doc();

                // let expirationDates = [];
                // if (stockData.expirationDate) {
                //     expirationDates.push({
                //         date: stockData.expirationDate,
                //         qty: parseInt(stockData.quantity, 10)
                //     });
                // }

                // batch.set(newStockRef, {
                //     branchId: stockData.branchId,
                //     varietyId: stockData.varietyId,
                //     productId: stockData.productId,
                //     quantity: newQuantity,
                //     expirationDates: expirationDates,
                //     createdAt: Timestamp.now(),
                //     updatedAt: Timestamp.now()
                // });

                // stockDoc = { id: newStockRef.id };



                // Create new stock document
                const newStockRef = db.collection(this.branchStocksCollection).doc();

                let expirationDates = [];
                if (stockData.expirationDate) {

                    // const date = new Date(stockData.expirationDate);
                    // date.setUTCHours(0, 0, 0, 0); // normalize to midnight UTC
                    // const expirationDate = date.getTime(); // get Unix timestamp in milliseconds

                    expirationDates.push({
                        date: stockData.expirationDate,
                        qty: parseInt(stockData.quantity, 10)
                    });
                }

                batch.set(newStockRef, {
                    branchId: stockData.branchId,
                    varietyId: stockData.varietyId,
                    productId: stockData.productId,
                    quantity: newQuantity,
                    expirationDates: expirationDates,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });

                stockDoc = { id: newStockRef.id };
            }

            // Create inventory log
            const logRef = db.collection(this.inventoryLogsCollection).doc();

            // const date = new Date(stockData.expirationDate);
            // date.setUTCHours(0, 0, 0, 0); // normalize to midnight UTC
            // const expirationDate = date.getTime(); // get Unix timestamp in milliseconds

            batch.set(logRef, {
                type: 'add_stock',
                branchId: stockData.branchId,
                productId: stockData.productId,
                varietyId: stockData.varietyId,
                quantity: parseInt(stockData.quantity, 10),
                oldQuantity: oldQuantity,
                newQuantity: newQuantity,
                expirationDate: stockData.expirationDate || null,
                performedBy: user.uid,
                reason: stockData.reason || 'Stock addition',
                timestamp: Timestamp.now()
            });

            // Commit the batch
            await batch.commit();

            // Log the activity
            await this.logService.logActivity({
                activityType: 'INVENTORY_ADD',
                user: user,
                action: 'ADD_STOCK',
                targetResource: 'branch_stocks',
                resourceId: stockDoc.id,
                details: `Added ${stockData.quantity} units to branch ${stockData.branchId}`,
                changes: {
                    oldQuantity,
                    newQuantity,
                    expirationDate: stockData.expirationDate
                }
            });

            return {
                success: true,
                stockId: stockDoc.id,
                oldQuantity,
                newQuantity
            };
        } catch (error) {
            console.error('Error adding stock:', error);

            // Log the error
            await this.logService.logError({
                errorType: 'INVENTORY_ERROR',
                user: user,
                action: 'ADD_STOCK',
                targetResource: 'branch_stocks',
                message: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Deduct stock from a branch (for orders)
     * @param {Object} orderData - Order data
     * @param {Object} user - User performing the action
     * @returns {Promise<Object>} Result of the operation
     */
    async deductStock(orderData, user) {
        const batch = db.batch();

        try {
            // Process each item in the order
            for (const item of orderData.items) {
                // Get the branch stock document
                const stockRef = db.collection(this.branchStocksCollection)
                    .where('branchId', '==', orderData.branchId)
                    .where('varietyId', '==', item.varietyId)
                    .limit(1);

                const stockSnapshot = await stockRef.get();

                if (stockSnapshot.empty) {
                    throw new Error(`No stock found for variety ${item.varietyId} in branch ${orderData.branchId}`);
                }

                const stockDoc = stockSnapshot.docs[0];
                const stockData = stockDoc.data();

                const oldQuantity = stockData.quantity || 0;
                const deductQuantity = parseInt(item.quantity, 10);

                if (oldQuantity < deductQuantity) {
                    throw new Error(`Insufficient stock for variety ${item.varietyId}. Available: ${oldQuantity}, Requested: ${deductQuantity}`);
                }

                const newQuantity = oldQuantity - deductQuantity;

                // Update expirationDates using FIFO
                let expirationDates = stockData.expirationDates || [];
                let remainingToDeduct = deductQuantity;
                const deductedDates = [];

                // Sort by date (earliest first)
                expirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));

                const updatedExpirationDates = expirationDates.map(dateItem => {
                    if (remainingToDeduct <= 0) {
                        return dateItem; // No more to deduct
                    }

                    if (dateItem.qty <= remainingToDeduct) {
                        // Deduct entire batch
                        remainingToDeduct -= dateItem.qty;
                        deductedDates.push({
                            date: dateItem.date,
                            qty: dateItem.qty
                        });
                        return { ...dateItem, qty: 0 }; // Will be filtered out later
                    } else {
                        // Partial deduction
                        const deducted = remainingToDeduct;
                        dateItem.qty -= deducted;
                        remainingToDeduct = 0;
                        deductedDates.push({
                            date: dateItem.date,
                            qty: deducted
                        });
                        return dateItem;
                    }
                }).filter(dateItem => dateItem.qty > 0); // Remove empty batches

                // Update the stock document
                batch.update(db.collection(this.branchStocksCollection).doc(stockDoc.id), {
                    quantity: newQuantity,
                    expirationDates: updatedExpirationDates,
                    updatedAt: Timestamp.now()
                });

                // Create inventory log for each item
                const logRef = db.collection(this.inventoryLogsCollection).doc();
                batch.set(logRef, {
                    type: 'deduct_stock',
                    branchId: orderData.branchId,
                    productId: item.productId,
                    varietyId: item.varietyId,
                    quantity: deductQuantity,
                    oldQuantity: oldQuantity,
                    newQuantity: newQuantity,
                    deductedBatches: deductedDates,
                    performedBy: user.uid,
                    orderId: orderData.orderId || null,
                    reason: 'Order fulfillment',
                    timestamp: Timestamp.now()
                });
            }

            // Commit the batch
            await batch.commit();

            // Log the activity
            await this.logService.logActivity({
                activityType: 'INVENTORY_DEDUCT',
                user: user,
                action: 'DEDUCT_STOCK',
                targetResource: 'orders',
                resourceId: orderData.orderId,
                details: `Deducted stock for order ${orderData.orderId} from branch ${orderData.branchId}`
            });

            return {
                success: true,
                orderId: orderData.orderId
            };
        } catch (error) {
            console.error('Error deducting stock:', error);

            // Log the error
            await this.logService.logError({
                errorType: 'INVENTORY_ERROR',
                user: user,
                action: 'DEDUCT_STOCK',
                targetResource: 'branch_stocks',
                message: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Reject stock (mark as expired, damaged, etc.)
     * @param {Object} rejectData - Rejection data
     * @param {Object} user - User performing the action
     * @returns {Promise<Object>} Result of the operation
     */
    async rejectStock(rejectData, user) {
        const batch = db.batch();

        try {
            // Check if user has permission (manager or stockman)
            if (!['owner', 'manager', 'stock_manager', 'assistant_manager'].includes(user.role)) {
                throw new Error('You do not have permission to reject stock');
            }

            // Get the branch stock document
            const stockRef = db.collection(this.branchStocksCollection)
                .where('branchId', '==', rejectData.branchId)
                .where('varietyId', '==', rejectData.varietyId)
                .limit(1);

            const stockSnapshot = await stockRef.get();

            if (stockSnapshot.empty) {
                throw new Error(`No stock found for variety ${rejectData.varietyId} in branch ${rejectData.branchId}`);
            }

            const stockDoc = stockSnapshot.docs[0];
            const stockData = stockDoc.data();

            const oldQuantity = stockData.quantity || 0;
            const rejectQuantity = parseInt(rejectData.quantity, 10);

            if (oldQuantity < rejectQuantity) {
                throw new Error(`Cannot reject more than available stock. Available: ${oldQuantity}, Requested: ${rejectQuantity}`);
            }

            const newQuantity = oldQuantity - rejectQuantity;

            // Update expirationDates if specific date is provided
            let expirationDates = stockData.expirationDates || [];

            if (rejectData.expirationDate) {
                const dateIndex = expirationDates.findIndex(item => item.date === rejectData.expirationDate);

                if (dateIndex >= 0) {
                    if (expirationDates[dateIndex].qty < rejectQuantity) {
                        throw new Error(`Cannot reject more than available for this expiration date. Available: ${expirationDates[dateIndex].qty}, Requested: ${rejectQuantity}`);
                    }

                    expirationDates[dateIndex].qty -= rejectQuantity;

                    // Remove if quantity becomes zero
                    if (expirationDates[dateIndex].qty <= 0) {
                        expirationDates.splice(dateIndex, 1);
                    }
                } else {
                    throw new Error(`Expiration date ${rejectData.expirationDate} not found in stock`);
                }
            } else {
                // If no specific date, deduct from earliest dates (FIFO)
                let remainingToReject = rejectQuantity;

                // Sort by date (earliest first)
                expirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));

                expirationDates = expirationDates.map(dateItem => {
                    if (remainingToReject <= 0) {
                        return dateItem; // No more to reject
                    }

                    if (dateItem.qty <= remainingToReject) {
                        // Reject entire batch
                        remainingToReject -= dateItem.qty;
                        return { ...dateItem, qty: 0 }; // Will be filtered out later
                    } else {
                        // Partial rejection
                        dateItem.qty -= remainingToReject;
                        remainingToReject = 0;
                        return dateItem;
                    }
                }).filter(dateItem => dateItem.qty > 0); // Remove empty batches
            }

            // Update the stock document
            batch.update(db.collection(this.branchStocksCollection).doc(stockDoc.id), {
                quantity: newQuantity,
                expirationDates: expirationDates,
                updatedAt: Timestamp.now()
            });

            // Create inventory log
            const logRef = db.collection(this.inventoryLogsCollection).doc();
            batch.set(logRef, {
                type: 'reject',
                branchId: rejectData.branchId,
                productId: rejectData.productId,
                varietyId: rejectData.varietyId,
                quantity: rejectQuantity,
                oldQuantity: oldQuantity,
                newQuantity: newQuantity,
                expirationDate: rejectData.expirationDate || null,
                performedBy: user.uid,
                reason: rejectData.reason || 'Stock rejection',
                rejectReason: rejectData.rejectReason || 'Not specified',
                timestamp: Timestamp.now()
            });

            // Commit the batch
            await batch.commit();

            // Log the activity
            await this.logService.logActivity({
                activityType: 'INVENTORY_REJECT',
                user: user,
                action: 'REJECT_STOCK',
                targetResource: 'branch_stocks',
                resourceId: stockDoc.id,
                details: `Rejected ${rejectQuantity} units from branch ${rejectData.branchId} due to ${rejectData.rejectReason}`,
                changes: {
                    oldQuantity,
                    newQuantity,
                    expirationDate: rejectData.expirationDate
                }
            });

            return {
                success: true,
                stockId: stockDoc.id,
                oldQuantity,
                newQuantity
            };
        } catch (error) {
            console.error('Error rejecting stock:', error);

            // Log the error
            await this.logService.logError({
                errorType: 'INVENTORY_ERROR',
                user: user,
                action: 'REJECT_STOCK',
                targetResource: 'branch_stocks',
                message: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Transfer stock between branches
     * @param {Object} transferData - Transfer data
     * @param {Object} user - User performing the action
     * @returns {Promise<Object>} Result of the operation
     */
    async transferStock(transferData, user) {
        const batch = db.batch();

        try {
            // Check if user has permission (owner or higher role)
            if (user.role !== 'owner') {
                throw new Error('Only owners can transfer stock between branches');
            }

            // Get the source branch stock document
            const sourceStockRef = db.collection(this.branchStocksCollection)
                .where('branchId', '==', transferData.sourceBranchId)
                .where('varietyId', '==', transferData.varietyId)
                .limit(1);

            const sourceStockSnapshot = await sourceStockRef.get();

            if (sourceStockSnapshot.empty) {
                throw new Error(`No stock found for variety ${transferData.varietyId} in source branch ${transferData.sourceBranchId}`);
            }

            const sourceStockDoc = sourceStockSnapshot.docs[0];
            const sourceStockData = sourceStockDoc.data();

            const sourceOldQuantity = sourceStockData.quantity || 0;
            const transferQuantity = parseInt(transferData.quantity, 10);

            if (sourceOldQuantity < transferQuantity) {
                throw new Error(`Insufficient stock for transfer. Available: ${sourceOldQuantity}, Requested: ${transferQuantity}`);
            }

            const sourceNewQuantity = sourceOldQuantity - transferQuantity;

            // Update source expirationDates using FIFO
            let sourceExpirationDates = sourceStockData.expirationDates || [];
            let remainingToTransfer = transferQuantity;
            const transferredDates = [];

            // Sort by date (earliest first)
            sourceExpirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));

            const updatedSourceExpirationDates = sourceExpirationDates.map(dateItem => {
                if (remainingToTransfer <= 0) {
                    return dateItem; // No more to transfer
                }

                if (dateItem.qty <= remainingToTransfer) {
                    // Transfer entire batch
                    remainingToTransfer -= dateItem.qty;
                    transferredDates.push({
                        date: dateItem.date,
                        qty: dateItem.qty
                    });
                    return { ...dateItem, qty: 0 }; // Will be filtered out later
                } else {
                    // Partial transfer
                    const transferred = remainingToTransfer;
                    dateItem.qty -= transferred;
                    remainingToTransfer = 0;
                    transferredDates.push({
                        date: dateItem.date,
                        qty: transferred
                    });
                    return dateItem;
                }
            }).filter(dateItem => dateItem.qty > 0); // Remove empty batches

            // Update the source stock document
            batch.update(db.collection(this.branchStocksCollection).doc(sourceStockDoc.id), {
                quantity: sourceNewQuantity,
                expirationDates: updatedSourceExpirationDates,
                updatedAt: Timestamp.now()
            });

            // Get or create destination branch stock document
            const destStockRef = db.collection(this.branchStocksCollection)
                .where('branchId', '==', transferData.destBranchId)
                .where('varietyId', '==', transferData.varietyId)
                .limit(1);

            const destStockSnapshot = await destStockRef.get();

            let destStockDoc;
            let destOldQuantity = 0;
            let destNewQuantity = transferQuantity;

            if (!destStockSnapshot.empty) {
                destStockDoc = destStockSnapshot.docs[0];
                const destStockData = destStockDoc.data();
                destOldQuantity = destStockData.quantity || 0;
                destNewQuantity = destOldQuantity + transferQuantity;

                // Merge expirationDates
                let destExpirationDates = destStockData.expirationDates || [];

                // Add transferred dates to destination
                transferredDates.forEach(transferredDate => {
                    const existingIndex = destExpirationDates.findIndex(item => item.date === transferredDate.date);

                    if (existingIndex >= 0) {
                        destExpirationDates[existingIndex].qty += transferredDate.qty;
                    } else {
                        destExpirationDates.push(transferredDate);
                    }
                });

                // Sort by date
                destExpirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));

                // Update destination stock
                batch.update(db.collection(this.branchStocksCollection).doc(destStockDoc.id), {
                    quantity: destNewQuantity,
                    expirationDates: destExpirationDates,
                    updatedAt: Timestamp.now()
                });
            } else {
                // Create new destination stock
                const newDestStockRef = db.collection(this.branchStocksCollection).doc();

                batch.set(newDestStockRef, {
                    branchId: transferData.destBranchId,
                    varietyId: transferData.varietyId,
                    productId: transferData.productId,
                    quantity: transferQuantity,
                    expirationDates: transferredDates,
                    createdAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });

                destStockDoc = { id: newDestStockRef.id };
            }

            // Create source inventory log (deduction)
            const sourceLogRef = db.collection(this.inventoryLogsCollection).doc();
            batch.set(sourceLogRef, {
                type: 'transfer',
                subType: 'transfer_out',
                branchId: transferData.sourceBranchId,
                productId: transferData.productId,
                varietyId: transferData.varietyId,
                quantity: transferQuantity,
                oldQuantity: sourceOldQuantity,
                newQuantity: sourceNewQuantity,
                transferredBatches: transferredDates,
                destinationBranchId: transferData.destBranchId,
                performedBy: user.uid,
                reason: transferData.reason || 'Stock transfer',
                timestamp: Timestamp.now()
            });

            // Create destination inventory log (addition)
            const destLogRef = db.collection(this.inventoryLogsCollection).doc();
            batch.set(destLogRef, {
                type: 'transfer',
                subType: 'transfer_in',
                branchId: transferData.destBranchId,
                productId: transferData.productId,
                varietyId: transferData.varietyId,
                quantity: transferQuantity,
                oldQuantity: destOldQuantity,
                newQuantity: destNewQuantity,
                transferredBatches: transferredDates,
                sourceBranchId: transferData.sourceBranchId,
                performedBy: user.uid,
                reason: transferData.reason || 'Stock transfer',
                timestamp: Timestamp.now()
            });

            // Commit the batch
            await batch.commit();

            // Log the activity
            await this.logService.logActivity({
                activityType: 'INVENTORY_TRANSFER',
                user: user,
                action: 'TRANSFER_STOCK',
                targetResource: 'branch_stocks',
                resourceId: sourceStockDoc.id,
                details: `Transferred ${transferQuantity} units from branch ${transferData.sourceBranchId} to branch ${transferData.destBranchId}`,
                changes: {
                    sourceBranchId: transferData.sourceBranchId,
                    destBranchId: transferData.destBranchId,
                    quantity: transferQuantity
                }
            });

            return {
                success: true,
                sourceStockId: sourceStockDoc.id,
                destStockId: destStockDoc.id,
                transferQuantity
            };
        } catch (error) {
            console.error('Error transferring stock:', error);

            // Log the error
            await this.logService.logError({
                errorType: 'INVENTORY_ERROR',
                user: user,
                action: 'TRANSFER_STOCK',
                targetResource: 'branch_stocks',
                message: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Adjust stock count (for reconciliation)
     * @param {Object} adjustData - Adjustment data
     * @param {Object} user - User performing the action
     * @returns {Promise<Object>} Result of the operation
     */
    async adjustStock(adjustData, user) {
        const batch = db.batch();

        try {
            // // Check if user has permission (manager or owner)
            // if (!['owner', 'manager'].includes(user.role)) {
            //     throw new Error('Only managers and owners can adjust stock counts');
            // }

            // Get the branch stock document
            const stockRef = db.collection(this.branchStocksCollection)
                .where('branchId', '==', adjustData.branchId)
                .where('varietyId', '==', adjustData.varietyId)
                .limit(1);

            const stockSnapshot = await stockRef.get();

            if (stockSnapshot.empty) {
                throw new Error(`No stock found for variety ${adjustData.varietyId} in branch ${adjustData.branchId}`);
            }

            const stockDoc = stockSnapshot.docs[0];
            const stockData = stockDoc.data();

            const oldQuantity = stockData.quantity || 0;
            const newQuantity = parseInt(adjustData.newQuantity, 10);

            // Calculate difference
            const difference = newQuantity - oldQuantity;

            // Update expirationDates based on adjustment type
            let expirationDates = stockData.expirationDates || [];

            if (adjustData.adjustmentType === 'full_reset') {
                // Full reset - replace all expiration dates with new ones
                expirationDates = adjustData.expirationDates || [];
            } else if (difference !== 0) {
                // Partial adjustment - add or remove from specific expiration date
                if (adjustData.expirationDate) {
                    const dateIndex = expirationDates.findIndex(item => item.date === adjustData.expirationDate);

                    if (dateIndex >= 0) {
                        // Update existing date
                        expirationDates[dateIndex].qty += difference;

                        // Remove if quantity becomes zero or negative
                        if (expirationDates[dateIndex].qty <= 0) {
                            expirationDates.splice(dateIndex, 1);
                        }
                    } else if (difference > 0) {
                        // Add new expiration date if adding stock
                        expirationDates.push({
                            date: adjustData.expirationDate,
                            qty: difference
                        });
                    } else {
                        throw new Error(`Cannot reduce stock for non-existent expiration date ${adjustData.expirationDate}`);
                    }
                } else if (difference < 0) {
                    // Reducing stock without specific date - use FIFO
                    let remainingToReduce = Math.abs(difference);

                    // Sort by date (earliest first)
                    expirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));

                    expirationDates = expirationDates.map(dateItem => {
                        if (remainingToReduce <= 0) {
                            return dateItem; // No more to reduce
                        }

                        if (dateItem.qty <= remainingToReduce) {
                            // Reduce entire batch
                            remainingToReduce -= dateItem.qty;
                            return { ...dateItem, qty: 0 }; // Will be filtered out later
                        } else {
                            // Partial reduction
                            dateItem.qty -= remainingToReduce;
                            remainingToReduce = 0;
                            return dateItem;
                        }
                    }).filter(dateItem => dateItem.qty > 0); // Remove empty batches

                    if (remainingToReduce > 0) {
                        throw new Error(`Cannot reduce more stock than available in expiration dates. Remaining: ${remainingToReduce}`);
                    }
                } else if (difference > 0 && !adjustData.expirationDate) {
                    // Adding stock without expiration date
                    const today = new Date().toISOString().split('T')[0];

                    // Add to today's date or create new entry
                    const todayIndex = expirationDates.findIndex(item => item.date === today);

                    if (todayIndex >= 0) {
                        expirationDates[todayIndex].qty += difference;
                    } else {
                        expirationDates.push({
                            date: today,
                            qty: difference
                        });
                    }
                }
            }

            // Sort by date
            expirationDates.sort((a, b) => new Date(a.date) - new Date(b.date));

            // Update the stock document
            batch.update(db.collection(this.branchStocksCollection).doc(stockDoc.id), {
                quantity: newQuantity,
                expirationDates: expirationDates,
                updatedAt: Timestamp.now()
            });

            // Create inventory log
            const logRef = db.collection(this.inventoryLogsCollection).doc();
            batch.set(logRef, {
                type: 'adjust_stock',
                branchId: adjustData.branchId,
                productId: adjustData.productId,
                varietyId: adjustData.varietyId,
                quantity: Math.abs(difference),
                oldQuantity: oldQuantity,
                newQuantity: newQuantity,
                adjustmentType: adjustData.adjustmentType,
                expirationDate: adjustData.expirationDate || null,
                performedBy: user.uid,
                reason: adjustData.reason || 'Stock count adjustment',
                timestamp: Timestamp.now()
            });

            // Commit the batch
            await batch.commit();

            // Log the activity
            await this.logService.logActivity({
                activityType: 'INVENTORY_ADJUST',
                user: user,
                action: 'ADJUST_STOCK',
                targetResource: 'branch_stocks',
                resourceId: stockDoc.id,
                details: `Adjusted stock from ${oldQuantity} to ${newQuantity} units in branch ${adjustData.branchId}`,
                changes: {
                    oldQuantity,
                    newQuantity,
                    adjustmentType: adjustData.adjustmentType,
                    reason: adjustData.reason
                }
            });

            return {
                success: true,
                stockId: stockDoc.id,
                oldQuantity,
                newQuantity,
                difference
            };
        } catch (error) {
            console.error('Error adjusting stock:', error);

            // Log the error
            await this.logService.logError({
                errorType: 'INVENTORY_ERROR',
                user: user,
                action: 'ADJUST_STOCK',
                targetResource: 'branch_stocks',
                message: error.message,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Get stock for a branch
     * @param {string} branchId - Branch ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of stock items
     */
    async getBranchStock(branchId, options = {}) {
        try {
            let query = db.collection(this.branchStocksCollection)
                .where('branchId', '==', branchId);

            // Apply filters
            if (options.productId) {
                query = query.where('productId', '==', options.productId);
            }

            if (options.varietyId) {
                query = query.where('varietyId', '==', options.varietyId);
            }

            // Add ordering
            query = query.orderBy('updatedAt', options.order || 'desc');

            // Add pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            const snapshot = await query.get();

            // Get product details for each stock item
            const stockItems = await Promise.all(snapshot.docs.map(async doc => {
                const stockData = doc.data();

                // Get product details
                const productDoc = await db.collection(this.productsCollection).doc(stockData.productId).get();
                let productData = null;

                if (productDoc.exists) {
                    productData = productDoc.data();

                    // Find variety details
                    const variety = productData.varieties?.find(v => v.id === stockData.varietyId);

                    return {
                        id: doc.id,
                        ...stockData,
                        product: {
                            id: productDoc.id,
                            name: productData.name,
                            description: productData.description,
                            category: productData.category
                        },
                        variety: variety || null,
                        updatedAt: stockData.updatedAt?.toDate(),
                        createdAt: stockData.createdAt?.toDate()
                    };
                } else {
                    return {
                        id: doc.id,
                        ...stockData,
                        product: {
                            id: stockData.productId,
                            name: 'Unknown Product',
                            description: 'Product not found'
                        },
                        variety: null,
                        updatedAt: stockData.updatedAt?.toDate(),
                        createdAt: stockData.createdAt?.toDate()
                    };
                }
            }));

            return stockItems;
        } catch (error) {
            console.error('Error getting branch stock:', error);
            throw error;
        }
    }

    /**
     * Get inventory logs
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of inventory logs
     */
    async getInventoryLogs(options = {}) {
        try {
            let query = db.collection(this.inventoryLogsCollection);

            // Apply filters
            if (options.branchId) {
                query = query.where('branchId', '==', options.branchId);
            }

            if (options.productId) {
                query = query.where('productId', '==', options.productId);
            }

            if (options.varietyId) {
                query = query.where('varietyId', '==', options.varietyId);
            }

            if (options.type) {
                query = query.where('type', '==', options.type);
            }

            if (options.performedBy) {
                query = query.where('performedBy', '==', options.performedBy);
            }

            // Add date range filter
            if (options.startDate && options.endDate) {
                const startTimestamp = Timestamp.fromDate(new Date(options.startDate));
                const endTimestamp = Timestamp.fromDate(new Date(options.endDate));
                query = query.where('timestamp', '>=', startTimestamp)
                    .where('timestamp', '<=', endTimestamp);
            }

            // Add ordering
            query = query.orderBy('timestamp', options.order || 'desc');

            // Add pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.startAfter) {
                const startAfterDoc = await db.collection(this.inventoryLogsCollection).doc(options.startAfter).get();
                if (startAfterDoc.exists) {
                    query = query.startAfter(startAfterDoc);
                }
            }

            const snapshot = await query.get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate()
            }));
        } catch (error) {
            console.error('Error getting inventory logs:', error);
            throw error;
        }
    }
}

module.exports = { InventoryService };