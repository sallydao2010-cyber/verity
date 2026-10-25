import React from 'react';
import { Gradient } from '../data/types';

const GRADIENTS: Record<Gradient, [string, string]> = {
  amber: ['#E9B565', '#A34D2E'],
  navy: ['#243750', '#111A26'],
  sage: ['#BFC9AC', '#5E7565'],
  peach: ['#EDB8A0', '#C98370'],
};

interface BookCoverProps {
  title: string;
  author?: string;
  gradient: Gradient;
  size?: 'sm' | 'md' | 'lg';
  showAuthor?: boolean;
  className?: string;
}

export default function BookCover({
  title,
  author,
  gradient,
  size = 'md',
  showAuthor = false,
  className = '',
}: BookCoverProps) {
  const [from, to] = GRADIENTS[gradient];

  const sizeClasses = {
    sm: 'w-24 h-32',
    md: 'w-36 h-48',
    lg: 'w-48 h-64',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg flex-shrink-0 select-none ${sizeClasses[size]} ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {/* Spine line */}
      <div
        className="absolute left-3 top-0 bottom-0 w-px opacity-30"
        style={{ background: 'rgba(255,255,255,0.6)' }}
      />
      {/* Corner circle decoration */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 border border-white"
      />

      {/* Label */}
      <p
        className="absolute top-3 left-5 right-3 text-white opacity-70"
        style={{ fontSize: '6px', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}
      >
        Tác phẩm chọn lọc
      </p>

      {/* Title */}
      <p
        className="absolute top-8 left-5 right-3 text-white font-extrabold leading-tight uppercase"
        style={{
          fontSize: size === 'lg' ? '14px' : size === 'md' ? '11px' : '8px',
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </p>

      {/* Author – only on large covers */}
      {showAuthor && author && (
        <p
          className="absolute bottom-3 left-5 right-3 text-white uppercase opacity-80"
          style={{ fontSize: '7px', letterSpacing: '0.1em', fontWeight: 600 }}
        >
          {author}
        </p>
      )}
    </div>
  );
}
