"""Main FastAPI application."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, SessionLocal
from app.init_db import seed_departments_and_issues
from app.routes import auth, complaints
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
)


# Startup event to seed database
@app.on_event("startup")
def startup_event():
    """Seed database on startup."""
    db = SessionLocal()
    try:
        seed_departments_and_issues(db)
    finally:
        db.close()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(complaints.router)

# Global error handlers
@app.exception_handler(404)
async def not_found_exception_handler(request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={"detail": "Resource not found"},
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "message": "NagarSeva API",
        "status": "healthy",
        "version": settings.api_version,
    }


@app.get("/health")
def health():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
