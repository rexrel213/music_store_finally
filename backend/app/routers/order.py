from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.auth.dependencies import get_current_user
from app.models import Order, OrderItem, Product, User, OrderStatusEnum
from app.schemas import OrderRead, OrderItemRead, OrderItemCreate, OrderItemUpdate, CheckoutRequest
import random
from app.barcode.barcodegenerate import generate_order_barcode


router = APIRouter(prefix="/order", tags=["Order"])



@router.get("/me", response_model=OrderRead)
async def get_order(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.music_type)
        )
        .where(Order.user_id == current_user.id, Order.status == OrderStatusEnum.ORDERED)
    )
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ (корзина) не найдена")
    return order

@router.get("/me/barcode")
async def get_order_barcode(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order).where(Order.user_id == current_user.id)
    )
    order = result.scalars().first()
    if not order or not order.barcode:
        raise HTTPException(status_code=404, detail="Штрихкод не найден")
    return {"barcode_url": order.barcode}


@router.post("/items", response_model=OrderItemRead, status_code=status.HTTP_201_CREATED)
async def add_to_order(
    item: OrderItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    
    product = await db.get(Product, item.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.order_items)
            .selectinload(OrderItem.product)
            .selectinload(Product.images),
            selectinload(Order.order_items)
            .selectinload(OrderItem.product)
            .selectinload(Product.brand),
            selectinload(Order.order_items)
            .selectinload(OrderItem.product)
            .selectinload(Product.music_type),
            selectinload(Order.user)
        )
        .where(Order.user_id == current_user.id, Order.status == OrderStatusEnum.ORDERED)
    )
    order = result.scalars().first()

    
    if not order:
        order = Order(user_id=current_user.id, status=OrderStatusEnum.ORDERED)
        db.add(order)
        await db.flush()
        
        barcode_path = generate_order_barcode(order.id)
        order.barcode = barcode_path
        await db.commit()  
        await db.refresh(order)

    # Проверяем, есть ли уже такой товар в корзине
    result = await db.execute(
        select(OrderItem)
        .where(OrderItem.order_id == order.id, OrderItem.product_id == item.product_id)
    )
    existing_item = result.scalars().first()

    if existing_item:
        # Если товар уже есть — увеличиваем количество
        existing_item.quantity += item.quantity
        db.add(existing_item)
        await db.commit()
        await db.refresh(existing_item)

        # Загружаем связи для сериализации
        result = await db.execute(
            select(OrderItem)
            .options(
                selectinload(OrderItem.order),
                selectinload(OrderItem.product).selectinload(Product.images),
                selectinload(OrderItem.product).selectinload(Product.brand),
                selectinload(OrderItem.product).selectinload(Product.music_type)
            )
            .where(OrderItem.id == existing_item.id)
        )
        item_with_relations = result.scalars().first()
        return item_with_relations
    else:
        # Если товара нет — создаём новый элемент заказа
        new_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
        )
        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)

        # Загружаем связи для сериализации
        result = await db.execute(
            select(OrderItem)
            .options(
                selectinload(OrderItem.order),
                selectinload(OrderItem.product).selectinload(Product.images),
                selectinload(OrderItem.product).selectinload(Product.brand),
                selectinload(OrderItem.product).selectinload(Product.music_type)
            )
            .where(OrderItem.id == new_item.id)
        )
        item_with_relations = result.scalars().first()
        return item_with_relations





@router.post("/me/checkout", status_code=status.HTTP_200_OK)
async def checkout_order(
    data: CheckoutRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Получаем текущий заказ-корзину пользователя
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.order_items),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.music_type)
        )
        .where(Order.user_id == current_user.id, Order.status == OrderStatusEnum.ORDERED)
    )
    order = result.scalars().first()
    if not order or not order.order_items:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    # Фильтруем выбранные товары по переданным id
    selected_items = [item for item in order.order_items if item.id in data.items_ids]
    if not selected_items:
        raise HTTPException(status_code=400, detail="Не выбраны товары для покупки")

    for item in selected_items:
        product_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_result.scalars().first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар с id {item.product_id} не найден")
        if product.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Недостаточно товара {product.title} на складе")
        product.quantity -= item.quantity
        


    # Создаем новый заказ со статусом COMPLETED
    completed_order = Order(user_id=current_user.id, status=OrderStatusEnum.COMPLETED)
    db.add(completed_order)
    await db.flush()  # чтобы получить id нового заказа

    # Переносим выбранные товары в новый заказ
    for item in selected_items:
        item.order_id = completed_order.id

    # Если остались товары в старом заказе, они остаются в корзине
    # Если все товары были выбраны, то корзина станет пустой

    await db.commit()
    await db.refresh(completed_order)

    # Создаем новую пустую корзину для пользователя, если старый заказ теперь пуст
    result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    remaining_items = result.scalars().first()
    if not remaining_items:
        order.status = OrderStatusEnum.ORDERED  # можно оставить, но корзина пустая
        # Можно также удалить пустой заказ, если хотите

    # Генерируем штрихкод для нового заказа
    barcode_path = generate_order_barcode(completed_order.id)
    completed_order.barcode = barcode_path
    await db.commit()
    await db.refresh(completed_order)

    return {
        "success": True,
        "new_order_id": completed_order.id,
        "message": "Заказ оформлен!"
    }

@router.get("/me/history", response_model=list[OrderRead])
async def get_order_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .options(
            selectinload(Order.user),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.brand),
            selectinload(Order.order_items).selectinload(OrderItem.product).selectinload(Product.music_type)
        )
        .where(Order.user_id == current_user.id, Order.status == OrderStatusEnum.COMPLETED)
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().all()
    return orders

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_order(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OrderItem)
        .join(Order)
        .where(OrderItem.id == item_id, Order.user_id == current_user.id)
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Товар не найден в заказе")
    await db.delete(item)
    await db.commit()

@router.patch("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def update_order_item(
    item_id: int,
    item_update: OrderItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OrderItem)
        .join(Order)
        .where(OrderItem.id == item_id, Order.user_id == current_user.id)
    )
    order_item = result.scalars().first()
    if not order_item:
        raise HTTPException(status_code=404, detail="Товар не найден в заказе")
    
    order_item.quantity = item_update.quantity  # присваиваем новое количество из запроса
    await db.commit()


  