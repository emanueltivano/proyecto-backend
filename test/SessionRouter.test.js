const chai = require('chai');
const supertest = require('supertest');
const app = require('../app');
const { expect } = chai;
const config = require('../config/config');

const request = supertest(app);

describe('SessionRouter', () => {
  let agent;

  it('should log in a user', async () => {
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

  it('should get current user', async () => {
    const response = await agent.get(`/api/sessions/current`).redirects(1);

    expect(response.status).to.equal(200);
  });

  it('should logout current user', async () => {
    const response = await agent.get(`/api/sessions/logout`).redirects(1);

    expect(response.status).to.equal(200);
  });
});