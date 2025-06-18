from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, UniqueConstraint, LargeBinary, Enum
from sqlalchemy.orm import relationship, backref
import enum
from sqlalchemy.dialects.postgresql import BYTEA # Для хранения файлов в PostgreSQL
from .database import Base






class OrderStatusEnum(str, enum.Enum):
    ORDERED = 'Корзина'
    COMPLETED = 'Оплачено'
    CANCELLED = 'Отменено'


class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), unique=True, nullable=False)
    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    avatar = Column(LargeBinary, nullable=True)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(120), nullable=False)
    created_at = Column(DateTime, server_default='now()')
    role_id = Column(Integer, ForeignKey('roles.id'))
    role = relationship("Role", back_populates="users")
    comments = relationship("Comment", back_populates="user")
    orders = relationship("Order", back_populates="user")
    ratings = relationship("Rating", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    suppliers = relationship("Supplier", back_populates="user", uselist=False)

class Category(Base):
    __tablename__ = 'categories'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    music_types = relationship("MusicType", back_populates="category")

class MusicType(Base):
    __tablename__ = 'music_types'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    category = relationship("Category", back_populates="music_types")
    products = relationship("Product", back_populates="music_type")

class Brand(Base):
    __tablename__ = 'brands'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    description = Column(Text)
    website = Column(String(255))
    logo = Column(String(255))
    products = relationship("Product", back_populates="brand")

class Product(Base):
    __tablename__ = 'products'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    image = Column(String(255))
    quantity = Column(Integer, nullable=False, server_default='0')
    created_at = Column(DateTime, server_default='now()')
    music_type_id = Column(Integer, ForeignKey('music_types.id'))
    brand_id = Column(Integer, ForeignKey('brands.id'))
    music_type = relationship("MusicType", back_populates="products")
    brand = relationship("Brand", back_populates="products")
    comments = relationship("Comment", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    ratings = relationship("Rating", back_populates="product")
    supply_items = relationship("SupplyItem", back_populates="product")
    favorites = relationship("Favorite", back_populates="product", cascade="all, delete-orphan", single_parent=True)
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_path = Column(String(255), nullable=False)  
    product = relationship("Product", back_populates="images")



class Comment(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default='now()')
    rating = Column(Integer, default=0, nullable=False)
    parent_id = Column(Integer, ForeignKey('comments.id'), nullable=True)
    user = relationship("User", back_populates="comments")
    product = relationship("Product", back_populates="comments")
    parent = relationship("Comment", remote_side=[id], backref=backref("children", cascade="all, delete-orphan", lazy="selectin"))

class CommentRating(Base):
    __tablename__ = 'comment_ratings'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    comment_id = Column(Integer, ForeignKey('comments.id'), nullable=False)
    value = Column(Integer, nullable=False)

    user = relationship("User")
    comment = relationship("Comment", backref=backref("comment_ratings", cascade="all, delete-orphan"))

    __table_args__ = (
        UniqueConstraint('user_id', 'comment_id', name='unique_user_comment_rating'),
    )

class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    user = relationship("User", back_populates="favorites")
    product= relationship("Product", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product_favorite'),
    )

class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, server_default='now()')
    status = Column(Enum(OrderStatusEnum), nullable=False, default=OrderStatusEnum.ORDERED)
    barcode = Column(String(255), nullable=True)
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = 'order_items'
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False, server_default='1')
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

class Rating(Base):
    __tablename__ = 'ratings'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    value = Column(Integer, nullable=False)
    user = relationship("User", back_populates="ratings")
    product = relationship("Product", back_populates="ratings")

    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product_rating'),
    )

class Supplier(Base):
    __tablename__ = 'suppliers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=False)
    bank_account = Column(String(50), nullable=False)
    inn = Column(String(12), nullable=False)
    kpp = Column(String(9), nullable=False)
    supplies = relationship("Supply", back_populates="supplier")
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    user = relationship("User", back_populates="suppliers")

class Supply(Base):
    __tablename__ = 'supplies'
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    created_at = Column(DateTime, server_default='now()')
    supplier = relationship("Supplier", back_populates="supplies")
    supply_items = relationship("SupplyItem", back_populates="supply")

class SupplyItem(Base):
    __tablename__ = 'supply_items'
    id = Column(Integer, primary_key=True, index=True)
    supply_id = Column(Integer, ForeignKey('supplies.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    supply = relationship("Supply", back_populates="supply_items")
    product = relationship("Product", back_populates="supply_items")
