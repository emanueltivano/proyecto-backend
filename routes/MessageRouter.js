const express = require('express');
const router = express.Router();
const MessageDAO = require('../DAO/mongodb/MessageDAO');
const roleMiddleware = require('../middlewares/roleMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, roleMiddleware('user'), async (req, res, next) => {
  const { user, message } = req.body;
  try {
    const newMessage = await MessageDAO.createMessage(user, message);
    res.status(201).json({ status: 201, response: newMessage });
  } catch (error) {
    res.status(400).json({ status: 400, response: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const messages = await MessageDAO.getAllMessages();
    res.json({ status: 200, response: messages });
  } catch (error) {
    res.status(500).json({ status: 500, response: error.message });
  }
});

module.exports = router;