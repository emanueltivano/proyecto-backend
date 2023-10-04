const http = require('http');
const app = require('./app');
const socketIO = require('./socket');
const config = require('./config/config');
const setupChangeStreams = require('./services/changeStreams');

const server = http.createServer(app);

// Inicializar Socket.io y pasarlo a setupChangeStreams
const io = socketIO.init(server);
setupChangeStreams(io);

server.listen(config.port, () => {
  console.log(`Server started on port ${config.port}.`);
});