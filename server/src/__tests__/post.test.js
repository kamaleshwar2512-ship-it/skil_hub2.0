'use strict';

const request = require('supertest');
const app = require('../app');

// ─── Helpers ──────────────────────────────────────────────────────────────────
let accessToken;
let createdPostId;

const ts = Date.now();
const testUser = {
  name: 'Post Tester',
  email: `post${ts}@test.edu`,
  password: 'Test1234!',
  role: 'student',
  department: 'Computer Science',
  year: '3rd',
};

beforeAll(async () => {
  const regRes = await request(app).post('/api/auth/register').send(testUser);
  expect(regRes.status).toBe(201);
  accessToken = regRes.body.data?.accessToken;
});

// ─── Tests ─────────────────────────────────────────────────────────────────────
describe('Post API', () => {
  describe('POST /api/posts', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ content: 'Hello', postType: 'general' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject request with missing content (422 from validate middleware)', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ postType: 'general' });
      expect(res.status).toBe(422);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should create a post successfully', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'My first test post', postType: 'general' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.content).toBe('My first test post');
      createdPostId = res.body.data.id;
    });
  });

  describe('GET /api/posts', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/posts');
      expect(res.status).toBe(401);
    });

    it('should return paginated feed (trending)', async () => {
      const res = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sort: 'trending', page: 1, limit: 10 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('page', 1);
      expect(res.body.meta).toHaveProperty('totalPages');
    });

    it('should return paginated feed (recent)', async () => {
      const res = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sort: 'recent', page: 1, limit: 5 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid sort param (422 from validate middleware)', async () => {
      const res = await request(app)
        .get('/api/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ sort: 'invalid' });
      expect(res.status).toBe(422);
    });
  });

  describe('POST/DELETE /api/posts/:id/like', () => {
    it('should like a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${createdPostId}/like`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 409]).toContain(res.status);
    });

    it('should unlike a post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${createdPostId}/like`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('POST /api/posts/:id/comments', () => {
    it('should reject empty comment (422 from validate middleware)', async () => {
      const res = await request(app)
        .post(`/api/posts/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: '' });
      expect(res.status).toBe(422);
    });

    it('should add a comment to a post', async () => {
      const res = await request(app)
        .post(`/api/posts/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Nice post!' });
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/posts/:id/comments', () => {
    it('should return comments for a post', async () => {
      const res = await request(app)
        .get(`/api/posts/${createdPostId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete own post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for already-deleted post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${createdPostId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(404);
    });
  });
});
