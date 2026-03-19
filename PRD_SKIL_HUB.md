# Product Requirements Document — SKIL Hub

**SKIL Hub — Student Knowledge Integration Learning Hub**

> Version 1.0 | Date: 2026-03-15

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Target Users](#4-target-users)
5. [User Personas](#5-user-personas)
6. [Core Features](#6-core-features)
7. [Functional Requirements](#7-functional-requirements)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [System Architecture](#9-system-architecture)
10. [Technology Stack](#10-technology-stack)
11. [Machine Learning Architecture](#11-machine-learning-architecture)
12. [Database Design](#12-database-design)
13. [API Design](#13-api-design)
14. [User Flow](#14-user-flow)
15. [Security Considerations](#15-security-considerations)
16. [Success Metrics](#16-success-metrics)
17. [Future Improvements](#17-future-improvements)

---

## 1. Product Overview

**SKIL Hub** (Student Knowledge Integration Learning Hub) is a web-based academic social networking platform designed exclusively for college and university ecosystems. It functions as both a **digital academic portfolio system** and a **collaborative academic social network**.

The platform enables students to showcase academic achievements, find project collaborators, and engage with faculty — while giving faculty tools to monitor student progress, discover talent across departments, and promote academic opportunities.

SKIL Hub is **not** a job marketplace. It is a **professional academic network** focused entirely on academic growth, collaboration, research visibility, and student recognition within an institutional context.

### Key Differentiators

| Aspect | LinkedIn | SKIL Hub |
|---|---|---|
| Focus | Career / Industry | Academic / College |
| Users | Professionals | Students & Faculty |
| Content | Job posts, work experience | Achievements, projects, research |
| AI Features | Job matching | Achievement classification, skill-based collaboration matching |
| Scope | Global workforce | Single college ecosystem |

---

## 2. Problem Statement

### Student Challenges

- **Scattered achievements** — Hackathon wins, certifications, and research papers are stored across different platforms with no unified view.
- **Collaboration barriers** — Finding teammates with complementary skills for academic projects is ad-hoc and inefficient.
- **Limited recognition** — Academic accomplishments lack visibility beyond a classroom; there is no central place for peer and faculty recognition.
- **Faculty disconnect** — Interaction with faculty is limited to scheduled classroom time.

### Faculty Challenges

- **No cross-department visibility** — Discovering talented students across departments requires manual effort.
- **Fragmented monitoring** — Tracking student achievements across courses and semesters is cumbersome.
- **Engagement tools gap** — Faculty have no digital tool to highlight student work, share research opportunities, or give public academic feedback.

### Institutional Challenge

- Colleges lack a **centralized platform** that brings academic achievement, collaboration, and faculty mentorship together in a single interface.

---

## 3. Objectives

| ID | Objective | Measurable Outcome |
|---|---|---|
| OBJ-1 | Provide a unified academic portfolio for every student | 80%+ students create profiles within first semester |
| OBJ-2 | Enable ML-powered collaborator discovery | Users find relevant teammates within 3 clicks |
| OBJ-3 | Auto-classify and tag achievements | ≥85% classification accuracy on campus datasets |
| OBJ-4 | Increase student–faculty academic interaction | 2× increase in digital academic feedback from faculty |
| OBJ-5 | Surface trending academic content | Trending feed refreshes with contextually relevant posts |
| OBJ-6 | Run entirely on local infrastructure | Zero dependency on cloud-only services |

---

## 4. Target Users

### Primary Users

| User Type | Description |
|---|---|
| **Students** | Undergraduate and postgraduate students across all departments |
| **Faculty** | Professors, lecturers, and department heads |

### Secondary Users

| User Type | Description |
|---|---|
| **Department Administrators** | View aggregate achievement data for their department |
| **Lab / Club Coordinators** | Promote events, projects, and research groups |

### Assumption

> The platform is deployed within a single college/university. Multi-institution federation is out of scope for v1.

---

## 5. User Personas

### Persona 1 — Arjun Kumar (Student)

| Field | Detail |
|---|---|
| Role | 3rd-year B.Tech, Computer Science |
| Skills | Python, Machine Learning, Data Analysis |
| Goals | Showcase hackathon wins; find teammates for a capstone project |
| Pain Points | Achievements scattered across Google Drive, LinkedIn, and email; cannot find ML-skilled teammates outside his department |
| Platform Usage | Creates profile → Adds achievements → Searches for collaborators → Posts project updates |

### Persona 2 — Dr. Meena Sharma (Faculty)

| Field | Detail |
|---|---|
| Role | Associate Professor, Electronics & Communication |
| Goals | Identify strong students for research assistantship; give feedback on student projects |
| Pain Points | Only aware of students in her own section; no structured way to see cross-department student achievements |
| Platform Usage | Browses trending achievements → Filters by department/skill → Comments on student posts → Shares research opportunities |

### Persona 3 — Priya Nair (Student)

| Field | Detail |
|---|---|
| Role | 2nd-year M.Sc, Data Science |
| Skills | R, Statistics, Visualization |
| Goals | Build a visible academic portfolio ahead of PhD applications |
| Pain Points | Certifications and small projects go unnoticed; no peer recognition |
| Platform Usage | Uploads certifications → Posts project summaries → Engages with faculty comments |

### Persona 4 — Prof. Raghav Iyer (Department Head)

| Field | Detail |
|---|---|
| Role | Head, Department of Computer Science |
| Goals | Monitor department-wide achievement trends; promote inter-department collaboration |
| Pain Points | Relies on manual reports; no real-time dashboard for student academic activities |
| Platform Usage | Views department analytics → Highlights exceptional achievements → Posts academic opportunities |

---

## 6. Core Features

### 6.1 Academic Profile System

- Student and faculty profile creation with academic details (department, year, skills, bio)
- Dedicated achievements section: hackathons, certifications, publications, awards
- Skills tagging (self-declared + ML-inferred from achievements)
- Profile visibility across the college ecosystem

### 6.2 Achievement Showcase

- Structured achievement entries with category, title, description, date, and optional proof (links/files)
- **ML-powered auto-classification** of achievements into categories (hackathon, certification, research, project, award)
- Faculty endorsement on achievements

### 6.3 Academic Feed & Posts

- Create posts: text + optional image/link
- Post types: Achievement, Project Update, Research, General Academic
- Like, comment, and share functionality
- **ML-powered trending detection** using weighted scoring (likes, comments, recency)

### 6.4 Project Collaboration

- Create project listings with title, description, required skills, and team size
- **ML-powered skill matching** to recommend potential teammates using TF-IDF + Cosine Similarity
- Request to join / invite to team flows
- Project status tracking (open, in-progress, completed)

### 6.5 Search & Discovery

- Search students by name, department, skill, or achievement type
- Search projects by skill requirements or keyword
- Filter and sort results
- ML-driven "Suggested Collaborators" recommendations

### 6.6 Notifications

- In-app notification center
- Notifications for: likes, comments, collaboration requests, team invitations, endorsements

### 6.7 Faculty Dashboard

- View student achievements across departments
- Filter by skill, department, achievement type
- Quick-action: endorse, comment, share

---

## 7. Functional Requirements

### FR-01: User Registration & Authentication

| ID | Requirement |
|---|---|
| FR-01.1 | Users register with name, email, password, role (student/faculty), and department |
| FR-01.2 | Email must follow college domain pattern (configurable) |
| FR-01.3 | JWT-based authentication for all protected routes |
| FR-01.4 | Password hashing using bcrypt |
| FR-01.5 | Login returns access token (short-lived) and refresh token |

### FR-02: Profile Management

| ID | Requirement |
|---|---|
| FR-02.1 | Users can create and edit their profile (bio, skills, department, year) |
| FR-02.2 | Students can add, edit, and delete achievements |
| FR-02.3 | Profile page displays user info, achievements, posts, and projects |
| FR-02.4 | Skills are stored as tags; max 20 per profile |

### FR-03: Achievement Management

| ID | Requirement |
|---|---|
| FR-03.1 | Achievements have: title, description, category, date, proof_url |
| FR-03.2 | Auto-classification via ML upon creation (user can override) |
| FR-03.3 | Faculty can endorse achievements with a comment |
| FR-03.4 | Achievement categories: hackathon, certification, research, project, award, other |

### FR-04: Feed & Posts

| ID | Requirement |
|---|---|
| FR-04.1 | Users create posts with content (text, up to 2000 chars) and optional image URL |
| FR-04.2 | Posts have a type: achievement, project_update, research, general |
| FR-04.3 | Feed is sorted by trending score (default) or recency (toggle) |
| FR-04.4 | Like and unlike a post; comment on a post |
| FR-04.5 | Feed is paginated (20 posts per page) |

### FR-05: Project Collaboration

| ID | Requirement |
|---|---|
| FR-05.1 | Users create projects: title, description, required_skills, max_team_size |
| FR-05.2 | ML service returns top-N recommended collaborators based on skill match |
| FR-05.3 | Users can request to join a project; project owner approves/rejects |
| FR-05.4 | Project has status: open, in_progress, completed |
| FR-05.5 | Team members are listed on the project page |

### FR-06: Search & Filtering

| ID | Requirement |
|---|---|
| FR-06.1 | Full-text search on user profiles (name, skills, department) |
| FR-06.2 | Full-text search on projects (title, description, required_skills) |
| FR-06.3 | Filter by department, skill, achievement category |
| FR-06.4 | Search results are paginated |

### FR-07: Notifications

| ID | Requirement |
|---|---|
| FR-07.1 | In-app notification for: new like, new comment, collaboration request, endorsement |
| FR-07.2 | Notifications are marked read/unread |
| FR-07.3 | Notification bell shows unread count |

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | API responses under 500ms for standard queries; under 2s for ML inference |
| **Scalability** | Handle up to 5,000 concurrent users within a single college deployment |
| **Availability** | 99% uptime during academic hours (8 AM — 10 PM) |
| **Security** | All passwords hashed (bcrypt); JWT tokens with expiry; CORS policies; input sanitization |
| **Data Privacy** | User data accessible only within platform; no third-party data sharing |
| **Responsiveness** | Frontend usable on desktop (primary) and tablet/mobile (responsive) |
| **Accessibility** | WCAG 2.1 Level AA compliance for core flows |
| **Maintainability** | Modular code architecture; documented APIs; consistent naming conventions |
| **Portability** | Entire stack runs locally; no cloud-only dependencies |
| **Data Integrity** | Foreign key constraints; transaction support for critical operations |

---

## 9. System Architecture

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                   React.js + Vite (SPA)                         │
└────────────────────────────┬─────────────────────────────────────┘
                             │  HTTP (REST)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│               Node.js + Express (Port 3000)                     │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐ ┌──────────────────┐  │
│  │   Auth   │ │  Users   │ │   Posts   │ │  Projects        │  │
│  │  Module  │ │  Module  │ │  Module   │ │  Module          │  │
│  └──────────┘ └──────────┘ └───────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌───────────┐                       │
│  │ Achieve- │ │  Search  │ │  Notifi-  │                       │
│  │  ments   │ │  Module  │ │  cations  │                       │
│  └──────────┘ └──────────┘ └───────────┘                       │
└──────────┬──────────────────────────────────┬────────────────────┘
           │                                  │
           ▼                                  ▼  HTTP (REST)
┌─────────────────────┐          ┌─────────────────────────────────┐
│    SQLite Database   │          │      ML SERVICE                 │
│  (File: skil_hub.db) │          │   Python + Flask (Port 5000)    │
│                      │          │                                 │
│  • users             │          │  ┌───────────────────────────┐  │
│  • achievements      │          │  │  Achievement Classifier   │  │
│  • posts             │          │  │  TF-IDF + Naive Bayes     │  │
│  • projects          │          │  └───────────────────────────┘  │
│  • comments          │          │  ┌───────────────────────────┐  │
│  • likes             │          │  │  Skill Matcher            │  │
│  • notifications     │          │  │  TF-IDF + Cosine Sim      │  │
│  • project_members   │          │  └───────────────────────────┘  │
│  • endorsements      │          │  ┌───────────────────────────┐  │
└─────────────────────┘          │  │  Trending Scorer           │  │
                                  │  │  Weighted Algorithm        │  │
                                  │  └───────────────────────────┘  │
                                  └─────────────────────────────────┘
```

### Communication Flow

1. **Client ↔ Backend**: REST API over HTTP. JWT token in `Authorization` header.
2. **Backend ↔ Database**: SQLite via `better-sqlite3` (synchronous, single-file).
3. **Backend → ML Service**: Internal REST calls from Express to Flask when ML inference is needed (achievement classification, collaborator recommendation, trending score calculation).
4. **ML Service**: Stateless; loads pre-trained models from disk on startup.

---

## 10. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React.js | 18.x | UI components and SPA routing |
| **Frontend Build** | Vite | 5.x | Dev server and bundler |
| **Frontend Routing** | React Router | 6.x | Client-side routing |
| **Frontend State** | React Context + useReducer | — | Global state management |
| **Frontend HTTP** | Axios | 1.x | API calls |
| **Backend Runtime** | Node.js | 20.x LTS | Server runtime |
| **Backend Framework** | Express | 4.x | REST API framework |
| **Database** | SQLite | 3.x | Relational storage (file-based) |
| **DB Driver** | better-sqlite3 | 9.x | Node.js SQLite binding |
| **Authentication** | JSON Web Tokens (JWT) | — | Stateless auth |
| **Password Hashing** | bcrypt | 5.x | Secure password storage |
| **Validation** | express-validator | 7.x | Request input validation |
| **ML Runtime** | Python | 3.10+ | ML model execution |
| **ML Framework** | Scikit-learn | 1.x | Model training and inference |
| **ML API** | Flask | 3.x | REST endpoint for ML service |
| **ML Text Processing** | Scikit-learn TfidfVectorizer | — | Text vectorization |
| **ML Serialization** | joblib | — | Model persistence |

### Assumption

> No ORM is used for the backend. Raw SQL with parameterized queries via `better-sqlite3` keeps the stack minimal and transparent.

---

## 11. Machine Learning Architecture

### 11.1 Achievement Classifier

| Attribute | Detail |
|---|---|
| **Purpose** | Auto-classify new achievements into predefined categories |
| **Input** | Achievement title + description (concatenated text) |
| **Output** | Predicted category label + confidence score |
| **Algorithm** | TF-IDF Vectorization → Multinomial Naive Bayes |
| **Categories** | hackathon, certification, research, project, award, other |
| **Training Data** | Seeded dataset of 200–500 labeled achievements (provided or crowd-sourced within college) |
| **Retraining** | Manual script; retrain when 100+ new labeled samples are added |

**Pipeline:**

```
Raw Text (title + description)
    │
    ▼
TF-IDF Vectorizer (max_features=5000, ngram_range=(1,2))
    │
    ▼
Multinomial Naive Bayes Classifier
    │
    ▼
{ category: "hackathon", confidence: 0.87 }
```

### 11.2 Skill-Based Collaborator Matcher

| Attribute | Detail |
|---|---|
| **Purpose** | Recommend potential teammates for a project based on skill overlap |
| **Input** | Project required_skills list |
| **Output** | Ranked list of user IDs with similarity scores |
| **Algorithm** | TF-IDF on user skill strings → Cosine Similarity between project skill vector and each user skill vector |
| **Filtering** | Exclude users already on the project; optionally filter by department |

**Pipeline:**

```
Project Required Skills → TF-IDF Vector
All User Skill Profiles  → TF-IDF Vectors
    │
    ▼
Cosine Similarity(project_vector, each user_vector)
    │
    ▼
Sort descending → Top N users
    │
    ▼
[{ user_id: 42, score: 0.81 }, { user_id: 17, score: 0.73 }, ...]
```

### 11.3 Trending Post Scorer

| Attribute | Detail |
|---|---|
| **Purpose** | Score posts for the trending feed |
| **Algorithm** | Weighted scoring (not ML model; deterministic formula) |

**Formula:**

```
trending_score = (w1 × like_count) + (w2 × comment_count) + (w3 × recency_factor)

where:
    w1 = 1.0  (weight for likes)
    w2 = 2.0  (weight for comments — higher engagement signal)
    w3 = 5.0  (weight for recency)

    recency_factor = 1 / (1 + hours_since_post / 24)
        → yields 1.0 at post time, ~0.5 after 24 hours, decays further
```

> **Assumption:** Weights are configurable via environment variables. The formula runs in the Node.js backend (no ML service needed for this).

### ML Service API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/classify-achievement` | POST | Classify achievement text into a category |
| `/recommend-collaborators` | POST | Return ranked collaborator suggestions for a project |
| `/health` | GET | Health check |

---

## 12. Database Design

### Entity-Relationship Overview

```
users ──< achievements
users ──< posts ──< comments
                 ──< likes
users ──< projects ──< project_members
achievements ──< endorsements >── users (faculty)
users ──< notifications
```

### Table Definitions

#### `users`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE NOT NULL |
| password_hash | TEXT | NOT NULL |
| role | TEXT | NOT NULL CHECK (role IN ('student','faculty')) |
| department | TEXT | NOT NULL |
| year | TEXT | NULLABLE (students only) |
| bio | TEXT | DEFAULT '' |
| skills | TEXT | JSON array as string, DEFAULT '[]' |
| avatar_url | TEXT | NULLABLE |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

#### `achievements`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| category | TEXT | NOT NULL (hackathon, certification, research, project, award, other) |
| ml_category | TEXT | NULLABLE (ML-predicted category) |
| ml_confidence | REAL | NULLABLE |
| proof_url | TEXT | NULLABLE |
| achieved_date | TEXT | NOT NULL |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

#### `posts`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| content | TEXT | NOT NULL (max 2000 chars enforced at API level) |
| post_type | TEXT | NOT NULL (achievement, project_update, research, general) |
| image_url | TEXT | NULLABLE |
| trending_score | REAL | DEFAULT 0.0 |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

#### `comments`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| post_id | INTEGER | FOREIGN KEY → posts(id) ON DELETE CASCADE |
| user_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| content | TEXT | NOT NULL |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

#### `likes`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| post_id | INTEGER | FOREIGN KEY → posts(id) ON DELETE CASCADE |
| user_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |
| | | UNIQUE(post_id, user_id) |

#### `projects`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| owner_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| title | TEXT | NOT NULL |
| description | TEXT | NOT NULL |
| required_skills | TEXT | JSON array as string |
| max_team_size | INTEGER | NOT NULL DEFAULT 4 |
| status | TEXT | DEFAULT 'open' CHECK (status IN ('open','in_progress','completed')) |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

#### `project_members`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| project_id | INTEGER | FOREIGN KEY → projects(id) ON DELETE CASCADE |
| user_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| role | TEXT | DEFAULT 'member' (owner, member) |
| status | TEXT | DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')) |
| joined_at | TEXT | DEFAULT CURRENT_TIMESTAMP |
| | | UNIQUE(project_id, user_id) |

#### `endorsements`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| achievement_id | INTEGER | FOREIGN KEY → achievements(id) ON DELETE CASCADE |
| faculty_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| comment | TEXT | NULLABLE |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |
| | | UNIQUE(achievement_id, faculty_id) |

#### `notifications`

| Column | Type | Constraints |
|---|---|---|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | FOREIGN KEY → users(id) ON DELETE CASCADE |
| type | TEXT | NOT NULL (like, comment, collab_request, endorsement, team_invite) |
| message | TEXT | NOT NULL |
| reference_id | INTEGER | NULLABLE (ID of related entity) |
| reference_type | TEXT | NULLABLE (post, project, achievement) |
| is_read | INTEGER | DEFAULT 0 |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP |

### Indexes

```sql
CREATE INDEX idx_achievements_user ON achievements(user_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_trending ON posts(trending_score DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
```

---

## 13. API Design

### Base URLs

- **Backend API**: `http://localhost:3000/api`
- **ML Service**: `http://localhost:5000` (internal, called by backend only)

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT tokens | No |
| POST | `/api/auth/refresh` | Refresh access token | Refresh Token |

### User Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Get current user profile | Yes |
| PUT | `/api/users/me` | Update current user profile | Yes |
| GET | `/api/users/:id` | Get user profile by ID | Yes |
| GET | `/api/users` | Search/list users (query params: q, department, skill) | Yes |

### Achievement Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/achievements` | Create achievement (triggers ML classification) | Yes |
| GET | `/api/achievements` | List achievements (query: user_id, category) | Yes |
| GET | `/api/achievements/:id` | Get single achievement | Yes |
| PUT | `/api/achievements/:id` | Update achievement (owner only) | Yes |
| DELETE | `/api/achievements/:id` | Delete achievement (owner only) | Yes |
| POST | `/api/achievements/:id/endorse` | Faculty endorses an achievement | Yes (Faculty) |

### Post Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/posts` | Create a post | Yes |
| GET | `/api/posts` | Get feed (query: sort=trending\|recent, page, limit) | Yes |
| GET | `/api/posts/:id` | Get single post with comments | Yes |
| DELETE | `/api/posts/:id` | Delete post (owner only) | Yes |
| POST | `/api/posts/:id/like` | Like a post | Yes |
| DELETE | `/api/posts/:id/like` | Unlike a post | Yes |
| POST | `/api/posts/:id/comments` | Add comment | Yes |
| GET | `/api/posts/:id/comments` | Get comments for a post | Yes |

### Project Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/projects` | Create project | Yes |
| GET | `/api/projects` | List/search projects (query: q, skill, status) | Yes |
| GET | `/api/projects/:id` | Get project detail with members | Yes |
| PUT | `/api/projects/:id` | Update project (owner only) | Yes |
| DELETE | `/api/projects/:id` | Delete project (owner only) | Yes |
| POST | `/api/projects/:id/join` | Request to join | Yes |
| PUT | `/api/projects/:id/members/:userId` | Accept/reject member (owner only) | Yes |
| GET | `/api/projects/:id/recommendations` | Get ML-recommended collaborators | Yes |

### Notification Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/notifications` | Get user notifications (query: unread_only) | Yes |
| PUT | `/api/notifications/:id/read` | Mark notification as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |

### ML Service Internal Endpoints

| Method | Endpoint | Request Body | Response |
|---|---|---|---|
| POST | `/classify-achievement` | `{ "text": "..." }` | `{ "category": "...", "confidence": 0.87 }` |
| POST | `/recommend-collaborators` | `{ "required_skills": [...], "exclude_user_ids": [...] }` | `{ "recommendations": [{ "user_id": ..., "score": ... }] }` |
| GET | `/health` | — | `{ "status": "ok" }` |

### API Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Description of what went wrong",
    "details": [ ... ]
  }
}
```

---

## 14. User Flow

### 14.1 Student Registration & Onboarding

```
Landing Page → Register (name, email, password, role, department, year)
    │
    ▼
Login → JWT Token Issued
    │
    ▼
Onboarding: Add bio, skills, avatar
    │
    ▼
Dashboard (Feed)
```

### 14.2 Adding an Achievement

```
Profile Page → "Add Achievement" Button
    │
    ▼
Form: Title, Description, Date, Proof URL
    │
    ▼
Submit → Backend creates record → Calls ML Service → Auto-assigns category
    │
    ▼
Achievement appears on profile with ML-suggested category (user can override)
```

### 14.3 Creating a Post

```
Feed Page → "Create Post" 
    │
    ▼
Form: Content, Post Type, Optional Image URL
    │
    ▼
Submit → Post created → Appears in feed
    │
    ▼
Other users see in feed → Like / Comment → Trending score updates
```

### 14.4 Finding Collaborators

```
Create Project → Define required skills, description, team size
    │
    ▼
"Find Collaborators" → Backend calls ML Service with required skills
    │
    ▼
ML returns ranked user list by skill similarity
    │
    ▼
View suggested users → Send collaboration invite
    │
    ▼
Invited user accepts/rejects → Team updated
```

### 14.5 Faculty Engagement

```
Faculty Login → Feed Page (sees trending posts)
    │
    ▼
Browse posts / Search students by department or skill
    │
    ▼
View student profile → See achievements
    │
    ▼
Endorse achievement with comment → Student receives notification
```

---

## 15. Security Considerations

| Area | Measure |
|---|---|
| **Authentication** | JWT with short-lived access tokens (15 min) and long-lived refresh tokens (7 days) |
| **Password Storage** | bcrypt with salt rounds ≥ 10 |
| **Input Validation** | All API inputs validated with `express-validator`; reject malformed requests |
| **SQL Injection** | Parameterized queries only via `better-sqlite3`; no string concatenation in SQL |
| **XSS Prevention** | React's default escaping; sanitize user-generated HTML (if any) on backend |
| **CORS** | Restrict allowed origins to frontend URL (localhost during dev) |
| **Rate Limiting** | Apply rate limiting on auth endpoints (e.g., 10 requests/min for login) |
| **Authorization** | Middleware checks: resource ownership (own posts/profiles), role-based (faculty-only endorsement) |
| **ML Service Isolation** | ML Flask service is internal only; not exposed to client directly |
| **Data Backup** | SQLite file backup script (cron-based or manual) |

---

## 16. Success Metrics

| Metric | Target | Measurement Method |
|---|---|---|
| User registration rate | 80% of students within first semester | Count of registered users vs. total students |
| Profile completeness | ≥60% profiles have ≥3 achievements | DB query on achievements per user |
| Daily active users (DAU) | 30% of registered users | Login/session tracking |
| Average posts per week | ≥50 across platform | Post count over time |
| Collaborator match acceptance rate | ≥40% of recommendations lead to team joins | ML recommendation click-through and join data |
| Achievement classification accuracy | ≥85% | Periodic manual review of 100 random classifications |
| Faculty engagement | ≥20% faculty endorse at least 1 achievement/month | Endorsement count per faculty |
| Average session duration | ≥5 minutes | Frontend analytics |

---

## 17. Future Improvements

> The following are **out of scope** for v1 but represent the natural evolution of SKIL Hub.

| Priority | Improvement | Description |
|---|---|---|
| High | **Real-time notifications** | WebSocket-based live notifications instead of polling |
| High | **Multi-institution federation** | Allow departments across multiple colleges to connect |
| Medium | **Research paper repository** | Direct upload and indexing of academic papers |
| Medium | **Mentorship matching** | ML-powered faculty-student mentorship recommendations |
| Medium | **Advanced analytics dashboard** | Department-level charts: achievements by category, skill distribution, trending topics |
| Medium | **Mobile app** | React Native companion app |
| Low | **Gamification** | Badges, streaks, and leaderboards for academic engagement |
| Low | **Content moderation ML** | Auto-flag inappropriate content using text classification |
| Low | **Recommendation feed** | Personalized feed algorithm using collaborative filtering |

---

## Assumptions

1. The platform is deployed within **a single college/university**. Multi-institution support is deferred to future versions.
2. The college provides a **domain-specific email pattern** (e.g., `@college.edu`) for registration validation. This is configurable.
3. The initial ML training dataset (200–500 labeled achievements) is **manually curated or crowd-sourced** during initial deployment.
4. **File/image uploads** are stored as URLs (links to external hosting). Direct file storage on the server is out of scope for v1.
5. The platform runs on a **local server** or campus network. Public internet deployment is not required for v1.
6. **No ORM** is used. SQL queries are written directly with parameterized bindings to keep the stack transparent and minimal.

---

*End of PRD — SKIL Hub v1.0*
