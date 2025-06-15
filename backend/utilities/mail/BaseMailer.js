// backend\lib\mailer\BaseMailer.js

const transporter = require("../../config/transporter");

class BaseMailer {
  constructor() {
    if (this.constructor === BaseMailer) {
      throw new Error(
        "BaseMailer is an abstract class and cannot be instantiated directly."
      );
    }
  }

  // Method to be overridden by child classes
  async sendMail(toEmail, subject, content) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: toEmail,
      subject: subject,
      ...content, // Allow child classes to pass in 'text' or 'html'
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`${subject} email sent: `, info.response);
      return info;
    } catch (error) {
      console.error(`Error sending ${subject} email: `, error);
      throw error;
    }
  }
}

module.exports = BaseMailer;
