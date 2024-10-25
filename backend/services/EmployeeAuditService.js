const activityLog = require('./activityLog');
const sendNotification = require('./notification');

class EmployeeAuditService {
  constructor(db, messaging) {
    this.db = db;
    this.messaging = messaging;
  }

  async logEmployeeAction(params) {
    params.action = `Employee: ${params.action}`;
    
    await activityLog(this.db, params);

    if (params.notification && params.notification.fcmToken) {
      await sendNotification(this.messaging, params.userId, params.notification.title, params.notification.body, params.notification.fcmToken);
    }
  }
}
let instance = null;
const initNotificationService = (messaging) => {
    if (!instance) {
        instance = new NotificationService(messaging);
    }
    return instance;
};

module.exports = EmployeeAuditService;
