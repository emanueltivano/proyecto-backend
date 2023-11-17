const chai = require('chai');
const supertest = require('supertest');
const app = require('../app');
const { expect } = chai;
const config = require('../config/config');

const request = supertest(app);

describe('Cart Router', () => {
  let agent;  // Variable para el agente

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
    await agent.post('/api/sessions/login').send({ email: config.testUserEmail, password: config.testUserPassword });
  });

  let createdCartId;

  it('should create a new cart', async () => {
    const response = await agent.post('/api/carts');

    expect(response.status).to.equal(201);
    createdCartId = response.body.response._id;
  });

  it('should get a specific cart by ID', async () => {
    if (!createdCartId) {
      console.error('No cart created for this test.');
      throw new Error('No se ha creado ningún carrito para esta prueba.');
    }

    const response = await agent.get(`/api/carts/${createdCartId}`);

    expect(response.status).to.equal(200);
  });

  it('should add a product to the cart', async () => {
    if (!createdCartId) {
      console.error('No cart created for this test.');
      throw new Error('No se ha creado ningún carrito para esta prueba.');
    }

    const productId = '64d670348d40fa60aa60c005';

    const response = await agent.post(`/api/carts/${createdCartId}/products/${productId}`);

    expect(response.status).to.equal(200);
  });

  it('should remove a product from the cart', async () => {
    if (!createdCartId) {
      console.error('No cart created for this test.');
      throw new Error('No se ha creado ningún carrito para esta prueba.');
    }

    const productId = '64d670348d40fa60aa60c005';

    const response = await agent.delete(`/api/carts/${createdCartId}/products/${productId}`);

    expect(response.status).to.equal(200);
  });

  it('should update the cart', async () => {
    if (!createdCartId) {
      console.error('No cart created for this test.');
      throw new Error('No se ha creado ningún carrito para esta prueba.');
    }

    const response = await agent.put(`/api/carts/${createdCartId}`);

    expect(response.status).to.equal(200);
  });

  it('should update the units of a product in the cart', async () => {
    if (!createdCartId) {
      console.error('No cart created for this test.');
      throw new Error('No se ha creado ningún carrito para esta prueba.');
    }

    const productId = '64d670348d40fa60aa60c005';

    const response = await agent.put(`/api/carts/${createdCartId}/products/${productId}/5`);

    expect(response.status).to.equal(200);
  });

  it('should remove all products from the cart', async () => {
    if (!createdCartId) {
      console.error('No cart created for this test.');
      throw new Error('No se ha creado ningún carrito para esta prueba.');
    }

    const response = await agent.delete(`/api/carts/${createdCartId}/products`);

    expect(response.status).to.equal(200);
  });
});