import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { ModalProvider } from './store/ModalContext'
import { ShelfProvider } from './store/ShelfContext'
import AuthModal from './components/AuthModal'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import RecommendPage from './pages/RecommendPage'
import ShelfPage from './pages/ShelfPage'
import BookDetailPage from './pages/BookDetailPage'

function AppInner() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kham-pha" element={<ExplorePage />} />
        <Route path="/goi-y" element={<RecommendPage />} />
        <Route path="/tu-sach" element={<ShelfPage />} />
        <Route path="/sach/:id" element={<BookDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <AuthModal />
    </>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="text-center flex flex-col items-center gap-4">
        <p className="text-6xl font-extrabold text-ink">404</p>
        <p className="text-muted">Trang không tồn tại.</p>
        <a href="/" className="bg-ink text-white font-semibold px-6 py-2.5 rounded-pill hover:bg-ink/80 transition-colors text-sm">
          Về trang chủ
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModalProvider>
          <ShelfProvider>
            <AppInner />
          </ShelfProvider>
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
