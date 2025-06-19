from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.models import Product, OrderItem, Order, OrderStatusEnum, User
from app.auth.dependencies import get_current_user
from app.database import get_db

router = APIRouter()

@router.get("/total")
async def get_sales_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Проверка роли пользователя — допустим, роль admin имеет id=1
    if current_user.role_id != 1:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Доступ запрещён")

    # Запрос: суммируем количество проданных товаров по всем COMPLETED заказам
    result = await db.execute(
        select(
            Product.id,
            Product.title,
            func.sum(OrderItem.quantity).label("sold_count")
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status == OrderStatusEnum.COMPLETED)
        .group_by(Product.id)
        .order_by(func.sum(OrderItem.quantity).desc())
    )
    sales = [
        {"id": row[0], "title": row[1], "sold_count": row[2] or 0}
        for row in result.all()
    ]

    # Общая сумма проданных товаров
    total_result = await db.execute(
        select(func.sum(OrderItem.quantity))
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status == OrderStatusEnum.COMPLETED)
    )
    total_sold = total_result.scalar() or 0

    return {"total_sold": total_sold, "products": sales}
