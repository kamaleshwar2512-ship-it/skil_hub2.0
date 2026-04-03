"""
ml-service/models/recommender.py
Skill-Based Matchmaking — TF-IDF + Cosine Similarity

Provides two public methods:
  - recommend()          : Project → Students (find collaborators for a project)
  - recommend_projects() : Student → Projects (find projects for a student)
"""

import os
import joblib
from sklearn.metrics.pairwise import cosine_similarity

from config import RECOMMENDER_VECTORIZER_PATH


class SkillRecommender:
    """Recommends collaborators or projects based on TF-IDF skill similarity."""

    def __init__(self):
        self.vectorizer = None
        self.is_loaded = False

    # ─── Loading ──────────────────────────────────────────────────────────────

    def load(self):
        """Load the fitted TF-IDF vectorizer from disk."""
        if not os.path.exists(RECOMMENDER_VECTORIZER_PATH):
            raise FileNotFoundError(
                f"Recommender vectorizer not found at {RECOMMENDER_VECTORIZER_PATH}. "
                "Run: python training/train_recommender.py"
            )
        self.vectorizer = joblib.load(RECOMMENDER_VECTORIZER_PATH)
        self.is_loaded = True

    # ─── Helpers ──────────────────────────────────────────────────────────────

    def _to_text(self, skills):
        """
        Convert a skill value to a normalized lowercase text string.
        Accepts:
          - list  : ["Python", "ML"]  → "ml python"
          - str   : "Python ML"       → "ml python"
          - other : anything else     → ""
        """
        if isinstance(skills, list):
            tokens = [str(s).lower().strip() for s in skills if str(s).strip()]
            return " ".join(sorted(set(tokens)))
        if isinstance(skills, str):
            tokens = [t.lower().strip() for t in skills.split() if t.strip()]
            return " ".join(sorted(set(tokens)))
        return ""

    def _safe_transform(self, texts):
        """
        Transform texts with the fitted vectorizer.
        Falls back to fit_transform if vocabulary mismatch occurs (e.g. new skills
        not seen during training).
        """
        try:
            return self.vectorizer.transform(texts)
        except Exception:
            return self.vectorizer.fit_transform(texts)

    # ─── Direction 1: Project → Students ─────────────────────────────────────

    def recommend(
        self,
        required_skills,
        user_skills,
        exclude_ids=None,
        top_n=10,
    ):
        """
        Recommend collaborators for a project.

        Args:
            required_skills : list[str] | str  — project's required skills
            user_skills     : list[dict]        — [{"user_id": int, "skills": str|list}, ...]
            exclude_ids     : set[int]          — user IDs already on the team
            top_n           : int               — max results to return

        Returns:
            list[dict] sorted by score desc — [{"user_id": int, "score": float}, ...]
        """
        if not self.is_loaded:
            self.load()

        if exclude_ids is None:
            exclude_ids = set()

        # Deduplicate input by user_id (last entry wins)
        seen = {}
        for u in user_skills:
            seen[u["user_id"]] = u
        candidates = [u for u in seen.values() if u["user_id"] not in exclude_ids]

        if not candidates:
            return []

        query_text = self._to_text(required_skills)
        if not query_text:
            return []

        candidate_texts = [self._to_text(u["skills"]) for u in candidates]
        all_texts = [query_text] + candidate_texts

        tfidf_matrix = self._safe_transform(all_texts)
        query_vec = tfidf_matrix[0]
        candidate_vecs = tfidf_matrix[1:]

        scores = cosine_similarity(query_vec, candidate_vecs)[0]

        results = []
        for idx, candidate in enumerate(candidates):
            score = float(scores[idx])
            if score > 0:
                results.append({
                    "user_id": candidate["user_id"],
                    "score": round(score, 4),
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n]

    # ─── Direction 2: Student → Projects ─────────────────────────────────────

    def recommend_projects(
        self,
        student_skills,
        projects,
        exclude_project_ids=None,
        top_n=10,
    ):
        """
        Recommend open projects for a student.

        Args:
            student_skills       : list[str] | str — student's skills
            projects             : list[dict]       — [{"project_id": int, "required_skills": str|list}, ...]
            exclude_project_ids  : set[int]         — project IDs the student already owns/joined
            top_n                : int              — max results to return

        Returns:
            list[dict] sorted by score desc — [{"project_id": int, "score": float}, ...]
        """
        if not self.is_loaded:
            self.load()

        if exclude_project_ids is None:
            exclude_project_ids = set()

        # Deduplicate input by project_id (last entry wins)
        seen = {}
        for p in projects:
            seen[p["project_id"]] = p

        # Filter excluded and projects with no required skills
        candidates = [
            p for p in seen.values()
            if p["project_id"] not in exclude_project_ids
            and self._to_text(p.get("required_skills", ""))
        ]

        if not candidates:
            return []

        query_text = self._to_text(student_skills)
        if not query_text:
            return []

        candidate_texts = [self._to_text(p["required_skills"]) for p in candidates]
        all_texts = [query_text] + candidate_texts

        tfidf_matrix = self._safe_transform(all_texts)
        query_vec = tfidf_matrix[0]
        candidate_vecs = tfidf_matrix[1:]

        scores = cosine_similarity(query_vec, candidate_vecs)[0]

        results = []
        for idx, candidate in enumerate(candidates):
            score = float(scores[idx])
            if score > 0:
                results.append({
                    "project_id": candidate["project_id"],
                    "score": round(score, 4),
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n]
