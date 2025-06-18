from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Supply, SupplyItem, User, Supplier, Product
from app.schemas import SupplyCreate, SupplyRead, SupplyItemCreate
from app.auth.dependencies import get_current_user
from typing import List, Optional


router = APIRouter(prefix="/supplies", tags=["Supplies"])

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_supply(
    supply: SupplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Получаем поставщика для текущего пользователя
    result = await db.execute(
        select(Supplier).where(Supplier.user_id == current_user.id)
    )
    supplier = result.scalar_one_or_none()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")

    new_supply = Supply(supplier_id=supplier.id)
    db.add(new_supply)
    await db.flush()  # чтобы получить new_supply.id

    for item in supply.items:
        # Создаем элемент поставки
        new_supply_item = SupplyItem(
            supply_id=new_supply.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_supply_item)

        # Обновляем количество товара в продукте
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")

        # Предполагается, что у модели Product есть поле quantity
        product.quantity += item.quantity
        db.add(product)  # помечаем объект как измененный

    await db.commit()
    await db.refresh(new_supply)
    return new_supply
