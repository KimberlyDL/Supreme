const transporter = require('../../config/transporter');  // Import the transporter module

// Function to send a verification email
async function sendVerificationEmail(toEmail, verificationUrl) {
    const mailOptions = {
        from: process.env.GMAIL_USER,  // Sender email (your Gmail)
        to: toEmail,  // Recipient email
        subject: 'Email Verification',
        text: `Click the following link to verify your email: ${verificationUrl}`,
        html: `<p>Click the following link to verify your email: <a href="${verificationUrl}">Verify Email</a></p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);  // Use the imported transporter
        console.log('Verification email sent: ', info.response);
    } catch (error) {
        console.error('Error sending verification email: ', error);
    }
}

module.exports = sendVerificationEmail;