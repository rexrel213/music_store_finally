import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';

const BASE_URL = 'https://ruslik.taruman.ru'; // ваш API эндпоинт

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${BASE_URL}/brand`);
        if (!res.ok) throw new Error('Ошибка загрузки брендов');
        const data = await res.json();
        setBrands(data);
      } catch (err) {
        setError(err.message || 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            setBrands([]);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-700 text-xl">Бренды не найдены</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Список брендов</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/brands/${brand.id}`}
            className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300"
          >
            {brand.logo ? (
              <img
                src={`https://ruslik.taruman.ru${brand.logo}`}
                alt={brand.name}
                className="w-24 h-24 object-contain mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400';
                }}
              />
            ) : (
              <Package className="w-24 h-24 text-gray-300 mb-4" />
            )}
            <h2 className="text-xl font-semibold text-center text-gray-900">{brand.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BrandsPage;
