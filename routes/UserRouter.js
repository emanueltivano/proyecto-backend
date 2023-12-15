const express = require('express');
const router = express.Router();
const multer = require('multer');
const UserDAO = require('../DAO/mongodb/UserDAO');
const { transport } = require('../services/utils');
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const { category } = req.body;
            let uploadPath = 'uploads/';

            if (category === 'profile') {
                uploadPath += 'profiles/';
            } else if (category === 'product') {
                uploadPath += 'products/';
            } else if (category === 'document') {
                uploadPath += 'documents/';
            }

            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        },
    }),
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const users = await UserDAO.getAllUsers();
        const simplifiedUsers = users.map(user => ({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            last_connection: user.last_connection
        }));
        res.json(simplifiedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Limpiar usuarios inactivos
router.delete('/', async (req, res) => {
    try {
        const inactiveUsers = await UserDAO.getInactiveUsers(2 * 24 * 60);

        // Envía un correo a los usuarios inactivos
        inactiveUsers.forEach(async user => {
            await transport.sendMail({
                from: 'Ecommerce <correoenvios@example.com>',
                to: user.email,
                subject: "Eliminación de cuenta por inactividad",
                html: `
                <div>
                  <h1>Tu cuenta ha sido eliminada debido a inactividad. Si deseas volver a utilizar nuestros servicios, por favor regístrate de nuevo.</h1>
                </div>
                `,
                attachments: []
            });
            await UserDAO.deleteUserById(user._id);
        });

        res.json({ status: 'success', message: 'Usuarios inactivos eliminados correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:uid/edit', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const { uid } = req.params;
    const { role } = req.body;

    try {
        const user = await UserDAO.getUserById(uid);

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        user.role = role;
        user.admin = role === 'admin'; // Asigna true si el rol es 'admin'
        user.premium = role === 'premium'; // Asigna true si el rol es 'premium'
        await user.save();
        res.redirect('/users');
    } catch (error) {
        res.status(500).json({ status: 500, response: error.message });
    }
});

router.post('/:uid/delete', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await UserDAO.getUserById();
        await transport.sendMail({
            from: 'Ecommerce <correoenvios@example.com>',
            to: user.email,
            subject: "Eliminación de cuenta",
            html: `
            <div>
              <h1>Tu cuenta ha sido eliminada. Si deseas volver a utilizar nuestros servicios, por favor regístrate de nuevo.</h1>
            </div>
            `,
            attachments: []
        });
        await UserDAO.deleteUserById(uid);
        res.redirect('/users');
    } catch (error) {
        res.status(500).json({ status: 500, response: error.message });
    }
});

const checkDocuments = async (req, res, next) => {
    const user = await UserDAO.getUserById(req.params.uid);

    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.documents || user.documents.length < 3) {
        return res.status(400).json({ error: 'User has not uploaded required documents.' });
    }

    next();
};

router.post('/:uid/documents', upload.array('documents'), async (req, res) => {
    const { uid } = req.params;
    const { files } = req;

    try {
        await UserDAO.updateUserDocuments(uid, files);

        res.json({ status: 200, response: 'Documents uploaded successfully.' });
    } catch (error) {
        res.status(500).json({ status: 500, response: error.message });
    }
});

router.post('/premium/:uid', checkDocuments, async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await UserDAO.getUserById(uid);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.role = user.role === 'user' ? 'premium' : 'user';
        user.premium = user.premium === false ? true : false;

        await user.save();
        res.json({ status: 200, response: user });
    } catch (error) {
        res.status(500).json({ status: 500, response: error.message });
    }
});

module.exports = router;