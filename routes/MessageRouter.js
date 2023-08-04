const express = require('express');
const router = express.Router();
const MessageManager = require('../dao/mongodb/MessageManager');

router.post('/', async (req, res, next) => {
  const { user, message } = req.body;
  try {
    const newMessage = await MessageManager.createMessage(user, message);
    res.status(201).json({ status: 201, response: newMessage });
  } catch (error) {
    res.status(400).json({ status: 400, response: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const messages = await MessageManager.getAllMessages();
    res.json({ status: 200, response: messages });
  } catch (error) {
    res.status(500).json({ status: 500, response: error.message });
  }
});

module.exports = router;