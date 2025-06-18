import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Music, Star, ShoppingCart, Heart, Package, Search, Filter, Grid, List, ArrowRight } from 'lucide-react';
import StarRating from '../context/StarRating';

const BASE_URL = 'https://ruslik.taruman.ru';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (!categoryId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryRes = await fetch(`${BASE_URL}/admin/categories/${categoryId}`);
        if (!categoryRes.ok) throw new Error('Ошибка загрузки категории');
        const categoryData = await categoryRes.json();
        setCategory(categoryData);

        const productsRes = await fetch(`${BASE_URL}/admin/categories/${categoryId}/products`);
        if (!productsRes.ok) throw new Error('Ошибка загрузки товаров');
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'name':
      default:
        return (a.title || '').localeCompare(b.title || '');
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Загружаем товары...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ошибка загрузки</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <Link 
              to="/" 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                На главную
              </Link>
              <div className="hidden sm:block text-gray-400">•</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {category?.name || 'Категория'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Найдено {products.length} инструментов
            </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Description */}
        {category?.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">О категории</h2>
                <p className="text-gray-600 leading-relaxed">{category.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">По названию</option>
                <option value="price-low">Сначала дешевые</option>
                <option value="price-high">Сначала дорогие</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              В этой категории пока нет товаров
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              Мы работаем над добавлением новых инструментов. Загляните позже!
            </p>
            <Link
              to="/products"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <Music className="w-4 h-4 mr-2" />
              Посмотреть все товары
            </Link>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-6"
          }>
            {sortedProducts.map((product, index) => (
              viewMode === 'grid' ? (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  {/* Product Image */}
                  <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={product.image ? `${BASE_URL}${product.image}` : 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-colors shadow-lg">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
                      {product.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.description?.length > 80
                        ? product.description.slice(0, 80) + '...'
                        : product.description || 'Качественный музыкальный инструмент для профессионалов и любителей'}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      <StarRating rating={product.avg_rating || 0} size="sm" />
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-[#9E1946]">
                          {product.price?.toLocaleString('ru-RU') || '0'} ₽
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/products/${product.id}`}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center group-hover:shadow-lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Подробнее
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="flex items-start p-6 space-x-6">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={product.image ? `${BASE_URL}${product.image}` : 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=200'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {product.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {product.description?.length > 150
                          ? product.description.slice(0, 150) + '...'
                          : product.description || 'Качественный музыкальный инструмент для профессионалов и любителей'}
                      </p>

                      <div className="flex items-center space-x-4 mb-4">
                        <StarRating rating={product.rating || 4.5} size="sm" />
                        <span className="text-sm text-gray-500">
                          ({product.reviews_count || Math.floor(Math.random() * 50) + 10} отзывов)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl font-bold text-blue-600">
                            {product.price?.toLocaleString('ru-RU') || '0'} ₽
                          </span>
                          {product.old_price && (
                            <span className="text-lg text-gray-500 line-through">
                              {product.old_price.toLocaleString('ru-RU')} ₽
                            </span>
                          )}
                        </div>
                        
                        <Link
                          to={`/products/${product.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          Подробнее
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CategoryPage;