import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { useModal } from '../store/ModalContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { openLogin, openRegister } = useModal();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const initials = user
    ? user.name
        .split(' ')
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '';

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchIconClick = () => {
    navigate('/kham-pha');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ', exact: true },
    { to: '/kham-pha', label: 'Khám phá', exact: false },
    { to: '/goi-y', label: 'Gợi ý cho bạn', exact: false },
    { to: '/tu-sach', label: 'Tủ sách', exact: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-page border-b border-soft/80">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
          aria-label="Verity – Trang chủ"
        >
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center">
            <span className="text-white font-bold text-base leading-none">v</span>
          </div>
          <span className="font-extrabold text-ink text-lg tracking-tight">verity.</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded px-1 ${
                  isActive
                    ? 'text-ink font-bold border-b-2 border-ink pb-0.5'
                    : 'text-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search icon – leads to /kham-pha */}
          <button
            onClick={handleSearchIconClick}
            aria-label="Tìm kiếm sách"
            className="hidden md:flex w-9 h-9 items-center justify-center rounded-full hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            <svg className="w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {user ? (
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setAvatarMenuOpen((v) => !v)}
                aria-label="Menu tài khoản"
                aria-expanded={avatarMenuOpen}
                className="w-9 h-9 rounded-full bg-ink text-white font-bold text-sm flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
              >
                {initials}
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 top-11 w-44 bg-paper rounded-xl shadow-lg border border-soft/60 py-1 z-50">
                  <Link
                    to="/tu-sach"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-ink hover:bg-soft transition-colors"
                  >
                    Tủ sách
                  </Link>
                  <button
                    onClick={() => { logout(); setAvatarMenuOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-soft transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => openLogin()}
                className="hidden md:block text-sm font-medium text-ink hover:text-muted transition-colors px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => openRegister()}
                className="bg-ink text-white text-sm font-semibold px-4 py-2 rounded-pill hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink whitespace-nowrap"
              >
                <span className="hidden sm:inline">Tham gia miễn phí</span>
                <span className="sm:hidden">Tham gia</span>
              </button>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Mở menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-soft/80 bg-page px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-white font-bold' : 'text-ink hover:bg-soft'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-soft/60 flex flex-col gap-1">
            {!user ? (
              <>
                <button
                  onClick={() => { openLogin(); setMobileMenuOpen(false); }}
                  className="px-3 py-2.5 text-sm font-medium text-ink hover:bg-soft rounded-lg text-left transition-colors"
                >
                  Đăng nhập
                </button>
              </>
            ) : (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="px-3 py-2.5 text-sm font-medium text-ink hover:bg-soft rounded-lg text-left transition-colors"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
