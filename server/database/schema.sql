-- ============================================================
-- SKIL Hub — SQLite Database Schema
-- ============================================================
-- Run via: node server/database/init.js
-- SQLite version 3.x
-- PRAGMA foreign_keys = ON;  (enabled at connection time)
-- ============================================================

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL CHECK (role IN ('student', 'faculty')),
  department    TEXT    NOT NULL,
  year          TEXT,                     -- NULL for faculty
  bio           TEXT    NOT NULL DEFAULT '',
  skills        TEXT    NOT NULL DEFAULT '[]',   -- JSON array string
  avatar_url    TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Achievements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT    NOT NULL,
  description   TEXT    NOT NULL,
  category      TEXT    NOT NULL CHECK (category IN ('hackathon','certification','research','project','award','other')),
  ml_category   TEXT,                     -- ML-predicted category (may differ from user's chosen category)
  ml_confidence REAL,
  proof_url     TEXT,
  achieved_date TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Posts ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT    NOT NULL CHECK (length(content) <= 2000),
  post_type       TEXT    NOT NULL CHECK (post_type IN ('achievement','project_update','research','general')),
  image_url       TEXT,
  trending_score  REAL    NOT NULL DEFAULT 0.0,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Comments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Likes ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (post_id, user_id)
);

-- ─── Projects ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT    NOT NULL,
  description     TEXT    NOT NULL,
  required_skills TEXT    NOT NULL DEFAULT '[]',  -- JSON array string
  max_team_size   INTEGER NOT NULL DEFAULT 4,
  status          TEXT    NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','completed')),
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Project Members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_members (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role       TEXT    NOT NULL DEFAULT 'member' CHECK (role IN ('owner','member')),
  status     TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  joined_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (project_id, user_id)
);

-- ─── Endorsements ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS endorsements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  faculty_id     INTEGER NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  comment        TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE (achievement_id, faculty_id)
);

-- ─── Notifications ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type           TEXT    NOT NULL CHECK (type IN ('like','comment','collab_request','endorsement','team_invite','collab_accepted','collab_rejected')),
  message        TEXT    NOT NULL,
  reference_id   INTEGER,               -- ID of related entity
  reference_type TEXT,                  -- 'post' | 'project' | 'achievement'
  is_read        INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_achievements_user      ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user             ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_trending         ON posts(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created          ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post          ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post             ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user   ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_endorsements_achievement ON endorsements(achievement_id);

-- ─── Connections ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        TEXT    NOT NULL CHECK(status IN ('pending','accepted')) DEFAULT 'pending',
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(requester_id, receiver_id);

-- ─── Messages ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content       TEXT    NOT NULL,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
