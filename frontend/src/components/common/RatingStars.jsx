import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, max = 5, interactive = false, onRate = () => {}, size = 'md' }) => {
  const stars = Array.from({ length: max }, (_, index) => index + 1);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((starVal) => {
        const isFilled = starVal <= Math.round(rating);
        return (
          <button
            key={starVal}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate(starVal)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${starSizes[size] || starSizes.md} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-600 fill-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
