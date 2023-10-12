const { createLogger, format, transports } = require('winston');

// Define los formatos que deseas utilizar
const { combine, timestamp, json } = format;

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    // Transporte para la consola
    new transports.Console({
      level: 'debug',
      format: format.combine(format.colorize(), format.simple())
    }),
    // Transporte para el archivo errors.log
    new transports.File({
      filename: '../errors.log',
      level: 'error'
    })
  ]
});

module.exports = logger;