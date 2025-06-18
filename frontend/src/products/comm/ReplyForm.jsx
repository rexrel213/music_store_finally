import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, AlertCircle, X } from 'lucide-react';

const ReplyForm = ({ commentId, productId, onSuccess }) => {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = 'https://ruslik.taruman.ru';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('Пожалуйста заргестрируйтесь или войдите чтобы ответить на комментарий');
      return;
    }

    if (!content.trim()) {
      setError('Пожалуйста напишите ответ');
      return;
    }

    setSubmitting(true);

    try {
      const replyRes = await fetch(`${BASE_URL}/products/${productId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product_id: productId,
          user_id: currentUser.id,
          content,
          parent_id: commentId,
        }),
      });

      if (!replyRes.ok) {
        const errorData = await replyRes.json();
        throw new Error(errorData.detail || 'Ошибка отправки ответа на комментарий');
      }

      setContent('');
      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onSuccess}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="flex items-center p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-none text-sm"
            placeholder="Напишите свой ответ"
            disabled={submitting}
          />
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={submitting}
          >
            Закрыть
          </button>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                Sending...
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="h-3 w-3 mr-2" />
                Ответить
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyForm;