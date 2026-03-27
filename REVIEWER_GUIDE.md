# SKIL Hub 2.0 — Reviewer's Guide & Proof of Work

> **Project Name:** SKIL Hub (Student Knowledge Integration Learning Hub)  
> **Prepared for:** Project Reviewer / Mentor  
> **Date:** March 27, 2026

---

## 🚀 1. Executive Summary
**SKIL Hub** is a professional academic social networking platform designed for college ecosystems. It replicates the core value of LinkedIn but focuses entirely on **academic growth**, **research collaboration**, and **achievement visibility**.

### **Key Value Proposition**
- **Unified Portfolio**: Students can showcase hackathons, research, and skills in one place.
- **AI-Powered Insights**: Achievements are automatically categorized using Machine Learning.
- **Smart Collaboration**: ML matching helps find the best teammates for academic projects.

---

## 🏗️ 2. System Architecture
The project follows a modular **Three-Tier Architecture**:

1.  **Frontend (React + Vite)**: A dynamic SPA using modern React hooks and Context API for global state.
2.  **Backend (Node.js + Express)**: A RESTful API that handles authentication (JWT), database operations (SQLite), and bridges the core application with the ML service.
3.  **ML Service (Python + Flask)**: A dedicated service for AI inference, utilizing `scikit-learn` for text classification and similarity matching.

---

## ✅ 3. Functional Proof (AI in Action)
You can directly verify the intelligence of the platform by running these terminal commands (PowerShell) while the services are active.

### **Proof 1: AI Achievement Classification**
This command tests the **Multinomial Naive Bayes** model. It takes raw text and predicts the academic category.
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/classify-achievement" `
  -Body (@{text="I won the first prize in the national level AI hackathon for sustainable energy."} | ConvertTo-Json) `
  -ContentType "application/json"
```
**Expected Outcome**: The AI should return `category: "award"` or `"hackathon"` with a confidence score.

### **Proof 2: Skill-Based Collaborator Matching**
This tests the **Cosine Similarity** engine. It compares project requirements against the user skill database.
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5000/recommend-collaborators" `
  -Body (@{required_skills=@("Python", "ML"); user_skills=@(@{user_id=1; skills="Python Machine Learning Data Analysis"})} | ConvertTo-Json) `
  -ContentType "application/json"
```
**Expected Outcome**: A ranked list of matching users with similarity scores.

---

## 📊 4. Database & Backend Proof
The project uses **SQLite 3**, a file-based relational database, making it fully portable and local-hostable.

- **Seeded Data**: On initialization (`run_project.bat`), the database is automatically seeded with sample profiles, posts, and achievements.
- **Security**: All user passwords are encrypted using **bcrypt**.
- **State Management**: Authentication is handled via **JWT (JSON Web Tokens)** with persistent login sessions.

---

## 🖥️ 5. Visual Walkthrough (Browser Guide)
Navigate to `http://localhost:5173` to verify these UI modules:

1.  **The Navbar**: Look at the "SKIL Hub" branding and the global search bar.
2.  **Home Feed**: View trending academic posts. Like or comment to see real-time engagement updates.
3.  **My Profile**: Click the "Me" icon → "View Profile". Here you can see your academic achievements and skills tags.
4.  **Projects**: Browse or create projects to see the suggestion engine in action.

---

## 🛠️ 6. Technology Stack Proof
| Layer | Core Technologies |
|---|---|
| **Frontend** | React 18, Vite, CSS (Flexbox/Grid), React Router |
| **Backend** | Node.js, Express, better-sqlite3, JWT, bcrypt |
| **Machine Learning** | Python 3.10, Flask, Scikit-learn (TF-IDF, Naive Bayes) |

---

### **Conclusion**
This project demonstrates a complete end-to-end integration of **Web Development** and **Machine Learning**, providing a production-ready institutional tool that is both functional and secure.
