"""
ml-service/training/train_recommender.py
Fit a TF-IDF vectorizer on student skills AND project required_skills for
bi-directional matchmaking (collaborator recommendation + project recommendation).
"""

import os
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib

from config import SAVED_MODELS_DIR, TRAINING_DATA_DIR, SKILLS_CSV, RECOMMENDER_VECTORIZER_PATH


# ─── Demo corpus ──────────────────────────────────────────────────────────────
# Covers both student skill profiles and project required_skills so the shared
# TF-IDF vocabulary can represent both sides of every match.
DEMO_CORPUS = [
    # Student profiles
    {"type": "student", "text": "python machine learning data science numpy pandas scikit-learn"},
    {"type": "student", "text": "react javascript html css frontend ui ux"},
    {"type": "student", "text": "node.js express sql backend rest api"},
    {"type": "student", "text": "python deep learning computer vision tensorflow keras"},
    {"type": "student", "text": "ui ux figma product design adobe xd wireframing"},
    {"type": "student", "text": "java spring boot microservices docker kubernetes"},
    {"type": "student", "text": "data analysis visualization tableau power bi sql"},
    {"type": "student", "text": "android kotlin mobile development firebase"},
    {"type": "student", "text": "ios swift mobile development xcode"},
    {"type": "student", "text": "cybersecurity network security linux penetration testing"},
    {"type": "student", "text": "cloud computing aws azure gcp devops terraform"},
    {"type": "student", "text": "natural language processing nlp transformers huggingface bert"},
    {"type": "student", "text": "embedded systems arduino c c++ firmware iot"},
    {"type": "student", "text": "blockchain solidity ethereum smart contracts web3"},
    {"type": "student", "text": "game development unity c# 3d animation"},
    {"type": "student", "text": "python flask django rest api backend web"},
    {"type": "student", "text": "research paper writing latex academic machine learning"},
    {"type": "student", "text": "sql database design postgresql mongodb data engineering"},
    {"type": "student", "text": "react native cross platform mobile javascript"},
    {"type": "student", "text": "data scraping selenium beautifulsoup python automation"},
    # Project required_skills
    {"type": "project", "text": "python machine learning scikit-learn data analysis"},
    {"type": "project", "text": "react javascript frontend css html web development"},
    {"type": "project", "text": "node.js express backend api sql database"},
    {"type": "project", "text": "python deep learning tensorflow computer vision"},
    {"type": "project", "text": "ui ux design figma prototyping wireframing"},
    {"type": "project", "text": "java spring boot rest api microservices"},
    {"type": "project", "text": "data visualization tableau dashboard sql analytics"},
    {"type": "project", "text": "android kotlin firebase mobile app"},
    {"type": "project", "text": "ios swift xcode mobile development"},
    {"type": "project", "text": "cloud aws devops docker terraform kubernetes"},
    {"type": "project", "text": "nlp python transformers text classification bert"},
    {"type": "project", "text": "embedded c c++ iot sensors arduino"},
    {"type": "project", "text": "blockchain solidity web3 ethereum"},
    {"type": "project", "text": "unity c# game development 3d modeling"},
    {"type": "project", "text": "flask django python web api backend"},
    {"type": "project", "text": "postgresql mongodb database design data engineering"},
    {"type": "project", "text": "react native javascript mobile cross platform"},
    {"type": "project", "text": "python selenium automation web scraping"},
    {"type": "project", "text": "cybersecurity linux network penetration testing"},
    {"type": "project", "text": "machine learning python recommendation system"},
]


def load_data():
    """
    Load the skills dataset from SKILLS_CSV if it exists.
    Falls back to the expanded DEMO_CORPUS so training always succeeds locally.
    """
    if os.path.exists(SKILLS_CSV):
        df = pd.read_csv(SKILLS_CSV)
        if "skills" in df.columns:
            print(f"[train_recommender] Loaded {len(df)} rows from {SKILLS_CSV}")
            return df["skills"].dropna().astype(str).tolist()
        if "text" in df.columns:
            print(f"[train_recommender] Loaded {len(df)} rows from {SKILLS_CSV}")
            return df["text"].dropna().astype(str).tolist()

    # Use demo corpus
    os.makedirs(TRAINING_DATA_DIR, exist_ok=True)
    demo_df = pd.DataFrame(DEMO_CORPUS)
    demo_df.to_csv(SKILLS_CSV, index=False)
    print(f"[train_recommender] Created expanded demo corpus ({len(DEMO_CORPUS)} rows) at {SKILLS_CSV}")
    return [row["text"] for row in DEMO_CORPUS]


def train():
    os.makedirs(SAVED_MODELS_DIR, exist_ok=True)

    corpus = load_data()
    print(f"[train_recommender] Training on {len(corpus)} text samples")

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),   # unigrams + bigrams for multi-word skills
        max_features=5000,
        stop_words="english",
        lowercase=True,       # normalize casing at fit time
        sublinear_tf=True,    # reduce effect of very frequent terms
    )
    vectorizer.fit(corpus)

    joblib.dump(vectorizer, RECOMMENDER_VECTORIZER_PATH)

    vocab_size = len(vectorizer.vocabulary_)
    print(f"[train_recommender] Fitted TF-IDF | vocab size: {vocab_size}")
    print(f"[train_recommender] Saved vectorizer to : {RECOMMENDER_VECTORIZER_PATH}")
    print(f"[train_recommender] Done ✓")


if __name__ == "__main__":
    train()
