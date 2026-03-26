#!/bin/bash

# ==============================================================================
# SKIL Hub — Local Development Run Script (Linux/Mac)
# ==============================================================================
# This script initializes and starts the Backend, ML Service, and Frontend.
# Pre-requisites: Node.js (v18+), Python (v3.9+), npm.
# ==============================================================================

# Exit on any error
set -e

echo "🚀 Starting SKIL Hub local setup..."

# 1. Setup Backend
echo "📦 Setting up Backend Server..."
cd server
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
fi
npm install
echo "🗄️ Initializing and Seeding Database..."
npm run init-db
npm run seed
cd ..

# 2. Setup ML Service
echo "🤖 Setting up ML Service..."
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..

# 3. Setup Frontend
echo "💻 Setting up Frontend Client..."
cd client
npm install
cd ..

echo "✅ Setup complete! Starting services..."

# 4. Start Services in parallel
# We use & to run them in background and trap SIGINT to kill them all on Ctrl+C

cleanup() {
    echo "🛑 Stopping all services..."
    kill $(jobs -p)
    exit
}

trap cleanup SIGINT

echo "📡 Starting ML Service on port 5000..."
cd ml-service
source venv/bin/activate
python app.py &
cd ..

echo "🛠️ Starting Backend Server on port 3000..."
cd server
npm run dev &
cd ..

echo "🌐 Starting Frontend Client on port 5173..."
cd client
npm run dev
