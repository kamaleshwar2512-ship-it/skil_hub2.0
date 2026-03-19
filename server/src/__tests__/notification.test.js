'use strict';

const request = require('supertest');
const app = require('../app');

// ─── Helpers ──────────────────────────────────────────────────────────────────
let accessToken;

const ts = Date.now();
const testUser = {
  name: 'Notification Tester',
  email: `notif${ts}@test.edu`,
  password: 'Test1234!',
  role: 'student',
  department: 'Electronics',
  year: '2nd',
};

beforeAll(async () => {
  const regRes = await request(app).post('/api/auth/register').send(testUser);
  expect(regRes.status).toBe(201);
  accessToken = regRes.body.data?.accessToken;
});

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('Notification API', () => {
  describe('GET /api/notifications', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });

    it('should return an array of notifications for the user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should support unread_only=true filter', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ unread_only: 'true' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should return 403 or 404 for a non-existent notification id', async () => {
      const res = await request(app)
        .put('/api/notifications/999999/read')
        .set('Authorization', `Bearer ${accessToken}`);
      expect([403, 404]).toContain(res.status);
    });
  });
});
