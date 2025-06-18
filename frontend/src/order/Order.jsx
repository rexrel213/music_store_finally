import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, Trash2, Plus, Minus, PackageX, ShoppingBag, Loader2, ExternalLink, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BASE_URL = 'https://ruslik.taruman.ru';

const Order = () => {
  const { currentUser } = useAuth();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});

  // Загрузка корзины
  const fetchOrderItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/order/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Ошибка загрузки корзины');
      }
      const data = await res.json();
      setOrderItems(data.order_items || []);
      // Инициализация: все товары выбраны
      const initialSelection = {};
      (data.order_items || []).forEach(item => {
        initialSelection[item.id] = true;
      });
      setSelectedItems(initialSelection);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {  
    fetchOrderItems();
  }, []);

  // Удаление товара
  const handleRemove = async (itemId) => {
    try {
      const res = await fetch(`${BASE_URL}/order/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (!res.ok) throw new Error('Ошибка удаления товара');
      await fetchOrderItems();
      toast.success('Товар удалён из корзины', { position: 'bottom-right' });
    } catch (e) {
      setError(e.message);
      toast.error(`Ошибка: ${e.message}`, { position: 'bottom-right' });
    }
  };

  // Увеличить количество
  const handleIncrease = async (item) => {
    try {
      const res = await fetch(`${BASE_URL}/order/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      });
      if (!res.ok) throw new Error('Ошибка увеличения количества');
      await fetchOrderItems();
    } catch (e) {
      setError(e.message);
      toast.error(`Ошибка: ${e.message}`, { position: 'bottom-right' });
    }
  };

  // Уменьшить количество
  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;
    try {
      const res = await fetch(`${BASE_URL}/order/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ quantity: item.quantity - 1 }),
      });
      if (!res.ok) throw new Error('Ошибка уменьшения количества');
      await fetchOrderItems();
    } catch (e) {
      setError(e.message);
      toast.error(`Ошибка: ${e.message}`, { position: 'bottom-right' });
    }
  };

  // Переключение чекбокса
  const toggleSelectItem = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Выбрать/снять все
  const toggleSelectAll = () => {
    const allSelected = orderItems.every(item => selectedItems[item.id]);
    const newSelection = {};
    orderItems.forEach(item => {
      newSelection[item.id] = !allSelected;
    });
    setSelectedItems(newSelection);
  };

  // Итоговая сумма только по выбранным товарам
  const totalPrice = orderItems.reduce((sum, item) => {
    if (selectedItems[item.id]) {
      return sum + item.product.price * item.quantity;
    }
    return sum;
  }, 0);

  // Оформить только выбранные товары
  const handleCheckout = async () => {
    const selectedIds = orderItems.filter(item => selectedItems[item.id]).map(item => item.id);
    if (selectedIds.length === 0) {
      toast.error('Выберите хотя бы один товар для оформления!', { position: 'bottom-right' });
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/order/me/checkout`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ items_ids: selectedIds })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Ошибка оформления заказа");
      }
      const data = await res.json();
      toast.success('Товар куплен, спасибо за покупку!', { position: 'bottom-right' });
      fetchOrderItems(); // обновить корзину
    } catch (e) {
      setError(e.message);
      toast.error(`Ошибка: ${e.message}`, { position: 'bottom-right' });
    }
  };

  // --- UI ---
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
          <p className="text-red-700">Ошибка: {error}</p>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#1A2238]" />
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <PackageX className="h-20 w-20 text-[#1A2238] mb-6" />
        <h2 className="text-3xl font-bold text-[#1A2238] mb-2 font-['Playfair_Display']">
          Ваша корзина пуста
        </h2>
        <p className="text-gray-600 mb-8 max-w-md text-lg">
          Похоже, вы ещё не добавили товары в корзину. Перейдите в каталог, чтобы выбрать инструменты!
        </p>
        <Link 
          to="/products" 
          className="inline-flex items-center bg-[#1A2238] hover:bg-[#9E1946] text-white px-7 py-3 rounded-xl text-lg font-semibold shadow-md transition-all"
        >
          <ShoppingBag className="mr-3 h-5 w-5" />
          Перейти в каталог
        </Link>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center mb-10">
        <ShoppingCart className="h-10 w-10 text-[#1A2238] mr-4" />
        <h1 className="text-4xl font-bold text-[#1A2238] font-['Playfair_Display'] tracking-tight">
          Корзина
        </h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100">
        <div className="flex items-center p-5 border-b bg-gradient-to-r from-gray-50 to-white">
          <input
            type="checkbox"
            checked={orderItems.every(item => selectedItems[item.id])}
            onChange={toggleSelectAll}
            className="h-5 w-5 mr-2 accent-[#1A2238]"
          />
          <span className="text-gray-700 font-medium">Выбрать все</span>
        </div>
        <div className="divide-y divide-gray-100">
          {orderItems.map(item => (
            <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6 bg-white hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={!!selectedItems[item.id]}
                onChange={() => toggleSelectItem(item.id)}
                className="h-5 w-5 mr-4 accent-[#1A2238]"
              />
              <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center">
                <img
                  src={`${BASE_URL}${item.product.image}`}
                  alt={item.product.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 w-full">
                <h3 className="text-lg font-semibold text-[#1A2238] mb-1 line-clamp-2">
                  {item.product.title}
                </h3>
                <p className="text-[#9E1946] font-medium text-base mb-2">
                  {item.product.price} ₽
                </p>
                <div className="flex items-center border rounded-lg w-fit">
                  <button
                    className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
                    onClick={() => handleDecrease(item)}
                    disabled={item.quantity <= 1}
                    title="Уменьшить количество"
                  >
                    <Minus className="h-4 w-4 text-[#1A2238]" />
                  </button>
                  <span className="px-4 py-2 font-medium">{item.quantity}</span>
                  <button
                    className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                    onClick={() => handleIncrease(item)}
                    title="Увеличить количество"
                  >
                    <Plus className="h-4 w-4 text-[#1A2238]" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  title="Удалить товар"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <Link 
                  to={`/products/${item.product.id}`}
                  className="inline-flex items-center text-[#1A2238] hover:text-[#9E1946] text-sm font-medium transition-colors"
                >
                  Подробнее
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg text-gray-600">Итого</span>
          <span className="text-3xl font-bold text-[#1A2238]">
            {totalPrice.toFixed(2)} ₽
          </span>
        </div>
        <button 
          className="w-full bg-[#1A2238] hover:bg-[#9E1946] text-white py-4 rounded-xl text-lg font-semibold shadow-md transition-all flex items-center justify-center"
          onClick={handleCheckout}
          disabled={loading}
        >
          <CheckSquare className="mr-3 h-6 w-6" />
          Оформить заказ на выбранное
        </button>
        <Link 
          to="/products"
          className="w-full mt-4 bg-white hover:bg-gray-50 border border-[#1A2238] text-[#1A2238] py-4 rounded-xl text-lg font-semibold shadow transition-all flex items-center justify-center"
        >
          Продолжить покупки
        </Link>
      </div>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Order;
