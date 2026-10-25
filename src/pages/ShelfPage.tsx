import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import { useAuth } from '../store/AuthContext';
import { useShelf } from '../store/ShelfContext';
import { useModal } from '../store/ModalContext';
import { updateUser } from '../data/storage';
import { BOOKS } from '../data/books';
import { ShelfStatus } from '../data/types';

type TabKey = ShelfStatus;
const TABS: { key: TabKey; label: string }[] = [
  { key: 'reading', label: 'Đang đọc' },
  { key: 'read', label: 'Đã đọc' },
  { key: 'want', label: 'Muốn đọc' },
];

function getWeekRange(date: Date): [Date, Date] {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return [monday, sunday];
}

function computeStreak(shelf: ReturnType<typeof useShelf>['shelf']): { count: number; dots: boolean[] } {
  const now = new Date();
  const dots: boolean[] = [];
  let streak = 0;

  for (let week = 7; week >= 0; week--) {
    const target = new Date(now);
    target.setDate(now.getDate() - week * 7);
    const [mon, sun] = getWeekRange(target);

    const active = shelf.some((e) => {
      if (e.status !== 'reading' && e.status !== 'read') return false;
      const added = new Date(e.addedAt);
      const finished = e.finishedAt ? new Date(e.finishedAt) : null;
      const inRange = (d: Date) => d >= mon && d <= sun;
      return inRange(added) || (finished && inRange(finished));
    });

    dots.push(active);
  }

  // Count streak from the most recent completed week backwards
  const [currentMon] = getWeekRange(now);
  for (let i = dots.length - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dots.length - 1 - i) * 7);
    const [wMon] = getWeekRange(weekStart);
    if (wMon >= currentMon) continue; // current week doesn't break streak
    if (dots[i]) streak++;
    else break;
  }

  return { count: streak, dots };
}

