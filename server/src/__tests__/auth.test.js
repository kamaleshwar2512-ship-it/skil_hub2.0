'use strict';

const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  it('should validate missing fields on /api/auth/login', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });
});

