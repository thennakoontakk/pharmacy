import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './checkout.css'

export default function CheckoutPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    district: '',
    postalCode: ''
  })
  const isUserAuthed = !!localStorage.getItem('user_token')

  useEffect(() => { (async () => {
    const token = localStorage.getItem('user_token')
    if (!token) { setItems([]); return }
    const res = await fetch('http://localhost:3001/api/cart', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
  })() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const subtotal = items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0)
  const shipping = items.length > 0 ? 250 : 0
  const total = subtotal + shipping

  const placeOrder = (e) => {
    e.preventDefault()
    if (!isUserAuthed) {
      alert('Please login to continue to payment.')
      return
    }
    if (!form.fullName || !form.phone || !form.address1 || !form.city || !form.district) {
      alert('Please fill in the required delivery details.')
      return
    }
    alert('Order details captured. Payment gateway integration will be added later.')
  }

  return (
    <div className="page">
      <Navbar isUserAuthed={isUserAuthed} onCartClick={() => {}} />

      <main className="checkout-page">
        <div className="checkout-left">
          <h2 className="section-title">Delivery Details</h2>
          <form className="form" onSubmit={placeOrder}>
            <div className="field"><label>Full Name*</label><input name="fullName" value={form.fullName} onChange={handleChange} /></div>
            <div className="split">
              <div className="field"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} /></div>
              <div className="field"><label>Phone*</label><input name="phone" value={form.phone} onChange={handleChange} /></div>
            </div>
            <div className="field"><label>Address Line 1*</label><input name="address1" value={form.address1} onChange={handleChange} /></div>
            <div className="field"><label>Address Line 2</label><input name="address2" value={form.address2} onChange={handleChange} /></div>
            <div className="split">
              <div className="field"><label>City*</label><input name="city" value={form.city} onChange={handleChange} /></div>
              <div className="field"><label>District*</label><input name="district" value={form.district} onChange={handleChange} /></div>
            </div>
            <div className="field"><label>Postal Code</label><input name="postalCode" value={form.postalCode} onChange={handleChange} /></div>

            <div className="payment-section">
              <div className="payment-title">Payment</div>
              <ul className="payment-list">
                <li>Cash on Delivery</li>
                <li>Card / Wallet (coming soon)</li>
                <li>Installments with MintPay / Koko (coming soon)</li>
              </ul>
            </div>

            <button className="place-order" type="submit">Place Order</button>
          </form>
        </div>

        <aside className="checkout-right">
          <div className="summary-card">
            <div className="summary-title">Order Summary</div>
            {items.map(it => (
              <div key={it.id} className="summary-item">
                <img className="sum-img" src={it.image?.includes('http') ? it.image : `http://localhost:3001${it.image || '/uploads/default.jpg'}`} alt={it.title} />
                <div className="sum-info">
                  <div className="sum-title">{it.title}</div>
                  <div className="sum-meta">Qty: {it.quantity}</div>
                </div>
                <div className="sum-price">Rs {(Number(it.price) * Number(it.quantity)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            ))}
            <div className="summary-row"><span>Subtotal</span><strong>Rs {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div className="summary-row"><span>Shipping</span><strong>Rs {shipping.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <div className="summary-row total"><span>Total</span><strong>Rs {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></div>
            <a className="back-to-cart" href="/cart">Back to Cart</a>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  )
}