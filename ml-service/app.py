"""
ml-service/app.py
SKIL Hub — ML Service (Flask)
Exposes REST endpoints for achievement classification and collaborator recommendation.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import HOST, PORT, DEBUG, SAVED_MODELS_DIR
from models.classifier import AchievementClassifier
from models.recommender import SkillRecommender

# ─── App Setup ──────────────────────────────────────────────
app = Flask(__name__)
CORS(app)  # Internal service — CORS open (Express backend calls this, not browser)

# ─── Lazy Model Instances ────────────────────────────────────
# Models load from disk on first request and are cached in memory
_classifier = None
_recommender = None


def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = AchievementClassifier()
        _classifier.load()
    return _classifier


def get_recommender():
    global _recommender
    if _recommender is None:
        _recommender = SkillRecommender()
        _recommender.load()
    return _recommender


# ─── Health Check ────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    models_ready = os.path.isdir(SAVED_MODELS_DIR) and bool(os.listdir(SAVED_MODELS_DIR))
    return jsonify({
        "status": "ok",
        "service": "skil-hub-ml",
        "models_ready": models_ready,
    })


# ─── Achievement Classification ──────────────────────────────
@app.route("/classify-achievement", methods=["POST"])
def classify_achievement():
    """
    Request body: { "text": "Achievement title and description combined" }
    Response:     { "category": "hackathon", "confidence": 0.87 }
    """
    data = request.get_json(silent=True)
    if not data or "text" not in data:
        return jsonify({"error": "Missing required field: text"}), 400

    text = str(data["text"]).strip()
    if not text:
        return jsonify({"error": "Text cannot be empty"}), 400

    try:
        classifier = get_classifier()
        result = classifier.predict(text)
        return jsonify(result)
    except FileNotFoundError:
        # Models not trained yet — return graceful fallback
        return jsonify({
            "category": "other",
            "confidence": 0.0,
            "warning": "Models not trained yet. Run training scripts first.",
        })
    except Exception as e:
        app.logger.error(f"Classification error: {e}")
        return jsonify({"error": "Classification failed", "detail": str(e)}), 500


# ─── Collaborator Recommendation ──────────────────────────────
@app.route("/recommend-collaborators", methods=["POST"])
def recommend_collaborators():
    """
    Request body:
    {
      "required_skills": ["Python", "ML"],
      "user_skills": [
        { "user_id": 1, "skills": "Python Machine Learning Data Analysis" },
        { "user_id": 2, "skills": "Web Development React JavaScript" }
      ],
      "exclude_user_ids": [5],
      "top_n": 10
    }
    Response: { "recommendations": [{ "user_id": 1, "score": 0.82 }, ...] }
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400

    required_skills = data.get("required_skills", [])
    user_skills = data.get("user_skills", [])
    exclude_ids = set(data.get("exclude_user_ids", []))
    top_n = int(data.get("top_n", 10))

    if not required_skills:
        return jsonify({"recommendations": []})

    if not user_skills:
        return jsonify({"recommendations": []})

    try:
        recommender = get_recommender()
        recommendations = recommender.recommend(
            required_skills=required_skills,
            user_skills=user_skills,
            exclude_ids=exclude_ids,
            top_n=top_n,
        )
        return jsonify({"recommendations": recommendations})
    except FileNotFoundError:
        return jsonify({
            "recommendations": [],
            "warning": "Recommender model not trained yet. Run training scripts first.",
        })
    except Exception as e:
        app.logger.error(f"Recommendation error: {e}")
        return jsonify({"error": "Recommendation failed", "detail": str(e)}), 500


# ─── Entry Point ─────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n🤖 SKIL Hub ML Service")
    print(f"   Listening on  : http://{HOST}:{PORT}")
    print(f"   Health check  : http://{HOST}:{PORT}/health\n")
    app.run(host=HOST, port=PORT, debug=DEBUG)
