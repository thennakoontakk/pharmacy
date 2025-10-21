import React, { useState } from 'react'
import './navbar.css'
import logo from '../assets/logo.png'

export default function Navbar({ onLoginClick, isUserAuthed, onLogout, onCartClick }) {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className={`navbar ${searchOpen ? 'search-open' : ''}`}>
      {/* Left: Brand logo */}
      <div className="navbar__brand">
        <a href="/" className="navbar__brand-link" aria-label="Go to Home">
          <img src={logo} alt="Brand Logo" className="navbar__logo" />
          <span className="navbar__title">BIONETRO</span>
        </a>
      </div>
      {/* Center: Floating centered pill navigation (no logo inside pill) */}
      <div className="navbar__center">
        <nav className="nav-pill" aria-label="Primary">
          <a href="/" className="nav__link">Home</a>
          <a href="#shop" className="nav__link">Shop</a>
          <a href="#brand" className="nav__link">Brand</a>
          <a href="#about" className="nav__link">About Us</a>
          <a href="#contact" className="nav__link">Contact Us</a>
        </nav>
      </div>

      {/* Right-side actions with animated search to the LEFT of the search icon */}
      <div className="navbar__actions">
        <input
          type="text"
          className="search-input"
          placeholder="Search..."
          aria-label="Search"
        />
        <button
          className="icon-btn"
          aria-label="Open search"
          onClick={() => setSearchOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button className="text-link cart-btn" aria-label="Open cart" onClick={onCartClick}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="9" cy="20" r="1"></circle>
            <circle cx="17" cy="20" r="1"></circle>
            <path d="M5 4h2l1 7h10l2-5H7"></path>
          </svg>
          <span>Cart</span>
        </button>
        {isUserAuthed ? (
          <button onClick={onLogout} className="text-link logout-btn">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
          </button>
        ) : (
          <a href="#login" className="text-link login-btn" onClick={(e) => { e.preventDefault(); onLoginClick && onLoginClick(); }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Login</span>
          </a>
        )}
      </div>
    </header>
  )
}