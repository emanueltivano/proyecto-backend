const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const config = require('../config/config');

const createToken = (userId) => {
    return jwt.sign({ id: userId }, config.secretKey, {
        expiresIn: "1h",
    });
};

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.secretKey, (err, decodedToken) => {
            if (err) {
                reject(err);
            } else {
                resolve(decodedToken);
            }
        });
    });
};

const loginUser = async (email, password) => {
    try {
        const user = await UserModel.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return null;
        }

        if (email === config.adminEmail && password === config.adminPassword) {
            user.admin = true;
            user.role = 'administrador';
            await user.save();
        }

        const token = createToken(user._id);

        return { user, token };
    } catch (error) {
        throw new Error("Error al iniciar sesión");
    }
};

const getUserById = async (userId) => {
    try {
        const user = await UserModel.findById(userId);
        return user;
    } catch (error) {
        throw new Error("Error al obtener los datos del usuario");
    }
};

const registerUser = async ({ first_name, last_name, email, age, password }) => {
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
    if (email === config.adminEmail && password === config.adminPassword) {
        userData.admin = true;
        userData.role = 'administrador';
    }
    try {
        const newUser = await UserModel.collection.insertOne(userData);
        return newUser;
    } catch (error) {
        throw new Error("Error al registrar el usuario");
    }
};

module.exports = {
    loginUser,
    getUserById,
    verifyToken,
    registerUser
};