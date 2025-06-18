import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, AlertCircle, LogIn, Star } from 'lucide-react';

const CommentForm = ({ productId, onSuccess }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = 'https://ruslik.taruman.ru';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
  
    if (!currentUser) {
      setError('Please log in to leave a review');
      return;
    }
  
    if (!content.trim()) {
      setError('Please write a review');
      return;
    }
  
    setSubmitting(true);
  
    try {
      // 1. Отправляем комментарий (без рейтинга)
      const commentRes = await fetch(`${BASE_URL}/products/${productId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: currentUser.id,
          content,
        }),
      });
  
      if (!commentRes.ok) {
        const errorData = await commentRes.json();
        throw new Error(errorData.detail || 'Error submitting comment');
      }
  
      // 2. Если рейтинг выбран, отправляем отдельный запрос для обновления рейтинга товара
      if (rating > 0) {
        const ratingRes = await fetch(`${BASE_URL}/products/${productId}/rating`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            product_id: productId,
            user_id: currentUser.id,
            value: rating
          }),
        });
  
        if (!ratingRes.ok) {
          const errorData = await ratingRes.json();
          throw new Error(errorData.detail || 'Error updating product rating');
        }
      }
  
      setContent('');
      setRating(0);
      if (onSuccess) onSuccess();
  
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-md p-8 text-center border border-blue-200">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Войдите, чтобы оставить комментарий
        </h3>
        <p className="text-gray-600 mb-6">
          Пожалуйста, войдите в систему, чтобы поделиться своим опытом использования этого продукта.
        </p>
        <a 
          href="/login" 
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
        >
          <LogIn className="h-4 w-4 mr-2" />
          Войти
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      {error && (
        <div className="flex items-center p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Можете оценить этот инструмент
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`p-1 rounded transition-colors ${
                  star <= rating 
                    ? 'text-yellow-400 hover:text-yellow-500' 
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                <Star 
                  className={`h-6 w-6 ${star <= rating ? 'fill-current' : ''}`} 
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {rating} star{rating !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Review Text */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Ваш комментарий *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
            placeholder="Поделитесь своим мнение об инструменте"
            disabled={submitting}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Submitting...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Отправить
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;