const nodemailer = require("nodemailer");

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASSWORD:", process.env.EMAIL_PASSWORD ? "OK" : "MISSING");

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send OTP email
const sendOTPEmail = async (userEmail, userName, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Your OTP for Community Registration",
            html: `
                <h2>Welcome to Community, ${userName}!</h2>
                <p>Your One-Time Password (OTP) for email verification is:</p>
                <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
                <p>This OTP will expire in 15 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">Do not share this OTP with anyone. We will never ask for your OTP via email or phone.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: "OTP sent successfully" };
    } catch (error) {
        console.error("Error sending OTP email:", error);
        return { success: false, message: error.message };
    }
};

// Send verification success email
const sendVerificationSuccessEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Email Verified Successfully - Community",
            html: `
                <h2>Welcome to Community, ${userName}!</h2>
                <p>Your email has been verified successfully.</p>
                <p>You can now log in to your account and start exploring.</p>
                <br>
                <p>Happy exploring!</p>
                <p style="color: #666; font-size: 12px;">If you did not create this account, please contact our support team.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        return { success: true, message: "Verification email sent" };
    } catch (error) {
        console.error("Error sending verification email:", error);
        return { success: false, message: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendVerificationSuccessEmail
};
