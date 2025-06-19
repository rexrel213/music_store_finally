import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Music, ShoppingCart, Heart, Package, Search, Filter, Grid, List, ArrowRight, X, DollarSign, Tag, ChevronDown, SlidersHorizontal } from 'lucide-react';
import StarRating from '../context/StarRating';

const BASE_URL = 'https://ruslik.taruman.ru';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Фильтры
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [brand, setBrand] = useState('');

  // Списки брендов
  const [brandsList, setBrandsList] = useState([]);

  // Загрузка брендов при монтировании
  useEffect(() => {
    fetch(`${BASE_URL}/brand`)
      .then(res => res.json())
      .then(data => setBrandsList(data))
      .catch(() => setBrandsList([]));
  }, []);

  // Загрузка категории и продуктов с учётом фильтров
  useEffect(() => {
    if (!categoryId) return;
  
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Параметры для продуктов
        const params = new URLSearchParams();
        if (priceRange.min) params.append('price_min', priceRange.min);
        if (priceRange.max) params.append('price_max', priceRange.max);
        if (brand) params.append('brand_id', brand);
  
        // Загружаем категорию отдельно
        const categoryRes = await fetch(`${BASE_URL}/admin/categories/${categoryId}`);
        if (!categoryRes.ok) throw new Error('Категория не найдена');
        const categoryData = await categoryRes.json();
        setCategory(categoryData);
  
        // Загружаем продукты
        const productsRes = await fetch(`${BASE_URL}/admin/categories/${categoryId}/products?${params.toString()}`);
        if (!productsRes.ok) throw new Error(`Ошибка сервера: ${productsRes.status}`);
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
  
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [categoryId, priceRange, brand]);

  // Обработчики изменения фильтров
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange(prev => ({ ...prev, [name]: value }));
  };

  const clearAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    setBrand('');
  };

  const hasActiveFilters = priceRange.min || priceRange.max || brand;
  const activeFiltersCount = [priceRange.min, priceRange.max, brand].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1A2238] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Загружаем товары...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="inline-flex items-center text-[#1A2238] hover:text-[#1A2238]/80 font-medium transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                На главную
              </Link>
              <div className="hidden sm:block text-gray-400">•</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A2238]">
                {category?.name || 'Категория'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center">
                  <SlidersHorizontal className="h-6 w-6 text-[#1A2238] mr-3" />
                  <span className="font-semibold text-[#1A2238] text-lg">Фильтры</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-3 bg-[#9E1946] text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <ChevronDown className={`h-6 w-6 text-gray-400 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Filters Panel */}
            <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Filter className="h-7 w-7 text-[#1A2238] mr-3" />
                  <h2 className="text-2xl font-bold text-[#1A2238]">Фильтры</h2>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center text-sm text-[#9E1946] hover:text-[#9E1946]/80 transition-colors"
                  >
                    <X className="h-5 w-5 mr-1" />
                    Очистить все
                  </button>
                )}
              </div>

              <div className="space-y-8">
                {/* Price Range */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <DollarSign className="h-6 w-6 text-[#1A2238] mr-3" />
                    <h3 className="font-semibold text-[#1A2238] text-lg">Цена</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="number"
                        name="min"
                        value={priceRange.min}
                        onChange={handlePriceChange}
                        className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2238]/20 focus:border-[#1A2238] transition-all text-lg"
                        placeholder="Мин"
                        min="0"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₽</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        name="max"
                        value={priceRange.max}
                        onChange={handlePriceChange}
                        className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A2238]/20 focus:border-[#1A2238] transition-all text-lg"
                        placeholder="Макс"
                        min="0"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">₽</span>
                    </div>
                  </div>
                  {(priceRange.min || priceRange.max) && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      Цена: {priceRange.min || '0'} ₽ - {priceRange.max || '∞'} ₽
                    </div>
                  )}
                </div>

                {/* Brand Filter */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Tag className="h-6 w-6 text-[#1A2238] mr-3" />
                    <h3 className="font-semibold text-[#1A2238] text-lg">Бренд</h3>
                  </div>
                  <div className="relative">
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-5 py-4 pr-12 focus:ring-2 focus:ring-[#1A2238]/20 focus:border-[#1A2238] transition-all text-lg"
                    >
                      <option value="">Все бренды</option>
                      {Array.isArray(brandsList) ? brandsList.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      )) : null}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none" />
                  </div>
                  {brand && (
                    <div className="flex items-center justify-between bg-[#1A2238]/5 p-4 rounded-lg">
                      <span className="text-sm font-medium text-[#1A2238]">
                        {brandsList.find(b => b.id.toString() === brand)?.name}
                      </span>
                      <button
                        onClick={() => setBrand('')}
                        className="text-[#9E1946] hover:text-[#9E1946]/80"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Active Filters Summary */}
                {hasActiveFilters && (
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-medium text-gray-600">Активные фильтры</span>
                      <span className="bg-[#9E1946] text-white text-sm font-bold rounded-full h-7 w-7 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-[#1A2238] py-3 px-5 rounded-lg transition-colors text-base font-medium"
                    >
                      Сбросить все фильтры
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <Search className="h-6 w-6 text-gray-400 mr-3" />
                <span className="text-gray-600 text-lg">
                  Найдено {products.length} инструментов
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1A2238] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  title="Сетка"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1A2238] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                  title="Список"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <div className="text-center py-32">
                <div className="bg-white rounded-xl shadow-lg p-16">
                  <Search className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-600 mb-3">Инструменты не найдены</h3>
                  <p className="text-gray-500 mb-8 text-lg">Попробуйте изменить фильтры, чтобы увидеть больше результатов</p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="bg-[#1A2238] hover:bg-[#1A2238]/90 text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium"
                    >
                      Очистить все фильтры
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8" 
                : "space-y-6"
              }>
                {products.map(product => (
                  viewMode === 'grid' ? (
                    <article key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col group">
                      {/* Product Image */}
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
                        {/* Quick Actions */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white transition-colors shadow-lg">
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-[#1A2238] mb-3 line-clamp-2 min-h-[3.5rem] leading-tight">
                          {product.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow text-base leading-relaxed">
                          {product.description ? product.description.slice(0, 120) + '...' : 'Описание недоступно'}
                        </p>
                        
                        {/* Rating */}
                        <div className="mb-4">
                          <StarRating rating={product.avg_rating || 0} />
                        </div>
                        
                        {/* Price and Button - Fixed at bottom */}
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
                            className="w-full bg-[#1A2238] hover:bg-[#1A2238]/90 text-white px-6 py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg text-center font-semibold block text-lg flex items-center justify-center"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Подробнее
                          </Link>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <article key={product.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center space-x-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                          {product.image ? (
                            <img
                              src={`${BASE_URL}${product.image}`}
                              alt={product.title}
                              className="w-full h-full object-contain p-3"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=200';
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <Package className="h-8 w-8 mb-1" />
                              <span className="text-xs">Нет фото</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-[#1A2238] mb-2">
                            {product.title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {product.description ? product.description.slice(0, 150) + '...' : 'Описание недоступно'}
                          </p>
                          <div className="flex items-center space-x-4">
                            <StarRating rating={product.avg_rating || 0} />
                            <span className="text-2xl font-bold text-[#9E1946]">
                              {product.price} ₽
                            </span>
                            {product.old_price && (
                              <span className="text-lg text-gray-500 line-through">
                                {product.old_price} ₽
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <Link
                            to={`/products/${product.id}`}
                            className="bg-[#1A2238] hover:bg-[#1A2238]/90 text-white px-8 py-3 rounded-lg text-base font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                          >
                            Подробнее
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;