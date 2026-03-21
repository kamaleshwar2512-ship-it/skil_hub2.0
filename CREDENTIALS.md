# SKIL Hub — Local Development Credentials

Use these credentials to test the system end-to-end. All mock data is reset whenever you run `npm run init-db` and `npm run seed` in the `server/` directory.

## 1. Access Credentials
**Password for ALL accounts:** `password123`

### Students
| Name | Email | Role | Department |
|---|---|---|---|
| Aarav Patel | `aarav.p@skilhub.edu` | student | Computer Science |
| Isha Sharma | `isha.s@skilhub.edu` | student | Information Technology |
| Rohan Gupta | `rohan.g@skilhub.edu` | student | Electronics and Communication |
| Priya Singh | `priya.s@skilhub.edu` | student | Computer Science |
| Vikram Desai | `vikram.d@skilhub.edu` | student | Mechanical Engineering |

### Faculty
| Name | Email | Role | Department |
|---|---|---|---|
| Dr. Aranya Sen | `a.sen@skilhub.edu` | faculty | Computer Science |
| Prof. Mehta | `r.mehta@skilhub.edu` | faculty | Information Technology |

---

## 2. Service Endpoints

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **ML Service**: [http://localhost:5000](http://localhost:5000)

---

## 3. Testing Tips
1. **Login**: Go to the frontend and use any of the emails above with `password123`.
2. **Post Creation**: Create a general post or an achievement. Achievement creation will trigger the ML service for automatic categorization.
3. **Faculty Features**: Log in as **Dr. Aranya Sen** to endorse student achievements.
4. **Collaboration**: Create a project and use the "Recommendations" feature to see ML-ranked student collaborators.
