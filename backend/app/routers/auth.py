from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from app.core.auth import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    phone: str = Field(..., example="+919876543210")
    password: str = Field(..., example="secret123")
    role: str = Field("tourist", example="control_room")

class LoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    role: str
    userId: str
    fullName: str

@router.post("/login", response_model=LoginResponse)
def login_user(payload: LoginRequest):
    """
    Authenticates user and returns JWT bearer token containing sub (userId) and role claim.
    """
    # Demo mock authentication provider
    if payload.role not in ["tourist", "control_room", "rescue_team"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")
        
    user_id = f"USR-{abs(hash(payload.phone)) % 10000}"
    full_name = f"Demo {payload.role.replace('_', ' ').title()}"
    
    token = create_access_token(user_id=user_id, role=payload.role, full_name=full_name)
    
    return LoginResponse(
        accessToken=token,
        tokenType="bearer",
        role=payload.role,
        userId=user_id,
        fullName=full_name
    )

@router.get("/me")
def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Returns profile info derived from validated JWT token."""
    return {
        "userId": current_user.get("sub"),
        "role": current_user.get("role"),
        "fullName": current_user.get("full_name")
    }
