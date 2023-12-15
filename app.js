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
const { errorHandler } = require("./services/utils");
const { logger, loggerMiddleware } = require('./services/logger');
const { swaggerUi, swaggerSpec } = require('./config/swagger.config');

// Importa el módulo handlebars-helpers
const handlebarsHelpers = require('handlebars-helpers')();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const persistance = "mongodb";

let url = '';

if (persistance === "mongodb") {
  url = './routes/index';
} else if (persistance === "filesystem") {
  url = './DAO/filesystem/index';
}

const indexRouter = require(url);

app.use(loggerMiddleware);

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

const hbs = exphbs.create({ defaultLayout: 'main' });

// Registra handlebars-helpers con el motor handlebars
hbs.handlebars.registerHelper(handlebarsHelpers);

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('Conexión exitosa a MongoDB');
    setupChangeStreams();
  })
  .catch((error) => {
    logger.error('Error en la conexión a MongoDB:', error);
  });

app.use('/', indexRouter);
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;