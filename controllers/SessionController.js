const SessionManager = require('../dao/SessionManager');
const UserModel = require('../models/UserModel');
const passport = require('passport');
const express = require('express');
const session = require('express-session');
const cookieParser = require("cookie-parser");

const register = async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;

  try {
    const newUser = await SessionManager.registerUser({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    res.redirect('/login'); // Redirigir al perfil del usuario
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(400).json({ error: 'Error al registrar el usuario' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await SessionManager.loginUser(email, password);

    if (!result) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const { user, token } = result;

    // Establece el token JWT como una cookie
    res.cookie("jwt", token, { httpOnly: true });

    // Establece la sesión del usuario
    req.session.user = user;

    // Redirige al usuario a /products
    res.redirect('/products');
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const getCurrentUser = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }

  try {
    const decodedToken = await SessionManager.verifyToken(token);

    if (!decodedToken) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const user = await SessionManager.getUserById(decodedToken.id);

    if (!user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    // Devuelve los datos del usuario
    res.json(user);

    console.log(req.session.user)
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los datos del usuario" });
  }
};

const logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
};

const githubLogin = passport.authenticate('github', { scope: ['user:email'] });

const githubCallback = passport.authenticate('github', { failureRedirect: '/login' });

const githubCallbackSuccess = (req, res) => {
  req.session.user = req.user;
  res.redirect('/products');
};

module.exports = {
  login,
  getCurrentUser,
  register,
  logout,
  githubLogin,
  githubCallback,
  githubCallbackSuccess,
};