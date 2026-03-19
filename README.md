# SKIL Hub — Student Knowledge Integration Learning Hub

A web-based academic social networking platform for college ecosystems.  
SKIL Hub functions as a **digital academic portfolio** + **collaborative academic social network** — think LinkedIn, but exclusively for academic growth, student achievements, research visibility, and faculty engagement.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Backend | Node.js 20 + Express 4 |
| Database | SQLite 3 (better-sqlite3) |
| ML Service | Python 3.10 + Flask 3 + Scikit-learn |
| Auth | JWT (access + refresh tokens) |

---

## Prerequisites

- **Node.js** 20.x LTS — [nodejs.org](https://nodejs.org)
- **npm** 9.x+ (comes with Node.js)
- **Python** 3.10+ — [python.org](https://python.org)
- **pip** (comes with Python)
- **Git**

---

## Quick Start

### 1. Clone and navigate

```bash
git clone <repo-url>
cd skil-hub
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env and set JWT_SECRET to a strong random string
npm run init-db     # Create SQLite schema
npm run seed        # Load sample data
npm run dev         # Start on http://localhost:3000
```

### 3. Frontend setup (new terminal)

```bash
cd client
npm install
npm run dev         # Start on http://localhost:5173
```

### 4. ML service setup (new terminal)

```bash
cd ml-service
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
python training/train_classifier.py     # Train achievement classifier
python training/train_recommender.py    # Train skill recommender
python app.py                           # Start on http://localhost:5000
```

### 5. Open the app

Navigate to **http://localhost:5173** in your browser.

---

## Project Structure

```
skil-hub/
├── client/         # React + Vite frontend
├── server/         # Node.js + Express backend + SQLite
├── ml-service/     # Python + Flask ML service
└── docs/           # PRD and Development Roadmap
```

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Backend server port |
| `JWT_SECRET` | *(required)* | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | *(required)* | Secret for refresh tokens |
| `ML_SERVICE_URL` | `http://localhost:5000` | ML Flask service URL |
| `NODE_ENV` | `development` | Environment mode |

---

## Running Tests

```bash
# Backend tests
cd server && npm test

# Frontend tests
cd client && npm test

# ML service tests
cd ml-service && pytest
```

---

## Known Limitations & Assumptions

- Designed for a **single college deployment** (multi-institution federation is v2)
- **No file uploads** — images/proofs use external URLs
- ML training data (achievements CSV) should be curated for your college context
- The platform has **no job listings or recruitment features** by design
- All services run locally; no cloud dependencies

---

## Documentation

- [PRD — Product Requirements Document](docs/PRD_SKIL_HUB.md)
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [ML Models — Training & Operations](docs/ML_MODELS.md)
