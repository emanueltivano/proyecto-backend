const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/SessionController');

router.post('/register', SessionController.register);
router.post("/login", SessionController.login);
router.get("/current", SessionController.getCurrentUser);
router.get('/logout', SessionController.logout);
router.get('/github', SessionController.githubLogin);
router.get('/githubcallback', SessionController.githubCallback, SessionController.githubCallbackSuccess);
router.post('/forgot-password', SessionController.requestPasswordReset);
router.post('/reset-password/', SessionController.resetPassword);

module.exports = router;