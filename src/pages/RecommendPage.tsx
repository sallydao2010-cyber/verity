import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import StarRating from '../components/StarRating';
import { BOOKS } from '../data/books';
import { Book } from '../data/types';
import { useShelf } from '../store/ShelfContext';
import { useAuth } from '../store/AuthContext';
import { useModal } from '../store/ModalContext';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'Bạn muốn cuốn sách mang lại cảm giác gì?',
    options: [
      { label: 'Nhẹ nhàng và chữa lành', tags: ['nhẹ nhàng', 'chữa lành'] },
      { label: 'Kịch tính và bất ngờ', tags: ['kịch tính', 'bất ngờ'] },
      { label: 'Sâu sắc và suy ngẫm', tags: ['sâu sắc', 'suy ngẫm'] },
      { label: 'Lãng mạn và ấm áp', tags: ['lãng mạn', 'ấm áp'] },
    ],
  },
  {
    id: 'q2',
    text: 'Hôm nay bạn đang cảm thấy thế nào?',
    options: [
      { label: 'Vui vẻ', tags: ['nhẹ nhàng', 'lãng mạn'] },
      { label: 'Buồn', tags: ['chữa lành', 'sâu sắc'] },
      { label: 'Thư giãn', tags: ['nhẹ nhàng', 'ấm áp'] },
      { label: 'Căng thẳng hoặc mệt mỏi', tags: ['chữa lành', 'nhẹ nhàng'] },
    ],
  },
  {
    id: 'q3',
    text: 'Bạn thích kiểu sách nào?',
    options: [
      { label: 'Văn học', genre: 'Văn học' as const, tags: [] },
      { label: 'Tâm lý', genre: 'Tâm lý' as const, tags: [] },
      { label: 'Kinh điển', genre: 'Kinh điển' as const, tags: [] },
      { label: 'Đang thịnh hành', tags: ['popular'] },
    ],
  },
];

