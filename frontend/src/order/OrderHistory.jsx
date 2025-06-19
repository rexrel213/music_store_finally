import { useState, useEffect } from 'react';
import { ShoppingBag, Package, Clock, AlertCircle, Loader2, PackageX, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BASE_URL = 'https://ruslik.taruman.ru';

const OrderStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'оплачено':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'корзина':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'отменено':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor()} shadow-sm`}>
      {status || 'Неизвестно'}
    </span>
  );
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/order/me/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Ошибка загрузки истории заказов');
      }

      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#1A2238] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start shadow-lg">
          <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <PackageX className="h-20 w-20 text-[#1A2238] mb-6" />
        <h2 className="text-3xl font-bold text-[#1A2238] mb-2 font-['Playfair_Display']">
          Пока заказов нет
        </h2>
        <p className="text-gray-600 mb-8 max-w-md text-lg">
          Похоже, вы ещё не сделали ни одного заказа.<br />
          Начните покупки, чтобы увидеть историю заказов здесь.
        </p>
        <Link 
          to="/categories" 
          className="inline-flex items-center bg-[#1A2238] hover:bg-[#9E1946] text-white px-7 py-3 rounded-xl text-lg font-semibold shadow-md transition-all"
        >
          <ShoppingBag className="mr-3 h-5 w-5" />
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center mb-10">
        <Package className="h-10 w-10 text-[#1A2238] mr-4" />
        <h1 className="text-4xl font-bold text-[#1A2238] font-['Playfair_Display'] tracking-tight">
          История заказов
        </h1>
      </div>

      <div className="space-y-10">
        {orders.map((order) => (
          <div
            key={order?.id || Math.random()}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-wrap items-center justify-between">
              <div>
                <p className="text-base text-gray-500 mb-1">Заказ <span className="font-semibold text-[#9E1946]">#{order?.id || 'N/A'}</span></p>
                <div className="flex items-center space-x-4">
                  <OrderStatus status={order?.status} />
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {order?.created_at ? new Date(order.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-lg font-bold text-[#1A2238]">
                  {order?.order_items?.reduce((sum, item) => sum + ((item?.quantity || 0) * (item?.product?.price || 0)), 0).toLocaleString()} ₽
                </span>
                <span className="text-sm text-gray-500">
                  {order?.order_items?.length || 0} товаров
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="divide-y divide-gray-100">
              {order?.order_items?.map((item) => (
                <div
                  key={item?.id || Math.random()}
                  className="p-6 flex flex-col sm:flex-row items-center gap-6 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                    <img
                      src={item?.product?.image ? `${BASE_URL}${item.product.image}` : 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item?.product?.title || 'Product'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <h3 className="text-lg font-semibold text-[#1A2238] mb-1 line-clamp-2">
                      {item?.product?.title || 'Неизвестный товар'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-2">
                      <span>Количество: <span className="font-semibold text-[#1A2238]">{item?.quantity || 0}</span></span>
                      <span>Цена: <span className="font-semibold text-[#9E1946]">{item?.product?.price || 0}₽</span></span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <Link to={`/products/${item.product.id}`}>
                       <ChevronRight className="h-6 w-6 text-gray-300" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Barcode (если есть) */}
            {order?.barcode && (
              <div className="flex justify-center items-center bg-gray-50 py-6">
                <img 
                  src={`${BASE_URL}/static/barcodes/order_${order.id}.png`} 
                  alt={`Штрихкод заказа #${order.id}`} 
                  className="w-40 h-40 object-contain"
                />
              </div>
            )}

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 flex justify-end items-center">
              <span className="text-base text-gray-500">
                Спасибо за покупку!
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
