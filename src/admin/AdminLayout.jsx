import React from 'react'
import './admin.css'

export default function AdminLayout({ children }) {
  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    window.location.href = '/admin-login'
  }
  return (
    <div className="admin-wrapper">
      <aside className="admin-sidebar">
        <div className="admin-brand">BIOINTRO (pvt) LTD</div>
        <nav>
          <a href="/admin" className="active">Products</a>
          <a href="#">Cosmetics</a>
          <a href="#">Nutraceuticals</a>
          <a href="#">Herbal Products (Ayurvedic)</a>
          <a href="#">Nutritional Supplements</a>
          <div style={{ marginTop: 10, color: '#6b7280', fontWeight: 600 }}>Content</div>
          <a href="/admin/posters">Promotion Cards and Posters</a>
          <a href="/admin/blogs">Blogs</a>
        </nav>
      </aside>
      <div className="admin-content">
        <div className="admin-topbar">
          <input className="admin-search" placeholder="Search" />
          <div className="admin-user">BIOINTRO (pvt) LTD</div>
          <button className="admin-add" onClick={handleLogout}>Logout</button>
        </div>
        <div className="admin-body">
          {children}
        </div>
      </div>
    </div>
  )
}