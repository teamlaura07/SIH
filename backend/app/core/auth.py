from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "VANRAKSHAK_SIH_2026_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

security = HTTPBearer(auto_error=False)

def create_access_token(user_id: str, role: str, full_name: Optional[str] = None, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT token containing user_id, role, and optional full_name claims."""
    expire = datetime.utcnow() + (expires_delta or timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS))
    payload = {
        "sub": str(user_id),
        "role": role,
        "full_name": full_name or "VanRakshak User",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    """Decodes and validates JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> dict:
    """Dependency to extract and validate current authenticated user from Authorization header."""
    if not credentials:
        # Fallback default guest context for dev demo compatibility
        return {"user_id": "GUEST-SYSTEM", "role": "control_room", "full_name": "Control Room Operator"}
    
    token = credentials.credentials
    return decode_access_token(token)

def require_role(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) middleware factory."""
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role", "guest")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Required role in {allowed_roles}, but user has role '{user_role}'"
            )
        return current_user
    return role_checker
