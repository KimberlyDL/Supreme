// backend\utilities\mail\verifyEmail.js
const transporter = require('../../config/transporter');

async function sendVerificationEmail(toEmail, otp) {
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: 'Email Verification',
        text: `OTP: ${otp}`,
        // html: `<p>Click the following link to verify your email: <a href="${otp}">Verify Email</a></p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: ', info.response);
    } catch (error) {
        console.error('Error sending verification email: ', error);
    }
}

module.exports = sendVerificationEmail;