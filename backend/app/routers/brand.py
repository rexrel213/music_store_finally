from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Product, Comment, Rating, User, CommentRating, ProductImage, OrderItem, Order, OrderStatusEnum, Brand, MusicType
from app.schemas import ProductRead, ProductCreate, CommentRead, RatingRead, RatingCreate, CommentCreate, CommentRatingCreate, CommentRatingRead, BrandRead, MusicTypeRead, ProductReadWithRating, BrandRead, MusicTypeRead
from app.auth.dependencies import get_current_user
from typing import List, Optional



router = APIRouter(prefix="/brand", tags=["Brands"])

@router.get("", response_model=List[BrandRead])
async def list_brands(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Brand))
    brands = result.scalars().all()
    return brands

@router.get("/{brand_id}", response_model=BrandRead)
async def get_brand(brand_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Brand).where(Brand.id == brand_id))
    brand = result.scalars().first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand