'use strict';
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { PORT, NODE_ENV } = require('./config/config');
const { errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');
const { getDb } = require('./config/database');
const config = require('./config/config');

// Initialize database (creates tables if they don't exist)
require('./config/database');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const achievementRoutes = require('./routes/achievement.routes');
const postRoutes = require('./routes/post.routes');
const projectRoutes = require('./routes/project.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// ─── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiter to all API routes
app.use('/api', generalLimiter);

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'skil-hub-api',
      timestamp: new Date().toISOString(),
    },
  });
});

// Unified API health that also checks database and (optionally) ML service.
app.get('/api/health', async (req, res) => {
  const startedAt = Date.now();

  const dbStatus = {
    ok: false,
    latencyMs: null,
  };
  const mlStatus = {
    ok: false,
    latencyMs: null,
    url: config.ML_SERVICE_URL,
  };

  // Database check: simple pragma/select to verify connectivity
  try {
    const dbStart = Date.now();
    const db = getDb();
    db.prepare('SELECT 1').get();
    dbStatus.ok = true;
    dbStatus.latencyMs = Date.now() - dbStart;
  } catch (err) {
    console.warn('[Health] Database check failed:', err.message);
    dbStatus.ok = false;
  }

  // ML service check: best-effort ping to /health with short timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const mlStart = Date.now();
    const response = await fetch(`${config.ML_SERVICE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    mlStatus.latencyMs = Date.now() - mlStart;
    mlStatus.ok = response.ok;
  } catch (err) {
    console.warn('[Health] ML service check failed or timed out:', err.message);
    mlStatus.ok = false;
  }

  const overallOk = dbStatus.ok; // ML is optional; DB must be healthy

  res.status(overallOk ? 200 : 503).json({
    success: overallOk,
    data: {
      status: overallOk ? 'ok' : 'degraded',
      service: 'skil-hub-api',
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      components: {
        database: dbStatus,
        mlService: mlStatus,
      },
    },
  });
});

// ─── Production static file serving ──────────────────────────
if (NODE_ENV === 'production') {
  const CLIENT_BUILD = path.join(__dirname, '../../client/dist');
  app.use(express.static(CLIENT_BUILD));
  app.get('*', (req, res) => {
    res.sendFile(path.join(CLIENT_BUILD, 'index.html'));
  });
}

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` } });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🎓 SKIL Hub API Server`);
    console.log(`   Listening on  : http://localhost:${PORT}`);
    console.log(`   Environment   : ${NODE_ENV}`);
    console.log(`   Health check  : http://localhost:${PORT}/health\n`);
  });
}

module.exports = app;
