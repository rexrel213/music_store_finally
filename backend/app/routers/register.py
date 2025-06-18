from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import UserCreate
from app.auth.security import create_access_token, hash_password

router = APIRouter(prefix="/register", tags=["Register"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Проверяем, есть ли пользователь с таким email
        stmt = select(User).where(User.email == user.email)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_password = hash_password(user.password)

        new_user = User(
            email=user.email,
            password=hashed_password,
            name=user.name,
            role_id=2  
        )

        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)

        access_token = create_access_token({"sub": new_user.email})

        return {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role_id": new_user.role_id,
            "avatar": f"/login/profile/avatar/{new_user.id}",
            "created_at": new_user.created_at,
            "access_token": access_token
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
