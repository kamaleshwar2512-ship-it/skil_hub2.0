@echo off
:: ==============================================================================
:: SKIL Hub — Local Development Run Script (Windows)
:: ==============================================================================
:: This script initializes and starts the Backend, ML Service, and Frontend.
:: Pre-requisites: Node.js (v18+), Python (v3.9+), npm.
:: ==============================================================================

echo 🚀 Starting SKIL Hub local setup...

:: 1. Setup Backend
echo 📦 Setting up Backend Server...
cd server
if not exist .env (
    echo 📄 Creating .env file from .env.example...
    copy .env.example .env
)
call npm install
echo 🗄️ Initializing and Seeding Database...
call npm run init-db
call npm run seed
cd ..

:: 2. Setup ML Service
echo 🤖 Setting up ML Service...
cd ml-service
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
cd ..

:: 3. Setup Frontend
echo 💻 Setting up Frontend Client...
cd client
call npm install
cd ..

echo ✅ Setup complete! Starting services in separate windows...

:: 4. Start Services
:: We use 'start' to open each service in a new command prompt window

echo 📡 Starting ML Service on port 5000...
start "SKIL Hub — ML Service" cmd /k "cd ml-service && venv\Scripts\activate.bat && python app.py"

echo 🛠️ Starting Backend Server on port 3000...
start "SKIL Hub — Backend Server" cmd /k "cd server && npm run dev"

echo 🌐 Starting Frontend Client on port 5173...
start "SKIL Hub — Frontend Client" cmd /k "cd client && npm run dev"

echo ✨ All services are starting. Please wait for the 'Ready' messages in the new windows.
echo 💡 To stop, simply close the opened command windows.
pause
