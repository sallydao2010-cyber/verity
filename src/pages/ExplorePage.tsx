import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCard from '../components/BookCard';
import { BOOKS } from '../data/books';
import { Genre } from '../data/types';
import { matchesQuery } from '../utils/search';

const GENRES: (Genre | 'Tất cả')[] = ['Tất cả', 'Văn học', 'Tâm lý', 'Kinh điển', 'Lãng mạn'];
type SortKey = 'popular' | 'rating' | 'az';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'Phổ biến' },
  { key: 'rating', label: 'Điểm cao nhất' },
  { key: 'az', label: 'Tên A–Z' },
];

const PAGE_SIZE = 12;

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') ?? '';
  const genreParam = searchParams.get('theloai') ?? '';
  const authorParam = searchParams.get('tacgia') ?? '';
  const sortParam = (searchParams.get('sapxep') ?? 'popular') as SortKey;

  const [localQuery, setLocalQuery] = useState(queryParam);
  const [page, setPage] = useState(1);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Sync input when URL changes
  useEffect(() => {
    setLocalQuery(queryParam || authorParam);
    setPage(1);
  }, [queryParam, authorParam, genreParam, sortParam]);

  const activeGenre: Genre | 'Tất cả' = (GENRES.find((g) => g === genreParam) as Genre | 'Tất cả') ?? 'Tất cả';

  const filtered = useMemo(() => {
    let list = [...BOOKS];

    // Text search (q or tacgia)
    const q = queryParam || authorParam;
    if (q) {
      list = list.filter(
        (b) => matchesQuery(b.title, q) || matchesQuery(b.author, q)
      );
    }

    // Genre filter
    if (activeGenre !== 'Tất cả') {
      list = list.filter((b) => b.genres.includes(activeGenre as Genre));
    }

    // Sort
    if (sortParam === 'popular') list.sort((a, b) => b.popularity - a.popularity);
    else if (sortParam === 'rating') list.sort((a, b) => b.baseRating - a.baseRating);
    else list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));

    return list;
  }, [queryParam, authorParam, activeGenre, sortParam]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateParam = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v);
      else next.delete(k);
    });
    setSearchParams(next);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam({ q: localQuery.trim(), tacgia: '' });
  };

  const clearAll = () => {
    setLocalQuery('');
    setSearchParams({});
    setPage(1);
  };

  const currentSort = SORT_OPTIONS.find((o) => o.key === sortParam) ?? SORT_OPTIONS[0];

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="bg-paper border-b border-soft/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col gap-5">
              <p className="text-muted text-xs font-bold tracking-widest uppercase">Thư viện Verity</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-ink leading-tight tracking-tight">
                Khám phá thế giới<br />qua từng cuốn sách.
              </h1>
              <form onSubmit={handleSearch} role="search" className="flex items-center bg-soft rounded-pill p-1">
                <label htmlFor="explore-search" className="sr-only">Tìm sách</label>
                <span className="pl-4 text-muted flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input
                  id="explore-search"
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder="Tìm tên sách hoặc tác giả..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
                />
                <button type="submit" className="bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-paper whitespace-nowrap">
                  Tìm kiếm
                </button>
              </form>
            </div>
            <p className="text-muted text-base leading-relaxed max-w-xs md:ml-auto">
              Tìm kiếm theo tên sách, tác giả hoặc chọn thể loại phù hợp với bạn.
            </p>
          </div>
        </section>

        {/* ── Filter bar ───────────────────────────────────────────── */}
        <div className="sticky top-16 z-30 bg-page border-b border-soft/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
            {/* Genre chips */}
            <div className="flex items-center gap-2 flex-wrap overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => updateParam({ theloai: g === 'Tất cả' ? '' : g })}
                  className={`px-4 py-1.5 rounded-pill text-xs font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink ${
                    activeGenre === g
                      ? 'bg-ink text-white'
                      : 'bg-paper border border-soft text-ink hover:border-ink'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            {/* Result count + sort */}
            <div className="ml-auto flex items-center gap-2 text-xs text-muted whitespace-nowrap relative">
              <span className="font-medium">{filtered.length} kết quả</span>
              <span>·</span>
              <span>Sắp xếp:</span>
              <div className="relative">
                <button
                  onClick={() => setSortMenuOpen((v) => !v)}
                  className="font-bold text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  {currentSort.label} ▾
                </button>
                {sortMenuOpen && (
                  <div className="absolute right-0 top-6 bg-paper border border-soft/60 rounded-xl shadow-lg py-1 z-50 w-36">
                    {SORT_OPTIONS.map((o) => (
                      <button
                        key={o.key}
                        onClick={() => { updateParam({ sapxep: o.key }); setSortMenuOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-xs hover:bg-soft transition-colors ${o.key === sortParam ? 'font-bold text-ink' : 'text-muted'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Book grid ─────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <svg className="w-12 h-12 text-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M9 9l.01 0M15 15l.01 0" /><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <p className="text-ink font-semibold text-lg">Không tìm thấy sách phù hợp</p>
              <p className="text-muted text-sm">Thử từ khóa khác hoặc xem tất cả</p>
              <button onClick={clearAll} className="mt-2 bg-ink text-white text-sm font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink">
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {paginated.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12" role="navigation" aria-label="Phân trang">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-lg border border-soft flex items-center justify-center text-ink hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                    aria-label="Trang trước"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      aria-current={n === page ? 'page' : undefined}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink ${
                        n === page ? 'bg-ink text-white' : 'border border-soft text-ink hover:bg-soft'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-lg border border-soft flex items-center justify-center text-ink hover:bg-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                    aria-label="Trang sau"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
