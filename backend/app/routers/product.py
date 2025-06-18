from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Product, Comment, Rating, User, CommentRating, ProductImage, OrderItem, Order, OrderStatusEnum, Brand, MusicType
from app.schemas import ProductRead, ProductCreate, CommentRead, RatingRead, RatingCreate, CommentCreate, CommentRatingCreate, CommentRatingRead, BrandRead, MusicTypeRead, ProductReadWithRating, BrandRead, MusicTypeRead
from app.auth.dependencies import get_current_user
from typing import List, Optional



router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductReadWithRating])
async def list_products(
    skip: int = 0,
    limit: int = 10,
    q: Optional[str] = Query(None, description="Поисковый запрос по названию"),
    price_min: Optional[float] = Query(None, description="Минимальная цена"),
    price_max: Optional[float] = Query(None, description="Максимальная цена"),
    brand_id: Optional[int] = Query(None, description="ID бренда"),
    music_type_id: Optional[int] = Query(None, description="ID типа музыкального инструмента"),
    db: AsyncSession = Depends(get_db)
):
    avg_rating_subq = (
        select(
            Rating.product_id,
            func.avg(Rating.value).label("avg_rating")
        )
        .group_by(Rating.product_id)
        .subquery()
    )

    query = (
        select(Product, avg_rating_subq.c.avg_rating)
        .outerjoin(avg_rating_subq, Product.id == avg_rating_subq.c.product_id)
        .options(selectinload(Product.images))
        .options(selectinload(Product.brand))
        .options(selectinload(Product.music_type))
    )

    if q:
        query = query.where(Product.title.ilike(f"%{q}%"))

    if price_min is not None:
        query = query.where(Product.price >= price_min)

    if price_max is not None:
        query = query.where(Product.price <= price_max)

    if brand_id is not None:
        query = query.where(Product.brand_id == brand_id)

    if music_type_id is not None:
        query = query.where(Product.music_type_id == music_type_id)

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    products_with_rating = result.all()

    response = []
    for product, avg_rating in products_with_rating:
        product_data = ProductRead.model_validate(product, from_attributes=True).model_dump()
        product_data['avg_rating'] = avg_rating or 0.0
        response.append(ProductReadWithRating.model_validate(product_data))

    return response



