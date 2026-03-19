'use strict';

const request = require('supertest');
const app = require('../app');

// ─── Helpers ──────────────────────────────────────────────────────────────────
let accessToken;
let createdProjectId;

const ts = Date.now();
const testUser = {
  name: 'Project Tester',
  email: `proj${ts}@test.edu`,
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
describe('Project API', () => {
  describe('POST /api/projects', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).post('/api/projects').send({ title: 'Test' });
      expect(res.status).toBe(401);
    });

    it('should reject missing required fields (422 from validate middleware)', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Incomplete' }); // missing description
      expect(res.status).toBe(422);
      expect(res.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });

    it('should create a project successfully', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test ML Project',
          description: 'A project for testing purposes',
          requiredSkills: ['Python', 'Machine Learning'],
          maxTeamSize: 4,
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe('Test ML Project');
      createdProjectId = res.body.data.id;
    });
  });

  describe('GET /api/projects', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });

    it('should return a paginated list of projects', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ page: 1, limit: 10 });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toHaveProperty('page', 1);
    });

    it('should filter projects by skill keyword', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({ skill: 'Python' });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return project detail', async () => {
      const res = await request(app)
        .get(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', createdProjectId);
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/api/projects/999999')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update own project', async () => {
      const res = await request(app)
        .put(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated ML Project', status: 'in_progress' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete own project', async () => {
      const res = await request(app)
        .delete(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 or 404 for already-deleted project', async () => {
      // After deletion, isProjectOwner() returns false → 403 FORBIDDEN
      // (no row exists in project_members to verify ownership)
      const res = await request(app)
        .delete(`/api/projects/${createdProjectId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect([403, 404]).toContain(res.status);
    });
  });
});
