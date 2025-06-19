import React, { useState, useEffect } from 'react';
import { Heart, HeartOff, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'https://ruslik.taruman.ru';

const AddToFavoriteButton = ({ product }) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [adding, setAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null); // ID избранного для удаления
  const [messageType, setMessageType] = useState('success');

  // При загрузке проверяем, в избранном ли продукт
  useEffect(() => {
    if (!currentUser) {
      setIsFavorite(false);
      setFavoriteId(null);
      return;
    }

    const checkFavorite = async () => {
      try {
        const res = await fetch(`${BASE_URL}/favorites/check?product_id=${product.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Ошибка проверки избранного');
        const data = await res.json();
        if (data.is_favorite) {
          setIsFavorite(true);
          setFavoriteId(data.favorite_id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    };

    checkFavorite();
  }, [currentUser, product.id]);

  const handleAddToFavorite = async () => {
    if (!currentUser) {
      setMessage('Пожалуйста, войдите в систему, чтобы добавить в избранное');
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setAdding(true);
    setMessage('');

    try {
      const response = await fetch(`${BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ product_id: product.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка добавления в избранное');
      }

      const data = await response.json();
      setIsFavorite(true);
      setFavoriteId(data.id); // получаем ID созданного избранного
      setMessage('Добавлено в избранное!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFromFavorite = async () => {
    if (!currentUser || !favoriteId) return;

    setAdding(true);
    setMessage('');

    try {
      const response = await fetch(`${BASE_URL}/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка удаления из избранного');
      }

      setIsFavorite(false);
      setFavoriteId(null);
      setMessage('Удалено из избранного');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Ошибка: ${error.message}`);
      setMessageType('error');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={isFavorite ? handleRemoveFromFavorite : handleAddToFavorite}
        disabled={adding}
        className={`w-full flex items-center justify-center py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
          isFavorite
            ? 'bg-red-50 border-2 border-red-500 text-red-600 hover:bg-red-100'
            : 'border-2 border-[#1A2238] text-[#1A2238] hover:bg-[#1A2238]/10'
        } ${adding ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {adding ? (
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-current mr-2"></div>
        ) : isFavorite ? (
          <HeartOff className="h-5 w-5 mr-2" />
        ) : (
          <Heart className="h-5 w-5 mr-2" />
        )}
        <span className="font-medium">
          {adding
            ? isFavorite
              ? 'Удаление...'
              : 'Добавление...'
            : isFavorite
            ? 'Удалить из избранного'
            : 'Добавить в желаемое'}
        </span>
      </button>

      {message && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm font-medium flex items-center ${
            messageType === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {messageType === 'error' ? (
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          ) : (
            <Check className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          {message}
        </div>
      )}
    </div>
  );
};

export default AddToFavoriteButton;
