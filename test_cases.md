# Test Cases — SKIL Hub

## AUTHENTICATION FLOW
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-AUTH-01 | Register a new user | Valid email, password, name | Returns 201 Created and user object | Returns 201 Created | ✅ Pass |
| TC-AUTH-02 | Login with valid credentials | Registered email and password | Returns 200 OK + JWT access token | Returns 200 OK + token | ✅ Pass |
| TC-AUTH-03 | Login with invalid credentials | Incorrect password | Returns 401 Unauthorized "Invalid email or password" | Returns 401 Unauthorized | ✅ Pass |
| TC-AUTH-04 | Access protected route without token | Call `/api/posts` without headers | Returns 401 Unauthorized "Token required" | Returns 401 Unauthorized | ✅ Pass |

## UI & ROUTING FLOW
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-UI-01 | Navigate to Register page | URL `/register` | Registration form renders | Registration renders | ✅ Pass |
| TC-UI-02 | Redirect authenticated user to Feed | Visit `/login` with valid session | Auto-redirects to `/feed` | Redirects to `/feed` | ✅ Pass |
| TC-UI-03 | Render Feed with Posts | Load `/feed` | Posts list rendered without crashing | Blank screen (React runtime error) | ❌ Fail |
| TC-UI-04 | Logout behavior | Click "Sign Out" from Profile dropdown | Clears token, redirects to `/login` | Navigates to `/login` smoothly | ✅ Pass |

## API ENDPOINTS
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-API-01 | Health Check | `GET /api/health` | HTTP 200, status "ok" | HTTP 200, `database: {ok: true}` | ✅ Pass |
| TC-API-02 | Fetch Feed Posts | `GET /api/posts?sort=recent` | Returns array of post objects | Returns valid JSON array of posts | ✅ Pass |
| TC-API-03 | Create Post | `POST /api/posts` with valid `content` | Returns 201 Created, post object | Returns 201 Created | ✅ Pass |
| TC-API-04 | Like Post | `POST /api/posts/1/like` | HTTP 200 "Post liked", trigger Notif. | HTTP 200 "Post liked" | ✅ Pass |

## ML MODEL INTEGRATION
| Test Case ID | Description | Input | Expected Output | Actual Output | Status |
|---|---|---|---|---|---|
| TC-ML-01 | Flask Health Check | `GET http://localhost:5000/health` | Returns status "ok" | HTTP 200, status "ok" | ✅ Pass |
| TC-ML-02 | Fallback on ML Timeout | Add achievement while ML server is down | Uses default category mapping without crashing | Saves achievement normally | ✅ Pass |
