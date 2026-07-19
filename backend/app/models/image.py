"""ComplaintImage model."""
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class ComplaintImage(Base):
    """Image model for storing complaint images and AI analysis."""

    __tablename__ = "complaint_images"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), nullable=False)
    image_path = Column(String, nullable=False)
    
    # AI analysis results
    detected_issues = Column(Text, nullable=True)  # JSON string
    confidence_score = Column(Integer, nullable=True)  # 0-100
    risk_level = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    complaint = relationship("Complaint", back_populates="images")
