"""
ml-service/training/train_recommender.py
Fit a TF-IDF vectorizer on student skills for collaborator recommendations.
"""

import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

from config import SAVED_MODELS_DIR, TRAINING_DATA_DIR, SKILLS_CSV, RECOMMENDER_VECTORIZER_PATH


def load_data() -> pd.DataFrame:
    """Load the skills dataset, or create a tiny demo dataset if missing."""
    if os.path.exists(SKILLS_CSV):
        df = pd.read_csv(SKILLS_CSV)
    else:
        os.makedirs(TRAINING_DATA_DIR, exist_ok=True)
        df = pd.DataFrame(
            [
                {"user_id": 1, "skills": "Python Machine Learning Data Science"},
                {"user_id": 2, "skills": "React JavaScript HTML CSS Frontend"},
                {"user_id": 3, "skills": "Node.js Express SQL Backend"},
                {"user_id": 4, "skills": "Python Deep Learning Computer Vision"},
                {"user_id": 5, "skills": "UI UX Figma Product Design"},
            ]
        )
        df.to_csv(SKILLS_CSV, index=False)
        print(f"[train_recommender] Created demo dataset at {SKILLS_CSV}")

    df = df.dropna(subset=["skills"])
    return df


def train():
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

    df = load_data()
    corpus = df["skills"].astype(str).tolist()

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        stop_words="english",
    )
    vectorizer.fit(corpus)

    joblib.dump(vectorizer, RECOMMENDER_VECTORIZER_PATH)

    print(f"\n[train_recommender] Fitted TF-IDF on {len(corpus)} skill rows")
    print(f"[train_recommender] Saved vectorizer to : {RECOMMENDER_VECTORIZER_PATH}")


if __name__ == "__main__":
    train()

