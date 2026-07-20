"""Application configuration from environment variables."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "postgresql://nagarseva:nagarseva@localhost:5432/nagarseva"

    # Gemini AI
    gemini_api_key: str = ""

    # JWT
    jwt_secret: str = "your-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24

    # API
    api_title: str = "NagarSeva API"
    api_description: str = "Civic Grievance Reporting Platform"
    api_version: str = "0.1.0"

    # File uploads
    upload_directory: str = "./uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB

    # CORS
    cors_origins: list = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://nagar-seva-chi.vercel.app",
]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
