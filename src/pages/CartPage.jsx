import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './cart-page.css'

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const isUserAuthed = !!localStorage.getItem('user_token')

  const loadCart = async () => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('user_token')
    if (!token) {
      setItems([])
      setLoading(false)
      return
    }
    try {
      const res = await fetch('http://localhost:3001/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  const updateQty = async (id, quantity) => {
    const token = localStorage.getItem('user_token')
    try {
      await fetch(`http://localhost:3001/api/cart/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      })
      await loadCart()
    } catch (e) {
      console.error('Failed to update qty', e)
    }
  }

  const removeItem = async (id) => {
    const token = localStorage.getItem('user_token')
    try {
      await fetch(`http://localhost:3001/api/cart/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      await loadCart()
    } catch (e) {
      console.error('Failed to remove item', e)
    }
  }

  const subtotal = items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0)
  const shipping = items.length > 0 ? 250 : 0
  const total = subtotal + shipping

  return (
    <div className="page">
      <Navbar isUserAuthed={isUserAuthed} onCartClick={() => {}} />

      <main className="cart-page">
        <div className="cart-left">
          <h2 className="section-title">Shopping Cart</h2>
          {loading && <div className="loading">Loading cart…</div>}
          {!loading && !isUserAuthed && (
            <div className="auth-hint">Please login to view your cart.</div>
          )}
          {!loading && isUserAuthed && items.length === 0 && (
            <div className="empty">Your cart is empty.</div>
          )}

          {items.map((it) => (
            <div key={it.id} className="cart-row">
              <img className="cart-img" src={it.image?.includes('http') ? it.image : `http://localhost:3001${it.image || '/uploads/default.jpg'}`} alt={it.title} />
              <div className="cart-info">
                <div className="title">{it.title}</div>
                <div className="price">Rs {Number(it.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="controls">
                  <button className="qty-btn" onClick={() => updateQty(it.id, Math.max(1, Number(it.quantity) - 1))}>-</button>
                  <span className="qty">{it.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(it.id, Number(it.quantity) + 1)}>+</button>
                </div>
              </div>
              <button className="remove" onClick={() => removeItem(it.id)}>Remove</button>
            </div>
          ))}
        </div>

        <aside className="cart-right">
          <div className="summary-card">
            <div className="summary-title">Order Summary</div>
            <div className="summary-row"><span>Subtotal</span><strong>Rs {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div className="summary-row"><span>Shipping</span><strong>Rs {shipping.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div className="summary-row total"><span>Total</span><strong>Rs {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <a className="checkout-btn" href="/checkout">Checkout</a>
          </div>

          <div className="payment-badges">
            <div className="badge">0% Installments</div>
            <div className="badge">MintPay • Koko • Visa</div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  )
}