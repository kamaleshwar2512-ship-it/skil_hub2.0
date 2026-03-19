"""
ml-service/models/recommender.py
Skill-Based Collaborator Recommender
Pipeline: TF-IDF Vectorizer → Cosine Similarity
"""

import os
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from config import RECOMMENDER_VECTORIZER_PATH


class SkillRecommender:
    """Recommends collaborators based on skill similarity using TF-IDF + Cosine Similarity."""

    def __init__(self):
        self.vectorizer = None
        self.is_loaded = False

    def load(self):
        """Load the fitted TF-IDF vectorizer from disk."""
        if not os.path.exists(RECOMMENDER_VECTORIZER_PATH):
            raise FileNotFoundError(
                f"Recommender vectorizer not found at {RECOMMENDER_VECTORIZER_PATH}. "
                "Run: python training/train_recommender.py"
            )
        self.vectorizer = joblib.load(RECOMMENDER_VECTORIZER_PATH)
        self.is_loaded = True

    def recommend(
        self,
        required_skills: list,
        user_skills: list,
        exclude_ids: set = None,
        top_n: int = 10,
    ) -> list:
        """
        Recommend collaborators based on skill match.

        Args:
            required_skills: List of skill strings for the project (e.g., ["Python", "ML"])
            user_skills:     List of dicts: [{ "user_id": int, "skills": "Python ML Data" }, ...]
            exclude_ids:     Set of user IDs to exclude (current team members)
            top_n:           Maximum number of recommendations to return

        Returns:
            List of dicts sorted by score: [{ "user_id": int, "score": float }, ...]
        """
        if not self.is_loaded:
            self.load()

        if exclude_ids is None:
            exclude_ids = set()

        # Filter out excluded users
        candidates = [u for u in user_skills if u["user_id"] not in exclude_ids]
        if not candidates:
            return []

        # Build query string from required skills
        query_text = " ".join(required_skills)

        # Build candidate skill strings
        candidate_texts = [u["skills"] for u in candidates]

        # Vectorize query and candidates together for consistent IDF
        all_texts = [query_text] + candidate_texts
        try:
            tfidf_matrix = self.vectorizer.transform(all_texts)
        except Exception:
            # If vectorizer was fit on a different vocabulary, fall back to fit_transform
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)

        query_vec = tfidf_matrix[0]
        candidate_vecs = tfidf_matrix[1:]

        # Compute cosine similarities
        scores = cosine_similarity(query_vec, candidate_vecs)[0]

        # Build result list
        results = []
        for idx, candidate in enumerate(candidates):
            score = float(scores[idx])
            if score > 0:
                results.append({
                    "user_id": candidate["user_id"],
                    "score": round(score, 4),
                })

        # Sort by score descending and return top N
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n]
