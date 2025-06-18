import { useState } from 'react';
import { Star } from 'lucide-react';

const ProductRatingInput = ({ productId, onRated }) => {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const BASE_URL = 'https://ruslik.taruman.ru';

  const handleRate = async (value) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/products/${productId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Ошибка при отправке рейтинга');
      }
      setSelected(value);
      if (onRated) onRated(value);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex space-x-1 mb-2">
        {[1,2,3,4,5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hovered || selected)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {selected > 0 && <p className="text-green-600">Спасибо за оценку!</p>}
    </div>
  );
};

export default ProductRatingInput;
