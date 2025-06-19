from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from sqlalchemy.orm import selectinload
from typing import List
from uuid import uuid4
import shutil
from pathlib import Path
from app.models import (
    Supplier, Product, User, Category, 
    MusicType, Brand, Comment, Order, ProductImage,
    Rating, Role, Supply, SupplyItem, OrderItem
)
from app.schemas import (
    SupplierCreate, SupplierRead, SupplierListResponse,
    ProductCreate, ProductRead, ProductListResponse,
    CategoryCreate, CategoryRead, CategoryListResponse,
    MusicTypeCreate, MusicTypeRead, MusicTypeListResponse,
    BrandCreate, BrandRead, BrandListResponse,
    CommentCreate, CommentRead, CommentListResponse,
    OrderRead, OrderListResponse,
    RatingCreate, RatingRead,
    SupplyCreate, SupplyRead, SupplyListResponse, SupplyItemRead, SupplyItemCreate,   
    OrderItemRead, OrderItemCreate
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def apply_sort(query, model, sort: str):
    if not sort:
        return query
    if '.' in sort:
        relation_name, field_name = sort.split('.', 1)
        relation = getattr(model, relation_name, None)
        if relation is not None:
            query = query.join(relation)
            sort_column = getattr(relation.property.mapper.class_, field_name)
            query = query.order_by(sort_column)
            return query
    else:
        sort_column = getattr(model, sort, None)
        if sort_column is not None:
            query = query.order_by(sort_column)
    return query

# ======================== Поставщики ========================

@router.get("/suppliers", response_model=SupplierListResponse)
async def list_suppliers(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Supplier)
    query = apply_sort(query, Supplier, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    suppliers = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Supplier))
    total = total_result.scalar_one()
    return {"data": suppliers, "total": total}

@router.get("/suppliers/{id}", response_model=SupplierRead)
async def get_supplier(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Supplier).where(Supplier.id == id))
    supplier = result.scalars().first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("/suppliers", response_model=SupplierRead)
async def create_supplier(supplier: SupplierCreate, db: AsyncSession = Depends(get_db)):
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    await db.commit()
    await db.refresh(db_supplier)
    return db_supplier

# ======================== Поставки ========================
@router.get("/supplies", response_model=SupplyListResponse)
async def list_supplies(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    # Подгружаем supplier, если он есть в схеме SupplyRead
    query = select(Supply).options(selectinload(Supply.supplier))
    query = apply_sort(query, Supply, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    supplies = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Supply))
    total = total_result.scalar_one()
    return {"data": supplies, "total": total}

@router.post("/supplies", response_model=SupplyRead)
async def create_supply(supply: SupplyCreate, db: AsyncSession = Depends(get_db)):
    db_supply = Supply(**supply.dict())
    db.add(db_supply)
    await db.commit()
    await db.refresh(db_supply)
    # Подгружаем supplier для сериализации!
    result = await db.execute(
        select(Supply)
        .options(selectinload(Supply.supplier))
        .where(Supply.id == db_supply.id)
    )
    return result.scalars().one()

# ==================== SupplyItems ====================
@router.get("/supply-items", response_model=List[SupplyItemRead])
async def list_supply_items(
    skip: int = 0,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    # Подгружаем supply (с supplier) и product, если они есть в схеме SupplyItemRead
    query = select(SupplyItem).options(
        selectinload(SupplyItem.supply).selectinload(Supply.supplier),
        selectinload(SupplyItem.product)
    )
    result = await db.execute(query.offset(skip).limit(limit))
    items = result.scalars().all()
    return items

@router.post("/supply-items", response_model=SupplyItemRead)
async def create_supply_item(
    item: SupplyItemCreate,
    db: AsyncSession = Depends(get_db)
):
    db_item = SupplyItem(**item.dict())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    # Обновляем количество товара
    product = await db.get(Product, item.product_id)
    product.quantity += item.quantity
    await db.commit()
    # Возвращаем созданный объект с подгруженными связями
    result = await db.execute(
        select(SupplyItem)
        .options(
            selectinload(SupplyItem.supply).selectinload(Supply.supplier),
            selectinload(SupplyItem.product)
        )
        .where(SupplyItem.id == db_item.id)
    )
    return result.scalars().one()

# ======================== Товары ========================
@router.get("/products", response_model=ProductListResponse)
async def list_products(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Product)
    query = apply_sort(query, Product, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    products = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Product))
    total = total_result.scalar_one()
    return {"data": products, "total": total}

