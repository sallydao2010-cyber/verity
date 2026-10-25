import React from 'react';

interface StarRatingProps {
  value: number;            // current value (can be float for display)
  max?: number;
  interactive?: boolean;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
}: StarRatingProps) {
  const sizePx = { sm: 16, md: 20, lg: 28 }[size];

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} trên ${max} sao`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = value >= i + 1;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.((i + 1) as 1 | 2 | 3 | 4 | 5)}
            className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded' : 'cursor-default'}`}
            aria-label={interactive ? `${i + 1} sao` : undefined}
            style={{ fontSize: sizePx }}
          >
            <svg
              width={sizePx}
              height={sizePx}
              viewBox="0 0 24 24"
              fill={filled ? '#111111' : 'none'}
              stroke="#111111"
              strokeWidth={1.5}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </span>
  );
}
