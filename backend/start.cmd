@echo off
REM One-step backend setup + run script
REM Usage (from backend folder):  .\start  [in PowerShell/CMD]

setlocal enabledelayedexpansion

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

REM 5) Start the FastAPI server with uvicorn
echo [INFO] Starting backend server on http://localhost:1581 ...
uvicorn app:app --reload --host 0.0.0.0 --port 1581

:end
endlocal
