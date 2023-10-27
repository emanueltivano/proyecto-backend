const ProductModel = require('../models/ProductModel');
const MessageModel = require('../models/MessageModel');
const socketIO = require('../socket');

function setupChangeStreams() {
  const io = socketIO.getIO(); // Obtiene el objeto io del módulo socket.js
  const productChangeStream = ProductModel.watch();
  const stockChangeStream = ProductModel.watch();
  const messageChangeStream = MessageModel.watch();

  productChangeStream.on('change', async (change) => {
    try {
      const updatedProducts = await ProductModel.find({});
      io.emit('productsUpdate', updatedProducts);
    } catch (error) {
      console.error('Error al obtener los productos actualizados:', error);
    }
  });

  stockChangeStream.on('change', async (change) => {
    try {
      const updatedProduct = await ProductModel.findById(change.documentKey._id);
      console.log(`Stock actualizado para el producto ${updatedProduct._id}: ${updatedProduct.stock}`);
      io.emit('updateStock', {
        productId: updatedProduct._id,
        newStockValue: updatedProduct.stock
      });
    } catch (error) {
      console.error('Error al obtener el producto actualizado:', error);
    }
  });

  messageChangeStream.on('change', async (change) => {
    try {
      const updatedMessages = await MessageModel.find({}).sort({ createdAt: 1 });
      io.emit('messagesUpdate', updatedMessages);
    } catch (error) {
      console.error('Error al obtener los mensajes actualizados:', error);
    }
  });
}

module.exports = setupChangeStreams;