@router.get("/products/{id}", response_model=ProductRead)
async def get_product(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/products", response_model=ProductRead)
async def create_product(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    brand_id: int = Form(...),
    music_type_id: int = Form(...),
    image: UploadFile = File(None),

    db: AsyncSession = Depends(get_db)
):
    image_url = None
    if image and image.content_type.startswith("image/"):
        UPLOAD_DIR = Path("static/uploads")
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        ext = image.filename.split('.')[-1]
        filename = f"{uuid4()}.{ext}"
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
        image_url = f"/static/uploads/{filename}"

    db_product = Product(
        title=title,
        description=description,
        price=price,
        brand_id=brand_id,
        music_type_id=music_type_id,
        image=image_url
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    # Подгружаем связанные объекты для корректной сериализации
    result = await db.execute(
        select(Product)
        .options(
            selectinload(Product.brand),
            selectinload(Product.images),
            selectinload(Product.music_type)
        )
        .where(Product.id == db_product.id)
    )
    product_with_images = result.scalars().first()

    return product_with_images

@router.post("/products/{product_id}/images")
async def upload_product_images(
    product_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    saved_images = []
    UPLOAD_DIR = Path("static/uploads")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    for file in files:
        if not file.content_type.startswith("image/"):
            continue
        filename = f"product_{product_id}_{uuid4().hex}_{file.filename}"
        file_path = UPLOAD_DIR / filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        product_image = ProductImage(product_id=product_id, image_path=f"/static/uploads/{filename}")
        db.add(product_image)
        saved_images.append(product_image)

    await db.commit()
    return {"uploaded": len(saved_images)}

    
# ======================== Категории ========================
@router.get("/categories", response_model=CategoryListResponse)
async def list_categories(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Category)
    query = apply_sort(query, Category, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    categories = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Category))
    total = total_result.scalar_one()
    return {"data": categories, "total": total}

@router.get("/categories/{id}", response_model=CategoryRead)
async def get_category(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == id))
    category = result.scalars().first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/categories", response_model=CategoryRead)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_category = Category(**category.dict())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category


@router.get("/categories/{id}/products")
async def get_products_by_category(id: int, db: AsyncSession = Depends(get_db)):
    # Получаем все типы музыки для категории
    music_types_result = await db.execute(
        select(MusicType.id).where(MusicType.category_id == id)
    )
    music_type_ids = [row[0] for row in music_types_result.all()]
    if not music_type_ids:
        return {"products": []}

    # Получаем все товары с этими типами музыки
    products_result = await db.execute(
        select(Product).where(Product.music_type_id.in_(music_type_ids))
    )
    products = products_result.scalars().all()
    return {"products": products}

# ======================== Музыкальные типы ========================
@router.get("/music-types", response_model=MusicTypeListResponse)
async def list_music_types(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(MusicType)
    query = apply_sort(query, MusicType, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    music_types = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(MusicType))
    total = total_result.scalar_one()
    return {"data": music_types, "total": total}

@router.get("/music-types/{id}", response_model=MusicTypeRead)
async def get_music_type(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MusicType).where(MusicType.id == id))
    music_type = result.scalars().first()
    if not music_type:
        raise HTTPException(status_code=404, detail="Music type not found")
    return music_type

@router.post("/music-types", response_model=MusicTypeRead)
async def create_music_type(music_type: MusicTypeCreate, db: AsyncSession = Depends(get_db)):
    db_music_type = MusicType(**music_type.dict())
    db.add(db_music_type)
    await db.commit()
    await db.refresh(db_music_type)
    return db_music_type

# ======================== Бренды ========================
# @router.get("/brands", response_model=BrandListResponse)
# async def list_brands(
#     skip: int = 0,
#     limit: int = 10,
#     sort: str = None,
#     db: AsyncSession = Depends(get_db)
# ):
#     query = select(Brand)
#     query = apply_sort(query, Brand, sort)
#     result = await db.execute(query.offset(skip).limit(limit))
#     brands = result.scalars().all()
#     total_result = await db.execute(select(func.count()).select_from(Brand))
#     total = total_result.scalar_one()
#     return {"data": brands, "total": total}

@router.get("/brands/{id}", response_model=BrandRead)
async def get_brand(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Brand).where(Brand.id == id))
    brand = result.scalars().first()
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.get("/brands", response_model=list[BrandRead])
async def get_brands(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Brand))
    brands = result.scalars().all()
    return brands

