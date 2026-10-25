import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from '../data/types';
import BookCover from './BookCover';
import { useAuth } from '../store/AuthContext';
import { useShelf } from '../store/ShelfContext';
import { useModal } from '../store/ModalContext';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  const { user } = useAuth();
  const { getEntry, addToShelf, removeFromShelf } = useShelf();
  const { openLogin } = useModal();
  const navigate = useNavigate();
  const entry = getEntry(book.id);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openLogin(() => addToShelf(book.id, 'want'));
      return;
    }
    if (entry) {
      removeFromShelf(book.id);
    } else {
      addToShelf(book.id, 'want');
    }
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/kham-pha?tacgia=${encodeURIComponent(book.author)}`);
  };

  return (
    <div className="group relative flex flex-col">
      {/* Cover */}
      <Link to={`/sach/${book.id}`} className="relative block rounded-xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink">
        <BookCover
          title={book.title}
          author={book.author}
          gradient={book.gradient}
          size="md"
          className="w-full !h-52"
        />
        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          aria-label={entry ? 'Bỏ khỏi tủ sách' : 'Lưu vào tủ sách'}
          className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center bg-white/80 hover:bg-white transition-colors shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
        >
          {entry ? (
            <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" />
            </svg>
          )}
        </button>
      </Link>

      {/* Info */}
      <div className="mt-3 flex flex-col gap-0.5">
        <Link
          to={`/sach/${book.id}`}
          className="font-semibold text-ink leading-snug hover:underline line-clamp-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
        >
          {book.title}
        </Link>
        <button
          onClick={handleAuthorClick}
          className="text-muted text-xs text-left hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
        >
          {book.author}
        </button>
        <p className="text-ink text-xs font-medium mt-0.5">
          ★ {book.baseRating.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
