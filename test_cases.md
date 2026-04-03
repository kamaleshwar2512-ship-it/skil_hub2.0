# Test Cases — SKIL Hub
**Last Updated: 2026-04-03 | Tested By: Antigravity AI (E2E Browser Testing)**

---

## AUTHENTICATION FLOW
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-AUTH-01 | Register a new user | Valid email, password, name | Returns 201 Created and user object | Returns 201 Created | ✅ Pass |
| TC-AUTH-02 | Login with valid credentials | Registered email and password | Returns 200 OK + JWT access token | Returns 200 OK + token | ✅ Pass |
| TC-AUTH-03 | Login with invalid credentials | Incorrect password | Returns 401 Unauthorized "Invalid email or password" | Returns 401 Unauthorized | ✅ Pass |
| TC-AUTH-04 | Access protected route without token | Call `/api/posts` without headers | Returns 401 Unauthorized "Token required" | Returns 401 Unauthorized | ✅ Pass |

---

## UI & ROUTING FLOW
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-UI-01 | Navigate to Register page | URL `/register` | Registration form renders | Registration renders | ✅ Pass |
| TC-UI-02 | Redirect authenticated user to Feed | Visit `/login` with valid session | Auto-redirects to `/feed` | Redirects to `/feed` | ✅ Pass |
| TC-UI-03 | Render Feed with Posts | Load `/feed` | Posts list rendered without crashing | Posts list renders with seeded data | ✅ Pass |
| TC-UI-04 | Logout behavior | Click "Sign Out" from Profile dropdown | Clears token, redirects to `/login` | Navigates to `/login` smoothly | ✅ Pass |

---

## API ENDPOINTS
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-API-01 | Health Check | `GET /api/health` | HTTP 200, status "ok" | HTTP 200, `database: {ok: true}` | ✅ Pass |
| TC-API-02 | Fetch Feed Posts | `GET /api/posts?sort=recent` | Returns array of post objects | Returns valid JSON array of posts | ✅ Pass |
| TC-API-03 | Create Post | `POST /api/posts` with valid `content` | Returns 201 Created, post object | Returns 201 Created | ✅ Pass |
| TC-API-04 | Like Post | `POST /api/posts/1/like` | HTTP 200 "Post liked", trigger Notif. | HTTP 200 "Post liked" | ✅ Pass |

---

## ML MODEL INTEGRATION
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-ML-01 | Flask Health Check | `GET http://localhost:5000/health` | Returns status "ok" | HTTP 200, status "ok" | ✅ Pass |
| TC-ML-02 | Fallback on ML Timeout | Add achievement while ML server is down | Uses default category mapping without crashing | Saves achievement normally | ✅ Pass |

---

## END-TO-END FRONTEND ↔ BACKEND COMMUNICATION
*Tested via live browser session — all three services running (Frontend :5173, Backend :3000, ML :5000)*

| Test Case ID | Description | Network Request | UI Result | Status |
|---|---|---|---|---|
| TC-E2E-01 | Health Check — All Services | `GET /api/health` → 200, DB ok + ML ok; `GET :5000/health` → 200 | JSON responses valid | ✅ Pass |
| TC-E2E-02 | Login Page Load | `GET http://localhost:5173` → 200 | Login page renders with email/password fields + "Sign in" button | ✅ Pass |
| TC-E2E-03 | Register New User (Frontend → API) | `POST /api/auth/register` → 201 | User "E2E Test User" (e2etest@test.edu) created; auto-redirected to Feed | ✅ Pass |
| TC-E2E-04 | Login with Credentials (Frontend → API) | `POST /api/auth/login` → 200 | JWT token received; redirected to `/feed` with authenticated session | ✅ Pass |
| TC-E2E-05 | Feed Page Loads with Posts | `GET /api/posts` → 200 | Feed renders seeded posts from multiple students; infinite scroll structure visible | ✅ Pass |
| TC-E2E-06 | Create Post (Frontend → API → Feed Update) | `POST /api/posts` → 201 | Post "Testing SKIL Hub frontend-backend integration! #SKILHub" appears live in feed | ✅ Pass |
| TC-E2E-07 | Like a Post (Frontend → API) | `POST /api/posts/:id/like` → 200 | Like count increments to 1; UI updates without page refresh | ✅ Pass |
| TC-E2E-08 | Projects Page + AI Tab (Frontend → API → ML) | `GET /api/projects` → 200; `GET /api/users/:id/recommendations` → 200 | Projects tab loads "All Projects" + "For You (AI)" tab; AI recommendations rendered | ✅ Pass |
| TC-E2E-09 | Search Page — Skill Filter | `GET /api/users?q=Python` → 200 | Results show "Aarav Patel", "Dr. Aranya Sen", "E2E Test User" with skill tags | ✅ Pass |
| TC-E2E-10 | Notifications Page | `GET /api/notifications` → 200 | Notifications page loads; no crashes | ✅ Pass |
| TC-E2E-11 | Profile Page | `GET /api/users/me` → 200 | Profile renders "E2E Test User" with correct department (Computer Science) | ✅ Pass |
| TC-E2E-12 | Logout + Redirect | Token cleared client-side | Redirected to `/login`; protected routes inaccessible | ✅ Pass |

### E2E Test Summary
- **Total E2E Tests**: 12
- **Passed**: 12
- **Failed**: 0
- **Services Tested**: Frontend (React/Vite), Backend (Node.js/Express), ML Service (Flask)
- **Key Flows Verified**: Auth, Feed, Post creation, Likes, AI Project Recommendations, User Search, Notifications, Profile, Logout

---

## OVERALL SUMMARY
| Suite | Total | Pass | Fail |
|---|---|---|---|
| Authentication Flow | 4 | 4 | 0 |
| UI & Routing Flow | 4 | 4 | 0 |
| API Endpoints | 4 | 4 | 0 |
| ML Model Integration | 2 | 2 | 0 |
| E2E Frontend↔Backend | 12 | 12 | 0 |
| **Total** | **26** | **26** | **0** |
