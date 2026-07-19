"""Department model."""
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Department(Base):
    """Department model for complaint routing."""

    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=True)
    escalation_level = Column(Integer, default=1)  # 1=low, 2=medium, 3=high

    # Relationships
    issue_types = relationship("IssueType", back_populates="department")
    complaints = relationship("Complaint", back_populates="assigned_department")
