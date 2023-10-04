const socketIO = require('socket.io');

let io;

function init(server) {
  io = socketIO(server);
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

module.exports = {
  init,
  getIO,
};