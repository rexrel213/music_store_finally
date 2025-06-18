import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThumbsUp, ThumbsDown, Heart } from 'lucide-react';

const CommentRating = ({ commentId, initialRating, onRatingChange }) => {
  const { currentUser } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [totalRating, setTotalRating] = useState(initialRating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const BASE_URL = 'https://ruslik.taruman.ru';

  // Определяем текущую оценку пользователя
  const userVote = userRating?.value;

  const handleRating = async (value) => {
    if (!currentUser) {
      setError('Please log in to rate comments');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}/products/comments/${commentId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to update rating');
      }

      const data = await res.json();
      
      // Обновляем состояние в зависимости от ответа
      if (data === null) {
        // Рейтинг был удален (отмена)
        setTotalRating(prev => prev - value);
        setUserRating(null);
      } else {
        // Новый или измененный рейтинг
        const ratingChange = userRating 
          ? (value - userRating.value) 
          : value;
        
        setTotalRating(prev => prev + ratingChange);
        setUserRating(data);
      }

      // Вызываем колбэк, если передан
      onRatingChange?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center bg-gray-100 rounded-full p-1">
        <button
          onClick={() => handleRating(1)}
          disabled={loading}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
            userVote === 1 
              ? 'bg-green-500 text-white shadow-md' 
              : 'text-gray-500 hover:bg-green-100 hover:text-green-600'
          }`}
          aria-label="Like"
        >
          <ThumbsUp className="w-4 h-4" />
        </button>
        
        <span className={`px-3 py-1 text-sm font-medium ${
          totalRating > 0 ? 'text-green-600' : 
          totalRating < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {totalRating}
        </span>
        
        <button
          onClick={() => handleRating(-1)}
          disabled={loading}
          className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
            userVote === -1 
              ? 'bg-red-500 text-white shadow-md' 
              : 'text-gray-500 hover:bg-red-100 hover:text-red-600'
          }`}
          aria-label="Dislike"
        >
          <ThumbsDown className="w-4 h-4" />
        </button>
      </div>
      
      {error && (
        <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default CommentRating;