import React, { useEffect, useState } from 'react'
import './products.css'
import ProductCard from './ProductCard'

export default function ProductsSection({ onAddToCart }) {
  const [products, setProducts] = useState([])
  const [posters, setPosters] = useState([])
  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/api/products').then(r => r.json()).then(data => setProducts(data))
    fetch('http://localhost:3001/api/public/posters').then(r => r.json()).then(data => setPosters(data))
    fetch('http://localhost:3001/api/public/blogs').then(r => r.json()).then(data => setBlogs(Array.isArray(data) ? data : []))
  }, [])

  const formatPrice = (v) => `Rs ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  return (
    <section className="products-wrapper">
      <div className="container">
        <header className="section-header">
          <h2>New Arrivals</h2>
          <a className="see-all" href="#new-arrivals">See all</a>
        </header>
        <div className="grid">
          {products.map(p => (
            <ProductCard
              key={p.id}
              title={p.title}
              price={formatPrice(p.price)}
              oldPrice={p.oldPrice ? formatPrice(p.oldPrice) : undefined}
              image={p.image?.includes('http') ? p.image : `http://localhost:3001${p.image || '/uploads/default.jpg'}`}
              discountBadge={p.discountBadge}
              onAddToCart={() => onAddToCart && onAddToCart(p)}
            />
          ))}
        </div>

        {/* Best Selling Section with Poster Layout */}
        <header className="section-header">
          <h2>Best Selling</h2>
          <a className="see-all" href="#best-selling">See all</a>
        </header>
        <div className="section-with-poster">
          <div className="products-with-poster">
            <div className="product-rows">
              <div className="product-row">
                {products.slice(0,3).map(p => (
                  <ProductCard
                    key={`b1-${p.id}`}
                    title={p.title}
                    price={formatPrice(p.price)}
                    oldPrice={p.oldPrice ? formatPrice(p.oldPrice) : undefined}
                    image={p.image?.includes('http') ? p.image : `http://localhost:3001${p.image || '/uploads/default.jpg'}`}
                    discountBadge={p.discountBadge}
                    onAddToCart={() => onAddToCart && onAddToCart(p)}
                  />
                ))}
              </div>
              <div className="product-row">
                {products.slice(3,6).map(p => (
                  <ProductCard
                    key={`b2-${p.id}`}
                    title={p.title}
                    price={formatPrice(p.price)}
                    oldPrice={p.oldPrice ? formatPrice(p.oldPrice) : undefined}
                    image={p.image?.includes('http') ? p.image : `http://localhost:3001${p.image || '/uploads/default.jpg'}`}
                    discountBadge={p.discountBadge}
                    onAddToCart={() => onAddToCart && onAddToCart(p)}
                  />
                ))}
              </div>
            </div>
            {posters.length > 0 && (
              <div className="poster-sidebar">
                <img src={`http://localhost:3001${posters[0]?.image_path}`} alt={posters[0]?.name} className="poster-image" />
              </div>
            )}
          </div>
        </div>

        {/* Top Rated Section with Poster Layout */}
        <header className="section-header">
          <h2>Top Rated</h2>
          <a className="see-all" href="#top-rated">See all</a>
        </header>
        <div className="section-with-poster">
          <div className="products-with-poster">
            <div className="product-rows">
              <div className="product-row">
                {products.slice(1,4).map(p => (
                  <ProductCard
                    key={`t1-${p.id}`}
                    title={p.title}
                    price={formatPrice(p.price)}
                    oldPrice={p.oldPrice ? formatPrice(p.oldPrice) : undefined}
                    image={p.image?.includes('http') ? p.image : `http://localhost:3001${p.image || '/uploads/default.jpg'}`}
                    discountBadge={p.discountBadge}
                    onAddToCart={() => onAddToCart && onAddToCart(p)}
                  />
                ))}
              </div>
              <div className="product-row">
                {products.slice(4,7).map(p => (
                  <ProductCard
                    key={`t2-${p.id}`}
                    title={p.title}
                    price={formatPrice(p.price)}
                    oldPrice={p.oldPrice ? formatPrice(p.oldPrice) : undefined}
                    image={p.image?.includes('http') ? p.image : `http://localhost:3001${p.image || '/uploads/default.jpg'}`}
                    discountBadge={p.discountBadge}
                    onAddToCart={() => onAddToCart && onAddToCart(p)}
                  />
                ))}
              </div>
            </div>
            {posters.length > 1 && (
              <div className="poster-sidebar">
                <img src={`http://localhost:3001${posters[1]?.image_path}`} alt={posters[1]?.name} className="poster-image" />
              </div>
            )}
          </div>
        </div>

        {/* Browse by Your Skin Type Section */}
        <div className="skin-type-section">
          <div className="skin-type-left">
            <div className="skin-type-images">
              <div className="main-image">
                <img src="/src/assets/face 1.png" alt="Skin Type Guide" />
              </div>
              <div className="side-images">
                <img src="/src/assets/face 2.png" alt="Skin Type 1" />
                <img src="/src/assets/face 3.png" alt="Skin Type 2" />
              </div>
            </div>
            <div className="daily-activity-card">
              <h4>Daily Activity</h4>
              <p>Loream is ispam</p>
            </div>
          </div>
          <div className="skin-type-right">
            <h2>Browse by Your Skin Type</h2>
            <div className="faq-list">
              <div className="faq-item">
                <p>How long does it take for you to complete a project?</p>
                <span className="arrow-icon">&gt;</span>
              </div>
              <div className="faq-item">
                <p>How long does it take for you to complete a project?</p>
                <span className="arrow-icon">&gt;</span>
              </div>
              <div className="faq-item">
                <p>How long does it take for you to complete a project?</p>
                <span className="arrow-icon">&gt;</span>
              </div>
              <div className="faq-item">
                <p>How long does it take for you to complete a project?</p>
                <span className="arrow-icon">&gt;</span>
              </div>
              <div className="faq-item">
                <p>How long does it take for you to complete a project?</p>
                <span className="arrow-icon">&gt;</span>
              </div>
            </div>
          </div>
        </div>

        <div className="brands-section">
          <h2>TOP BRANDS</h2>
          <div className="brands-grid">
            <img src="/src/assets/brand (1).png" alt="Andre Beauty Supply" />
            <img src="/src/assets/brand (2).png" alt="QVC Beauty" />
            <img src="/src/assets/brand (3).png" alt="ULTA Beauty" />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>WHAT OUR CUSTOMERS SAY</h2>
          <div className="reviews-grid">
            {[
              { name: 'Samantha', date: 'January 07, 2023', text: 'Great — great job! So in love with my skincare routine now. Delivery was fast and support was helpful.', avatar: '/src/assets/face 1.png' },
              { name: 'Samantha', date: 'April 07, 2023', text: 'Ordered twice already. Good selection and authentic products. Prices are reasonable.', avatar: '/src/assets/face 2.png' },
              { name: 'Samantha', date: 'April 07, 2023', text: 'Customer service answered all my questions. The site is easy to use.', avatar: '/src/assets/face 3.png' },
              { name: 'Samantha', date: 'April 07, 2023', text: 'Love the bundle deals. Will recommend to friends!', avatar: '/src/assets/face 2.png' },
            ].map((r, idx) => (
              <div key={idx} className="review-card">
                <div className="review-header">
                  <img className="avatar" src={r.avatar} alt={r.name} />
                  <div className="meta">
                    <div className="name">{r.name}</div>
                    <div className="date">{r.date}</div>
                  </div>
                </div>
                <div className="stars">★★★★★</div>
                <p className="review-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Blog Section */}
        <div className="latest-blog-section">
          <h2>LATEST BLOG</h2>
          <p className="latest-blog-intro">
            Learn more about K-Beauty and skincare in Sri Lanka. We gather insights and guides to help you shop smarter and care for your skin with trusted products you can find locally.
          </p>
          <div className="blogs-grid">
            {blogs.map((b) => (
              <div key={b.id} className="blog-card">
                {b.thumbnail_path && (
                  <img className="blog-thumb" src={`http://localhost:3001${b.thumbnail_path}`} alt={b.title} />
                )}
                <div className="blog-overlay">
                  <h3 className="blog-title">{b.title}</h3>
                  <p className="blog-desc">{b.description?.length > 80 ? b.description.slice(0,80) + '…' : b.description}</p>
                </div>
              </div>
            ))}
            {blogs.length === 0 && (
              <div className="no-blogs">No blogs yet. Add some in Admin &gt; Blogs.</div>
            )}
          </div>
        </div>

        {/* Footer moved to dedicated component */}
      </div>
    </section>
  )
}