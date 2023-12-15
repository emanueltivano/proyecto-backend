const bcrypt = require("bcrypt");
const UserModel = require("../../models/UserModel");
const config = require('../../config/config');
const CartDAO = require('./CartDAO');
const { createToken, verifyToken, transport } = require('../../services/utils');

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
            role: 'user',
            admin: false,
            premium: false,
            cart: newCart._id
        };
        if (email === config.adminEmail && password === config.adminPassword) {
            userData.admin = true;
            userData.role = 'admin';
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
                user.role = 'admin';
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

    async requestPasswordReset(email) {
        try {
            const user = await UserModel.findOne({ email });
            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            const resetToken = createToken(user._id);

            await transport.sendMail({
                from: 'Ecommerce <correoenvios@example.com>',
                to: email,
                subject: "Restablece tu contraseña en Ecommerce",
                html: `
                    <div>
                        <h1>Recibimos una solicitud para restablecer tu contraseña.</h1>
                        <p>Si no solicitaste esto, puedes ignorar este correo electrónico.</p>
                        <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                        <a href="http://localhost:8080/reset-password?token=${resetToken}">Restablecer Contraseña</a>
                    </div>
                `,
                attachments: []
            });

            return "Correo de restablecimiento de contraseña enviado. Por favor, verifica tu correo.";
        } catch (error) {
            throw new Error("Error al solicitar restablecimiento de contraseña");
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const decodedToken = await verifyToken(token);
            const userId = decodedToken.id;
            const user = await UserModel.findById(userId);

            if (!user) {
                throw new Error("Usuario no encontrado");
            }

            // Verifica si la nueva contraseña es la misma que la antigua
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                throw new Error("No puedes usar la misma contraseña anterior.");
            }

            // Verifica si el token ha expirado
            const currentTimestamp = Math.floor(Date.now() / 1000); // Obtiene la marca de tiempo actual en segundos
            if (decodedToken.exp < currentTimestamp) {
                // Token expirado, redirige a una vista para generar un nuevo correo de restablecimiento
                return 'http://localhost:8080/forgot-password';
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            user.password = hashedPassword;
            await user.save();

            return "Contraseña restablecida correctamente.";
        } catch (error) {
            throw new Error("Error al restablecer la contraseña: " + error.message);
        }
    }

    async updateLastConnection(userId, lastConnection) {
        try {
            const user = await UserModel.findById(userId);
            if (user) {
                user.last_connection = lastConnection;
                await user.save();
            }
        } catch (error) {
            console.error('Error updating last connection:', error);
            throw new Error('Error updating last connection');
        }
    }
    
    async updateUserDocuments(userId, documents) {
        try {
            const user = await UserModel.findById(userId);
            if (user) {
                user.documents = documents;
                await user.save();
            }
        } catch (error) {
            console.error('Error updating user documents:', error);
            throw new Error('Error updating user documents');
        }
    }
}

module.exports = new SessionDAO();