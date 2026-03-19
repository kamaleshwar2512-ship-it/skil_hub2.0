"""
ml-service/training/train_classifier.py
Train a simple achievement text classifier and persist artifacts to disk.
"""

import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

from config import (
    SAVED_MODELS_DIR,
    TRAINING_DATA_DIR,
    ACHIEVEMENTS_CSV,
    CLASSIFIER_MODEL_PATH,
    CLASSIFIER_VECTORIZER_PATH,
    ACHIEVEMENT_CATEGORIES,
)


def load_data() -> pd.DataFrame:
    """Load the achievements dataset, or create a tiny demo dataset if missing."""
    if os.path.exists(ACHIEVEMENTS_CSV):
        df = pd.read_csv(ACHIEVEMENTS_CSV)
    else:
        os.makedirs(TRAINING_DATA_DIR, exist_ok=True)
        df = pd.DataFrame(
            [
                {
                    "text": "Won first place at college level hackathon building an IoT project",
                    "category": "hackathon",
                },
                {
                    "text": "Completed AWS cloud practitioner certification with high score",
                    "category": "certification",
                },
                {
                    "text": "Published research paper on deep learning in IEEE conference",
                    "category": "research",
                },
                {
                    "text": "Lead team project to build full stack web app for campus",
                    "category": "project",
                },
                {
                    "text": "Received best student award from department",
                    "category": "award",
                },
                {
                    "text": "Participated in multiple workshops and seminars",
                    "category": "other",
                },
            ]
        )
        df.to_csv(ACHIEVEMENTS_CSV, index=False)
        print(f"[train_classifier] Created demo dataset at {ACHIEVEMENTS_CSV}")

    # Basic cleaning: drop rows with missing values
    df = df.dropna(subset=["text", "category"])
    # Keep only known categories
    df = df[df["category"].isin(ACHIEVEMENT_CATEGORIES)]
    return df


def train():
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

    df = load_data()
    texts = df["text"].astype(str).tolist()
    labels = df["category"].astype(str).tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.2, random_state=42, stratify=labels if len(df) >= 5 else None
    )

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        stop_words="english",
    )
    X_train_vec = vectorizer.fit_transform(X_train)

    model = MultinomialNB()
    model.fit(X_train_vec, y_train)

    if X_test:
        X_test_vec = vectorizer.transform(X_test)
        y_pred = model.predict(X_test_vec)
        print("\n[train_classifier] Evaluation on hold-out set:\n")
        print(classification_report(y_test, y_pred, zero_division=0))

    joblib.dump(model, CLASSIFIER_MODEL_PATH)
    joblib.dump(vectorizer, CLASSIFIER_VECTORIZER_PATH)

    print(f"\n[train_classifier] Saved model to       : {CLASSIFIER_MODEL_PATH}")
    print(f"[train_classifier] Saved vectorizer to : {CLASSIFIER_VECTORIZER_PATH}")


if __name__ == "__main__":
    train()

