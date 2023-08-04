const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const ProductModel = require('./dao/models/ProductModel');
const MessageModel = require('./dao/models/MessageModel');
const CartModel = require('./dao/models/CartModel');
const socketMiddleware = require('./socketMiddleware');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configuración de Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Conexión a MongoDB
mongoose.connect('mongodb+srv://EmanuelTivano:gCjV9pq7ckS0rQmx@cluster1.bwre0nz.mongodb.net/ecommerce?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conexión exitosa a MongoDB');

  // Configurar los change streams después de la conexión a MongoDB
  setupChangeStreams();
}).catch((error) => {
  console.error('Error en la conexión a MongoDB:', error);
});

// Middleware para analizar el cuerpo de la solicitud
app.use(express.json());

// Función para configurar los change streams para los modelos de MongoDB
const setupChangeStreams = () => {
  // Crear el change stream para escuchar cambios en la colección de productos
  const productChangeStream = ProductModel.watch();

  // Crear el change stream para escuchar cambios en la colección de mensajes
  const messageChangeStream = MessageModel.watch();

  // Escuchar cambios en la colección de productos y enviar actualizaciones a los clientes conectados
  productChangeStream.on('change', async (change) => {
    try {
      // Obtener todos los productos actualizados después del cambio
      const updatedProducts = await ProductModel.find({});

      // Enviar la lista de productos actualizada a todos los clientes conectados
      io.emit('productsUpdate', updatedProducts);
    } catch (error) {
      console.error('Error al obtener los productos actualizados:', error);
    }
  });

  // Escuchar cambios en la colección de mensajes y enviar actualizaciones a los clientes conectados
  messageChangeStream.on('change', async (change) => {
    try {
      // Obtener todos los mensajes actualizados después del cambio
      const updatedMessages = await MessageModel.find({}).sort({ createdAt: 1 });

      // Enviar la lista de mensajes actualizada a todos los clientes conectados
      io.emit('messagesUpdate', updatedMessages);
    } catch (error) {
      console.error('Error al obtener los mensajes actualizados:', error);
    }
  });

  // Manejar las conexiones de los clientes Socket.IO
  io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};

// Rutas
const indexRouter = require('./routes/index');
const productRouter = require('./routes/ProductRouter');
const messageRouter = require('./routes/MessageRouter');
const cartRouter = require('./routes/CartRouter');
app.use('/', indexRouter);
app.use('/api/products', productRouter);
app.use('/api/messages', messageRouter);
app.use('/api/carts', cartRouter);

// Iniciar el servidor
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});