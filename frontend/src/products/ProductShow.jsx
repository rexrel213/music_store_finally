import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Star, MessageSquare, Image as ImageIcon, Package, ShoppingCart } from 'lucide-react';
import StarRating from '../context/StarRating';
import AddToOrder from '../order/AddToOrder';
import AddToFavorite from '../favorite/AddToFavorite';
import CommentForm from './comm/CommentForm';
import CommentItem from './comm/CommentItem';

const MAX_DEPTH = 3;       
const MAX_CHILDREN = 3;  

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const BASE_URL = 'https://ruslik.taruman.ru';

  // Загрузка данных о товаре и комментариях
  const fetchProductData = async () => {
    try {
      const [productRes, commentsRes, ratingRes] = await Promise.all([
        fetch(`${BASE_URL}/products/${productId}`),
        fetch(`${BASE_URL}/products/${productId}/comments`),
        fetch(`${BASE_URL}/products/${productId}/rating`)
      ]);
      if (!productRes.ok || !commentsRes.ok || !ratingRes.ok) throw new Error('Failed to load product data');

      const productData = await productRes.json();
      const commentsData = await commentsRes.json();
      const ratingData = await ratingRes.json();

      setProduct(productData);
      setSelectedImage(productData.image);
      setComments(buildCommentTree(commentsData));
      setRating(ratingData.average || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line
  }, [productId]);

  // Построение дерева комментариев
  const buildCommentTree = (comments, maxDepth = MAX_DEPTH) => {
    const map = {};
    const roots = [];

    comments.forEach(c => {
      map[c.id] = { ...c, children: [] };
    });

    comments.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    // Обрезаем дерево по глубине и количеству детей
    const trimTree = (nodes, depth = 1) => {
      if (depth > maxDepth) {
        // На максимальной глубине не показываем детей
        return nodes.map(node => ({ ...node, children: [] }));
      }
      return nodes.map(node => {
        let trimmedChildren = node.children || [];
        if (trimmedChildren.length > MAX_CHILDREN) {
          trimmedChildren = trimmedChildren.slice(0, MAX_CHILDREN);
          node.hasMoreChildren = true; // Флаг для UI, чтобы показать кнопку "Показать ещё"
        }
        return {
          ...node,
          children: trimTree(trimmedChildren, depth + 1),
        };
      });
    };

    return trimTree(roots);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка информации о товаре...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Ошибка загрузки товара</h2>
            <p className="text-red-700">{error}</p>
            <Link 
              to="/products" 
              className="mt-4 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Назад к товарам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="text-yellow-600 mb-4">
              <Package className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Товар не найден</h2>
            <p className="text-yellow-700">Товар не найден.</p>
            <Link 
              to="/products" 
              className="mt-4 inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Назад к товарам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/products" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Назад к товарам
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Детали товара */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="flex flex-col lg:flex-row gap-10 p-8">
            {/* Картинки товара */}
            <div className="flex-1 flex flex-col items-center lg:max-w-[480px] w-full">
              {/* Основное изображение */}
              <div className="w-full aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-md flex items-center justify-center mb-4">
                {selectedImage ? (
                  <img
                    src={`${BASE_URL}${selectedImage}`}
                    alt={product.title}
                    className="w-full h-full object-contain transition-all duration-500 hover:scale-[1.02]"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder-product.png';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 w-full">
                    <ImageIcon className="h-20 w-20 text-gray-300 mb-2" />
                    <span className="text-gray-400 font-medium">Нет изображения</span>
                  </div>
                )}
              </div>
              {/* Галерея миниатюр */}
              {(product.images && product.images.length > 0) && (
                <div className="flex flex-row gap-3 w-full">
                  {/* Основная картинка как миниатюра */}
                  <button
                    onClick={() => setSelectedImage(product.image)}
                    className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === product.image
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={`${BASE_URL}${product.image}`}
                      alt={`${product.title} thumbnail`}
                      className="w-full h-full object-contain bg-white"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-thumbnail.png';
                      }}
                    />
                  </button>
                  {/* Остальные миниатюры */}
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img.image_path)}
                      className={`flex-1 aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === img.image_path
                          ? 'border-blue-500 ring-2 ring-blue-200'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={`${BASE_URL}${img.image_path}`}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-thumbnail.png';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Информация о товаре */}
            <div className="flex-1 min-w-0 flex flex-col justify-between space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center space-x-4 mb-6">
                  <StarRating rating={rating} showNumber={true} />
                  <span className="text-sm text-gray-500">
                    ({comments.length} отзыв{comments.length !== 1 ? 'ов' : ''})
                  </span>
                </div>
              </div>
              {/* Описание */}
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Характеристики</h3>
                <div className="text-gray-600 leading-relaxed space-y-3">
                  {product.description ? (
                    product.description.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-base">
                          {paragraph.trim()}
                        </p>
                      )
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Нет описания для этого товара.</p>
                  )}
                </div>
              </div>
              {/* Характеристики */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {product.brand && (
                    <Link
                      to={`/brands/${product.brand.id}`}
                      className="text-blue-600 hover:underline flex items-center space-x-2"
                    >
                      {product.brand.logo ? (
                        <img
                          src={`${BASE_URL}${product.brand.logo}`}
                          alt={product.brand.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        product.brand.name
                      )}
                    </Link>
                  )}
                  {product?.music_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Тип:</span>
                      <span className="font-medium text-gray-900">{product.music_type.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Наличие:</span>
                    <span className={`font-medium ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.quantity > 0 ? `В наличии (${product.quantity})` : 'Нет в наличии'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Цена и действия */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-[#9E1946]">
                      {product.price} ₽
                    </span>
                    {product.old_price && (
                      <span className="text-xl text-gray-500 line-through">
                        {product.old_price} ₽
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {product.quantity > 0 ? (
                    <AddToOrder product={product} />
                  ) : (
                    <button 
                      disabled 
                      className="w-full bg-gray-300 text-gray-500 px-6 py-3 rounded-md font-medium cursor-not-allowed flex items-center justify-center"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Сейчас недоступно
                    </button>
                  )}
                  <AddToFavorite product={product} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Отзывы */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-yellow-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">Отзывы</h2>
          </div>
          {/* Форма добавления отзыва */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Напишите отзыв</h3>
            <CommentForm productId={productId} onSuccess={fetchProductData} />
          </div>
          {/* Список отзывов */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет отзывов</h3>
                <p className="text-gray-600">Будьте первым, кто оставит отзыв!</p>
              </div>
            ) : (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                  onReplySuccess={fetchProductData} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
