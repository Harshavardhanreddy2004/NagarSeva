"""Complaint routes."""
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
import os
import shutil
from pathlib import Path

from app.database import get_db
from app.config import settings
from app.auth import decode_token
from app.models import Complaint
from app.schemas.complaint import ComplaintCreate, ComplaintResponse, ComplaintUpdate, DashboardStats
from app.services.complaint_service import ComplaintService
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/complaints", tags=["complaints"])

# Initialize AI service
ai_service = AIService()


def get_current_user(authorization: str = None) -> int:
    """Extract user ID from JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
        
        token_data = decode_token(token)
        if not token_data:
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
    authorization: str = None,
    db: Session = Depends(get_db),
):
    """Create a new complaint with optional image upload."""
    user_id = get_current_user(authorization)
    
    image_path = None
    detected_issue = None
    risk_level = None
    
    # Handle image upload
    if image:
        try:
            # Save image
            file_path = Path(settings.upload_directory) / f"{user_id}_{image.filename}"
            with open(file_path, "wb") as f:
                shutil.copyfileobj(image.file, f)
            
            image_path = str(file_path)
            
            # Analyze image with AI
            analysis = ai_service.analyze_image(image_path)
            detected_issue = analysis.detected_issue
            risk_level = analysis.risk_level
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")
    
    # Create complaint
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
        return ComplaintResponse.from_orm(complaint)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=dict)
def list_complaints(
    status: str = None,
    priority: str = None,
    user_id: int = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """List complaints with optional filters."""
    complaints, total = ComplaintService.list_complaints(
        db=db,
        user_id=user_id,
        status=status,
        priority=priority,
        limit=limit,
        offset=offset,
    )
    
    return {
        "total": total,
        "complaints": [ComplaintResponse.from_orm(c) for c in complaints],
    }


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    """Get a specific complaint."""
    complaint = ComplaintService.get_complaint(db, complaint_id)
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return ComplaintResponse.from_orm(complaint)


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    status_update: dict,
    db: Session = Depends(get_db),
):
    """Update complaint status."""
    try:
        complaint = ComplaintService.update_complaint_status(
            db=db,
            complaint_id=complaint_id,
            new_status=status_update.get("status"),
            change_reason=status_update.get("reason"),
        )
        return ComplaintResponse.from_orm(complaint)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    return ComplaintService.get_dashboard_stats(db)


@router.get("/heatmap/data", response_model=dict)
def get_heatmap_data(db: Session = Depends(get_db)):
    """Get heatmap data for complaint density."""
    heatmap_data = ComplaintService.get_heatmap_data(db)
    return {"heatmap_data": heatmap_data}
