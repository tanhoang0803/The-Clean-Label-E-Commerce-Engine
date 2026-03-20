const request = require('supertest');
const app = require('../server');

describe('Auth endpoints', () => {
  it('POST /api/auth/register returns 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' }); // missing password
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login returns 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/products returns 401 without JWT', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test', ingredients: 'water', price: 9.99 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
