import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useModal } from '../store/ModalContext';
import { useShelf } from '../store/ShelfContext';

export default function AuthModal() {
  const { modal, pendingAction, openLogin, openRegister, closeModal } = useModal();
  const { login, register, loginDemo } = useAuth();
  const { refresh: refreshShelf } = useShelf();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modal) {
      setError('');
      setEmailError('');
      setPasswordError('');
      setNameError('');
      setEmail('');
      setPassword('');
      setName('');
      setTimeout(() => firstRef.current?.focus(), 50);
    }
  }, [modal]);

  // Keyboard trap & Esc
  useEffect(() => {
    if (!modal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [modal, closeModal]);

  if (!modal) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? 'Đã có lỗi xảy ra.');
      return;
    }
    refreshShelf();
    if (pendingAction) pendingAction();
    closeModal();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setEmailError('');
    setPasswordError('');
    const result = register(name, email, password);
    if (!result.ok) {
      const msg = result.error ?? '';
      if (msg.includes('tên')) setNameError(msg);
      else if (msg.includes('Email') || msg.includes('email')) setEmailError(msg);
      else setPasswordError(msg);
      return;
    }
    refreshShelf();
    if (pendingAction) pendingAction();
    closeModal();
  };

  const handleDemo = () => {
    loginDemo();
    refreshShelf();
    if (pendingAction) pendingAction();
    closeModal();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={modal === 'login' ? 'Đăng nhập' : 'Tham gia miễn phí'}
      onClick={(e) => { if (e.target === overlayRef.current) closeModal(); }}
    >
      <div className="bg-paper w-full max-w-md rounded-2xl shadow-2xl p-8 relative">
        {/* Close */}
        <button
          onClick={closeModal}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink text-muted hover:text-ink"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {modal === 'login' ? (
          <>
            <h2 className="text-2xl font-extrabold text-ink mb-1">Đăng nhập</h2>
            <p className="text-muted text-sm mb-6">Chào mừng bạn trở lại Verity.</p>
            <form onSubmit={handleLogin} noValidate className="flex flex-col gap-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-ink mb-1">Email</label>
                <input
                  ref={firstRef}
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full border border-soft rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition"
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-ink mb-1">Mật khẩu</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full border border-soft rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition"
                />
              </div>
              {error && <p className="text-red-600 text-sm" role="alert">{error}</p>}
              <button
                type="submit"
                className="w-full bg-ink text-white font-semibold rounded-pill py-3 hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink mt-1"
              >
                Đăng nhập
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-soft flex flex-col gap-2">
              <button
                onClick={handleDemo}
                className="w-full border border-soft rounded-pill py-2.5 text-sm font-medium text-ink hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
              >
                Dùng tài khoản demo (An Nguyễn)
              </button>
              <p className="text-center text-sm text-muted mt-1">
                Chưa có tài khoản?{' '}
                <button
                  onClick={() => openRegister()}
                  className="text-ink font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  Tham gia miễn phí
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-extrabold text-ink mb-1">Tham gia miễn phí</h2>
            <p className="text-muted text-sm mb-6">Tạo tài khoản để lưu tủ sách và chia sẻ cảm nhận.</p>
            <form onSubmit={handleRegister} noValidate className="flex flex-col gap-4">
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-ink mb-1">Tên hiển thị</label>
                <input
                  ref={firstRef}
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tên của bạn"
                  className="w-full border border-soft rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition"
                />
                {nameError && <p className="text-red-600 text-xs mt-1" role="alert">{nameError}</p>}
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-ink mb-1">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full border border-soft rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition"
                />
                {emailError && <p className="text-red-600 text-xs mt-1" role="alert">{emailError}</p>}
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-ink mb-1">Mật khẩu</label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  className="w-full border border-soft rounded-xl px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-ink focus:ring-2 focus:ring-ink/10 transition"
                />
                {passwordError && <p className="text-red-600 text-xs mt-1" role="alert">{passwordError}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-ink text-white font-semibold rounded-pill py-3 hover:bg-ink/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink mt-1"
              >
                Tạo tài khoản
              </button>
            </form>
            <div className="mt-4 pt-4 border-t border-soft flex flex-col gap-2">
              <button
                onClick={handleDemo}
                className="w-full border border-soft rounded-pill py-2.5 text-sm font-medium text-ink hover:bg-soft transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
              >
                Dùng tài khoản demo (An Nguyễn)
              </button>
              <p className="text-center text-sm text-muted mt-1">
                Đã có tài khoản?{' '}
                <button
                  onClick={() => openLogin()}
                  className="text-ink font-semibold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink rounded"
                >
                  Đăng nhập
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
