const express = require('express');
const exphbs = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const { readItemsFromFile, generateId, errorHandler, saveItemsToFile } = require('./routes/api/products');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configuración de Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middleware para analizar el cuerpo de la solicitud
app.use(express.json());

// Rutas
const indexRouter = require('./routes/index');
app.use('/', indexRouter);

// Configuración del servidor WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Emitir la lista de productos cuando un cliente se conecta
  const productsFilePath = './data/products.json';
  const products = readItemsFromFile(productsFilePath);
  socket.emit('productsUpdate', products);

  // Escuchar el evento de creación de productos
  socket.on('createProduct', (newProduct) => {
    // Generar un ID para el nuevo producto
    newProduct.id = generateId(products);

    // Agregar el nuevo producto a la lista de productos
    products.push(newProduct);
    saveItemsToFile(products, productsFilePath);

    // Emitir un evento a todos los clientes para que se actualice la lista de productos
    io.emit('productsUpdate', products);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Middleware para pasar la instancia de io a las rutas
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Iniciar el servidor
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});