import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import BookCard from '../components/BookCard';
import StarRating from '../components/StarRating';
import { getBookById, BOOKS } from '../data/books';
import { ShelfStatus, Review } from '../data/types';
import { useAuth } from '../store/AuthContext';
import { useShelf } from '../store/ShelfContext';
import { useModal } from '../store/ModalContext';
import {
  getAllReviews,
  getBookReviews,
  saveReview,
  getUserReviewForBook,
} from '../data/storage';

const STATUS_LABELS: Record<ShelfStatus, string> = {
  want: 'Muốn đọc',
  reading: 'Đang đọc',
  read: 'Đã đọc',
};

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEntry, addToShelf, changeStatus, removeFromShelf } = useShelf();
  const { openLogin } = useModal();

  const book = id ? getBookById(id) : undefined;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [shelfMenuOpen, setShelfMenuOpen] = useState(false);

  // Review form
  const reviewRef = React.useRef<HTMLDivElement>(null);
  const [myRating, setMyRating] = useState<number>(0);
  const [myText, setMyText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (id) setReviews(getBookReviews(id));
  }, [id]);

  useEffect(() => {
    // Pre-fill if user already has a review
    if (user && id) {
      const existing = getUserReviewForBook(user.id, id);
      if (existing) {
        setMyRating(existing.rating);
        setMyText(existing.text);
      }
    }
  }, [user, id]);

  if (!book) {
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center flex flex-col items-center gap-4">
            <p className="text-ink font-semibold text-lg">Không tìm thấy cuốn sách này</p>
            <button
              onClick={() => navigate('/kham-pha')}
              className="bg-ink text-white font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-sm"
            >
              Quay lại Khám phá
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const entry = getEntry(book.id);

  // Compute weighted rating
  const localReviews = reviews;
  const computedRating = useMemo(() => {
    if (localReviews.length === 0) return book.baseRating;
    const localSum = localReviews.reduce((s, r) => s + r.rating, 0);
    const totalCount = book.baseRatingCount + localReviews.length;
    return (book.baseRating * book.baseRatingCount + localSum) / totalCount;
  }, [book, localReviews]);

  const totalRatingCount = book.baseRatingCount + localReviews.length;
  const totalReviewCount = book.baseReviewCount + localReviews.length;

  // Star distribution
  const distribution = useMemo((): Record<number, number> => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    localReviews.forEach((r) => { dist[r.rating] = (dist[r.rating] ?? 0) + 1; });
    const total = book.baseRatingCount;
    const avg = book.baseRating;
    const approxDist: Record<number, number> = {
      5: Math.round(total * (avg >= 4.5 ? 0.6 : 0.4)),
      4: Math.round(total * 0.25),
      3: Math.round(total * 0.1),
      2: Math.round(total * 0.03),
      1: Math.round(total * 0.02),
    };
    return {
      5: approxDist[5] + dist[5],
      4: approxDist[4] + dist[4],
      3: approxDist[3] + dist[3],
      2: approxDist[2] + dist[2],
      1: approxDist[1] + dist[1],
    };
  }, [book, localReviews]);

  const handleShelfAction = (status: ShelfStatus) => {
    if (!user) {
      openLogin(() => { addToShelf(book.id, status); });
      setShelfMenuOpen(false);
      return;
    }
    if (entry) changeStatus(book.id, status);
    else addToShelf(book.id, status);
    setShelfMenuOpen(false);
  };

  const handleRemoveShelf = () => {
    removeFromShelf(book.id);
    setShelfMenuOpen(false);
  };

  const handleWriteReview = () => {
    if (!user) {
      openLogin(() => {
        setTimeout(() => {
          reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
      return;
    }
    reviewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLogin(() => handleSubmitReview(e));
      return;
    }
    setReviewError('');
    if (myRating === 0) { setReviewError('Vui lòng chọn số sao.'); return; }
    if (myText.trim().length < 10) { setReviewError('Nhận xét phải có ít nhất 10 ký tự.'); return; }
    if (myText.trim().length > 1000) { setReviewError('Nhận xét tối đa 1000 ký tự.'); return; }

    // Check if user already has a review – reuse that id so we update it
    const existing = getUserReviewForBook(user.id, book.id);
    const review: Review = {
      id: existing?.id ?? `review-${Date.now()}`,
      bookId: book.id,
      userName: user.name,
      rating: myRating as 1 | 2 | 3 | 4 | 5,
      text: myText.trim(),
      createdAt: new Date().toISOString(),
    };
    saveReview(review);
    setReviews(getBookReviews(book.id));
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Related books
  const related = useMemo(() => {
    return BOOKS.filter(
      (b) =>
        b.id !== book.id &&
        (b.genres.some((g) => book.genres.includes(g)) || b.author === book.author)
    ).slice(0, 4);
  }, [book]);

  const genreLabel = [
    ...book.genres,
    ...(book.subtype ? [book.subtype] : []),
    `${book.pages} trang`,
  ]
    .map((s) => s.toUpperCase())
    .join(' • ');

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-muted mb-8 flex-wrap" aria-label="Đường dẫn">
            <Link to="/" className="hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">Trang chủ</Link>
            <span>›</span>
            <Link to="/kham-pha" className="hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">Khám phá</Link>
            <span>›</span>
            <span className="text-ink font-medium truncate max-w-xs">{book.title}</span>
          </nav>

          {/* Book info */}
          <div className="grid md:grid-cols-[auto_1fr] gap-10 md:gap-14 mb-16">
            {/* Cover */}
            <div className="flex justify-center md:block">
              <BookCover title={book.title} author={book.author} gradient={book.gradient} size="lg" showAuthor className="shadow-2xl !w-52 !h-72" />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4">
              <p className="text-muted text-xs font-bold tracking-widest">{genreLabel}</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-ink leading-tight tracking-tight">
                {book.title}
              </h1>
              <p className="text-muted text-base">
                Tác giả{' '}
                <Link
                  to={`/kham-pha?tacgia=${encodeURIComponent(book.author)}`}
                  className="text-ink font-bold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  {book.author}
                </Link>
              </p>

              <hr className="border-soft/60" />

              {/* Rating block */}
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-ink">{computedRating.toFixed(1)}</span>
                  <span className="text-muted text-sm">/ 5</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <StarRating value={Math.round(computedRating)} size="md" />
                  <p className="text-muted text-xs">{totalRatingCount.toLocaleString('vi')} lượt đánh giá</p>
                </div>
                <div className="border-l border-soft/60 pl-5">
                  <p className="text-2xl font-extrabold text-ink">{totalReviewCount.toLocaleString('vi')}</p>
                  <p className="text-muted text-xs">bài review</p>
                </div>
              </div>

              <hr className="border-soft/60" />
              <p className="text-ink/80 leading-relaxed text-sm sm:text-base">{book.description}</p>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-2">
                {/* Add to shelf */}
                <div className="relative">
                  <button
                    onClick={() => setShelfMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={shelfMenuOpen}
                    className="bg-ink text-white font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-sm flex items-center gap-2"
                  >
                    {entry ? `${STATUS_LABELS[entry.status]} ✓` : 'Thêm vào tủ sách'}
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {shelfMenuOpen && (
                    <div className="absolute left-0 top-11 w-44 bg-paper rounded-xl shadow-lg border border-soft/60 py-1 z-50">
                      {(Object.entries(STATUS_LABELS) as [ShelfStatus, string][]).map(([s, label]) => (
                        <button
                          key={s}
                          onClick={() => handleShelfAction(s)}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-soft transition-colors ${entry?.status === s ? 'font-bold text-ink' : 'text-ink'}`}
                        >
                          {label}
                        </button>
                      ))}
                      {entry && (
                        <>
                          <hr className="my-1 border-soft/60" />
                          <button
                            onClick={handleRemoveShelf}
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-soft transition-colors"
                          >
                            Xóa khỏi tủ sách
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleWriteReview}
                  className="border border-soft text-ink font-semibold px-6 py-2.5 rounded-pill hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-sm"
                >
                  Viết review
                </button>
              </div>
            </div>
          </div>

          {/* ── Reviews ─────────────────────────────────────────────── */}
          <section className="mb-16">
            <h2 className="text-2xl font-extrabold text-ink mb-6">Đánh giá và nhận xét</h2>
            <div className="grid md:grid-cols-[auto_1fr] gap-10">
              {/* Star distribution */}
              <div className="bg-paper rounded-2xl p-6 border border-soft/60 min-w-[220px]">
                <p className="text-4xl font-extrabold text-ink mb-1">{computedRating.toFixed(1)}</p>
                <StarRating value={Math.round(computedRating)} size="sm" />
                <p className="text-muted text-xs mt-1">{totalRatingCount.toLocaleString('vi')} lượt</p>
                <div className="flex flex-col gap-1.5 mt-4">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] ?? 0;
                    const pct = totalRatingCount > 0 ? (count / totalRatingCount) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-muted w-3">{star}</span>
                        <div className="flex-1 h-1.5 bg-soft rounded-full overflow-hidden">
                          <div className="h-full bg-ink rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Review list */}
              <div className="flex flex-col gap-5">
                {reviews.length === 0 ? (
                  <p className="text-muted text-sm">Chưa có nhận xét nào. Hãy là người đầu tiên!</p>
                ) : (
                  reviews.map((r) => {
                    const initials = r.userName.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
                    const date = new Date(r.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                    return (
                      <div key={r.id} className="bg-paper rounded-xl p-5 border border-soft/60">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full bg-soft flex items-center justify-center text-ink font-bold text-xs flex-shrink-0">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-ink">{r.userName}</p>
                            <p className="text-muted text-xs">{date}</p>
                          </div>
                          <StarRating value={r.rating} size="sm" />
                        </div>
                        <p className="text-ink/80 text-sm leading-relaxed">{r.text}</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* ── Write review ─────────────────────────────────────────── */}
          <section ref={reviewRef} className="mb-16">
            <h2 className="text-xl font-extrabold text-ink mb-5">Chia sẻ cảm nhận của bạn</h2>
            <div className="bg-paper rounded-2xl p-6 border border-soft/60 max-w-2xl">
              <form onSubmit={handleSubmitReview} noValidate>
                <div className="mb-4">
                  <p className="text-sm font-medium text-ink mb-2">Đánh giá</p>
                  <StarRating value={myRating} interactive onChange={(v) => setMyRating(v)} size="lg" />
                </div>
                <div className="mb-4">
                  <label htmlFor="review-text" className="sr-only">Nhận xét</label>
                  <textarea
                    id="review-text"
                    value={myText}
                    onChange={(e) => setMyText(e.target.value)}
                    placeholder="Chia sẻ cảm nhận của bạn về cuốn sách..."
                    rows={4}
                    maxLength={1000}
                    className="w-full border border-soft rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition resize-none"
                  />
                  <p className="text-muted text-xs mt-1 text-right">{myText.length}/1000</p>
                </div>
                {reviewError && <p className="text-red-600 text-sm mb-3" role="alert">{reviewError}</p>}
                {reviewSuccess && <p className="text-green-600 text-sm mb-3">Đánh giá đã được lưu!</p>}
                <button
                  type="submit"
                  className="bg-ink text-white font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-sm"
                >
                  Gửi đánh giá
                </button>
              </form>
            </div>
          </section>

          {/* ── Related books ─────────────────────────────────────────── */}
          {related.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-extrabold text-ink mb-6">Sách liên quan</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {related.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
