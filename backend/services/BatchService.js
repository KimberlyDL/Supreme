
// backend/services/BatchService.js
const { db } = require('../config/firebase');

class BatchService {
  constructor() {
    this.batchesCollection = db.collection('batches');
    this.activityLogsCollection = db.collection('activityLogs');
    this.notificationsCollection = db.collection('notifications');
  }

  async getBatches(branchId) {
    let query = this.batchesCollection;
    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addBatch(batchData, userData) {
    const batchRef = await this.batchesCollection.add({
      ...batchData,
      createdBy: userData.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newBatchData = { id: batchRef.id, ...batchData };
    await this.logBatchAction('CREATE', newBatchData, userData);
    await this.createNotificationForBatchAction('CREATE', newBatchData);

    return newBatchData;
  }

  async updateBatch(batchId, batchData, userData) {
    await this.batchesCollection.doc(batchId).update({
      ...batchData,
      updatedBy: userData.uid,
      updatedAt: new Date(),
    });

    const updatedBatchData = { id: batchId, ...batchData };
    await this.logBatchAction('UPDATE', updatedBatchData, userData);
    await this.createNotificationForBatchAction('UPDATE', updatedBatchData);

    return updatedBatchData;
  }

  async deleteBatch(batchId, userData) {
    const batchData = (await this.batchesCollection.doc(batchId).get()).data();
    await this.batchesCollection.doc(batchId).delete();

    await this.logBatchAction('DELETE', { id: batchId, ...batchData }, userData);
    await this.createNotificationForBatchAction('DELETE', { id: batchId, ...batchData });
  }

  async logBatchAction(actionType, batchData, userData) {
    const logId = `log_${new Date().getTime()}`;
    const logEntry = {
      logId,
      userId: userData.uid,
      userName: `${userData.firstName} ${userData.lastName}`,
      role: userData.role,
      actionType,
      targetType: "batch",
      targetId: batchData.id,
      targetName: `Batch for Product ${batchData.productId}`,
      description: `${actionType} batch for product ${batchData.productId} in branch ${batchData.branchId}`,
      timestamp: new Date(),
      status: "successful",
      metadata: {
        batchData,
      }
    };

    await this.activityLogsCollection.doc(logId).set(logEntry);
  }

  async createNotificationForBatchAction(actionType, batchData) {
    const notificationId = `notif_${new Date().getTime()}`;
    const notification = {
      id: notificationId,
      type: `BATCH_${actionType}`,
      message: `Batch for product ${batchData.productId} in branch ${batchData.branchId} has been ${actionType.toLowerCase()}.`,
      createdAt: new Date(),
      isRead: false,
      recipientRoles: ['owner', 'manager', 'stock_manager'],
      batchId: batchData.id,
      productId: batchData.productId,
      branchId: batchData.branchId
    };

    await this.notificationsCollection.doc(notificationId).set(notification);
  }
}

module.exports = new BatchService();