export default function ShelfPage() {
  const { user, refresh: refreshAuth } = useAuth();
  const { shelf, changeStatus, removeFromShelf, refresh: refreshShelf } = useShelf();
  const { openLogin } = useModal();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>('reading');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const thisYear = new Date().getFullYear();

  const tabBooks = useMemo(() => {
    const ids = shelf.filter((e) => e.status === activeTab).map((e) => e.bookId);
    return BOOKS.filter((b) => ids.includes(b.id));
  }, [shelf, activeTab]);

  const readThisYear = useMemo(() => {
    return shelf.filter((e) => {
      if (e.status !== 'read') return false;
      if (!e.finishedAt) return false;
      return new Date(e.finishedAt).getFullYear() === thisYear;
    }).length;
  }, [shelf, thisYear]);

  const goal = user?.yearlyGoal ?? 12;
  const pct = Math.min(100, Math.round((readThisYear / goal) * 100));
  const streak = user ? computeStreak(shelf) : { count: 0, dots: Array(8).fill(false) };

  const tabCounts: Record<TabKey, number> = useMemo(() => ({
    reading: shelf.filter((e) => e.status === 'reading').length,
    read: shelf.filter((e) => e.status === 'read').length,
    want: shelf.filter((e) => e.status === 'want').length,
  }), [shelf]);

  const handleGoalSave = () => {
    const val = parseInt(goalInput, 10);
    if (!user || isNaN(val) || val < 1 || val > 365) return;
    updateUser({ ...user, yearlyGoal: val });
    refreshAuth();
    setEditingGoal(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-page flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center flex flex-col items-center gap-4">
            <svg className="w-16 h-16 text-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <p className="text-ink font-semibold text-lg">Đăng nhập để xem tủ sách của bạn</p>
            <div className="flex gap-3 flex-wrap justify-center mt-2">
              <button
                onClick={() => openLogin()}
                className="bg-ink text-white font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-sm"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const initials = user.name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();
  const joinedDate = new Date(user.joinedAt);
  const joinedLabel = `Thành viên từ tháng ${joinedDate.getMonth() + 1}, ${joinedDate.getFullYear()}`;

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <main className="flex-1">
        {/* ── Hero (dark) ────────────────────────────────────────────── */}
        <section className="bg-ink">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div className="flex flex-col gap-4">
              <p className="text-muted text-xs font-bold tracking-widest uppercase">Không gian của bạn</p>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Tủ sách cá nhân
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                  <span className="font-extrabold text-ink text-lg">{initials}</span>
                </div>
                <div>
                  <p className="text-white font-bold">{user.name}</p>
                  <p className="text-muted text-sm">{joinedLabel}</p>
                </div>
              </div>
            </div>

            {/* Right – Reading challenge card */}
            <div className="flex flex-col gap-4">
              <div className="bg-paper rounded-2xl p-6 shadow-md relative">
                <p className="text-muted text-xs font-medium mb-1">Thử thách đọc {thisYear}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-5xl font-extrabold text-ink">{readThisYear}</span>
                  <span className="text-muted text-lg mb-1">/{goal} cuốn</span>
                </div>
                <span className="absolute top-4 right-4 bg-soft text-ink text-xs font-bold px-3 py-1 rounded-pill">
                  {pct}%
                </span>
                {/* Progress bar */}
                <div className="w-full h-2 bg-soft rounded-full overflow-hidden mt-3 mb-3">
                  <div
                    className="h-full bg-ink rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct >= 100 ? (
                  <p className="text-ink text-sm font-medium">Bạn đã hoàn thành thử thách năm nay!</p>
                ) : (
                  <p className="text-muted text-sm">Còn {goal - readThisYear} cuốn nữa để hoàn thành mục tiêu.</p>
                )}
                {editingGoal ? (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="number"
                      min={1}
                      max={365}
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleGoalSave()}
                      className="w-20 border border-soft rounded-lg px-2 py-1 text-sm text-ink focus:outline-none focus:border-ink"
                      autoFocus
                    />
                    <button
                      onClick={handleGoalSave}
                      className="text-sm font-semibold text-ink hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingGoal(false)}
                      className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setGoalInput(String(goal)); setEditingGoal(true); }}
                    className="text-xs text-muted hover:text-ink transition-colors mt-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded underline"
                  >
                    Đổi mục tiêu
                  </button>
                )}
              </div>

              {/* Streak card */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold text-sm">Chuỗi theo tuần</p>
                  <span className="text-white font-extrabold">{streak.count} tuần</span>
                </div>
                <div className="flex gap-2">
                  {streak.dots.map((active, i) => {
                    const isCurrentWeek = i === streak.dots.length - 1;
                    return (
                      <div
                        key={i}
                        className={`flex-1 h-2.5 rounded-full transition-all ${
                          active
                            ? 'bg-white'
                            : isCurrentWeek
                            ? 'bg-transparent border border-white/50'
                            : 'bg-white/20'
                        }`}
                        title={active ? 'Tuần giữ chuỗi' : isCurrentWeek ? 'Tuần hiện tại' : 'Tuần bỏ lỡ'}
                      />
                    );
                  })}
                </div>
                <p className="text-muted text-xs mt-2">Đọc ít nhất 1 cuốn mỗi tuần để giữ chuỗi.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs ──────────────────────────────────────────────────── */}
        <div className="border-b border-soft/60 bg-page">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex gap-0" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  role="tab"
                  aria-selected={activeTab === tab.key}
                  aria-controls={`tabpanel-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink ${
                    activeTab === tab.key
                      ? 'border-ink text-ink font-bold'
                      : 'border-transparent text-muted hover:text-ink'
                  }`}
                >
                  {tab.label}{' '}
                  <span className={`text-xs ml-1 ${activeTab === tab.key ? 'text-ink' : 'text-muted'}`}>
                    ({tabCounts[tab.key]})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Book list ─────────────────────────────────────────────── */}
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-label={TABS.find((t) => t.key === activeTab)?.label}
          className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
        >
          {tabBooks.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <svg className="w-12 h-12 text-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-ink font-semibold">Chưa có sách nào ở đây</p>
              <button
                onClick={() => navigate('/kham-pha')}
                className="mt-2 bg-ink text-white text-sm font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
              >
                Khám phá sách
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {tabBooks.map((book) => (
                <ShelfBookCard
                  key={book.id}
                  bookId={book.id}
                  onChangeStatus={changeStatus}
                  onRemove={removeFromShelf}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Shelf card with status menu ──────────────────────────────────────────────

function ShelfBookCard({
  bookId,
  onChangeStatus,
  onRemove,
}: {
  bookId: string;
  onChangeStatus: (id: string, s: ShelfStatus) => void;
  onRemove: (id: string) => void;
}) {
  const navigate = useNavigate();
  const book = BOOKS.find((b) => b.id === bookId);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!book) return null;

  const STATUS_LABELS: Record<ShelfStatus, string> = {
    read: 'Đã đọc',
    reading: 'Đang đọc',
    want: 'Muốn đọc',
  };

  return (
    <div className="relative flex flex-col group">
      <div className="relative">
        <button
          onClick={() => navigate(`/sach/${book.id}`)}
          className="block w-full rounded-xl overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
        >
          <BookCover title={book.title} gradient={book.gradient} size="md" className="w-full !h-52" />
        </button>
        {/* Status menu trigger */}
        <div className="absolute top-2 right-2" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Tùy chọn"
            aria-expanded={menuOpen}
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-ink font-bold text-sm"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-paper rounded-xl shadow-lg border border-soft/60 py-1 z-50">
              <p className="px-3 py-1.5 text-xs text-muted font-semibold uppercase tracking-wide">Chuyển sang…</p>
              {(Object.entries(STATUS_LABELS) as [ShelfStatus, string][]).map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => { onChangeStatus(bookId, s); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-soft transition-colors"
                >
                  {label}
                </button>
              ))}
              <hr className="my-1 border-soft/60" />
              <button
                onClick={() => { onRemove(bookId); setMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-soft transition-colors"
              >
                Xóa khỏi tủ sách
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={() => navigate(`/sach/${book.id}`)}
          className="font-semibold text-ink text-sm leading-snug hover:underline line-clamp-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
        >
          {book.title}
        </button>
        <p className="text-muted text-xs mt-0.5">{book.author}</p>
      </div>
    </div>
  );
}
