'use strict';

const request = require('supertest');
const app = require('../app');

describe('Health endpoints', () => {
  it('GET /health should return basic ok status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'ok');
  });

  it('GET /api/health should include components block', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('data.components');
    expect(res.body.data.components).toHaveProperty('database');
    expect(res.body.data.components).toHaveProperty('mlService');
  });
});

