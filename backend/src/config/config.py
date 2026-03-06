from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    app_name: str = "Adani App Connectivity API"
    debug: bool = False
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    # CORS
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Uploads
    upload_dir: str = "uploads"
    max_upload_mb: int = 10
    # Frontend static files (optional; default: ../frontend/dist relative to backend)
    frontend_dist: str | None = None
    
    # Database
    database_url: str = "sqlite:///core/db_connection/connectivity.db"
    db_user: str = "postgres"
    db_password: str = "password"
    db_host: str = "localhost"
    db_port: str = "5432"
    db_name: str = "App Connectivity"

    class Config:
        env_prefix = "APP_"
        env_file = ".env"


settings = Settings()
