import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCard from '../components/BookCard';
import { getTrendingBooks } from '../data/books';

const MOOD_CHIPS = [
  { label: 'Nhẹ nhàng', value: 'Nhẹ nhàng và chữa lành' },
  { label: 'Kịch tính', value: 'Kịch tính và bất ngờ' },
  { label: 'Sâu sắc', value: 'Sâu sắc và suy ngẫm' },
  { label: 'Lãng mạn', value: 'Lãng mạn và ấm áp' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const trending = getTrendingBooks();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/kham-pha?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/kham-pha');
    }
  };

  const handleMoodChip = (value: string) => {
    navigate(`/goi-y?q1=${encodeURIComponent(value)}`);
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="flex flex-col gap-6">
              <p className="flex items-center gap-2 text-muted text-xs font-bold tracking-widest uppercase">
                <span className="w-4 h-px bg-muted inline-block" />
                Đọc theo cách của bạn
              </p>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-ink leading-tight tracking-tight">
                Gặp cuốn sách<br />dành cho bạn.
              </h1>
              <p className="text-muted text-base leading-relaxed max-w-md">
                Khám phá những câu chuyện hợp tâm trạng, lưu lại điều bạn yêu và chia sẻ cảm nhận cùng cộng đồng độc giả.
              </p>
              {/* Search */}
              <form onSubmit={handleSearch} role="search" className="flex items-center gap-0 bg-paper rounded-pill shadow-md border border-soft/60 p-1 max-w-md">
                <label htmlFor="home-search" className="sr-only">Tìm sách</label>
                <span className="pl-4 text-muted flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </span>
                <input
                  id="home-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm tên sách, tác giả..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-ink text-white text-sm font-semibold px-5 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-paper whitespace-nowrap"
                >
                  Tìm sách
                </button>
              </form>
            </div>

            {/* Right – Featured card */}
            <div className="order-first md:order-last">
              <a
                href="/kham-pha"
                onClick={(e) => { e.preventDefault(); navigate('/kham-pha'); }}
                className="relative block rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-amber-100 to-orange-200 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
              >
                {/* Background placeholder – warm bookshelf feel */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#f4e4c1] via-[#e8c99a] to-[#c49a6c]" />
                {/* Decorative books */}
                <div className="absolute inset-0 flex items-end justify-center gap-2 pb-8 opacity-40">
                  {['amber','navy','sage','peach'].map((g, i) => (
                    <div
                      key={g}
                      className="rounded w-8 opacity-80"
                      style={{
                        height: `${90 + i * 12}px`,
                        background: g === 'amber' ? 'linear-gradient(135deg,#E9B565,#A34D2E)'
                          : g === 'navy' ? 'linear-gradient(135deg,#243750,#111A26)'
                          : g === 'sage' ? 'linear-gradient(135deg,#BFC9AC,#5E7565)'
                          : 'linear-gradient(135deg,#EDB8A0,#C98370)',
                        transform: `rotate(${(i-1.5)*3}deg)`,
                      }}
                    />
                  ))}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-5 left-5 right-14 text-white">
                  <p className="text-xs font-bold tracking-widest uppercase opacity-80 mb-1">Tuyển tập tháng này</p>
                  <p className="text-lg font-extrabold leading-snug">Những trang sách cho ngày chậm rãi</p>
                </div>
                <div className="absolute bottom-5 right-5 w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* ── Mood chips ─────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
          <div className="bg-paper rounded-2xl p-6 sm:p-8 shadow-sm border border-soft/60">
            <p className="text-muted text-sm font-medium mb-4">Hôm nay bạn thấy thế nào?</p>
            <div className="flex flex-wrap gap-3">
              {MOOD_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => handleMoodChip(chip.value)}
                  className="px-5 py-2.5 rounded-pill border border-soft text-sm font-medium text-ink hover:bg-ink hover:text-white hover:border-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trending ─────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted text-xs font-bold tracking-widest uppercase">Sách thịnh hành tuần này</p>
            <a
              href="/kham-pha"
              onClick={(e) => { e.preventDefault(); navigate('/kham-pha'); }}
              className="text-sm font-medium text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
            >
              Xem tất cả →
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trending.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
