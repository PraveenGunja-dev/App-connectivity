from __future__ import annotations

import subprocess
import sys
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent
DB_PATH = BACKEND_DIR / "core" / "db_connection" / "connectivity.db"


def ensure_database() -> None:
    """Create the SQLite database from CSVs if it does not exist."""
    if DB_PATH.exists():
        print(f"[INFO] Database already exists: {DB_PATH}")
        return

    print("[INFO] Database not found. Importing CSV data...")
    subprocess.run(
        [sys.executable, "-m", "scripts.csv_to_sqlite"],
        cwd=str(BACKEND_DIR),
        check=True,
    )


def start_uvicorn() -> None:
    """Start the FastAPI app with uvicorn."""
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "1581",
    ]
    print("[INFO] Starting backend on http://localhost:1581 ...")
    subprocess.run(cmd, cwd=str(BACKEND_DIR), check=True)


def main() -> None:
    print("==== Running backend (Python launcher) ====")
    print(f"[INFO] Using Python: {sys.executable}")
    print(f"[INFO] Backend directory: {BACKEND_DIR}")

    ensure_database()
    start_uvicorn()


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(f"[ERROR] Command failed with exit code {exc.returncode}")
        sys.exit(exc.returncode)
    except KeyboardInterrupt:
        print("\n[INFO] Backend server stopped by user.")
        sys.exit(0)
    except Exception as exc:  # pragma: no cover - generic guard
        print(f"[ERROR] Unexpected error: {exc}")
        sys.exit(1)

