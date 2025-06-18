from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Role
from app.schemas import UserUpdate, PasswordUpdate, UserResponse
from app.auth.security import SECRET_KEY, ALGORITHM, create_access_token, verify_password
from app.auth.dependencies import get_current_user
from fastapi.responses import Response
import logging
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/login", tags=["Login"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=120)
    access_token = create_access_token(
        data={"sub": user.email, "role_id": user.role_id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "avatar": f"/login/profile/avatar/{user.id}",
        "role_id": user.role_id,
        "created_at": user.created_at
    }

@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):

    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")


    avatar_url = f"/login/profile/avatar/{user.id}"


    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role_id=user.role_id,
        created_at=user.created_at,
        role_name=user.role.name if user.role else None,
        avatar=avatar_url
    )

@router.patch("/profile")
async def update_profile(
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = current_user
    if user_update.name:
        user.name = user_update.name
    if user_update.email:
        user.email = user_update.email
    if user_update.password:
        if not pwd_context.verify(user_update.password.oldPassword, user.password):
            raise HTTPException(400, "Неверный текущий пароль")
        user.password = pwd_context.hash(user_update.password.newPassword)
    await db.commit()
    return {"status": "success"}

@router.delete("/profile")
async def delete_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await db.delete(current_user)
    await db.commit()
    logging.info(f"User {current_user.email} deleted successfully")
    return {"status": "success"}

@router.post("/profile/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    avatar_data = await file.read()
    current_user.avatar = avatar_data
    await db.commit()
    await db.refresh(current_user)
    return {"status": "success"}

@router.get("/profile/avatar/{user_id}")
async def get_avatar(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    if not user.avatar:
        raise HTTPException(404, "Avatar not found")
    return Response(content=user.avatar, media_type="image/jpeg")
