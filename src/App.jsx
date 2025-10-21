import { useEffect, useState } from 'react'
import './App.css'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProductsSection from './components/ProductsSection'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import AdminLayout from './admin/AdminLayout'
import AdminProducts from './admin/AdminProducts'
import AdminPosters from './admin/AdminPosters'
import AdminBlogs from './admin/AdminBlogs'
import Login from './admin/Login'
import CartSidebar from './components/CartSidebar'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'

function isAuthed() {
  return !!localStorage.getItem('admin_token')
}

function ProtectedRoute({ children }) {
  if (!isAuthed()) return <Navigate to="/admin-login" replace />
  return children
}

function App() {
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [isUserAuthed, setIsUserAuthed] = useState(!!localStorage.getItem('user_token'))
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])

  const handleAuthSuccess = () => {
    setIsUserAuthed(true)
    setAuthOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user_token')
    setIsUserAuthed(false)
    setCartItems([])
    setCartOpen(false)
  }

  const loadCart = async () => {
    const token = localStorage.getItem('user_token')
    if (!token) return
    try {
      const res = await fetch('http://localhost:3001/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setCartItems(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load cart', e)
    }
  }

  const openCart = async () => {
    if (!isUserAuthed) {
      setAuthMode('login')
      setAuthOpen(true)
      return
    }
    await loadCart()
    setCartOpen(true)
  }

  const closeCart = () => setCartOpen(false)

  const handleAddToCart = async (product) => {
    if (!isUserAuthed) {
      setAuthMode('login')
      setAuthOpen(true)
      return
    }
    const token = localStorage.getItem('user_token')
    try {
      await fetch('http://localhost:3001/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      })
      await loadCart()
      setCartOpen(true)
    } catch (e) {
      console.error('Failed to add to cart', e)
    }
  }

  const updateCartQty = async (itemId, quantity) => {
    const token = localStorage.getItem('user_token')
    try {
      await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      })
      await loadCart()
    } catch (e) {
      console.error('Failed to update cart item', e)
    }
  }

  const removeCartItem = async (itemId) => {
    const token = localStorage.getItem('user_token')
    try {
      await fetch(`http://localhost:3001/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadCart()
    } catch (e) {
      console.error('Failed to remove cart item', e)
    }
  }

  const viewCart = () => { setCartOpen(false); navigate('/cart') }

  return (
    <Routes>
      <Route path="/" element={<>
        <Navbar
          onLoginClick={() => { setAuthMode('login'); setAuthOpen(true) }}
          isUserAuthed={isUserAuthed}
          onLogout={handleLogout}
          onCartClick={openCart}
        />
        <Hero />
        <ProductsSection onAddToCart={handleAddToCart} />
        <Footer />
        <CartSidebar
          isOpen={cartOpen}
          items={cartItems}
          onClose={closeCart}
          onUpdateQty={updateCartQty}
          onRemove={removeCartItem}
          onViewCart={viewCart}
        />
        <AuthModal
          isOpen={authOpen}
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSwitchMode={(m) => setAuthMode(m)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>} />

      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />

      <Route path="/admin-login" element={<Login />} />
      <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/posters" element={<ProtectedRoute><AdminLayout><AdminPosters /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/blogs" element={<ProtectedRoute><AdminLayout><AdminBlogs /></AdminLayout></ProtectedRoute>} />
    </Routes>
  )
}

export default App
