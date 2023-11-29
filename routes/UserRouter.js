const express = require('express');
const router = express.Router();
const multer = require('multer');
const SessionDAO = require('../DAO/mongodb/SessionDAO');

const { getUserById, updateUserDocuments, updatePremiumStatus } = require('../DAO/mongodb/UserDAO');

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const { category } = req.body; // Assuming category is passed in the request body
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

const checkDocuments = async (req, res, next) => {
    const user = await getUserById(req.params.uid);

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
        await updateUserDocuments(uid, files);

        res.json({ status: 200, response: 'Documents uploaded successfully.' });
    } catch (error) {
        res.status(500).json({ status: 500, response: error.message });
    }
});

router.post('/premium/:uid', checkDocuments, async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await SessionDAO.getUserById(uid);

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