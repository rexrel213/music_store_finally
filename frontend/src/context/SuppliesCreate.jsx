import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const SupplyAddPage = () => {
  const [products, setProducts] = useState([]);
  const { currentUser } = useAuth();
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  useEffect(() => {
    fetch('https://ruslik.taruman.ru/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : data.data || []);
      })
      .catch(() => alert('Ошибка загрузки товаров'));
      console.log(currentUser);
  }, []);

  const handleItemChange = (idx, field, value) => {
    setItems(items =>
      items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems([...items, { product_id: '', quantity: 1 }]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.some(item => !item.product_id || !item.quantity)) {
      alert('Заполните все поля');
      return;
    }

    try {
      const res = await fetch('https://ruslik.taruman.ru/supplies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity)
          }))
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Ошибка добавления поставки');
      }

      alert('Поставка успешно добавлена!');
      setItems([{ product_id: '', quantity: 1 }]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Добавить поставку</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-4">
            <select
              value={item.product_id}
              onChange={e => handleItemChange(idx, 'product_id', e.target.value)}
              required
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">-- Выберите товар --</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>{product.title}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
              required
              className="w-20 border border-gray-300 rounded-md px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 hover:text-red-700 transition-colors"
                aria-label="Удалить товар из поставки"
              >
                Удалить
              </button>
            )}
          </div>
        ))}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={addItem}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            + Добавить товар
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
          >
            Сохранить поставку
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplyAddPage;
