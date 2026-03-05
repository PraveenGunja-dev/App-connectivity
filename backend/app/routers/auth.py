from fastapi import APIRouter, Depends

from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.auth import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    """Login with email and password. For demo, any email/password is accepted."""
    # Demo: accept any credentials. In production, validate against DB.
    access_token = create_access_token(subject=body.email)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_email=body.email,
    )


@router.get("/me", response_model=UserResponse)
def me(user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Return current authenticated user."""
    return user
