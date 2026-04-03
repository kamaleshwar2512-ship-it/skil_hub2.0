# Project File Structure

```text
├── skil 4.0 - linkedin/
│   └── CREDENTIALS.md
│   └── DEVELOPMENT_ROADMAP.md
│   └── PRD_SKIL_HUB.md
│   └── PROJECT_STATE.md
│   └── PROJECT_STRUCTURE.txt
│   └── PROJECT_TREE_DATA.json
│   └── PROJECT_TREE_OVERVIEW.md
│   └── README.md
│   └── REVIEWER_GUIDE.md
│   └── debug_report.md
│   └── generate_structure.py
│   └── project_analysis.md
│   └── run_instructions.md
│   └── run_project.bat
│   └── run_project.sh
│   └── test_cases.md
│   ├── client/
│   │   └── index.html
│   │   └── package-lock.json
│   │   └── package.json
│   │   └── vite.config.js
│   │   ├── src/
│   │   │   └── App.jsx
│   │   │   └── index.css
│   │   │   └── main.jsx
│   │   │   └── test-setup.js
│   │   │   ├── api/
│   │   │   │   └── axiosInstance.js
│   │   │   ├── components/
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   │   └── Layout.jsx
│   │   │   │   └── Navbar.css
│   │   │   │   └── Navbar.jsx
│   │   │   │   └── PostCard.jsx
│   │   │   │   └── PostCreationBox.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │   └── SidebarLeft.jsx
│   │   │   │   └── SidebarRight.jsx
│   │   │   ├── context/
│   │   │   │   └── AuthContext.jsx
│   │   │   │   └── NotificationContext.jsx
│   │   │   ├── pages/
│   │   │   │   └── CreateProjectPage.jsx
│   │   │   │   └── EditProfilePage.jsx
│   │   │   │   └── FeedPage.jsx
│   │   │   │   └── FeedPage.test.jsx
│   │   │   │   └── LoginPage.jsx
│   │   │   │   └── LoginPage.test.jsx
│   │   │   │   └── NotificationsPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   │   └── ProjectDetailPage.jsx
│   │   │   │   └── ProjectsPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   │   └── RegisterPage.test.jsx
│   │   │   │   └── SearchPage.jsx
│   ├── docs/
│   │   └── ML_MODELS.md
│   ├── ml-service/
│   │   └── app.py
│   │   └── config.py
│   │   └── requirements.txt
│   │   ├── models/
│   │   │   └── __init__.py
│   │   │   └── classifier.py
│   │   │   └── recommender.py
│   │   ├── saved_models/
│   │   │   └── classifier.joblib
│   │   │   └── tfidf_classifier.joblib
│   │   │   └── tfidf_recommender.joblib
│   │   ├── training/
│   │   │   └── train_classifier.py
│   │   │   └── train_recommender.py
│   │   │   ├── data/
│   │   │   │   └── achievements.csv
│   │   │   │   └── skills.csv
│   ├── server/
│   │   └── package-lock.json
│   │   └── package.json
│   │   └── posts_dump.json
│   │   ├── database/
│   │   │   └── init.js
│   │   │   └── schema.sql
│   │   │   └── seed.js
│   │   │   └── seed.sql
│   │   │   └── skil_hub.db-shm
│   │   │   └── skil_hub.db-wal
│   │   ├── scripts/
│   │   │   └── verify-ml-integration.js
│   │   ├── src/
│   │   │   └── app.js
│   │   │   ├── config/
│   │   │   │   └── config.js
│   │   │   │   └── database.js
│   │   │   ├── controllers/
│   │   │   │   └── achievement.controller.js
│   │   │   │   └── auth.controller.js
│   │   │   │   └── notification.controller.js
│   │   │   │   └── post.controller.js
│   │   │   │   └── project.controller.js
│   │   │   │   └── user.controller.js
│   │   │   ├── middleware/
│   │   │   │   └── auth.js
│   │   │   │   └── errorHandler.js
│   │   │   │   └── rateLimiter.js
│   │   │   │   └── validate.js
│   │   │   ├── models/
│   │   │   │   └── achievement.model.js
│   │   │   │   └── notification.model.js
│   │   │   │   └── post.model.js
│   │   │   │   └── project.model.js
│   │   │   │   └── user.model.js
│   │   │   ├── routes/
│   │   │   │   └── achievement.routes.js
│   │   │   │   └── auth.routes.js
│   │   │   │   └── notification.routes.js
│   │   │   │   └── post.routes.js
│   │   │   │   └── project.routes.js
│   │   │   │   └── user.routes.js
│   │   │   ├── services/
│   │   │   │   └── ml.service.js
│   │   │   │   └── trending.service.js
│   │   │   ├── utils/
│   │   │   │   └── response.js
│   │   │   ├── __tests__/
│   │   │   │   └── auth.test.js
│   │   │   │   └── health.test.js
│   │   │   │   └── notification.test.js
│   │   │   │   └── post.test.js
│   │   │   │   └── project.test.js
```
