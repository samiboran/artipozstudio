import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import { useCart } from './hooks/useCart'
import { supabase } from './lib/supabase'
import { applySiteFont } from './lib/siteFonts'
import { getSessionId } from './lib/session'
import Gallery from './pages/Gallery'
import Isler from './pages/Isler'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'
import Favorites from './pages/Favorites'
import About from './pages/About'
import Legal from './pages/Legal'
import FineArtBaski from './pages/FineArtBaski'
import Cerceve from './pages/Cerceve'
import FotografBaski from './pages/FotografBaski'
import WhatsAppButton from './components/WhatsAppButton'

// React Router sayfa değiştirince scroll pozisyonunu KORUYOR, sıfırlamıyor —
// bu yüzden "İncele"ye veya navbar linkine tıklayınca yeni sayfa ortadan/en alttan
// açılıyordu. Her rota değişiminde en üste sarıyoruz.
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

// Basit ziyaretçi istatistiği için her rota değişiminde page_views'e bir satır ekler.
// Admin panelinin kendi gezinmesi istatistikleri kirletmesin diye /admin hariç tutulur.
function PageViewTracker() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    supabase.from('page_views').insert({
      session_id: getSessionId(),
      path: pathname,
      referrer: document.referrer || null,
    })
  }, [pathname])
  return null
}

function App() {
  const { count } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    applySiteFont(supabase)
  }, [])

  return (
    <>
      <ScrollToTop />
      <PageViewTracker />
      <Navbar cartCount={count} onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/isler" element={<Isler />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/kayit" element={<Signup />} />
        <Route path="/favoriler" element={<Favorites />} />
        <Route path="/hakkimizda" element={<About />} />
        <Route path="/yasal/:page" element={<Legal />} />
        <Route path="/fine-art-baski" element={<FineArtBaski />} />
        <Route path="/cerceve" element={<Cerceve />} />
        <Route path="/fotograf-baski" element={<FotografBaski />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppButton />
      <Footer />
    </>
  )
}

export default App
