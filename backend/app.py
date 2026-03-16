from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from src.config.config import settings
from src.routes import auth, reports
import subprocess
import sys

# --- Self-Bootstrapping Database Logic ---
def ensure_database():
    """Create the SQLite database from CSVs if it does not exist."""
    backend_dir = Path(__file__).resolve().parent
    db_path = backend_dir / "core" / "db_connection" / "connectivity.db"
    
    if not db_path.exists():
        print("[INFO] Database not found. Importing CSV data...")
        try:
            subprocess.run(
                [sys.executable, "-m", "src.utils.csv_to_sqlite"],
                cwd=str(backend_dir),
                check=True,
            )
        except Exception as e:
            print(f"[ERROR] Failed to initialize database: {e}")

ensure_database()
# -----------------------------------------

# Frontend build directory (for single-port serving with /app-connectivity base path)
_BACKEND_DIR = Path(__file__).resolve().parent
_FRONTEND_DIST = (
    Path(settings.frontend_dist)
    if settings.frontend_dist
    else _BACKEND_DIR.parent / "frontend" / "dist"
)
_APP_CONNECTIVITY_PREFIX = "app-connectivity"

app = FastAPI(
    title=settings.app_name,
    description="API for Adani App Connectivity dashboard.",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/health")
def health() -> dict:
    """Health check for load balancers and monitoring."""
    return {"status": "ok", "service": "adani-app-connectivity-api"}


@app.get("/")
def root_redirect():
    """Redirect root path to /app-connectivity/."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/app-connectivity/")


@app.get("/app-connectivity/{full_path:path}")
@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    """Serve frontend static files or index.html for SPA routing.
    
    This handler covers:
    1. Direct requests for files in /assets/ or /fonts/ (at root or under prefix)
    2. Requests for index.html under the prefix
    3. SPA routing fallbacks (return index.html)
    """
    # 1. Protection: do not serve index.html for unknown API routes
    if full_path.startswith("api/") or full_path == "api":
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="API route not found")
    
    # 2. Extract the relative path from the dist folder
    # Handle cases with and without the app-connectivity prefix
    rel_path = full_path
    if rel_path.startswith(_APP_CONNECTIVITY_PREFIX + "/"):
        rel_path = rel_path[len(_APP_CONNECTIVITY_PREFIX) + 1:]
    elif rel_path == _APP_CONNECTIVITY_PREFIX:
        rel_path = ""
    
    # Clean up slashes
    rel_path = rel_path.strip("/").strip("\\")
    
    # 3. If path is empty (it was just the prefix or it's root), check for index.html
    if not rel_path:
        index_path = _FRONTEND_DIST / "index.html"
        if index_path.is_file():
            return FileResponse(index_path)
    
    # 4. Try to serve specific file from dist folder (assets, fonts, etc.)
    file_path = _FRONTEND_DIST / rel_path
    if file_path.is_file():
        return FileResponse(file_path)
    
    # 5. SPA Fallback: If the path doesn't look like a file (no extension) 
    # or if it's under the app-connectivity prefix, serve index.html
    # This allows React Router to handle the URL client-side.
    if "." not in rel_path or full_path.startswith(_APP_CONNECTIVITY_PREFIX):
        index_path = _FRONTEND_DIST / "index.html"
        if index_path.is_file():
            return FileResponse(index_path)
    
    # 6. Final fallback: Return API info or 404
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content={
            "message": "Adani App Connectivity",
            "docs": "/docs",
            "app": "/app-connectivity/",
            "hint": "Ensure the frontend is built: 'npm run build' in frontend directory.",
        },
        status_code=404,
    )


if __name__ == "__main__":
    import uvicorn
    print("[INFO] Starting backend on http://localhost:1581 ...")
    uvicorn.run("app:app", host="0.0.0.0", port=1581, reload=True)
