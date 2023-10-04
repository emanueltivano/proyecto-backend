const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const cors = require('cors');
const config = require('./config/config');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const initializePassport = require('./config/passport.config');
const setupChangeStreams = require('./services/changeStreams');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const persistance = "mongodb"

let url = ''

if (persistance === "mongodb") {
  url = './routes/index'
} else if ((persistance === "filesystem")) {
  url = './DAO/filesystem/index'
}

const indexRouter = require(url);

// Configuraciones iniciales
initializePassport();
app.use(session({
  secret: "CoderSecrets",
  store: MongoStore.create({
    mongoUrl: config.mongoUrl,
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  }),
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(cors({ origin: `http://localhost:${config.port}`, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));

// Configuración de Handlebars
const hbs = exphbs.create({ defaultLayout: 'main' });
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Conexión a MongoDB y configuración de change streams
mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión exitosa a MongoDB');
    setupChangeStreams();
  })
  .catch((error) => {
    console.error('Error en la conexión a MongoDB:', error);
  });

app.use('/', indexRouter);

module.exports = app;