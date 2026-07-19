"""Complaint request/response schemas."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from decimal import Decimal


class ImageAnalysis(BaseModel):
    """Image analysis result schema."""
    detected_issue: str
    confidence_score: int
    risk_level: str


class ComplaintImageBase(BaseModel):
    """Base complaint image schema."""
    image_path: str
    detected_issues: Optional[str] = None
    confidence_score: Optional[int] = None
    risk_level: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintCreate(BaseModel):
    """Complaint creation schema."""
    location_lat: float
    location_lon: float
    location_address: Optional[str] = None
    description: str
    issue_type_id: Optional[int] = None
    image_path: Optional[str] = None


class ComplaintUpdate(BaseModel):
    """Complaint update schema."""
    status: Optional[str] = None
    priority: Optional[str] = None
    description: Optional[str] = None


class ComplaintHistoryResponse(BaseModel):
    """Complaint history response schema."""
    id: int
    old_status: Optional[str]
    new_status: str
    change_reason: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


class ComplaintResponse(BaseModel):
    """Complaint response schema."""
    id: int
    user_id: int
    issue_type_id: Optional[int]
    assigned_dept_id: Optional[int]
    location_lat: float
    location_lon: float
    location_address: Optional[str]
    description: str
    status: str
    priority: str
    created_at: datetime
    assigned_at: Optional[datetime]
    resolved_at: Optional[datetime]
    images: List[ComplaintImageBase] = []
    history: List[ComplaintHistoryResponse] = []

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    """Dashboard statistics schema."""
    total_complaints: int
    resolved_count: int
    pending_count: int
    in_progress_count: int
    avg_resolution_time_hours: Optional[float] = None
    by_priority: dict = {}
    by_status: dict = {}


class LocationHeatmapPoint(BaseModel):
    """Heatmap grid point schema."""
    grid_id: str
    lat: float
    lon: float
    complaint_count: int
    severity: str  # low, medium, high
    issues: List[str]
