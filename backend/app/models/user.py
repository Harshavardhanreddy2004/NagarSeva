"""User model."""
from datetime import datetime

from sqlalchemy import Column, DateTime, String, Integer, Enum
from sqlalchemy.orm import relationship

from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """User role enumeration."""
    CITIZEN = "citizen"
    OFFICIAL = "official"
    ADMIN = "admin"


class User(Base):
    """User model for authentication and profile."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.CITIZEN)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    complaints = relationship("Complaint", back_populates="user")
