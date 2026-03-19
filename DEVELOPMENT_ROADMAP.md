# Development Roadmap — SKIL Hub

**SKIL Hub — Student Knowledge Integration Learning Hub**

> Version 1.0 | Date: 2026-03-15

---

## Table of Contents

1. [Project Folder Structure](#1-project-folder-structure)
2. [Development Phases Overview](#2-development-phases-overview)
3. [Phase 1 — Environment Setup](#phase-1--environment-setup)
4. [Phase 2 — Database Design](#phase-2--database-design)
5. [Phase 3 — Backend API Development](#phase-3--backend-api-development)
6. [Phase 4 — Frontend Development](#phase-4--frontend-development)
7. [Phase 5 — ML Model Implementation](#phase-5--ml-model-implementation)
8. [Phase 6 — System Integration](#phase-6--system-integration)
9. [Phase 7 — Testing](#phase-7--testing)
10. [Phase 8 — Deployment Preparation](#phase-8--deployment-preparation)
11. [Dependency Graph](#dependency-graph)

---

## 1. Project Folder Structure

```
skil-hub/
├── client/                          # React + Vite frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                     # Axios instance and API helpers
│   │   │   ├── axiosInstance.js
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── achievements.js
│   │   │   ├── posts.js
│   │   │   ├── projects.js
│   │   │   └── notifications.js
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── AchievementCard.jsx
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── UserCard.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── SkillTag.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/                 # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── FeedPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── EditProfilePage.jsx
│   │   │   ├── AchievementsPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── ProjectDetailPage.jsx
│   │   │   ├── CreateProjectPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── NotificationsPage.jsx
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   └── useFetch.js
│   │   ├── utils/                   # Utility functions
│   │   │   ├── formatDate.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                          # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # SQLite connection setup
│   │   │   └── config.js            # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification middleware
│   │   │   ├── validate.js          # Request validation middleware
│   │   │   ├── errorHandler.js      # Global error handler
│   │   │   └── rateLimiter.js       # Rate limiting for auth routes
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── achievement.routes.js
│   │   │   ├── post.routes.js
│   │   │   ├── project.routes.js
│   │   │   └── notification.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── achievement.controller.js
│   │   │   ├── post.controller.js
│   │   │   ├── project.controller.js
│   │   │   └── notification.controller.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── achievement.model.js
│   │   │   ├── post.model.js
│   │   │   ├── project.model.js
│   │   │   └── notification.model.js
│   │   ├── services/
│   │   │   ├── ml.service.js        # HTTP client for ML Flask service
│   │   │   └── trending.service.js  # Trending score calculation
│   │   ├── utils/
│   │   │   └── response.js          # Standard response formatter
│   │   └── app.js                   # Express app entry point
│   ├── database/
│   │   ├── schema.sql               # Full DDL for all tables
│   │   ├── seed.sql                 # Seed data for development
│   │   └── skil_hub.db              # SQLite database file (git-ignored)
│   ├── .env                         # Environment variables
│   ├── .env.example
│   └── package.json
│
├── ml-service/                      # Python + Flask ML service
│   ├── app.py                       # Flask entry point
│   ├── models/
│   │   ├── classifier.py            # Achievement classifier (TF-IDF + NB)
│   │   └── recommender.py           # Skill matcher (TF-IDF + Cosine Sim)
│   ├── training/
│   │   ├── train_classifier.py      # Training script for achievement classifier
│   │   ├── train_recommender.py     # Training script for skill matcher
│   │   └── data/
│   │       ├── achievements.csv     # Labeled training data
│   │       └── skills.csv           # User skills dataset
│   ├── saved_models/                # Serialized models (joblib)
│   │   ├── classifier.joblib
│   │   ├── tfidf_classifier.joblib
│   │   ├── recommender.joblib
│   │   └── tfidf_recommender.joblib
│   ├── requirements.txt
│   └── config.py
│
├── docs/                            # Documentation
│   ├── PRD_SKIL_HUB.md
│   └── DEVELOPMENT_ROADMAP.md
│
├── .gitignore
└── README.md
```

---

## 2. Development Phases Overview

| Phase | Name | Duration | Key Output |
|---|---|---|---|
| 1 | Environment Setup | 1–2 days | Project scaffolding, dependencies installed, dev servers running |
| 2 | Database Design | 1–2 days | SQLite schema created, seed data loaded |
| 3 | Backend API Development | 5–7 days | Full REST API with auth, CRUD, and business logic |
| 4 | Frontend Development | 7–10 days | Complete React SPA with all pages and components |
| 5 | ML Model Implementation | 3–4 days | Trained models, Flask API serving predictions |
| 6 | System Integration | 2–3 days | Frontend ↔ Backend ↔ ML fully connected |
| 7 | Testing | 2–3 days | Unit, integration, and E2E tests passing |
| 8 | Deployment Preparation | 1–2 days | Build scripts, startup scripts, documentation |

**Total estimated duration: 22–33 days** (for a single developer working full-time)

### Phase Dependency Flow

```
Phase 1 → Phase 2 → Phase 3 ──┐
                               ├──→ Phase 6 → Phase 7 → Phase 8
Phase 1 ──→ Phase 4 ──────────┤
Phase 1 ──→ Phase 5 ──────────┘
```

> Phases 3, 4, and 5 can be **developed in parallel** after Phases 1 and 2 are complete. Phase 6 integrates all three.

---

## Phase 1 — Environment Setup

---

### TASK-1.1: Initialize Project Root

| Field | Value |
|---|---|
| **TASK_ID** | TASK-1.1 |
| **TASK_NAME** | Initialize Project Root |
| **DESCRIPTION** | Create the root `skil-hub/` directory. Initialize a Git repository. Create `.gitignore` with entries for `node_modules/`, `.env`, `skil_hub.db`, `__pycache__/`, `saved_models/`, and `*.joblib`. Create `README.md` with project title and description. |
| **TECHNOLOGIES_USED** | Git |
| **EXPECTED_OUTPUT** | Git repo initialized; `.gitignore` and `README.md` present at root |
| **DEPENDENCIES** | None |
| **NEXT_TASK** | TASK-1.2 |

---

### TASK-1.2: Scaffold React Frontend with Vite

| Field | Value |
|---|---|
| **TASK_ID** | TASK-1.2 |
| **TASK_NAME** | Scaffold React Frontend with Vite |
| **DESCRIPTION** | Inside the root, run `npx create-vite@latest client -- --template react`. Install dependencies: `react-router-dom`, `axios`. Create the folder structure: `src/api/`, `src/components/`, `src/context/`, `src/pages/`, `src/hooks/`, `src/utils/`. Configure Vite proxy to forward `/api` calls to `http://localhost:3000`. Verify dev server starts with `npm run dev`. |
| **TECHNOLOGIES_USED** | React.js, Vite, npm |
| **EXPECTED_OUTPUT** | React dev server running on `http://localhost:5173` with proxy configured |
| **DEPENDENCIES** | TASK-1.1 |
| **NEXT_TASK** | TASK-1.3 |

---

### TASK-1.3: Scaffold Node.js Backend

| Field | Value |
|---|---|
| **TASK_ID** | TASK-1.3 |
| **TASK_NAME** | Scaffold Node.js Backend |
| **DESCRIPTION** | Create `server/` directory. Run `npm init -y`. Install dependencies: `express`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `express-validator`, `cors`, `dotenv`, `express-rate-limit`. Create the folder structure: `src/config/`, `src/middleware/`, `src/routes/`, `src/controllers/`, `src/models/`, `src/services/`, `src/utils/`. Create `src/app.js` with a minimal Express server on port 3000. Create `.env.example` with keys: `PORT`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ML_SERVICE_URL`. Verify server starts with `node src/app.js`. |
| **TECHNOLOGIES_USED** | Node.js, Express, npm |
| **EXPECTED_OUTPUT** | Express server running on `http://localhost:3000` returning `{ status: "ok" }` on `GET /` |
| **DEPENDENCIES** | TASK-1.1 |
| **NEXT_TASK** | TASK-1.4 |

---

### TASK-1.4: Scaffold Python ML Service

| Field | Value |
|---|---|
| **TASK_ID** | TASK-1.4 |
| **TASK_NAME** | Scaffold Python ML Service |
| **DESCRIPTION** | Create `ml-service/` directory. Create `requirements.txt` with: `flask`, `scikit-learn`, `joblib`, `flask-cors`, `pandas`. Create a Python virtual environment (`python -m venv venv`) and install dependencies. Create `app.py` with a minimal Flask server on port 5000 and a `/health` endpoint. Create empty directories: `models/`, `training/`, `training/data/`, `saved_models/`. Verify dev server starts with `python app.py`. |
| **TECHNOLOGIES_USED** | Python, Flask, pip |
| **EXPECTED_OUTPUT** | Flask server running on `http://localhost:5000` returning `{ "status": "ok" }` on `GET /health` |
| **DEPENDENCIES** | TASK-1.1 |
| **NEXT_TASK** | TASK-2.1 |

---

## Phase 2 — Database Design

---

### TASK-2.1: Write SQLite Schema

| Field | Value |
|---|---|
| **TASK_ID** | TASK-2.1 |
| **TASK_NAME** | Write SQLite Schema |
| **DESCRIPTION** | Create `server/database/schema.sql`. Define all tables as specified in the PRD Database Design section: `users`, `achievements`, `posts`, `comments`, `likes`, `projects`, `project_members`, `endorsements`, `notifications`. Include all column types, constraints, foreign keys (with ON DELETE CASCADE), CHECK constraints, and UNIQUE constraints. Add all indexes: `idx_achievements_user`, `idx_posts_user`, `idx_posts_trending`, `idx_comments_post`, `idx_likes_post`, `idx_project_members_project`, `idx_notifications_user_read`. |
| **TECHNOLOGIES_USED** | SQLite, SQL |
| **EXPECTED_OUTPUT** | `schema.sql` file containing complete DDL that creates all tables and indexes |
| **DEPENDENCIES** | TASK-1.3 |
| **NEXT_TASK** | TASK-2.2 |

---

### TASK-2.2: Create Database Connection Module

| Field | Value |
|---|---|
| **TASK_ID** | TASK-2.2 |
| **TASK_NAME** | Create Database Connection Module |
| **DESCRIPTION** | Implement `server/src/config/database.js`. Use `better-sqlite3` to open (or create) `server/database/skil_hub.db`. Enable WAL mode for better concurrent read performance. Enable foreign key enforcement (`PRAGMA foreign_keys = ON`). Export a singleton database instance. On first run, execute `schema.sql` to create all tables if they don't exist. |
| **TECHNOLOGIES_USED** | Node.js, better-sqlite3 |
| **EXPECTED_OUTPUT** | Database module that initializes SQLite with schema; tables verified via `.tables` or test query |
| **DEPENDENCIES** | TASK-2.1 |
| **NEXT_TASK** | TASK-2.3 |

---

### TASK-2.3: Create Seed Data

| Field | Value |
|---|---|
| **TASK_ID** | TASK-2.3 |
| **TASK_NAME** | Create Seed Data |
| **DESCRIPTION** | Create `server/database/seed.sql`. Insert sample data: 5 student users, 2 faculty users, 10 achievements (spread across categories), 5 posts with varying engagement, 2 projects with members, and corresponding comments, likes, endorsements, and notifications. Passwords should be bcrypt hashes of simple dev passwords (e.g., `password123`). Create a seed script `server/database/seed.js` that reads and executes `seed.sql` against the database. |
| **TECHNOLOGIES_USED** | SQL, Node.js, bcrypt |
| **EXPECTED_OUTPUT** | Running `node database/seed.js` populates the database with realistic sample data |
| **DEPENDENCIES** | TASK-2.2 |
| **NEXT_TASK** | TASK-3.1 |

---

## Phase 3 — Backend API Development

---

### TASK-3.1: Implement Config and Utility Modules

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.1 |
| **TASK_NAME** | Implement Config and Utility Modules |
| **DESCRIPTION** | Implement `server/src/config/config.js`: load environment variables from `.env` using `dotenv` and export them (PORT, JWT_SECRET, JWT_REFRESH_SECRET, ML_SERVICE_URL). Implement `server/src/utils/response.js`: export helper functions `successResponse(res, data, meta)` and `errorResponse(res, statusCode, code, message, details)` that format responses per the PRD API response format. |
| **TECHNOLOGIES_USED** | Node.js, dotenv |
| **EXPECTED_OUTPUT** | Config module exporting env vars; response utility formatting `{ success, data, meta }` and `{ success, error }` objects |
| **DEPENDENCIES** | TASK-1.3 |
| **NEXT_TASK** | TASK-3.2 |

---

### TASK-3.2: Implement Authentication Middleware and Routes

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.2 |
| **TASK_NAME** | Implement Authentication Middleware and Routes |
| **DESCRIPTION** | **Middleware (`server/src/middleware/auth.js`):** Extract JWT from `Authorization: Bearer <token>` header. Verify token using `jsonwebtoken`. Attach decoded user payload (`id`, `role`) to `req.user`. Return 401 on invalid/expired token. **Rate Limiter (`server/src/middleware/rateLimiter.js`):** Use `express-rate-limit` to limit auth routes to 10 requests per minute per IP. **Error Handler (`server/src/middleware/errorHandler.js`):** Global error middleware that catches errors and formats them using `errorResponse`. **Model (`server/src/models/user.model.js`):** Functions — `createUser(data)`, `findByEmail(email)`, `findById(id)`. Use parameterized `better-sqlite3` queries. **Controller (`server/src/controllers/auth.controller.js`):** `register`: validate input (express-validator), check duplicate email, hash password (bcrypt), create user, return user data (without password). `login`: validate input, find user by email, compare password, generate access token (15 min) and refresh token (7 days), return tokens. `refresh`: verify refresh token, issue new access token. **Routes (`server/src/routes/auth.routes.js`):** `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`. Wire rate limiter to auth routes. **App (`server/src/app.js`):** Add CORS middleware, JSON body parser, auth routes, and global error handler. |
| **TECHNOLOGIES_USED** | Express, bcrypt, jsonwebtoken, express-validator, express-rate-limit |
| **EXPECTED_OUTPUT** | Register → Login → Get JWT → Use JWT on protected routes. All auth endpoints functional and tested with curl/Postman. |
| **DEPENDENCIES** | TASK-2.2, TASK-3.1 |
| **NEXT_TASK** | TASK-3.3 |

---

### TASK-3.3: Implement User API

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.3 |
| **TASK_NAME** | Implement User API |
| **DESCRIPTION** | **Model (`user.model.js` — extend):** Add `updateUser(id, data)`, `searchUsers(query, department, skill, page, limit)`. Search should support filtering by department and skill (LIKE query on skills JSON string). **Controller (`user.controller.js`):** `getMe`: return current user from `req.user.id`. `updateMe`: validate input, update profile fields (bio, skills, department, year, avatar_url). `getUserById`: return public profile of any user (include their achievements and posts). `searchUsers`: accept query params, call model, return paginated results. **Validation (`middleware/validate.js`):** Create reusable validation middleware wrapper for `express-validator`. **Routes (`user.routes.js`):** `GET /api/users/me`, `PUT /api/users/me`, `GET /api/users/:id`, `GET /api/users`. All protected by auth middleware. |
| **TECHNOLOGIES_USED** | Express, better-sqlite3, express-validator |
| **EXPECTED_OUTPUT** | All user endpoints functional: view profile, edit profile, search users |
| **DEPENDENCIES** | TASK-3.2 |
| **NEXT_TASK** | TASK-3.4 |

---

### TASK-3.4: Implement Achievement API

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.4 |
| **TASK_NAME** | Implement Achievement API |
| **DESCRIPTION** | **Model (`achievement.model.js`):** `createAchievement(data)`, `findById(id)`, `findByUserId(userId)`, `updateAchievement(id, data)`, `deleteAchievement(id)`, `listAchievements(filters, page, limit)`. **Controller (`achievement.controller.js`):** `create`: validate input, insert record, call ML service (`POST /classify-achievement` via `ml.service.js`) to get auto-classification, update `ml_category` and `ml_confidence` on the record, return achievement with ML prediction. If ML service is unavailable, create without ML classification (graceful degradation). `list`, `getById`, `update`, `delete`: standard CRUD with ownership checks. `endorse`: only faculty role can endorse; insert into `endorsements` table; create notification for the achievement owner. **Service (`services/ml.service.js`):** HTTP client using `fetch` or small HTTP lib to call `http://localhost:5000/classify-achievement` and `http://localhost:5000/recommend-collaborators`. Include timeout (5s) and error handling. **Routes (`achievement.routes.js`):** `POST /api/achievements`, `GET /api/achievements`, `GET /api/achievements/:id`, `PUT /api/achievements/:id`, `DELETE /api/achievements/:id`, `POST /api/achievements/:id/endorse`. |
| **TECHNOLOGIES_USED** | Express, better-sqlite3, express-validator |
| **EXPECTED_OUTPUT** | Achievement CRUD working; ML classification called on create; endorsement by faculty working |
| **DEPENDENCIES** | TASK-3.3 |
| **NEXT_TASK** | TASK-3.5 |

---

### TASK-3.5: Implement Post & Feed API

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.5 |
| **TASK_NAME** | Implement Post & Feed API |
| **DESCRIPTION** | **Model (`post.model.js`):** `createPost(data)`, `findById(id)`, `getFeed(sort, page, limit)`, `deletePost(id)`, `likePost(postId, userId)`, `unlikePost(postId, userId)`, `getLikeCount(postId)`, `isLikedByUser(postId, userId)`, `addComment(postId, userId, content)`, `getComments(postId, page, limit)`. **Service (`trending.service.js`):** Implement `calculateTrendingScore(likeCount, commentCount, createdAt)` using the formula from the PRD: `score = (1.0 * likes) + (2.0 * comments) + (5.0 * recencyFactor)` where `recencyFactor = 1 / (1 + hoursSincePost / 24)`. Export `updatePostTrendingScores()` to recalculate scores for recent posts. **Controller (`post.controller.js`):** `create`: validate (content max 2000 chars, valid post_type), insert, calculate initial trending score. `getFeed`: accept sort param (trending or recent), return paginated posts with author info, like count, comment count, and whether current user has liked. `getById`, `delete`: standard with ownership check. `like`, `unlike`: toggle like, recalculate trending score. `addComment`, `getComments`: standard. **Routes (`post.routes.js`):** As per PRD API Design. |
| **TECHNOLOGIES_USED** | Express, better-sqlite3 |
| **EXPECTED_OUTPUT** | Feed page shows posts sorted by trending or recency; like/unlike/comment works; trending scores recalculate |
| **DEPENDENCIES** | TASK-3.3 |
| **NEXT_TASK** | TASK-3.6 |

---

### TASK-3.6: Implement Project & Collaboration API

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.6 |
| **TASK_NAME** | Implement Project & Collaboration API |
| **DESCRIPTION** | **Model (`project.model.js`):** `createProject(data)`, `findById(id)`, `listProjects(filters, page, limit)`, `updateProject(id, data)`, `deleteProject(id)`, `addMember(projectId, userId, role, status)`, `updateMemberStatus(projectId, userId, status)`, `getMembers(projectId)`, `getProjectsByUser(userId)`. **Controller (`project.controller.js`):** `create`: validate input, insert project, auto-add owner as member with role='owner' and status='accepted'. `list`: support search by query, skill, status; paginated. `getById`: return project with member list. `update`, `delete`: ownership check. `requestJoin`: insert member with status='pending'; notify project owner. `handleMember`: owner accepts/rejects; update member status; notify requesting user. `getRecommendations`: call ML service `POST /recommend-collaborators` with project's required_skills and exclude current members; return ranked user list with profiles. **Routes (`project.routes.js`):** As per PRD API Design. |
| **TECHNOLOGIES_USED** | Express, better-sqlite3 |
| **EXPECTED_OUTPUT** | Projects CRUD, join/leave, member management, and ML-powered recommendations working |
| **DEPENDENCIES** | TASK-3.3 |
| **NEXT_TASK** | TASK-3.7 |

---

### TASK-3.7: Implement Notification API

| Field | Value |
|---|---|
| **TASK_ID** | TASK-3.7 |
| **TASK_NAME** | Implement Notification API |
| **DESCRIPTION** | **Model (`notification.model.js`):** `createNotification(data)`, `getByUserId(userId, unreadOnly, page, limit)`, `markAsRead(id, userId)`, `markAllAsRead(userId)`, `getUnreadCount(userId)`. **Controller (`notification.controller.js`):** `list`: return paginated notifications for current user; include unread count in meta. `markRead`: mark single notification as read (ownership check). `markAllRead`: mark all user's notifications as read. **Routes (`notification.routes.js`):** `GET /api/notifications`, `PUT /api/notifications/:id/read`, `PUT /api/notifications/read-all`. **Integration:** Add notification creation calls into existing controllers — `post.controller.js` (on like, on comment), `achievement.controller.js` (on endorse), `project.controller.js` (on join request, on accept/reject). |
| **TECHNOLOGIES_USED** | Express, better-sqlite3 |
| **EXPECTED_OUTPUT** | Notification bell shows unread count; marking as read works; notifications auto-created on engagement events |
| **DEPENDENCIES** | TASK-3.4, TASK-3.5, TASK-3.6 |
| **NEXT_TASK** | TASK-4.1 |

---

## Phase 4 — Frontend Development

---

### TASK-4.1: Set Up Frontend Foundation

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.1 |
| **TASK_NAME** | Set Up Frontend Foundation |
| **DESCRIPTION** | **Global Styles (`index.css`):** Define CSS custom properties (color palette, typography, spacing, border-radius, shadows). Import Google Font (Inter or similar). Set base reset and body styles. **Axios Instance (`api/axiosInstance.js`):** Create Axios instance with `baseURL: '/api'`. Add request interceptor to attach JWT from localStorage. Add response interceptor for 401 handling (redirect to login). **Auth Context (`context/AuthContext.jsx`):** Create context with state: `user`, `token`, `isAuthenticated`, `loading`. Provide methods: `login(email, password)`, `register(data)`, `logout()`. On mount, check localStorage for existing token and validate. **Protected Route (`components/ProtectedRoute.jsx`):** Wrapper that redirects to `/login` if not authenticated. **App.jsx:** Set up React Router with routes: `/login`, `/register`, `/feed`, `/profile/:id`, `/profile/edit`, `/achievements`, `/projects`, `/projects/new`, `/projects/:id`, `/search`, `/notifications`. Wrap with `AuthContext.Provider`. |
| **TECHNOLOGIES_USED** | React.js, React Router, Axios, CSS |
| **EXPECTED_OUTPUT** | App loads, routes work, auth context manages login state, protected routes redirect unauthenticated users |
| **DEPENDENCIES** | TASK-1.2 |
| **NEXT_TASK** | TASK-4.2 |

---

### TASK-4.2: Build Authentication Pages

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.2 |
| **TASK_NAME** | Build Authentication Pages |
| **DESCRIPTION** | **LoginPage.jsx:** Form with email and password inputs. On submit, call `login()` from AuthContext. Show validation errors. Redirect to `/feed` on success. Link to register page. **RegisterPage.jsx:** Form with name, email, password, confirm password, role (student/faculty dropdown), department (dropdown), year (conditional, only for students). Client-side validation. On submit, call `register()`. Redirect to `/feed` on success. **Styling:** Professional, academic-themed design. College-appropriate color scheme. Responsive layout. |
| **TECHNOLOGIES_USED** | React.js, CSS |
| **EXPECTED_OUTPUT** | Users can register and login; tokens stored in localStorage; redirected to feed |
| **DEPENDENCIES** | TASK-4.1 |
| **NEXT_TASK** | TASK-4.3 |

---

### TASK-4.3: Build Navbar and Layout Components

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.3 |
| **TASK_NAME** | Build Navbar and Layout Components |
| **DESCRIPTION** | **Navbar.jsx:** Fixed top navigation bar. Logo/title "SKIL Hub". Navigation links: Feed, Projects, Search. Profile avatar/dropdown (Profile, Notifications, Logout). Notification bell with unread count badge (`NotificationBell.jsx`). Responsive hamburger menu for mobile. **LoadingSpinner.jsx:** Centered spinner for async loading states. **SkillTag.jsx:** Styled chip/tag for displaying skills. Consistent color coding. |
| **TECHNOLOGIES_USED** | React.js, CSS |
| **EXPECTED_OUTPUT** | Persistent navbar with navigation; notification bell shows count; responsive layout |
| **DEPENDENCIES** | TASK-4.2 |
| **NEXT_TASK** | TASK-4.4 |

---

### TASK-4.4: Build Feed Page and Post Components

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.4 |
| **TASK_NAME** | Build Feed Page and Post Components |
| **DESCRIPTION** | **FeedPage.jsx:** Create-post form at top (content textarea, post type selector, submit button). Toggle: "Trending" / "Recent" sort. Infinite scroll or "Load More" pagination. List of `PostCard` components. **PostCard.jsx:** Display author avatar, name, department. Post content with type badge (achievement, project_update, research, general). Timestamp (relative: "2 hours ago"). Like button with count (toggle). Comment button with count. Expandable comment section. **CommentSection.jsx:** List of comments with author name and timestamp. Add comment input at bottom. |
| **TECHNOLOGIES_USED** | React.js, CSS |
| **EXPECTED_OUTPUT** | Feed page loads posts; like/comment works; sorting toggles between trending and recent |
| **DEPENDENCIES** | TASK-4.3 |
| **NEXT_TASK** | TASK-4.5 |

---

### TASK-4.5: Build Profile and Achievement Pages

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.5 |
| **TASK_NAME** | Build Profile and Achievement Pages |
| **DESCRIPTION** | **ProfilePage.jsx:** Header section with avatar, name, department, year, bio. Skills section with `SkillTag` components. Tab navigation: Achievements, Posts, Projects. Achievement tab: list of `AchievementCard` components. Posts tab: user's posts. Projects tab: user's projects. If viewing own profile, show "Edit Profile" button. **EditProfilePage.jsx:** Form to edit bio, skills (add/remove tags), department, year, avatar URL. Save button calls `PUT /api/users/me`. **AchievementCard.jsx:** Title, category badge (color-coded), description, date. ML confidence indicator (if ML-classified). Endorsement count and endorsement details. "Add Achievement" modal/form for own profile. **AchievementsPage.jsx:** Full list of own achievements. Filter by category. "Add Achievement" button opens form: title, description, date, proof URL. On submit, show ML-suggested category with option to override. |
| **TECHNOLOGIES_USED** | React.js, CSS |
| **EXPECTED_OUTPUT** | Profile page fully renders user info, achievements, and posts; edit profile works; add achievement with ML classification works |
| **DEPENDENCIES** | TASK-4.4 |
| **NEXT_TASK** | TASK-4.6 |

---

### TASK-4.6: Build Project Pages

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.6 |
| **TASK_NAME** | Build Project Pages |
| **DESCRIPTION** | **ProjectsPage.jsx:** List of projects as `ProjectCard` components. Search bar and filters (skill, status). "Create Project" button. **ProjectCard.jsx:** Title, description (truncated), required skills as tags, team size indicator (current/max), status badge (open/in_progress/completed). Click navigates to detail page. **CreateProjectPage.jsx:** Form: title, description, required skills (tag input), max team size. Submit calls `POST /api/projects`. Redirect to project detail. **ProjectDetailPage.jsx:** Full project info. Team members list with roles. If owner: "Find Collaborators" button to show ML-recommended users (`UserCard` list with match scores). Accept/reject pending join requests. If visitor: "Request to Join" button (if project is open and not full). **UserCard.jsx:** Compact user card showing name, department, skills, and optional match score. Click navigates to user profile. |
| **TECHNOLOGIES_USED** | React.js, CSS |
| **EXPECTED_OUTPUT** | Project listing, creation, detail view, team management, and ML recommendations all functional |
| **DEPENDENCIES** | TASK-4.5 |
| **NEXT_TASK** | TASK-4.7 |

---

### TASK-4.7: Build Search and Notification Pages

| Field | Value |
|---|---|
| **TASK_ID** | TASK-4.7 |
| **TASK_NAME** | Build Search and Notification Pages |
| **DESCRIPTION** | **SearchPage.jsx:** Search input with search-as-you-type (debounced 300ms). Tabs: "People" / "Projects". Filters: department dropdown, skill input. Results as `UserCard` or `ProjectCard` lists. Pagination. **SearchBar.jsx:** Reusable search input component with icon and clear button. **NotificationsPage.jsx:** List of notifications grouped by date. Each notification shows: icon by type, message, timestamp, read/unread indicator. Click navigates to relevant entity (post, project, achievement). "Mark All Read" button at top. **Notification Context (`context/NotificationContext.jsx`):** Poll `GET /api/notifications?unread_only=true` every 30 seconds. Provide `unreadCount` to `NotificationBell`. |
| **TECHNOLOGIES_USED** | React.js, CSS |
| **EXPECTED_OUTPUT** | Search returns users and projects with filters; notifications display with unread badge; polling updates count |
| **DEPENDENCIES** | TASK-4.6 |
| **NEXT_TASK** | TASK-5.1 |

---

## Phase 5 — ML Model Implementation

---

### TASK-5.1: Prepare Training Data

| Field | Value |
|---|---|
| **TASK_ID** | TASK-5.1 |
| **TASK_NAME** | Prepare Training Data |
| **DESCRIPTION** | Create `ml-service/training/data/achievements.csv` with columns: `title`, `description`, `category`. Populate with 300–500 labeled examples across 6 categories: hackathon, certification, research, project, award, other. Ensure roughly balanced distribution (50–100 per category). Examples should reflect realistic Indian college academic context (AI hackathons, NPTEL certifications, IEEE papers, etc.). Create `ml-service/training/data/skills.csv` with columns: `user_id`, `skills` (comma-separated skill strings). Populate with 50–100 sample user skill profiles. |
| **TECHNOLOGIES_USED** | CSV, Python |
| **EXPECTED_OUTPUT** | Two CSV files with sufficient labeled data for model training |
| **DEPENDENCIES** | TASK-1.4 |
| **NEXT_TASK** | TASK-5.2 |

---

### TASK-5.2: Train Achievement Classifier

| Field | Value |
|---|---|
| **TASK_ID** | TASK-5.2 |
| **TASK_NAME** | Train Achievement Classifier |
| **DESCRIPTION** | Create `ml-service/training/train_classifier.py`. Load `achievements.csv`. Preprocess text: lowercase, remove special characters, concatenate title + description. Split data: 80% train, 20% test. Build pipeline: `TfidfVectorizer(max_features=5000, ngram_range=(1,2))` → `MultinomialNB()`. Train the model. Evaluate: print accuracy, classification report (precision, recall, F1 per category), and confusion matrix. Save trained model and vectorizer using `joblib.dump()` to `saved_models/classifier.joblib` and `saved_models/tfidf_classifier.joblib`. Target: ≥85% accuracy on test set. |
| **TECHNOLOGIES_USED** | Python, Scikit-learn, pandas, joblib |
| **EXPECTED_OUTPUT** | Trained classifier with ≥85% accuracy; serialized model files in `saved_models/` |
| **DEPENDENCIES** | TASK-5.1 |
| **NEXT_TASK** | TASK-5.3 |

---

### TASK-5.3: Train Skill Recommender

| Field | Value |
|---|---|
| **TASK_ID** | TASK-5.3 |
| **TASK_NAME** | Train Skill Recommender |
| **DESCRIPTION** | Create `ml-service/training/train_recommender.py`. Load `skills.csv`. Build `TfidfVectorizer` on the combined skill strings of all users. Save the fitted vectorizer to `saved_models/tfidf_recommender.joblib`. Note: The recommender does not have a traditional "model" — the vectorizer transforms user skills at runtime, and cosine similarity is computed on-the-fly. The training script prepares and validates the vectorizer. Also create `ml-service/models/recommender.py` with a `SkillRecommender` class: `load()` to load the vectorizer, `recommend(required_skills, user_skills_list, exclude_ids, top_n)` that computes TF-IDF vectors and cosine similarity, returning top-N user IDs with scores. |
| **TECHNOLOGIES_USED** | Python, Scikit-learn, joblib |
| **EXPECTED_OUTPUT** | Fitted TF-IDF vectorizer saved; `SkillRecommender` class functional |
| **DEPENDENCIES** | TASK-5.1 |
| **NEXT_TASK** | TASK-5.4 |

---

### TASK-5.4: Build ML Flask API

| Field | Value |
|---|---|
| **TASK_ID** | TASK-5.4 |
| **TASK_NAME** | Build ML Flask API |
| **DESCRIPTION** | Update `ml-service/app.py` to serve two endpoints: **`POST /classify-achievement`**: Accept `{ "text": "..." }`. Load classifier and vectorizer (loaded once at startup). Transform text, predict category and confidence (using `predict_proba`). Return `{ "category": "...", "confidence": 0.87 }`. **`POST /recommend-collaborators`**: Accept `{ "required_skills": [...], "user_skills": [{ "user_id": ..., "skills": "..." }, ...], "exclude_user_ids": [...], "top_n": 10 }`. Use `SkillRecommender` to compute matches. Return `{ "recommendations": [{ "user_id": ..., "score": ... }] }`. Create `ml-service/models/classifier.py` with an `AchievementClassifier` class: `load()`, `predict(text)`. Both classifier and recommender classes should load models lazily on first request and cache in memory. Add error handling and input validation. |
| **TECHNOLOGIES_USED** | Python, Flask, Scikit-learn, joblib |
| **EXPECTED_OUTPUT** | `POST /classify-achievement` returns correct categories; `POST /recommend-collaborators` returns ranked user IDs; both testable with curl |
| **DEPENDENCIES** | TASK-5.2, TASK-5.3 |
| **NEXT_TASK** | TASK-6.1 |

---

## Phase 6 — System Integration

---

### TASK-6.1: Connect Backend to ML Service

| Field | Value |
|---|---|
| **TASK_ID** | TASK-6.1 |
| **TASK_NAME** | Connect Backend to ML Service |
| **DESCRIPTION** | Verify `server/src/services/ml.service.js` correctly calls the Flask ML service. Test the integration: (1) Create an achievement via `POST /api/achievements` and verify ML classification is returned. (2) Create a project and call `GET /api/projects/:id/recommendations` and verify collaborator recommendations are returned with user profiles. Ensure graceful degradation: if ML service is down, achievement creation still succeeds (without ML category), and recommendations return an empty list with a warning. Add `ML_SERVICE_URL` to `.env` configuration (default: `http://localhost:5000`). |
| **TECHNOLOGIES_USED** | Node.js, Express, Flask |
| **EXPECTED_OUTPUT** | Backend ↔ ML service communication verified; graceful fallback on ML service unavailability |
| **DEPENDENCIES** | TASK-3.4, TASK-3.6, TASK-5.4 |
| **NEXT_TASK** | TASK-6.2 |

---

### TASK-6.2: Connect Frontend to Backend

| Field | Value |
|---|---|
| **TASK_ID** | TASK-6.2 |
| **TASK_NAME** | Connect Frontend to Backend |
| **DESCRIPTION** | Complete all API integration in the frontend: (1) **Auth flow**: Register → Login → Token storage → Auto-refresh. (2) **Feed**: Load posts from `GET /api/posts`, create posts, like/comment. (3) **Profile**: Load user data from `GET /api/users/:id`, edit profile via `PUT /api/users/me`, load achievements. (4) **Achievements**: Create with ML classification display, list, endorsements. (5) **Projects**: List, create, detail view with members, join requests, ML recommendations. (6) **Search**: Connected to `GET /api/users` and `GET /api/projects` with query params. (7) **Notifications**: Polling, display, mark read. Verify all API error states are handled gracefully in the UI (loading states, error messages, 404s). |
| **TECHNOLOGIES_USED** | React.js, Axios |
| **EXPECTED_OUTPUT** | Full end-to-end flow working: register → login → create achievement (see ML classification) → create post → like → search → create project → find collaborators → notifications |
| **DEPENDENCIES** | TASK-4.7, TASK-6.1 |
| **NEXT_TASK** | TASK-6.3 |

---

### TASK-6.3: End-to-End Smoke Testing

| Field | Value |
|---|---|
| **TASK_ID** | TASK-6.3 |
| **TASK_NAME** | End-to-End Smoke Testing |
| **DESCRIPTION** | Manually test all critical user flows through the UI: (1) Student registers, logs in, completes profile. (2) Student adds achievement → ML auto-classifies → user overrides category. (3) Student creates post → another user likes and comments → trending score updates. (4) Faculty registers, views student achievements, endorses one. (5) Student creates project → gets ML recommendations → invites collaborator → collaborator accepts. (6) Search for users by skill and department. (7) Notifications appear for all engagement events. Fix any bugs discovered. Document any issues for Phase 7. |
| **TECHNOLOGIES_USED** | All (manual testing) |
| **EXPECTED_OUTPUT** | All 7 critical flows pass; bugs identified and fixed |
| **DEPENDENCIES** | TASK-6.2 |
| **NEXT_TASK** | TASK-7.1 |

---

## Phase 7 — Testing

---

### TASK-7.1: Backend Unit Tests

| Field | Value |
|---|---|
| **TASK_ID** | TASK-7.1 |
| **TASK_NAME** | Backend Unit Tests |
| **DESCRIPTION** | Set up testing framework: install `jest` as dev dependency. Create test files alongside source files or in a `__tests__/` directory. Write unit tests for: (1) **Models:** Test all database operations (CRUD) for each model using an in-memory or test SQLite database. (2) **Services:** Test `trending.service.js` calculations with known inputs; test `ml.service.js` with mocked HTTP responses. (3) **Auth middleware:** Test JWT verification with valid, expired, and invalid tokens. (4) **Validation:** Test input validation rules for each endpoint. Target: ≥80% code coverage on models and services. |
| **TECHNOLOGIES_USED** | Jest, Node.js |
| **EXPECTED_OUTPUT** | Test suite passing with ≥80% coverage on models and services |
| **DEPENDENCIES** | TASK-6.3 |
| **NEXT_TASK** | TASK-7.2 |

---

### TASK-7.2: Backend Integration Tests

| Field | Value |
|---|---|
| **TASK_ID** | TASK-7.2 |
| **TASK_NAME** | Backend Integration Tests |
| **DESCRIPTION** | Install `supertest` as dev dependency. Write integration tests for each route group: (1) **Auth routes:** Register, login, refresh token, invalid credentials. (2) **User routes:** Get profile, update profile, search users. (3) **Achievement routes:** Create (with mocked ML), list, update, delete, endorse (faculty only, student rejected). (4) **Post routes:** Create, get feed (trending/recent), like/unlike, comment. (5) **Project routes:** Create, join request, accept/reject, list, recommendations (mocked ML). (6) **Notification routes:** List, mark read, mark all read. Test authorization: ensure users cannot modify others' resources. Test edge cases: duplicate likes, self-endorsement prevention, joining full projects. |
| **TECHNOLOGIES_USED** | Jest, Supertest, Node.js |
| **EXPECTED_OUTPUT** | All API integration tests pass; edge cases covered |
| **DEPENDENCIES** | TASK-7.1 |
| **NEXT_TASK** | TASK-7.3 |

---

### TASK-7.3: ML Model Tests

| Field | Value |
|---|---|
| **TASK_ID** | TASK-7.3 |
| **TASK_NAME** | ML Model Tests |
| **DESCRIPTION** | Write Python tests using `pytest`. (1) **Classifier tests:** Test `AchievementClassifier.predict()` with known examples from each category; verify output format `{ category, confidence }`; test with edge cases (empty string, very long text, unknown domain text). (2) **Recommender tests:** Test `SkillRecommender.recommend()` with known skill profiles; verify the top recommendation is the closest match; test with no matching skills (should return empty or low scores); test `exclude_user_ids` filtering. (3) **Flask API tests:** Use Flask test client to test `/classify-achievement` and `/recommend-collaborators` endpoints; test invalid input handling (missing fields, wrong types). |
| **TECHNOLOGIES_USED** | Python, pytest, Flask |
| **EXPECTED_OUTPUT** | All ML tests pass; classifier accuracy confirmed; recommender ranking validated |
| **DEPENDENCIES** | TASK-5.4 |
| **NEXT_TASK** | TASK-7.4 |

---

### TASK-7.4: Frontend Testing

| Field | Value |
|---|---|
| **TASK_ID** | TASK-7.4 |
| **TASK_NAME** | Frontend Testing |
| **DESCRIPTION** | Set up Vitest (built into Vite) and React Testing Library. Write component tests for: (1) **Auth components:** LoginPage renders form, validates inputs, calls login API on submit. RegisterPage renders all fields, validates, submits. (2) **PostCard:** Renders post data correctly; like button toggles; comment section expands. (3) **AchievementCard:** Renders achievement with category badge; shows ML confidence. (4) **ProjectCard:** Renders project info, skill tags, status badge. (5) **SearchBar:** Debounces input, calls search API. Test protected route redirect when unauthenticated. |
| **TECHNOLOGIES_USED** | Vitest, React Testing Library |
| **EXPECTED_OUTPUT** | Component tests pass; core UI behavior verified |
| **DEPENDENCIES** | TASK-6.3 |
| **NEXT_TASK** | TASK-8.1 |

---

## Phase 8 — Deployment Preparation

---

### TASK-8.1: Create Startup Scripts

| Field | Value |
|---|---|
| **TASK_ID** | TASK-8.1 |
| **TASK_NAME** | Create Startup Scripts |
| **DESCRIPTION** | Create scripts to streamline local development and deployment: (1) **`start-dev.sh` (Linux/Mac) and `start-dev.bat` (Windows):** Start all three services (backend, frontend, ML) in parallel. Check prerequisites (Node.js, Python, npm). Install dependencies if `node_modules` or `venv` don't exist. Initialize database if `skil_hub.db` doesn't exist. (2) **`server/package.json` scripts:** `start`: `node src/app.js`, `dev`: `nodemon src/app.js`, `test`: `jest`, `seed`: `node database/seed.js`, `init-db`: `node database/init.js`. (3) **`client/package.json` scripts:** Ensure `dev`, `build`, `test` scripts are present. (4) **ML service:** Add `run.sh`/`run.bat` to activate venv and start Flask. |
| **TECHNOLOGIES_USED** | Bash, Batch, npm scripts |
| **EXPECTED_OUTPUT** | Single command starts the entire development environment |
| **DEPENDENCIES** | TASK-7.4 |
| **NEXT_TASK** | TASK-8.2 |

---

### TASK-8.2: Build Production Frontend

| Field | Value |
|---|---|
| **TASK_ID** | TASK-8.2 |
| **TASK_NAME** | Build Production Frontend |
| **DESCRIPTION** | Run `npm run build` in the `client/` directory to generate optimized production assets. Configure the Express backend to serve the static files from `client/dist/` in production mode. Add a `NODE_ENV` check: if `production`, serve static files and handle SPA fallback routing (serve `index.html` for all non-API routes). Test production build by running backend with `NODE_ENV=production` and verifying all pages load correctly from the built assets. |
| **TECHNOLOGIES_USED** | Vite, Express |
| **EXPECTED_OUTPUT** | `npm run build` produces optimized assets; backend serves them correctly in production mode |
| **DEPENDENCIES** | TASK-8.1 |
| **NEXT_TASK** | TASK-8.3 |

---

### TASK-8.3: Write Documentation

| Field | Value |
|---|---|
| **TASK_ID** | TASK-8.3 |
| **TASK_NAME** | Write Documentation |
| **DESCRIPTION** | Update `README.md` with: (1) **Project overview** (2 paragraphs). (2) **Tech stack** summary table. (3) **Prerequisites:** Node.js 20+, Python 3.10+, npm, pip. (4) **Quick Start:** Step-by-step instructions to clone, install deps, init database, seed data, train ML models, start all services. (5) **Project structure** overview. (6) **API documentation** summary (link to PRD for details). (7) **Environment variables** reference table. (8) **Running tests.** (9) **Known limitations** and assumptions. Create `server/.env.example` with all required variables and reasonable defaults. |
| **TECHNOLOGIES_USED** | Markdown |
| **EXPECTED_OUTPUT** | A new developer can clone the repo and follow README to have the full system running within 30 minutes |
| **DEPENDENCIES** | TASK-8.2 |
| **NEXT_TASK** | None (Project Complete) |

---

## Dependency Graph

The following diagram shows the dependencies between all tasks:

```
TASK-1.1 (Init Root)
    ├── TASK-1.2 (Frontend Scaffold)
    │       └── TASK-4.1 (Frontend Foundation)
    │               └── TASK-4.2 (Auth Pages)
    │                       └── TASK-4.3 (Navbar/Layout)
    │                               └── TASK-4.4 (Feed/Posts)
    │                                       └── TASK-4.5 (Profile/Achievements)
    │                                               └── TASK-4.6 (Projects)
    │                                                       └── TASK-4.7 (Search/Notifications)
    │
    ├── TASK-1.3 (Backend Scaffold)
    │       └── TASK-2.1 (Schema)
    │               └── TASK-2.2 (DB Connection)
    │                       └── TASK-2.3 (Seed Data)
    │                       └── TASK-3.1 (Config/Utils)
    │                               └── TASK-3.2 (Auth API)
    │                                       └── TASK-3.3 (User API)
    │                                               ├── TASK-3.4 (Achievement API) ──┐
    │                                               ├── TASK-3.5 (Post API)          ├── TASK-3.7 (Notification API)
    │                                               └── TASK-3.6 (Project API) ──────┘
    │
    └── TASK-1.4 (ML Scaffold)
            └── TASK-5.1 (Training Data)
                    ├── TASK-5.2 (Train Classifier)
                    └── TASK-5.3 (Train Recommender)
                            └── TASK-5.4 (ML Flask API)

    ── Integration ──
    TASK-3.4 + TASK-3.6 + TASK-5.4 → TASK-6.1 (Backend ↔ ML)
    TASK-4.7 + TASK-6.1             → TASK-6.2 (Frontend ↔ Backend)
    TASK-6.2                        → TASK-6.3 (E2E Smoke Test)

    ── Testing ──
    TASK-6.3 → TASK-7.1 (Backend Unit Tests)
    TASK-7.1 → TASK-7.2 (Backend Integration Tests)
    TASK-5.4 → TASK-7.3 (ML Tests)
    TASK-6.3 → TASK-7.4 (Frontend Tests)

    ── Deployment ──
    TASK-7.4 → TASK-8.1 (Startup Scripts)
    TASK-8.1 → TASK-8.2 (Production Build)
    TASK-8.2 → TASK-8.3 (Documentation)
```

---

## Summary

| Metric | Value |
|---|---|
| Total Tasks | 30 |
| Total Phases | 8 |
| Parallelizable Phases | Phases 3, 4, 5 (after Phase 2) |
| Estimated Duration (1 developer) | 22–33 days |
| Estimated Duration (3 developers) | 12–18 days |
| Critical Path | Phase 1 → Phase 2 → Phase 3 → Phase 6 → Phase 7 → Phase 8 |

---

*End of Development Roadmap — SKIL Hub v1.0*
