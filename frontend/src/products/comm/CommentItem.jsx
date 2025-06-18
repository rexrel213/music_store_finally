import React, { useState } from 'react';
import { Clock, Edit, MessageSquare } from 'lucide-react';
import ReplyForm from './ReplyForm'; // предполагается, что есть компонент формы ответа
import CommentRating from './CommentRatingForm'; // компонент рейтинга комментария
import Avatar from '../../context/Avatar'; // компонент аватара пользователя
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://ruslik.taruman.ru';

const CommentItem = ({ comment, onReplySuccess, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/products/comments/${comment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
              body: JSON.stringify({
        content: editContent,
        user_id: comment.user_id,
        product_id: comment.product_id,
      }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Не удалось обновить комментарий');
      }
      setIsEditing(false);
      onReplySuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className={`${level > 0 ? 'ml-8 pl-6 border-l-2 border-gray-200' : ''} bg-white border border-gray-200 rounded-lg p-6 shadow-sm`}>
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Avatar userId={comment.user_id} />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h4 className="font-semibold text-gray-900">
                {comment.user?.name || 'Anonymous User'}
              </h4>
              {comment.parent && comment.parent.user?.name && (
                <span className="text-sm text-muted">
                  <span className="mx-1">→</span>
                  <span className="font-medium text-blue-700">в ответ {comment.parent.user.name}</span>
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <time dateTime={comment.created_at}>
                {new Date(comment.created_at).toLocaleDateString()}
              </time>
            </div>
            {currentUser?.id === comment.user_id && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-blue-600 hover:underline text-sm"
              >
                <Edit className="w-4 h-4 mr-1" />
                Редактировать
              </button>
            )}
          </div>

          <div className="prose max-w-none mb-4">
            {isEditing ? (
              <>
                <textarea
                  className="w-full border rounded p-2"
                  rows={4}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  disabled={loading}
                />
                {error && <div className="text-red-600 my-2">{error}</div>}
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {loading ? 'Saving...' : 'Сохранить'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content);
                      setError(null);
                    }}
                    disabled={loading}
                    className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                  >
                    Закрыть
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-700 leading-relaxed">{comment.content}</p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <CommentRating 
              commentId={comment.id} 
              initialRating={comment.rating || 0}
              onRatingChange={onReplySuccess}
            />
            {currentUser && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Ответить
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <ReplyForm 
                commentId={comment.id} 
                productId={comment.product_id} 
                onSuccess={() => {
                  setShowReplyForm(false);
                  onReplySuccess();
                }} 
              />
            </div>
          )}

          {comment.children && comment.children.length > 0 && (
            <div className="mt-6 space-y-4">
              {comment.children.map(child => (
                <CommentItem
                  key={child.id}
                  comment={child}
                  onReplySuccess={onReplySuccess}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
