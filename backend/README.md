# Adani App Connectivity – Backend

FastAPI backend for the Adani App Connectivity dashboard.

## First-time setup

Run these steps once from your machine (from the project root or the `backend` folder).

### 1. Go to the backend directory

```bash
cd backend
```

### 2. Create and activate a virtual environment

**Windows (PowerShell or CMD):**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
python -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Build the frontend (one-time)

From the **project root** (parent of `backend` and `frontend`):

```bash
cd frontend
npm install
npm run build
cd ..
```

This creates `frontend/dist/`. The backend will serve these files so the whole app runs on one port.

### 5. Load the database (PostgreSQL)

The app now uses a PostgreSQL database. Ensure PostgreSQL is installed and accessible in your system.

Create a `.env` file in the `backend/` directory using your credentials:
```env
APP_DATABASE_URL="postgresql://postgres:password@localhost:5432/App Connectivity"
APP_DB_USER="postgres"
APP_DB_PASSWORD="password"
APP_DB_HOST="localhost"
APP_DB_PORT="5432"
APP_DB_NAME="App Connectivity"
```

To load your initial data from the SQL dump, from the project root directory run:
```bash
psql -U postgres -d "App Connectivity" -f sqlite_dump.sql
```
This loads all CSV-derived data directly into the tables required by the backend.

### 6. (Optional) Environment variables

For production, copy `.env.example` to `.env` and set `APP_SECRET_KEY` and any other settings.

### 7. Start the server (frontend + backend on one port)

**Method A – Python Launcher (Recommended):**

From the **backend** directory, run:

```bash
python start.py
```

**Method B – Windows Command Helper:**

From the project root, run:

```bash
backend.cmd
```

This script performs setup and starts the FastAPI server on port 1581.

**Option D – Manually from the `backend` directory:**

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 1581
```

- **App (dashboard):** http://localhost:1581  
- **API docs:** http://localhost:1581/docs  
- **Health:** http://localhost:1581/health  

The backend serves the frontend static build from `frontend/dist/`, so you only need this one server to run the full application.  

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Login (body: `email`, `password`) |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/reports/data` | Report grid data for Excel viewer |
| POST | `/api/reports/upload` | Upload PDF (form: `file`) |
| GET | `/api/reports/download/csv` | Download report as CSV |

CORS is enabled for `http://localhost:5173` (Vite dev server) by default.

## Database (PostgreSQL)

The table imports are driven by the new PostgreSQL structure:

| Table |
|-------|
| `data_to_be_captured` |
| `margin` |
| `element_status` |
| `transformation_capacity` |

Re-run the `psql` command after changing your SQL dump to refresh the database.

**Custom frontend path:** Set `APP_FRONTEND_DIST` to an absolute path if the frontend build is not at `../frontend/dist` relative to the backend directory.
