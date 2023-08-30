const express = require('express');
const UserModel = require('../dao/models/UserModel');
const bcrypt = require('bcrypt');
const passport = require('passport');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register'); // Renderizar la vista de registro
});

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userData = {
        first_name,
        last_name,
        email,
        age,
        password: hashedPassword,
        role: 'usuario',
        admin: false
    };
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        userData.admin = true;
        userData.role = 'administrador';
    }
    try {
        const newUser = await UserModel.collection.insertOne(userData);
        res.redirect('/login'); // Redirigir al perfil del usuario
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        res.status(400).json({ error: 'Error al registrar el usuario' });
    }
});

router.get('/login', (req, res) => {
    res.render('login'); // Renderizar la vista de inicio de sesión
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ error: 'Credenciales incorrectas' });
            return;
        }

        if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            user.admin = true;
            user.role = 'administrador';
            await user.save();
        }

        req.session.user = user; // Iniciar sesión para el usuario
        res.redirect('/products'); // Redirigir al perfil del usuario
    } catch (error) {
        res.status(400).json({ error: 'Error al iniciar sesión' });
    }
});

router.get('/profile', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login'); // Redirigir al inicio de sesión si no está autenticado
        return;
    }
    const user = req.session.user;
    res.render('profile', { user }); // Renderizar la vista de perfil con los datos del usuario
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login'); // Redirigir al inicio de sesión después de cerrar sesión
});

router.get('/api/sessions/github', passport.authenticate('github', {scope:['user:email']}), async(req,res)=>{});

router.get('/api/sessions/githubcallback', passport.authenticate('github', {failureRedirect: '/login'}), async(req,res)=>{
    req.session.user = req.user;
    res.redirect('/products')
});

module.exports = router;