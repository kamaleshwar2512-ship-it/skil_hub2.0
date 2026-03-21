# Run Instructions — SKIL Hub

To run the complete SKIL Hub ecosystem locally, you must start three separate servers. All commands are executed relative to the root project directory.

## Prerequisite Checks
1. **Node.js**: v18+ required.
2. **Python**: v3.10+ required.
3. Ensure `.env` is properly configured inside the `server/` directory.

---

### Step 1: Start the ML Service
The ML service provides AI categorization and recommendations. It must be running for the backend to communicate successfully.

1. Open a new terminal.
2. Navigate to the ML service directory:
   ```bash
   cd ml-service
   ```
3. Activate the virtual environment:
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`
4. Run the Flask server:
   ```bash
   python app.py
   ```
   *The server will start on `http://127.0.0.1:5000`.*

---

### Step 2: Start the Backend (Node.js API)
The backend hosts the SQLite database and the primary REST API.

1. Open a new terminal.
2. Navigate to the server directory:
   ```bash
   cd server
   ```
3. Initialize/seed the database (if running for the very first time):
   ```bash
   npm run init-db
   npm run seed
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:3000`. You can verify it is healthy by visiting `http://localhost:3000/api/health`.*

---

### Step 3: Start the Frontend (React / Vite)
1. Open a new terminal.
2. Navigate to the client directory:
   ```bash
   cd client
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will open at `http://localhost:5173`. The Vite proxy is pre-configured to automatically forward `/api` requests to the Node backend on port 3000.*

---

### Verifying Successful Startup
1. Open your browser and navigate to `http://localhost:5173`.
2. Register a new user using a `.edu` email address (`test.edu` configured by default in `.env`).
3. You should be securely redirected to the Feed upon login.
