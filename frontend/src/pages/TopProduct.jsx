import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import StarRating from '../context/StarRating';

const BASE_URL = 'https://ruslik.taruman.ru';

const HighRatingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products/top`);
        if (!res.ok) throw new Error('Ошибка загрузки товаров');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center py-10">Загрузка товаров...</p>;
  if (error) return <p className="text-red-600 text-center py-10">Ошибка: {error}</p>;
  if (products.length === 0) return <p className="text-center py-10">Товары с рейтингом 4 и выше не найдены.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-6">
      {products.map(product => (
        <article
          key={product.id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col group"
        >

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
                <Package className="h-16 w-16 mb-2" />
                <span className="text-sm font-medium">Изображение недоступно</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold text-[#1A2238] mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
              {product.title}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-base leading-relaxed">
              {product.description ? product.description.slice(0, 120) + '...' : 'Описание недоступно'}
            </p>

            
            <div className="mb-4">
              <StarRating rating={product.avg_rating || 0} />
            </div>

            
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-bold text-[#9E1946]">
                  {product.price} ₽
                </span>
                {product.old_price && (
                  <span className="text-lg text-gray-500 line-through">
                    {product.old_price} ₽
                  </span>
                )}
              </div>
              <Link
                to={`/products/${product.id}`}
                className="w-full bg-[#1A2238] hover:bg-[#1A2238]/90 text-white px-6 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center font-semibold block text-lg"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default HighRatingProducts;
