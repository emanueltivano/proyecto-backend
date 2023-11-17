require('dotenv').config();

module.exports = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    secretKey: process.env.SECRET_KEY,
    githubId: process.env.GITHUB_ID,
    githubSecret: process.env.GITHUB_SECRET,
    callbackUrl: process.env.CALLBACK_URL,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    testUserEmail: process.env.TEST_USER_EMAIL,
    testUserPassword: process.env.TEST_USER_PASSWORD,
    gmailUser: process.env.GMAIL_USER,
    gmailPassword: process.env.GMAIL_PASSWORD,
    twilioSid: process.env.TWILIO_ACCOUNT_SID,
    twilioToken: process.env.TWILIO_AUTH_TOKEN,
    twilioNumber: process.env.TWILIO_PHONE_NUMBER,
    testNumber: process.env.TEST_PHONE_NUMBER
};