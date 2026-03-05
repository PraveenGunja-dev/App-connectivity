@echo off
REM One-step backend setup + run script
REM Usage (from project root):  backend   [in CMD]
REM                             .\backend  [in PowerShell]

setlocal enabledelayedexpansion

REM Change to the backend directory relative to this script
cd /d "%~dp0backend"

echo.
echo ==== Backend setup and start ====

REM 1) Ensure Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not available in PATH.
    echo Install Python and try again.
    goto :end
)

REM 2) Create virtual environment if missing
if not exist ".venv\Scripts\activate.bat" (
    echo [INFO] Creating virtual environment (.venv)...
    python -m venv .venv
)

REM 3) Activate virtual environment
call ".venv\Scripts\activate.bat"

REM 4) Install/upgrade dependencies
if exist "requirements.txt" (
    echo [INFO] Installing dependencies from requirements.txt...
    pip install --upgrade pip >nul
    pip install -r requirements.txt
) else (
    echo [WARN] requirements.txt not found, skipping dependency install.
)

REM 5) Ensure SQLite database exists (run CSV import if missing)
if not exist "db\connectivity.db" (
    echo [INFO] Database not found. Importing CSV data...
    python -m scripts.csv_to_sqlite
) else (
    echo [INFO] Database already exists (db\connectivity.db).
)

REM 6) Start the FastAPI server with uvicorn
echo [INFO] Starting backend server on http://localhost:1581 ...
uvicorn app.main:app --reload --host 0.0.0.0 --port 1581

:end
endlocal
