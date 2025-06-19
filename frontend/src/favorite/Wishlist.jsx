import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Loader2, PackageX, ExternalLink, Trash2 } from 'lucide-react';
import AddToOrderButton from '../order/AddToOrder';

const BASE_URL = 'https://ruslik.taruman.ru';

const Wishlist = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const response = await fetch(`${BASE_URL}/favorites`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error('Ошибка загрузки избранного');
        }
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Ошибка загрузки избранного');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUser]);

  const handleRemoveFromWishlist = useCallback(async (favoriteId) => {
    try {
      const response = await fetch(`${BASE_URL}/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error('Ошибка удаления товара из избранного');
      }
      setFavorites((prev) => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ошибка удаления товара');
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Heart className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Авторизуйтесь, чтобы сохранить товары в избранном
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Авторизуйтесь или создайте учетную запись, чтобы сохранить товары в избранном
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Войти
          </button>
          <button
            onClick={() => navigate('/register')}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gray-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded max-w-xl mx-auto my-10">
        <p className="text-red-700">Ошибка: {error}</p>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <PackageX className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ваш список избранного пуст
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Добавьте товары в избранное, чтобы сохранить их для последующего просмотра
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center"
        >
          Найти товары
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-8 py-6 overflow-visible">
      {favorites.map((favorite) => {
        const product = favorite.product;
        return (
          <article
            key={favorite.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col group relative"
          >
            <button
              onClick={() => handleRemoveFromWishlist(favorite.id)}
              className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
              title="Удалить из избранного"
              aria-label="Удалить из избранного"
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </button>

            <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {product.image ? (
                <img
                  src={`${BASE_URL}${product.image}`}
                  alt={product.title}
                  className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <PackageX className="h-16 w-16 mb-2" />
                  <span className="text-sm font-medium">Изображение недоступно</span>
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-[#1A2238] mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
                {product.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-base leading-relaxed">
                {product.description ? product.description.slice(0, 120) + '...' : 'Описание недоступно'}
              </p>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-bold text-[#9E1946]">
                    {product.price} ₽
                  </span>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 bg-[#1A2238] hover:bg-[#1A2238]/90 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center font-semibold block text-lg flex items-center justify-center"
                  >
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Подробнее
                  </Link>
                  <AddToOrderButton 
                    product={product} 
                    className="text-sm px-4 py-2 rounded-xl border border-[#1A2238] text-[#1A2238] hover:bg-[#1A2238] hover:text-white transition-colors font-semibold"
                  />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
};

export default Wishlist;
