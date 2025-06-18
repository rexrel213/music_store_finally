from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Favorite, Product
from app.schemas import FavoriteCreate, FavoriteRead, ProductRead
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    favorite_in: FavoriteCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Проверяем, что товар существует
    product = await db.get(Product, favorite_in.product_id)
    if not product:
        raise HTTPException(404, detail="Товар не найден")

    # Проверяем, что такого избранного ещё нет
    result = await db.execute(
        select(Favorite).where(
            Favorite.user_id == current_user.id,
            Favorite.product_id == favorite_in.product_id
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(400, detail="Товар уже в избранном")

    # Добавляем в избранное
    favorite = Favorite(user_id=current_user.id, product_id=favorite_in.product_id)
    db.add(favorite)
    await db.commit()
    await db.refresh(favorite)
    return {"status": "success", "favorite_id": favorite.id}


@router.get("/", response_model=list[FavoriteRead])
async def get_favorites(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Favorite)
        .options(
            selectinload(Favorite.product).selectinload(Product.images),
            selectinload(Favorite.product).selectinload(Product.brand),
            selectinload(Favorite.product).selectinload(Product.music_type)
        )
        .where(Favorite.user_id == current_user.id)
    )
    favorites = result.scalars().all()
    return favorites


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    favorite_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(Favorite).where(
            Favorite.id == favorite_id,
            Favorite.user_id == current_user.id
        )
    )
    favorite = result.scalar_one_or_none()
    if not favorite:
        raise HTTPException(404, detail="Избранное не найдено")
    await db.delete(favorite)
    await db.commit()
    return {"status": "success"}

@router.get("/check")
async def check_favorite(product_id: int, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Favorite).where(
            Favorite.product_id == product_id,
            Favorite.user_id == current_user.id
        )
    )
    favorite = result.scalar_one_or_none()
    if favorite:
        return {"is_favorite": True, "favorite_id": favorite.id}
    return {"is_favorite": False}  