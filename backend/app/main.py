from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import settings
from app.routers import auth, reports

# Frontend build directory (for single-port serving)
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_FRONTEND_DIST = (
    Path(settings.frontend_dist)
    if settings.frontend_dist
    else _BACKEND_DIR.parent / "frontend" / "dist"
)

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


def _serve_frontend(path: str) -> FileResponse | None:
    """Serve a file from frontend dist, or None if not found."""
    if ".." in path or path.startswith("/"):
        return None
    file_path = _FRONTEND_DIST / path
    if file_path.is_file():
        return FileResponse(file_path)
    return None


@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    """Serve frontend static files or index.html for SPA routing."""
    if full_path == "api" or full_path.startswith("api/"):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not Found")
    # Try to serve static file
    response = _serve_frontend(full_path)
    if response is not None:
        return response
    # SPA fallback: serve index.html
    index_path = _FRONTEND_DIST / "index.html"
    if index_path.is_file():
        return FileResponse(index_path)
    # No frontend build: return minimal API info (dev without frontend build)
    from fastapi.responses import JSONResponse
    return JSONResponse(
        content={
            "message": "Adani App Connectivity API",
            "docs": "/docs",
            "health": "/health",
            "hint": "Build the frontend (npm run build in frontend/) and restart to serve the app.",
        },
        status_code=404,
    )
