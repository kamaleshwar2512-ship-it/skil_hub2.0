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
        self.synonyms = {
            "ml": "machine learning",
            "ai": "artificial intelligence",
            "js": "javascript",
            "py": "python",
            "aws": "amazon web services",
            "gcp": "google cloud platform",
            "azure": "microsoft azure",
            "reactjs": "react",
            "nodejs": "node",
            "backend": "back-end",
            "frontend": "front-end",
        }

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

    def _normalize_tokens(self, tokens):
        """Normalize tokens: lowercase, trim, and expand synonyms."""
        normalized = []
        for t in tokens:
            t = str(t).lower().strip()
            if not t:
                continue
            # Expand synonym if found
            if t in self.synonyms:
                normalized.append(self.synonyms[t])
            else:
                normalized.append(t)
        return sorted(set(normalized))

    def _to_text(self, skills):
        """
        Convert a skill value to a normalized lowercase text string with synonym expansion.
        """
        if isinstance(skills, list):
            tokens = self._normalize_tokens(skills)
            return " ".join(tokens)
        if isinstance(skills, str):
            # Try splitting by comma first, then whitespace
            raw_tokens = skills.replace(",", " ").split()
            tokens = self._normalize_tokens(raw_tokens)
            return " ".join(tokens)
        return ""

    def _get_skill_sets(self, skills):
        """Helper to get a clean set of normalized skills."""
        if isinstance(skills, list):
            return set(self._normalize_tokens(skills))
        if isinstance(skills, str):
            raw_tokens = skills.replace(",", " ").split()
            return set(self._normalize_tokens(raw_tokens))
        return set()

    def _safe_transform(self, texts):
        """
        Transform texts with the fitted vectorizer.
        """
        try:
            return self.vectorizer.transform(texts)
        except Exception:
            # Fallback for dynamic vocab during inference
            return self.vectorizer.fit_transform(texts)

    def _calculate_hybrid_score(self, query_skills, candidate_skills, sim_score):
        """
        Calculate hybrid score: 60% Overlap Ratio + 40% Cosine Similarity.
        Also provides matched and missing skill lists.
        """
        q_set = self._get_skill_sets(query_skills)
        c_set = self._get_skill_sets(candidate_skills)

        if not q_set:
            return 0.0, [], list(c_set)

        matched = list(q_set.intersection(c_set))
        missing = list(q_set - c_set)

        overlap_ratio = len(matched) / len(q_set)
        
        # Hybrid Score = 60% Overlap + 40% Similarity
        final_score = (0.6 * overlap_ratio) + (0.4 * float(sim_score))
        
        return round(final_score, 4), sorted(matched), sorted(missing)

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
        Returns: list[dict] sorted by score desc — 
        [{"user_id": int, "score": float, "matched": [], "missing": []}, ...]
        """
        if not self.is_loaded:
            self.load()

        if exclude_ids is None:
            exclude_ids = set()

        # Deduplicate and filter
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

        sim_scores = cosine_similarity(query_vec, candidate_vecs)[0]

        results = []
        for idx, candidate in enumerate(candidates):
            score, matched, missing = self._calculate_hybrid_score(
                required_skills, candidate["skills"], sim_scores[idx]
            )
            if score > 0:
                results.append({
                    "user_id": candidate["user_id"],
                    "score": score,
                    "matched_skills": matched,
                    "missing_skills": missing
                })

        # Recalculate sort based on hybrid score
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
        Returns: list[dict] sorted by score desc — 
        [{"project_id": int, "score": float, "matched": [], "missing": []}, ...]
        """
        if not self.is_loaded:
            self.load()

        if exclude_project_ids is None:
            exclude_project_ids = set()

        seen = {}
        for p in projects:
            seen[p["project_id"]] = p

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

        sim_scores = cosine_similarity(query_vec, candidate_vecs)[0]

        results = []
        for idx, candidate in enumerate(candidates):
            score, matched, missing = self._calculate_hybrid_score(
                candidate["required_skills"], student_skills, sim_scores[idx]
            )
            if score > 0:
                results.append({
                    "project_id": candidate["project_id"],
                    "score": score,
                    "matched_skills": matched,
                    "missing_skills": missing
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n]
