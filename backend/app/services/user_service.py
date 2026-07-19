"""User service for authentication and user management."""
from sqlalchemy.orm import Session

from app.models import User
from app.models.user import UserRole
from app.auth import hash_password, verify_password


class UserService:
    """Service for user management."""

    @staticmethod
    def create_user(
        db: Session,
        email: str,
        password: str,
        name: str = None,
        role: UserRole = UserRole.CITIZEN,
    ) -> User:
        """Create a new user."""
        if db.query(User).filter(User.email == email).first():
            raise ValueError(f"User with email {email} already exists")

        user = User(
            email=email,
            password_hash=hash_password(password),
            name=name,
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """Get user by email."""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        """Authenticate user with email and password."""
        user = UserService.get_user_by_email(db, email)
        
        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password")

        return user
