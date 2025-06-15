// backend/lib/mailer/ContactMailer.js

const BaseMailer = require("./BaseMailer");

class ContactMailer extends BaseMailer {
  constructor() {
    super();
  }

  async sendMessage(toEmail, userData) {
    const subject = userData.subject || "New Contact Form Message";

    const content = {
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>New Message from Website Contact Form</h2>
          <p><strong>Name:</strong> ${userData.fullname || "N/A"}</p>
          <p><strong>Email:</strong> ${userData.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${userData.phone || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px;">
            ${userData.message || ""}
          </div>
        </div>
      `,
    };

    return this.sendMail(toEmail, subject, content);
  }
}

module.exports = ContactMailer;
