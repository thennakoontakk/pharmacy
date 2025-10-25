import React from 'react'
import './cart.css'

export default function CartSidebar({ isOpen, items = [], onClose, onUpdateQty, onRemove, onViewCart, onCheckout }) {
  const subtotal = items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 1), 0)

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen} aria-label="Your cart">
        <div className="cart-header">
          <h3>Your cart</h3>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">×</button>
        </div>
        <div className="cart-items">
          {items.length === 0 && (
            <div className="cart-empty">Your cart is empty</div>
          )}
          {items.map((it) => (
            <div key={it.id} className="cart-item">
              <img className="cart-item-img" src={it.image?.includes('http') ? it.image : new URL(it.image || '/uploads/default.jpg', (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api$/, '')).toString()} alt={it.title} />
              <div className="cart-item-info">
                <div className="cart-item-title">{it.title}</div>
                <div className="cart-item-price">Rs {Number(it.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => onUpdateQty && onUpdateQty(it.id, Math.max(1, Number(it.quantity) - 1))}>-</button>
                  <span className="qty">{it.quantity}</span>
                  <button className="qty-btn" onClick={() => onUpdateQty && onUpdateQty(it.id, Number(it.quantity) + 1)}>+</button>
                </div>
              </div>
              <button className="remove-btn" onClick={() => onRemove && onRemove(it.id)} aria-label="Remove item">🗑</button>
            </div>
          ))}
        </div>
        <div className="cart-footer">
          <div className="cart-summary">
            <div className="row">
              <span>Sub Total:</span>
              <strong>Rs {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="row">
              <span>Discounts:</span>
              <strong>Rs 0.00</strong>
            </div>
          </div>
          <div className="cart-actions">
            <button className="view-btn" onClick={() => (onViewCart ? onViewCart() : onClose && onClose())}>View Cart</button>
            <button className="checkout-btn" onClick={() => onCheckout && onCheckout()}>Check out</button>
          </div>
        </div>
      </aside>
    </>
  )
}