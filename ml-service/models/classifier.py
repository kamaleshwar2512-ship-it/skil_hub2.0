"""
ml-service/models/classifier.py
Achievement Classification Model
Pipeline: TF-IDF Vectorizer → Multinomial Naive Bayes
"""

import os
import re
import joblib
import numpy as np

from config import CLASSIFIER_MODEL_PATH, CLASSIFIER_VECTORIZER_PATH


class AchievementClassifier:
    """Classifies achievement text into predefined academic categories."""

    def __init__(self):
        self.vectorizer = None
        self.model = None
        self.is_loaded = False

    def _preprocess(self, text: str) -> str:
        """Lowercase and strip special characters from text."""
        text = text.lower()
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def load(self):
        """Load serialized model and vectorizer from disk."""
        if not os.path.exists(CLASSIFIER_MODEL_PATH):
            raise FileNotFoundError(
                f"Classifier model not found at {CLASSIFIER_MODEL_PATH}. "
                "Run: python training/train_classifier.py"
            )
        if not os.path.exists(CLASSIFIER_VECTORIZER_PATH):
            raise FileNotFoundError(
                f"Classifier vectorizer not found at {CLASSIFIER_VECTORIZER_PATH}. "
                "Run: python training/train_classifier.py"
            )
        self.vectorizer = joblib.load(CLASSIFIER_VECTORIZER_PATH)
        self.model = joblib.load(CLASSIFIER_MODEL_PATH)
        self.is_loaded = True

    def predict(self, text: str) -> dict:
        """
        Predict achievement category.
        Returns: { "category": str, "confidence": float }
        """
        if not self.is_loaded:
            self.load()

        processed = self._preprocess(text)
        vec = self.vectorizer.transform([processed])
        prediction = self.model.predict(vec)[0]
        probabilities = self.model.predict_proba(vec)[0]
        confidence = float(np.max(probabilities))

        return {
            "category": prediction,
            "confidence": round(confidence, 4),
        }
