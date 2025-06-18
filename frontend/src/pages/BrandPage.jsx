import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ShoppingCart, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import StarRating from '../context/StarRating';

const BASE_URL = 'https://ruslik.taruman.ru';

const BrandPage = () => {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const brandRes = await fetch(`${BASE_URL}/brand/${brandId}`);
        if (!brandRes.ok) throw new Error('Ошибка загрузки бренда');
        const brandData = await brandRes.json();

        const productsRes = await fetch(`${BASE_URL}/products?brand_id=${brandId}`);
        if (!productsRes.ok) throw new Error('Ошибка загрузки товаров бренда');
        const productsData = await productsRes.json();

        setBrand(brandData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchBrandData();
  }, [brandId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Загрузка бренда...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link
              to="/brands"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к брендам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Бренд не найден</h2>
            <p className="text-gray-600 mb-6">Запрашиваемый бренд не существует</p>
            <Link
              to="/brands"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к брендам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-6">
            {brand.logo ? (
              <div className="w-20 h-20 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
                <img
                  src={`${BASE_URL}${brand.logo}`}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400';
                  }}
                />
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.name}</h1>
              {brand.description && (
                <p className="text-gray-600 text-lg max-w-2xl">{brand.description}</p>
              )}
              <div className="flex items-center mt-4 text-sm text-gray-500">
                <Package className="w-4 h-4 mr-1" />
                {products.length} {products.length === 1 ? 'товар' : 'товаров'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Товары отсутствуют</h3>
            <p className="text-gray-600 mb-8">У этого бренда пока нет доступных товаров</p>
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Посмотреть все товары
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Товары бренда {brand.name} </h2>
              <div className="text-sm text-gray-500">
                Найдено: {products.length} {products.length === 1 ? 'товар' : 'товаров'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col group"
                >
                  {/* Изображение */}
                  <div className="relative h-72 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {product.image ? (
                      <img
                        src={`${BASE_URL}${product.image}`}
                        alt={product.title}
                        className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400';
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

                  {/* Информация о товаре */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-[#1A2238] mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-base leading-relaxed">
                      {product.description
                        ? product.description.length > 120
                          ? product.description.slice(0, 120) + '...'
                          : product.description
                        : 'Описание недоступно'}
                    </p>

                    {/* Рейтинг */}
                    <div className="mb-4">
                      <StarRating rating={product.avg_rating || 0} />
                    </div>

                    {/* Цена и кнопка */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-2xl font-bold text-[#9E1946]">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
