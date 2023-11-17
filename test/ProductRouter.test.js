const chai = require('chai');
const supertest = require('supertest');
const app = require('../app');
const { expect } = chai;
const config = require('../config/config');

const request = supertest(app);

describe('Product Router', () => {
  let agent;
  let createdProductId;

  before(async () => {
    agent = supertest.agent(app);  // Crear el agente antes de las pruebas

    // Agrega mensajes de consola para depuración
    agent.on('request', (req) => {
      console.log('Request:', req.method, req.url);
    });

    agent.on('response', (res) => {
      console.log('Response:', res.status);
    });

    // Intenta iniciar sesión
    await agent.post('/api/sessions/login').send({ email: config.adminEmail, password: config.adminPassword });
  });
  
  it('should get a specific product by ID with authentication', async () => {
    const productId = '64d670348d40fa60aa60c005';
    const response = await agent.get(`/api/products/${productId}`).redirects(1);
  
    expect(response.status).to.equal(200);
  });
  
  it('should create a new product with authentication and admin role', async () => {
    const newProductData = {
      title: 'Product 31',
      description: 'Description of product 31',
      code: 'P1031',
      price: 500,
      stock: 5,
      category: 'Category 1',
    };
  
    try {
      const response = await agent.post('/api/products').send(newProductData).redirects(1);
  
      expect(response.status).to.equal(201);
      createdProductId = response.body.response._id;
    } catch (error) {
      console.error('Error creating a new product:', error);
      throw error;
    }
  });

  it('should update a product with authentication and admin role', async () => {
    if (!createdProductId) {
      console.error('No product created for this test.');
      throw new Error('No se ha creado ningún producto para esta prueba.');
    }

    const updatedProductData = {
      title: 'Product 31 (new)',
    };

    try {
      const response = await agent.put(`/api/products/${createdProductId}`).send(updatedProductData);

      expect(response.status).to.equal(200);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  });

  it('should delete a product with authentication and admin role', async () => {
    if (!createdProductId) {
      console.error('No product created for this test.');
      throw new Error('No se ha creado ningún producto para esta prueba.');
    }

    try {
      const response = await agent.delete(`/api/products/${createdProductId}`);

      expect(response.status).to.equal(200);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  });
});