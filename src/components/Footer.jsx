import React from 'react'
import './footer.css'

export default function Footer() {
  return (
    <footer className="site-footer" aria-label="Site Footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/src/assets/logo.png" alt="BIONETRO (PVT) LTD" className="footer-logo" />
            <p className="brand-tagline">BRINGING GLOBAL HEALTH CARE TO YOU</p>
            <div className="social-icons">
              <a href="#" aria-label="Facebook" className="social-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.7V12h2.7V9.7c0-2.7 1.6-4.2 4.1-4.2 1.2 0 2.4.2 2.4.2v2.6h-1.4c-1.4 0-1.8.9-1.8 1.8V12h3l-.5 2.9h-2.5v7A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="social-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.29 4.29 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 12 8.55c0 .33.04.66.11.97A12.15 12.15 0 0 1 3.15 5.5a4.28 4.28 0 0 0 1.32 5.71c-.65-.02-1.27-.2-1.82-.5v.05a4.28 4.28 0 0 0 3.43 4.2c-.31.09-.64.14-.98.14-.24 0-.48-.02-.71-.06a4.28 4.28 0 0 0 3.99 2.97A8.59 8.59 0 0 1 2 19.54a12.12 12.12 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56A8.7 8.7 0 0 0 22.46 6z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="social-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm6.5-2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="social-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v13H0V8zm7.5 0h4.8v1.8h.07c.67-1.27 2.3-2.6 4.75-2.6 5.08 0 6.02 3.34 6.02 7.68V21H18v-6.7c0-1.6-.03-3.64-2.22-3.64-2.22 0-2.56 1.73-2.56 3.52V21H7.5V8z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="social-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8zM9.6 15.5V8.5l6.4 3.5-6.4 3.5z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-columns">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#">Men</a></li>
                <li><a href="#">Men</a></li>
                <li><a href="#">Men</a></li>
                <li><a href="#">Men</a></li>
                <li><a href="#">Men</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Culture</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Getting started</a></li>
                <li><a href="#">Help center</a></li>
                <li><a href="#">Server status</a></li>
                <li><a href="#">Report a bug</a></li>
                <li><a href="#">Chat support</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <span>Copyright © 2025 | All Rights Reserved | </span>
          <a href="#" className="footer-link">Terms and Conditions</a>
          <span> | </span>
          <a href="#" className="footer-link">Privacy Policy</a>
          <span> | </span>
           <a href="https://www.getsoftora.com/" className="footer-link">POWERD BY SOFTORA</a>
        </div>
      </div>
    </footer>
  )
}