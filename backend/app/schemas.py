from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional 





# Users
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, example="securepassword123")
    name: str = Field(..., example="John Doe")

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    role_name: Optional[str] = None
    avatar: str 

class PasswordUpdate(BaseModel):
    oldPassword: str
    newPassword: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    password: PasswordUpdate | None = None 




# --- Бренды ---

class BrandCreate(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None

class BrandRead(BrandCreate):
    id: int
    name: str

    class Config:
        from_attributes = True

class BrandListResponse(BaseModel):
    data: list[BrandRead]
    total: int


# --- Пользователи ---

class PasswordUpdate(BaseModel):
    oldPassword: str
    newPassword: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, example="securepassword123")
    name: str = Field(..., example="John Doe")

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    role_id: int

    class Config:
        from_attributes = True



class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[PasswordUpdate] = None


# --- Роли ---

class RoleRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# --- Поставщики ---

class SupplierCreate(BaseModel):
    name: str
    phone: str
    bank_account: str
    inn: str
    kpp: str

class SupplierRead(SupplierCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class SupplierListResponse(BaseModel):
    data: list[SupplierRead]
    total: int





# --- Категории ---

class CategoryCreate(BaseModel):
    name: str

class CategoryRead(CategoryCreate):
    id: int

    class Config:
        from_attributes = True

class CategoryListResponse(BaseModel):
    data: list[CategoryRead]
    total: int


# --- Музыкальные типы ---

class MusicTypeCreate(BaseModel):
    name: str
    category_id: int

class MusicTypeRead(MusicTypeCreate):
    id: int
    name: str

    class Config:
        from_attributes = True

class MusicTypeListResponse(BaseModel):
    data: list[MusicTypeRead]
    total: int


# --- Товары ---

class ProductImageRead(BaseModel):
    id: int
    image_path: str

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    brand_id: int
    quantity: int = Field(ge=0)
    music_type_id: Optional[int] = None
    image: Optional[str] = None
    rating: Optional[float] = None
    images: Optional[list[ProductImageRead]] = []

class ProductRead(ProductCreate):
    id: int
    brand: Optional[BrandRead] = None
    music_type: Optional[MusicTypeRead] = None
    
    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    data: list[ProductRead]
    total: int

class ProductReadWithRating(ProductRead):
    avg_rating: float


    model_config = {
        "from_attributes": True
    }


# --- Комментарии ---

class CommentCreate(BaseModel):
    user_id: int
    product_id: int
    content: str
    parent_id: Optional[int] = None

class CommentRead(BaseModel):
    id: int
    user_id: int
    product_id: int
    content: str
    user: Optional[UserResponse] = None
    product: Optional[ProductRead] = None
    created_at: Optional[datetime] = None
    parent_id: Optional[int] = None
    children: Optional[list["CommentRead"]] = []
    rating: Optional[int] = 0

    class Config:
        from_attributes = True

# Обязательно добавь для рекурсивных ссылок
CommentRead.update_forward_refs()

class CommentListResponse(BaseModel):
    data: list[CommentRead]
    total: int




# --- Комментарии и рейтинги ---

class CommentRatingCreate(BaseModel):
    value: int

class CommentRatingRead(CommentRatingCreate):
    id: int
    user_id: int
    comment_id: int
    value: int


    class Config:
        from_attributes = True

# --- Заказы и элементы заказа ---

class OrderCreate(BaseModel):
    user_id: int

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)

class CheckoutRequest(BaseModel):
    items_ids: list[int]

class OrderItemRead(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    product: ProductRead
    
    

    class Config:
        from_attributes = True

class OrderRead(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    status: str
    order_items: list[OrderItemRead]
    barcode: Optional[str] = None

    class Config:
        from_attributes = True

class OrderItemUpdate(BaseModel):
    quantity: int = Field(gt=0)

OrderRead.update_forward_refs()
OrderItemRead.update_forward_refs()
OrderItemUpdate.update_forward_refs()

class OrderListResponse(BaseModel):
    data: list[OrderRead]
    total: int



# --- Фавориты ---

class FavoriteCreate(BaseModel):
    product_id: int

class FavoriteRead(FavoriteCreate):
    id: int
    user: Optional[UserResponse] = None
    product: Optional[ProductRead] = None

    class Config:
        from_attributes = True



# --- Рейтинги ---

class RatingCreate(BaseModel):
    value: int

class RatingRead(RatingCreate):
    id: int
    user: Optional[UserResponse] = None
    product: Optional[ProductRead] = None

    class Config:
        from_attributes = True

    

# --- Поставки и позиции поставок ---



class SupplyRead(BaseModel):
    id: int
    supplier_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SupplyListResponse(BaseModel):
    data: list[SupplyRead]
    total: int


class SupplyItemCreate(BaseModel):
    product_id: int
    quantity: int

class SupplyCreate(BaseModel):
    items: list[SupplyItemCreate]

class SupplyItemRead(SupplyItemCreate):
    id: int
    supply: Optional[SupplyRead] = None
    product: Optional[ProductRead] = None

    class Config:
        from_attributes = True