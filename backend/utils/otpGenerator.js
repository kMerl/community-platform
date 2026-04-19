// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate expiry time (15 minutes from now)
const getOTPExpiry = () => {
    return new Date(Date.now() + 15 * 60 * 1000);
};

module.exports = {
    generateOTP,
    getOTPExpiry
};
