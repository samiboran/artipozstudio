
import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartSidebar from './components/CartSidebar'
import { useCart } from './hooks/useCart'
import Gallery from './pages/Gallery'
import ProductDetail from './pages/ProductDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Favorites from './pages/Favorites'
import About from './pages/About'
import Legal from './pages/Legal'
import WhatsAppButton from './components/WhatsAppButton'

function App() {
  const { count } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <Navbar cartCount={count} onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<Gallery />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/favoriler" element={<Favorites />} />
        <Route path="/hakkimizda" element={<About />} />
        <Route path="/yasal/:page" element={<Legal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <WhatsAppButton />
      <Footer />
    </>
  )
}

export default App