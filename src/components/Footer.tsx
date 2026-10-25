import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-page border-t border-soft/80 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Link to="/" className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">
              <div className="w-7 h-7 rounded-full bg-ink flex items-center justify-center">
                <span className="text-white font-bold text-sm leading-none">v</span>
              </div>
              <span className="font-extrabold text-ink text-base tracking-tight">verity.</span>
            </Link>
            <p className="text-muted text-sm">Đọc theo cách của bạn</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Điều hướng chân trang">
            <Link to="/" className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">Trang chủ</Link>
            <Link to="/kham-pha" className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">Khám phá</Link>
            <Link to="/goi-y" className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">Gợi ý cho bạn</Link>
            <Link to="/tu-sach" className="text-sm text-muted hover:text-ink transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded">Tủ sách</Link>
          </nav>
        </div>

        <p className="text-muted text-xs mt-8 text-center sm:text-left">
          © Verity – Dự án học tập lớp 11.2
        </p>
      </div>
    </footer>
  );
}
