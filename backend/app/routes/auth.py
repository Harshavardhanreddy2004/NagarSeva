"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.user_service import UserService
from app.auth import create_access_token, decode_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    try:
        user = UserService.create_user(
            db=db,
            email=user_data.email,
            password=user_data.password,
            name=user_data.name,
        )
        token = create_access_token(user.id, user.email)
        
        from app.schemas.user import UserResponse
        user_response = UserResponse.from_orm(user)
        
        return TokenResponse(
            access_token=token,
            user=user_response
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token."""
    try:
        user = UserService.authenticate_user(
            db=db,
            email=credentials.email,
            password=credentials.password,
        )
        token = create_access_token(user.id, user.email)
        
        user_response = UserResponse.from_orm(user)
        
        return TokenResponse(
            access_token=token,
            user=user_response
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me", response_model=UserResponse)
def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get current user profile by verifying JWT token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
        
        token_data = decode_token(token)
        if not token_data:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = UserService.get_user_by_id(db, token_data.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse.from_orm(user)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
