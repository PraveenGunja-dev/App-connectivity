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

### 5. Load the database (from CSV files)

The app uses a SQLite database. The first time (and whenever you update the CSV files), from the `backend` directory run:

```bash
python -m scripts.csv_to_sqlite
```

This reads the four CSV files in the `backend` folder and creates `db/connectivity.db`. You should see output like:

```
Loaded ... rows into data_to_be_captured from ...
Loaded ... rows into margin from ...
Loaded ... rows into element_status from ...
Loaded ... rows into transformation_capacity from ...
Database written to ...\backend\db\connectivity.db
```

### 6. (Optional) Environment variables

For production, copy `.env.example` to `.env` and set `APP_SECRET_KEY` and any other settings.

### 7. Start the server (frontend + backend on one port)

**Option A – Single Python command from `backend` folder (recommended):**

From the backend directory (`D:/App Connectitvity/backend`), run:

```bash
python run_backend.py
```

This will:

- ensure the SQLite database exists (runs `python -m scripts.csv_to_sqlite` if needed)  
- start the FastAPI app with `uvicorn app.main:app --reload --host 0.0.0.0 --port 1581`

**Option B – Single Python command from project root:**

From the project root (`D:/App Connectitvity`), run:

```bash
python run_backend.py
```

This uses the same logic but is launched from one level above `backend/`.

**Option C – From project root (Windows `.cmd` helper):**

From the project root, run:

```bash
backend
```

This runs `backend.cmd`, which performs setup and starts the same uvicorn server.

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

## Database (SQLite)

The script in step 4 imports these CSVs into `db/connectivity.db`:

| Table | Source CSV |
|-------|------------|
| `data_to_be_captured` | 42nd_34th_CMETS_Extracted_Data_VoltageFix 1 1(Data to be captured).csv |
| `margin` | Connectivity_Application_Data_TEST_ALL_SHEETS38 (2) 6(Margin).csv |
| `element_status` | 42nd_34th_CMETS_Extracted_Data_VoltageFix 1 1(Element Status).csv |
| `transformation_capacity` | Connectivity_Application_Data_TEST_ALL_SHEETS39 6(Transformation Capacity).csv |

Re-run `python -m scripts.csv_to_sqlite` after changing any CSV to refresh the database.

**Custom frontend path:** Set `APP_FRONTEND_DIST` to an absolute path if the frontend build is not at `../frontend/dist` relative to the backend directory.
