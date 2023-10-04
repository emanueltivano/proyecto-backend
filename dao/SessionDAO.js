const bcrypt = require("bcrypt");
const UserModel = require("../models/UserModel");
const config = require('../config/config');
const CartDAO = require('../DAO/CartDAO');
const { createToken, transport } = require('../services/utils');

class SessionDAO {
    async registerUser(first_name, last_name, email, age, password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newCart = await CartDAO.createCart();

        const userData = {
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword,
            role: 'usuario',
            admin: false,
            cart: newCart._id
        };
        if (email === config.adminEmail && password === config.adminPassword) {
            userData.admin = true;
            userData.role = 'administrador';
        }
        try {
            const newUser = await UserModel.collection.insertOne(userData);

            await transport.sendMail({
                from: 'Ecommerce <correoenvios@example.com>',
                to: email,
                subject: "¡Bienvenido a Ecommerce!",
                html: `
                <div>
                  <h1>¡Muchas gracias por registrarse!</h1>
                </div>
                `,
                attachments: []
            });

            return newUser;
        } catch (error) {
            throw new Error("Error al registrar el usuario");
        }
    }

    async loginUser(email, password) {
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

            await transport.sendMail({
                from: 'Ecommerce <correoenvios@example.com>',
                to: email,
                subject: "Inicio de sesión en tu cuenta.",
                html: `
                    <div>
                        <h1>Alguien acaba de iniciar sesión en tu cuenta de Ecommerce.</h1>
                    </div>
                `,
                attachments: []
            });

            return { user, token };
        } catch (error) {
            throw new Error("Error al iniciar sesión");
        }
    }

    async getUserById(userId) {
        try {
            const user = await UserModel.findById(userId);
            return user;
        } catch (error) {
            throw new Error("Error al obtener los datos del usuario");
        }
    }
}

module.exports = new SessionDAO();