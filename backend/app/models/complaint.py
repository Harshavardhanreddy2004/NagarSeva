"""Complaint model."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base
import enum


class ComplaintStatus(str, enum.Enum):
    """Complaint status enumeration."""
    SUBMITTED = "submitted"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class Priority(str, enum.Enum):
    """Priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Complaint(Base):
    """Complaint model for tracking civic issues."""

    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_type_id = Column(Integer, ForeignKey("issue_types.id"), nullable=True)
    assigned_dept_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    
    # Location data
    location_lat = Column(Float, nullable=False)
    location_lon = Column(Float, nullable=False)
    location_address = Column(String, nullable=True)
    
    # Complaint details
    description = Column(String, nullable=False)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.SUBMITTED)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    assigned_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="complaints")
    issue_type = relationship("IssueType", back_populates="complaints")
    assigned_department = relationship("Department", back_populates="complaints")
    images = relationship("ComplaintImage", back_populates="complaint", cascade="all, delete-orphan")
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")