function computeRecommendations(answers: (number | null)[]): { book: Book; reason: string; score: number }[] {
  const allTags: string[] = [];
  let preferredGenre: string | null = null;
  let wantTrending = false;

  answers.forEach((ansIdx, qIdx) => {
    if (ansIdx === null) return;
    const option = QUESTIONS[qIdx].options[ansIdx];
    allTags.push(...option.tags);
    if ('genre' in option && option.genre) preferredGenre = option.genre;
    if (option.tags.includes('popular')) wantTrending = true;
  });

  return BOOKS.map((book) => {
    let score = 0;
    const matchedTags: string[] = [];

    allTags.forEach((tag) => {
      if (book.moodTags.includes(tag)) {
        score += 1;
        if (!matchedTags.includes(tag)) matchedTags.push(tag);
      }
    });

    if (preferredGenre && book.genres.includes(preferredGenre as any)) score += 1;
    if (wantTrending && book.trending) score += 1;
    score += book.popularity / 200; // small popularity nudge

    let reason = '';
    if (matchedTags.length > 0) {
      const tagLabels = matchedTags.slice(0, 2).join(', ');
      reason = `Phù hợp với tâm trạng ${tagLabels} của bạn.`;
    } else if (preferredGenre && book.genres.includes(preferredGenre as any)) {
      reason = `Đây là một cuốn ${preferredGenre} được yêu thích.`;
    } else {
      reason = 'Cuốn sách được cộng đồng đánh giá cao.';
    }

    return { book, reason, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.book.baseRating - a.book.baseRating)
    .slice(0, 5);
}

export default function RecommendPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getEntry, addToShelf, removeFromShelf } = useShelf();
  const { openLogin } = useModal();

  const q1Prefill = searchParams.get('q1') ?? '';

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (q1Prefill) {
      const idx = QUESTIONS[0].options.findIndex((o) => o.label === q1Prefill);
      if (idx >= 0) {
        const newAnswers = [...answers];
        newAnswers[0] = idx;
        setAnswers(newAnswers);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q1Prefill]);

  const currentAnswer = answers[currentQ];
  const canProceed = currentAnswer !== null;

  const handleSelect = (idx: number) => {
    const next = [...answers];
    next[currentQ] = idx;
    setAnswers(next);
  };

  const handleNext = () => {
    if (currentQ < 2) setCurrentQ(currentQ + 1);
    else setShowResults(true);
  };

  const handleBack = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const handleReset = () => {
    setAnswers([null, null, null]);
    setCurrentQ(0);
    setShowResults(false);
  };

  const handleBookmark = (bookId: string) => {
    if (!user) {
      openLogin(() => addToShelf(bookId, 'want'));
      return;
    }
    const entry = getEntry(bookId);
    if (entry) removeFromShelf(bookId);
    else addToShelf(bookId, 'want');
  };

  const results = showResults ? computeRecommendations(answers) : [];

  const answerLabels = answers
    .map((a, i) => (a !== null ? QUESTIONS[i].options[a].label : null))
    .filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-muted text-xs font-bold tracking-widest uppercase mb-3">Gợi ý riêng cho bạn</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-ink leading-tight tracking-tight">
              Cuốn sách tiếp theo đang chờ bạn.
            </h1>
            <p className="text-muted text-base mt-3 max-w-md mx-auto">
              Cho Verity biết một chút về tâm trạng hiện tại để nhận gợi ý phù hợp hơn.
            </p>
          </div>

          {!showResults ? (
            /* ── Survey card ─────────────────────────────────────────── */
            <div className="bg-paper rounded-2xl shadow-md border border-soft/60 p-6 sm:p-8">
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-bold text-muted tracking-wider uppercase">
                  Câu hỏi {currentQ + 1}/3
                </p>
                <div className="flex gap-1.5" role="progressbar" aria-valuenow={currentQ + 1} aria-valuemin={1} aria-valuemax={3}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${i <= currentQ ? 'bg-ink w-10' : 'bg-soft w-10'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Question */}
              <h2 className="text-xl sm:text-2xl font-bold text-ink mb-6">{QUESTIONS[currentQ].text}</h2>

              {/* Options grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {QUESTIONS[currentQ].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`px-5 py-4 rounded-xl border text-sm font-medium text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink ${
                      currentAnswer === idx
                        ? 'bg-ink text-white border-ink'
                        : 'border-soft text-ink hover:border-ink/40 hover:bg-soft/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {!canProceed && (
                <p className="text-muted text-sm mb-3">Hãy chọn một đáp án để tiếp tục</p>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                {currentQ > 0 ? (
                  <button
                    onClick={handleBack}
                    className="text-sm font-medium text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded px-1"
                  >
                    ← Quay lại
                  </button>
                ) : <span />}
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-ink text-white text-sm font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {currentQ < 2 ? 'Tiếp tục →' : 'Nhận gợi ý'}
                </button>
              </div>
            </div>
          ) : (
            /* ── Results ─────────────────────────────────────────────── */
            <div className="flex flex-col gap-8">
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-ink mb-3">Gợi ý cho bạn hôm nay</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {answerLabels.map((l) => (
                    <span key={l} className="px-3 py-1.5 rounded-pill bg-soft text-ink text-xs font-medium">{l}</span>
                  ))}
                </div>
              </div>

              {results.length === 0 ? (
                <p className="text-center text-muted">Không tìm thấy sách phù hợp. Thử lại nhé!</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {results.map(({ book, reason }) => {
                    const entry = getEntry(book.id);
                    const quote = book.quotes[0];
                    return (
                      <div key={book.id} className="bg-paper rounded-2xl border border-soft/60 shadow-sm p-5 flex gap-5 items-start">
                        <button
                          onClick={() => navigate(`/sach/${book.id}`)}
                          className="flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded-lg"
                        >
                          <BookCover title={book.title} gradient={book.gradient} size="md" />
                        </button>
                        <div className="flex-1 min-w-0 flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <button
                                onClick={() => navigate(`/sach/${book.id}`)}
                                className="font-extrabold text-ink text-lg hover:underline text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                              >
                                {book.title}
                              </button>
                              <p className="text-muted text-sm">{book.author}</p>
                            </div>
                            <button
                              onClick={() => handleBookmark(book.id)}
                              aria-label={entry ? 'Bỏ khỏi tủ sách' : 'Lưu vào tủ sách'}
                              className="flex-shrink-0 w-9 h-9 rounded-full border border-soft flex items-center justify-center hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                            >
                              {entry ? (
                                <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" /></svg>
                              ) : (
                                <svg className="w-4 h-4 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 3h14a1 1 0 0 1 1 1v17l-8-4-8 4V4a1 1 0 0 1 1-1z" /></svg>
                              )}
                            </button>
                          </div>
                          <StarRating value={book.baseRating} size="sm" />
                          <div className="flex items-start gap-2 mt-1">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-muted mt-1.5" />
                            <p className="text-muted text-sm italic">{reason}</p>
                          </div>
                          {quote && (
                            <blockquote className="border-l-2 border-soft pl-3 text-muted text-sm leading-relaxed mt-1">
                              "{quote}"
                            </blockquote>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleReset}
                  className="border border-soft text-ink text-sm font-medium px-6 py-2.5 rounded-pill hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
                >
                  Làm lại khảo sát
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
