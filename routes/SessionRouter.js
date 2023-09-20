const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/SessionController');
const cookieParser = require("cookie-parser");

router.use(cookieParser());

router.get('/register', (req, res) => {
    res.render('register'); // Renderizar la vista de registro
});

router.post('/register', SessionController.register);

router.get('/login', (req, res) => {
    res.render('login'); // Renderizar la vista de inicio de sesión
});

router.post("/login", SessionController.login);

router.get("/api/sessions/current", SessionController.getCurrentUser);

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login'); // Redirigir al inicio de sesión si no está autenticado
        return;
    }
    const user = req.session.user;
    res.render('profile', { user }); // Renderizar la vista de perfil con los datos del usuario
});

router.get('/logout', SessionController.logout);

router.get('/api/sessions/github', SessionController.githubLogin);

router.get('/api/sessions/githubcallback', SessionController.githubCallback, SessionController.githubCallbackSuccess);

module.exports = router;