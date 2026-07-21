"""Complaint routes."""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Header
from sqlalchemy.orm import Session, selectinload
import os
import shutil
from pathlib import Path
from typing import Optional

from app.database import get_db
from app.config import settings
from app.auth import decode_token
from app.models import Complaint
from app.schemas.complaint import ComplaintResponse, DashboardStats, ComplaintUpdate
from app.services.complaint_service import ComplaintService
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# Initialize AI service
ai_service = AIService()


def get_current_user(authorization: str = Header(None)) -> int:
    """Extract user ID from JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")

    try:
        scheme, token = authorization.split()

        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")

        token_data = decode_token(token)

        if token_data is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return token_data.user_id

    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")


# Create uploads directory if it doesn't exist
os.makedirs(settings.upload_directory, exist_ok=True)


@router.post("/create", response_model=ComplaintResponse)
async def create_complaint(
    location_lat: float = Form(...),
    location_lon: float = Form(...),
    location_address: str = Form(None),
    description: str = Form(...),
    image: UploadFile = File(None),
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new complaint with optional image upload."""

    image_path = None
    detected_issue = None
    risk_level = None

    if image:
        try:
            # Create uploads folder if it doesn't exist
            os.makedirs(settings.upload_directory, exist_ok=True)

            # Save image with unique filename
            filename = f"{user_id}_{image.filename}"
            file_path = Path(settings.upload_directory) / filename

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)

            # Store RELATIVE path in database
            image_path = f"uploads/{filename}"

            # AI analysis
            analysis = ai_service.analyze_image(str(file_path))
            detected_issue = analysis.detected_issue
            risk_level = analysis.risk_level

        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Image upload failed: {str(e)}"
            )

    try:
        complaint = ComplaintService.create_complaint(
            db=db,
            user_id=user_id,
            location_lat=location_lat,
            location_lon=location_lon,
            location_address=location_address,
            description=description,
            image_path=image_path,
            detected_issue=detected_issue,
            risk_level=risk_level,
        )

        # Load relationships before returning
        complaint.images
        complaint.history

        return ComplaintResponse.from_orm(complaint)

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/", response_model=list[ComplaintResponse])
def list_complaints(
    user_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List complaints with optional filters."""
    complaints, _ = ComplaintService.list_complaints(
        db=db,
        user_id=user_id,
        status=status,
        priority=priority,
        limit=limit,
        offset=offset,
    )

    return [ComplaintResponse.from_orm(c) for c in complaints]


@router.get("/{id}", response_model=ComplaintResponse)
def get_complaint(id: int, db: Session = Depends(get_db)):
    """Get a specific complaint by ID."""
    complaint = ComplaintService.get_complaint(db=db, complaint_id=id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return ComplaintResponse.from_orm(complaint)


@router.patch("/{id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    id: int,
    update: ComplaintUpdate,
    db: Session = Depends(get_db),
):
    """Update the status of a complaint."""
    if not update.status:
        raise HTTPException(status_code=400, detail="Status is required")

    try:
        complaint = ComplaintService.update_complaint_status(
            db=db,
            complaint_id=id,
            new_status=update.status,
            change_reason=update.description or None,
        )

        return ComplaintResponse.from_orm(complaint)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    return ComplaintService.get_dashboard_stats(db)


@router.get("/heatmap/data")
def heatmap_data(db: Session = Depends(get_db)):
    """Get safety heatmap grid data."""
    return {"heatmap_data": ComplaintService.get_heatmap_data(db)}
