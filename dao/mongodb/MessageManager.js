const Message = require('../models/MessageModel');

const createMessage = async (user, message) => {
  try {
    const newMessage = new Message({ user, message });
    await newMessage.save();
    return newMessage;
  } catch (error) {
    throw new Error('Error creating message.');
  }
};

const getAllMessages = async () => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    return messages;
  } catch (error) {
    throw new Error('Error retrieving messages from database.');
  }
};

module.exports = {
  createMessage,
  getAllMessages,
};