require('dotenv').config();

module.exports = {
    port: process.env.PORT,
    mongoUrl: process.env.MONGO_URL,
    secretKey: process.env.SECRET_KEY,
    githubId: process.env.GITHUB_ID,
    githubSecret: process.env.GITHUB_SECRET,
    callbackUrl: process.env.CALLBACK_URL,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD
};