@router.get("/top", response_model=List[ProductReadWithRating])
async def get_high_rating_products(
    min_rating: float = Query(4.0, ge=0, le=5),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    avg_rating_subq = (
        select(
            Rating.product_id,
            func.avg(Rating.value).label("avg_rating")
        )
        .group_by(Rating.product_id)
        .subquery()
    )

    query = (
        select(Product, avg_rating_subq.c.avg_rating)
        .join(avg_rating_subq, Product.id == avg_rating_subq.c.product_id)
        .where(avg_rating_subq.c.avg_rating >= min_rating)
        .options(
            selectinload(Product.images),
            selectinload(Product.brand),
            selectinload(Product.music_type)
        )
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    products_with_rating = result.all()

    response = []
    for product, avg_rating in products_with_rating:
        
        product_data = ProductRead.model_validate(product, from_attributes=True).model_dump()
        
        product_data['avg_rating'] = avg_rating or 0.0
        
        response.append(ProductReadWithRating.model_validate(product_data))
    return response









@router.post("/{product_id}/comments", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(
    product_id: int,
    comment: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Проверяем, что товар существует
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Проверяем, что пользователь покупал этот товар
    result = await db.execute(
        select(OrderItem)
        .join(Order)
        .where(
            Order.user_id == current_user.id,
            Order.status == OrderStatusEnum.COMPLETED,
            OrderItem.product_id == product_id
        )
    )
    bought_item = result.scalars().first()
    if not bought_item:
        raise HTTPException(
            status_code=403,
            detail="Оставлять отзыв могут только пользователи, купившие этот товар"
        )

    db_comment = Comment(
        product_id=product_id,
        user_id=current_user.id,
        content=comment.content,
    )
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)

    # Подгружаем все нужные связи для корректной сериализации
    result = await db.execute(
        select(Comment)
        .options(
            selectinload(Comment.user),
            selectinload(Comment.product).selectinload(Product.images),  # <-- вот это важно!
            selectinload(Comment.parent),
            selectinload(Comment.product).selectinload(Product.brand),
            selectinload(Comment.product).selectinload(Product.music_type),
        )
        .where(Comment.id == db_comment.id)
    )
    comment_with_relations = result.scalars().first()
    return comment_with_relations


@router.patch("/comments/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: int,
    comment_update: CommentCreate,  # или отдельную схему, например, CommentUpdate
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Найти комментарий
    result = await db.execute(select(Comment)
     .options(
        selectinload(Comment.user),
        selectinload(Comment.product).selectinload(Product.images),
        selectinload(Comment.product).selectinload(Product.brand),
        selectinload(Comment.product).selectinload(Product.music_type),
        selectinload(Comment.parent)
    )
     .where(Comment.id == comment_id)
    )
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    # Проверить, что пользователь — автор комментария
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Можно редактировать только свои комментарии")

    # Изменить текст комментария
    comment.content = comment_update.content
    db.add(comment)
    await db.commit()
    await db.refresh(comment)
    return comment



@router.post("/{product_id}/comments/reply", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment_reply(
    product_id: int,
    comment: CommentCreate,
    db: AsyncSession = Depends(get_db)
):
    # Проверяем существование товара
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Проверяем существование родительского комментария
    if comment.parent_id:
        parent_comment = await db.get(Comment, comment.parent_id)
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    # Создаем комментарий
    db_comment = Comment(
        product_id=product_id,
        user_id=comment.user_id,
        content=comment.content,
        parent_id=comment.parent_id
    )
    
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    
    # Загружаем связи для ответа
    result = await db.execute(
        select(Comment)
        .options(
            selectinload(Comment.user),
            selectinload(Comment.product).selectinload(Product.images),
            selectinload(Comment.children),
            selectinload(Comment.product).selectinload(Product.brand),
            selectinload(Comment.product).selectinload(Product.music_type),
        )
        .where(Comment.id == db_comment.id)
    )
    
    comment_with_relations = result.scalar_one()
    return comment_with_relations

@router.get("/{product_id}/comments", response_model=List[CommentRead])
async def get_product_comments(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment)
        .options(
            selectinload(Comment.user),
            selectinload(Comment.product).selectinload(Product.images),
            selectinload(Comment.product).selectinload(Product.brand),
            selectinload(Comment.product).selectinload(Product.music_type),
            selectinload(Comment.parent).selectinload(Comment.user),
            selectinload(Comment.children).selectinload(Comment.user),
        )
        .where(Comment.product_id == product_id)
    )
    comments = result.scalars().all()

    # Получаем id всех комментариев
    comment_ids = [c.id for c in comments]
    # Получаем рейтинги всех комментариев одним запросом
    ratings_result = await db.execute(
        select(CommentRating.comment_id, func.coalesce(func.sum(CommentRating.value), 0))
        .where(CommentRating.comment_id.in_(comment_ids))
        .group_by(CommentRating.comment_id)
    )
    ratings_map = dict(ratings_result.all())

    # Вставляем рейтинг в каждый комментарий
    for c in comments:
        setattr(c, 'rating', ratings_map.get(c.id, 0))

    comments.sort(key=lambda c: c.rating, reverse=True)

    return comments

    

    # Получаем id всех комментариев
    comment_ids = [c.id for c in comments]
    # Получаем рейтинги всех комментариев одним запросом
    ratings_result = await db.execute(
        select(CommentRating.comment_id, func.coalesce(func.sum(CommentRating.value), 0))
        .where(CommentRating.comment_id.in_(comment_ids))
        .group_by(CommentRating.comment_id)
    )
    ratings_map = dict(ratings_result.all())

    # Вставляем рейтинг в каждый комментарий
    for c in comments:
        setattr(c, 'rating', ratings_map.get(c.id, 0))

    comments.sort(key=lambda c: c.rating, reverse=True)

    return comments







@router.post("/comments/{comment_id}/rating", response_model=Optional[CommentRatingRead])
async def create_or_toggle_comment_rating(
    comment_id: int,
    rating: CommentRatingCreate,
    current_user: User = Depends(get_current_user),  # <--- вот это важно!
    db: AsyncSession = Depends(get_db)
):
    # Проверяем, что комментарий существует
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    # Проверяем, есть ли уже рейтинг от этого пользователя
    result = await db.execute(
        select(CommentRating).where(
            CommentRating.user_id == current_user.id,
            CommentRating.comment_id == comment_id
        )
    )
    existing_rating = result.scalars().first()

    # Логика обработки рейтинга
    if existing_rating:
        if existing_rating.value == rating.value:
            # Повторный клик на тот же рейтинг - удаляем (отмена)
            await db.delete(existing_rating)
            await db.commit()
            updated_rating = None
        else:
            # Меняем рейтинг
            existing_rating.value = rating.value
            db.add(existing_rating)
            await db.commit()
            await db.refresh(existing_rating)
            updated_rating = existing_rating
    else:
        # Создаём новый рейтинг
        db_rating = CommentRating(
            user_id=current_user.id,  # <--- используем id авторизованного пользователя
            comment_id=comment_id,
            value=rating.value
        )
        db.add(db_rating)
        await db.commit()
        await db.refresh(db_rating)
        updated_rating = db_rating

    # Пересчитываем общий рейтинг комментария
    result = await db.execute(
        select(func.coalesce(func.sum(CommentRating.value), 0))
        .where(CommentRating.comment_id == comment_id)
    )
    total_rating = result.scalar_one()

    comment.rating = total_rating
    db.add(comment)
    await db.commit()

    return updated_rating



@router.get("/comments/{comment_id}/rating")
async def get_comment_rating(comment_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            func.coalesce(func.sum(CommentRating.value), 0).label("total"),
        ).where(CommentRating.comment_id == comment_id)
    )
    row = result.first()
    return {"total": row.total}


@router.post("/{product_id}/rating", response_model=RatingRead, status_code=status.HTTP_201_CREATED)
async def create_rating(
    product_id: int,
    rating: RatingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Проверяем существование товара
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Проверяем покупку товара
    order_item = await db.execute(
        select(OrderItem)
        .join(Order)
        .where(
            Order.user_id == current_user.id,
            Order.status == OrderStatusEnum.COMPLETED,
            OrderItem.product_id == product_id
        )
    )
    if not order_item.scalars().first():
        raise HTTPException(
            status_code=403,
            detail="Оценивать товар могут только пользователи, купившие его"
        )

    # Проверяем существующий рейтинг
    existing_rating = await db.execute(
        select(Rating)
        .where(
            Rating.product_id == product_id,
            Rating.user_id == current_user.id
        )
    )
    existing_rating = existing_rating.scalars().first()

    if existing_rating:
        existing_rating.value = rating.value
    else:
        existing_rating = Rating(
            product_id=product_id,
            user_id=current_user.id,
            value=rating.value
        )
        db.add(existing_rating)

    await db.commit()
    await db.refresh(existing_rating)

    # Явная загрузка связей
    result = await db.execute(
        select(Rating)
        .where(Rating.id == existing_rating.id)
        .options(
            selectinload(Rating.user),
            selectinload(Rating.product).selectinload(Product.images),
            selectinload(Rating.product).selectinload(Product.brand),
            selectinload(Rating.product).selectinload(Product.music_type)
        )
    )
    rating_with_relations = result.scalars().first()

    return rating_with_relations



@router.get("/{product_id}/rating")
async def get_product_rating(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.avg(Rating.value)).where(Rating.product_id == product_id)
    )
    avg_rating = result.scalar()
    return {"average": avg_rating or 0}

@router.post("/", response_model=ProductRead)
async def create_product(product: ProductCreate, db: AsyncSession = Depends(get_db)):
    db_product = Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product







@router.get("/music_types", response_model=List[MusicTypeRead])
async def list_music_types(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MusicType))
    music_types = result.scalars().all()
    return music_types


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.brand), selectinload(Product.music_type))
        .where(Product.id == product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