@router.post("/brands", response_model=BrandRead)
async def create_brand(brand: BrandCreate, db: AsyncSession = Depends(get_db)):
    db_brand = Brand(**brand.dict())
    db.add(db_brand)
    await db.commit()
    await db.refresh(db_brand)
    return db_brand

# ======================== Комментарии ========================
@router.get("/comments", response_model=CommentListResponse)
async def list_comments(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Comment)
    query = apply_sort(query, Comment, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    comments = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Comment))
    total = total_result.scalar_one()
    return {"data": comments, "total": total}

@router.get("/comments/{id}", response_model=CommentRead)
async def get_comment(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comment).where(Comment.id == id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.post("/comments", response_model=CommentRead)
async def create_comment(comment: CommentCreate, db: AsyncSession = Depends(get_db)):
    db_comment = Comment(**comment.dict())
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment

# ======================== Заказы ========================
@router.get("/orders", response_model=OrderListResponse)
async def list_orders(
    skip: int = 0,
    limit: int = 10,
    sort: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Order)
    query = apply_sort(query, Order, sort)
    result = await db.execute(query.offset(skip).limit(limit))
    orders = result.scalars().all()
    total_result = await db.execute(select(func.count()).select_from(Order))
    total = total_result.scalar_one()
    return {"data": orders, "total": total}

@router.get("/orders/{id}", response_model=OrderRead)
async def get_order(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == id))
    order = result.scalars().first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# ======================== Заказы - Позиции ========================
@router.get("/order-items", response_model=List[OrderItemRead])
async def list_order_items(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    query = select(OrderItem).offset(skip).limit(limit)
    result = await db.execute(query)
    order_items = result.scalars().all()
    return order_items

@router.post("/order-items", response_model=OrderItemRead)
async def create_order_item(order_item: OrderItemCreate, db: AsyncSession = Depends(get_db)):
    db_order_item = OrderItem(**order_item.dict())
    db.add(db_order_item)
    await db.commit()
    await db.refresh(db_order_item)
    return db_order_item

@router.get("/order-items/{id}", response_model=OrderItemRead)
async def get_order_item(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OrderItem).where(OrderItem.id == id))
    order_item = result.scalars().first()
    if not order_item:
        raise HTTPException(status_code=404, detail="Order item not found")
    return order_item

# ======================== Рейтинги ========================
@router.get("/ratings/{id}", response_model=RatingRead)
async def get_rating(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Rating).where(Rating.id == id))
    rating = result.scalars().first()
    if not rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    return rating

@router.post("/ratings", response_model=RatingRead)
async def create_rating(rating: RatingCreate, db: AsyncSession = Depends(get_db)):
    db_rating = Rating(**rating.dict())
    db.add(db_rating)
    await db.commit()
    await db.refresh(db_rating)
    return db_rating
