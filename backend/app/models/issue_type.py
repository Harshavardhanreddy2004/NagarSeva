"""IssueType model."""
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.database import Base
import enum


class RiskLevel(str, enum.Enum):
    """Risk level enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class IssueType(Base):
    """Issue type model for classifying complaints."""

    __tablename__ = "issue_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False)
    risk_level = Column(Enum(RiskLevel), default=RiskLevel.MEDIUM)

    # Relationships
    department = relationship("Department", back_populates="issue_types")
    complaints = relationship("Complaint", back_populates="issue_type")
