## SKIL Hub — ML Models (Classifier & Recommender)

This document explains how to **train**, **retrain**, and **run** the Machine Learning models used by SKIL Hub.

The ML service is a separate Flask app in `ml-service/` that exposes:

- `POST /classify-achievement` — classify an achievement into categories (hackathon, certification, research, project, award, other).
- `POST /recommend-collaborators` — recommend collaborators based on project required skills and student skill profiles.

Backend code talks to this service via `server/src/services/ml.service.js` and uses **graceful fallbacks** when the ML service is unavailable.

---

## 1. Directory Layout

```text
ml-service/
├── app.py                 # Flask entrypoint
├── config.py              # Paths & environment config
├── models/
│   ├── classifier.py      # AchievementClassifier wrapper
│   └── recommender.py     # SkillRecommender wrapper
├── training/
│   ├── train_classifier.py
│   └── train_recommender.py
└── saved_models/          # Generated artifacts (.joblib files)
```

Key paths are configured in `ml-service/config.py`:

- `ACHIEVEMENTS_CSV` — training data for the classifier.
- `SKILLS_CSV` — training data for the recommender.
- `SAVED_MODELS_DIR` — output folder for trained models.

---

## 2. Training the Achievement Classifier

Script: `ml-service/training/train_classifier.py`

### 2.1. Input Data

The classifier expects a CSV at `ACHIEVEMENTS_CSV` (see `config.py`), with at least:

- `text` — concatenated achievement title + description.
- `category` — one of:
  - `hackathon`
  - `certification`
  - `research`
  - `project`
  - `award`
  - `other`

If the CSV does **not** exist, the script will create a **small demo dataset** so the service can still run locally.

### 2.2. Training Command

From the repository root:

```bash
cd ml-service
python training/train_classifier.py
```

This will:

- Load / bootstrap the achievements CSV.
- Fit a TF‑IDF vectorizer + Multinomial Naive Bayes model.
- Print a simple classification report (if there is enough data for a split).
- Save artifacts into `saved_models/`:
  - `classifier.joblib`
  - `tfidf_classifier.joblib`

The Flask endpoint `POST /classify-achievement` uses these exact files via `AchievementClassifier`.

---

## 3. Training the Skill Recommender

Script: `ml-service/training/train_recommender.py`

### 3.1. Input Data

The recommender expects a CSV at `SKILLS_CSV`, with at least:

- `user_id` — numeric user identifier (should match the IDs in the SQLite DB).
- `skills`  — free‑text skill string, e.g. `"Python Machine Learning Data Science"`.

If the CSV does **not** exist, the script will create a **small demo dataset**.

### 3.2. Training Command

From the repository root:

```bash
cd ml-service
python training/train_recommender.py
```

This will:

- Load / bootstrap the skills CSV.
- Fit a TF‑IDF vectorizer on the `skills` corpus.
- Save the vectorizer into `saved_models/`:
  - `tfidf_recommender.joblib`

The Flask endpoint `POST /recommend-collaborators` uses this vectorizer via `SkillRecommender`.

---

## 4. Running the ML Service

After installing Python dependencies (see `README.md`), run:

```bash
cd ml-service
python training/train_classifier.py
python training/train_recommender.py
python app.py
```

By default it listens on `http://0.0.0.0:5000` with:

- `GET /health` — health check used by the backend.
- `POST /classify-achievement` — classification endpoint.
- `POST /recommend-collaborators` — recommendation endpoint.

The backend Express server reads `ML_SERVICE_URL` from `server/.env` (see `README.md`) and **degrades gracefully** if the ML service is offline.

---

## 5. Dev / CI Automation (Smoke Training)

For CI or local smoke tests you typically **do not** want to run full training on large datasets. Instead:

1. Ensure small, representative CSVs exist at `ACHIEVEMENTS_CSV` and `SKILLS_CSV` (or rely on the demo data the scripts auto‑generate).
2. Call the training scripts once before starting the ML service.

### 5.1. Example: Local Smoke Training

From the repo root:

```bash
cd ml-service
python training/train_classifier.py
python training/train_recommender.py
```

In a CI pipeline (pseudo‑YAML):

```yaml
- name: Setup ML service
  run: |
    cd ml-service
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python training/train_classifier.py
    python training/train_recommender.py
```

The backend and frontend tests can then assume the ML endpoints are backed by valid (even if tiny) models.

---

## 6. When to Retrain

Retrain and redeploy the models when:

- You have **new labeled achievements** or **updated skill taxonomies**.
- You want to tune categories or improve recommendation quality.
- You are migrating the platform to a **new college** with different data.

Typical retrain flow:

1. Export / curate CSVs at `ACHIEVEMENTS_CSV` and `SKILLS_CSV`.
2. Run the two training scripts locally or in a training environment.
3. Copy new artifacts in `saved_models/` to the ML service deployment.
4. Restart the ML service and monitor `/health` and basic endpoint behaviour.

