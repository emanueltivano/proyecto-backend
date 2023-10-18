const winston = require('winston');
const config = require('../config/config');

const levels = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5,
};

const colors = {
  debug: 'blue',
  http: 'green',
  info: 'cyan',
  warning: 'yellow',
  error: 'red',
  fatal: 'magenta',
};

winston.addColors(colors);
winston.level = 'debug';

const developmentLogger = winston.createLogger({
  levels: levels,
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      level: 'debug', // Solo mostrará mensajes desde nivel debug en adelante en la consola
    }),
  ],
});

const productionLogger = winston.createLogger({
  levels: levels,
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      level: 'info', // Mostrará mensajes desde nivel info en adelante en la consola
    }),
    new winston.transports.File({
      filename: 'errors.log',
      level: 'error', // Solo registrará mensajes de error en el archivo "errors.log"
    }),
  ],
});

const logger = config.nodeEnv === 'production' ? productionLogger : developmentLogger;

const loggerMiddleware = (req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
};

module.exports = {
  logger: logger,
  loggerMiddleware: loggerMiddleware,
};