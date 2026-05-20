import React, { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * ReviewStars — inline hoverable 5-star rating row.
 * Local hover state avoids prop-drilling a global dictionary.
 * Calls onOpenReview(product, starValue) when a star is clicked,
 * which opens WriteReviewModal in Profile.jsx with the pre-selected rating.
 */
const ReviewStars = React.memo(({ product, onOpenReview }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50/55 border-b border-slate-100/50">
      <span className="text-xs font-bold text-slate-700">Rate &amp; Review</span>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isLit = hovered >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onOpenReview(product, star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-all hover:scale-125 active:scale-90 cursor-pointer"
            >
              <Star
                size={16}
                fill={isLit ? '#fbbf24' : 'none'}
                strokeWidth={1.5}
                className={isLit ? 'text-amber-400' : 'text-slate-300'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
});

ReviewStars.displayName = 'ReviewStars';
export default ReviewStars;
