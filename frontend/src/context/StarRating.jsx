import { Star } from 'lucide-react';

const StarRating = ({ rating }) => {
  const safeRating = typeof rating === 'number' ? Math.min(Math.max(rating, 0), 5) : 0;
  const fullStars = Math.floor(safeRating);
  const halfStar = safeRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-6 w-6 text-yellow-400 fill-current" />
      ))}
      {halfStar && <Star key="half" className="h-6 w-6 text-yellow-200 fill-current" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-6 w-6 text-gray-300" />
      ))}
    </div>
  );
};

export default StarRating;

