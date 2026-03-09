# Adani App Connectivity

Professional dashboard for monitoring and managing app connectivity across the Adani ecosystem.

## Features

- **Dynamic Personalized Dashboard**: Real-time overview of business metrics.
- **Excel Viewer**: Interactive spreadsheet-like grid for data analysis and reporting.
- **KPI Monitoring**: Tracking Total Revenue, Active Users, and Order statuses.
- **Reporting**: Advanced charts and data visualization for business insights.
- **Secure Access**: Protected routes with session management.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: FastAPI (Python)
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: shadcn/ui, Lucide React
- **Data**: SQLite (from CSV import), TanStack Query

## Running the application (single port)

The app runs on **one port**: the backend serves both the API and the frontend static build.

### First-time setup

1. **Backend** (Python venv, dependencies, DB, frontend build):

   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate          # Windows
   # source .venv/bin/activate     # macOS/Linux
   pip install -r requirements.txt
   ```

2. **Frontend build** (one-time; from project root):

   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

3. **Database Setup** (PostgreSQL):
   
   Ensure PostgreSQL is installed and added to your system PATH.
   Create a `.env` file in the `backend/` directory referencing your local database:
   ```env
   APP_DATABASE_URL="postgresql://postgres:password@localhost:5432/App Connectivity"
   APP_DB_USER="postgres"
   APP_DB_PASSWORD="password"
   APP_DB_HOST="localhost"
   APP_DB_PORT="5432"
   APP_DB_NAME="App Connectivity"
   ```
   Load the data from the SQL dump into your Postgres database (make sure you create the empty database first):
   ```bash
   psql -U postgres -d "App Connectivity" -f sqlite_dump.sql
   ```

### Run the app

From the **backend** directory:

```bash
cd backend
python start.py
```

Then open **http://localhost:1581** for the dashboard. API docs: http://localhost:1581/docs  

No need to run the frontend dev server; the backend serves the built frontend.

---

## Project structure

```text
├── backend/           # FastAPI app, serves API + frontend static files
│   ├── app/
│   ├── db/            # SQLite database (created by scripts)
│   └── scripts/       # e.g. csv_to_sqlite.py
├── frontend/          # React + Vite app (build output in dist/)
│   ├── src/
│   └── dist/          # Built files (served by backend)
└── README.md
```

See **backend/README.md** for detailed backend setup, endpoints, and database tables.

## Frontend-only development

To run the frontend dev server (hot reload) separately:

```bash
cd frontend
npm install
npm run dev
```

Use the backend on port 8000 for API calls (see backend README for CORS).

---
© 2026 Adani Group. All rights reserved.
