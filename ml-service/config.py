"""
ml-service/config.py
Configuration for the SKIL Hub ML Service.
"""
import os

# Service settings
HOST = os.getenv("ML_HOST", "0.0.0.0")
PORT = int(os.getenv("ML_PORT", 5000))
DEBUG = os.getenv("ML_DEBUG", "true").lower() == "true"

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SAVED_MODELS_DIR = os.path.join(BASE_DIR, "saved_models")
TRAINING_DATA_DIR = os.path.join(BASE_DIR, "training", "data")

# Model file names
CLASSIFIER_MODEL_PATH = os.path.join(SAVED_MODELS_DIR, "classifier.joblib")
CLASSIFIER_VECTORIZER_PATH = os.path.join(SAVED_MODELS_DIR, "tfidf_classifier.joblib")
RECOMMENDER_VECTORIZER_PATH = os.path.join(SAVED_MODELS_DIR, "tfidf_recommender.joblib")

# Training data files
ACHIEVEMENTS_CSV = os.path.join(TRAINING_DATA_DIR, "achievements.csv")
SKILLS_CSV = os.path.join(TRAINING_DATA_DIR, "skills.csv")

# Achievement categories
ACHIEVEMENT_CATEGORIES = [
    "hackathon",
    "certification",
    "research",
    "project",
    "award",
    "other",
]
