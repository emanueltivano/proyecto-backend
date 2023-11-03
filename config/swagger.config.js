const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Proyecto backend',
      version: '1.0.0',
      description: 'Documentación del proyecto final del curso de Programación Back End en Coderhouse.',
    },
  },
  apis: [
    path.resolve(__dirname, '../docs/products/products.yaml'),
    path.resolve(__dirname, '../docs/carts/carts.yaml')
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
};