// backend\services\NotificationService.js
const { messaging } = require('../config/firebase');

class NotificationService {
  constructor() {
    if (NotificationService.instance) {
      return NotificationService.instance;
    }

    this.messaging = messaging;

    NotificationService.instance = this;
  }

  async sendNotification(userId, title, body, token) {
    const message = {
      notification: {
        title,
        body,
      },
      token,
    };

    try {
      await this.messaging.send(message);
      console.log(`Notification sent to user ${userId}`);
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }
}

module.exports = new NotificationService();


// const sendNotification = async (messaging, userId, title, body, token) => {
//     const message = {
//         notification: {
//             title,
//             body,
//         },
//         token,
//     };

//     try {
//         await messaging.send(message);
//         console.log(`Notification sent to user ${userId}`);
//     } catch (error) {
//         console.error(`Error sending notification to user ${userId}:`, error);
//     }
// };

// module.exports = sendNotification;



