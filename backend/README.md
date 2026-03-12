# Adani App Connectivity – Backend

FastAPI backend for the Adani App Connectivity dashboard.

## First-time setup

Run these steps once from your machine (from the `backend` folder).

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

From the `frontend` directory:

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/`. The backend will serve these files so the whole app runs on one port.

### 5. Data

Report data is sourced from CSV files in `core/db_connection/` (e.g. `Margin.csv`, `Transformation Capacity.csv`). The backend automatically synchronizes these into a SQLite database on startup.

### 6. Start the server (frontend + backend on one port)

From the **backend** directory, run:

```bash
python app.py
```

- **App (dashboard):** [http://localhost:1581](http://localhost:1581)
- **API docs:** [http://localhost:1581/docs](http://localhost:1581/docs)

The backend serves the frontend static build from `frontend/dist/`, so you only need this one server to run the full application.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Login (body: `email`, `password`) |
| GET | `/api/auth/me` | Current user (Bearer token) |
| GET | `/api/reports/csv-raw` | Report grid data for Excel viewer |
| POST | `/api/reports/upload` | Upload PDF (form: `file`) |
| GET | `/api/reports/download/csv` | Download report as CSV |
| GET | `/api/reports/download/xlsx` | Download report as Excel (.xlsx) |

---
© 2026 Adani Group. All rights reserved.
