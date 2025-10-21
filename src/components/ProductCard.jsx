import React from 'react'
import './products.css'

export default function ProductCard({ title, price, oldPrice, image, discountBadge, onAddToCart }) {
  return (
    <article className="product-card">
      <div className="product-media">
        {discountBadge && <div className="badge">{discountBadge}</div>}
        <img src={image} alt={title} />
      </div>
      <div className="product-info">
        <h4 className="product-title">{title}</h4>
        <div className="product-prices">
          <span className="price">{price}</span>
          {oldPrice && <span className="old-price">{oldPrice}</span>}
        </div>
        <button className="add-btn" onClick={onAddToCart}>Add to Cart</button>
      </div>
    </article>
  )
}