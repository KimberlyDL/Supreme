const activityLog = require('./activityLog');
const sendNotification = require('./notification');

class InventoryAuditService {
  constructor(db, messaging) {
    this.db = db;
    this.messaging = messaging;
  }

  async logInventoryAction(params) {
    params.action = `Inventory: ${params.action}`;
    
    await activityLog(this.db, params);

    if (params.notification && params.notification.fcmToken) {
      await sendNotification(this.messaging, params.userId, params.notification.title, params.notification.body, params.notification.fcmToken);
    }
  }
}

module.exports = InventoryAuditService;
