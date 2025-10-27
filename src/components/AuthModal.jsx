import React, { useState } from 'react'
import './auth.css'
import logo from '../assets/logo.png'

export default function AuthModal({ isOpen, mode = 'login', onClose, onSwitchMode, onAuthSuccess }) {
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [accept, setAccept] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          try {
            const adminRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword })
            });
            const adminData = await adminRes.json();
            if (adminRes.ok) {
              localStorage.setItem('admin_token', adminData.token);
              window.location.href = '/admin';
              return;
            } else {
              setError(adminData?.error || 'Invalid credentials');
            }
          } catch (adminErr) {
            setError('Network error. Please try again.');
          }
        } else {
          setError(data?.error || 'Login failed');
        }
      } else {
        localStorage.setItem('user_token', data.token)
        onAuthSuccess?.(data.user, data.token)
        onClose?.()
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: signupEmail.trim(), password: signupPassword })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Signup failed')
      } else {
        localStorage.setItem('user_token', data.token)
        onAuthSuccess?.(data.user, data.token)
        onClose?.()
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true">
      <div className="auth-card">
        <button className="auth-close" aria-label="Close" onClick={onClose}>×</button>
        <div className="auth-brand">
          <img src={logo} alt="Logo" />
        </div>
        {error && <div className="auth-error" role="alert">{error}</div>}

        {mode === 'login' ? (
          <>
            <h2 className="auth-title">LOGIN</h2>
            <form onSubmit={handleLogin} className="auth-form">
              <label>Email</label>
              <input type="email" value={loginEmail} onChange={(e)=>setLoginEmail(e.target.value)} placeholder="email@example.com" />
              <label>Password</label>
              <input type="password" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} placeholder="••••••••" />

              <div className="auth-row">
                <label className="checkbox">
                  <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
                  <span>Remember Me</span>
                </label>
                <a href="#" className="auth-link">Forgot Password?</a>
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Logging in...' : 'LOGIN'}</button>
            </form>

            <div className="auth-footer">
              <span>Don’t have an account? </span>
              <button className="link-btn" onClick={() => onSwitchMode?.('signup')}>Create an account</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="auth-title">Create account</h2>
            <form onSubmit={handleSignup} className="auth-form">
              <label>Name</label>
              <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" />
              <label>Email</label>
              <input type="email" value={signupEmail} onChange={(e)=>setSignupEmail(e.target.value)} placeholder="email@example.com" />
              <label>Password</label>
              <input type="password" value={signupPassword} onChange={(e)=>setSignupPassword(e.target.value)} placeholder="••••••••" />

              <label className="checkbox">
                <input type="checkbox" checked={accept} onChange={(e)=>setAccept(e.target.checked)} />
                <span>I accept the <a href="#" className="auth-link">Terms & Conditions</a></span>
              </label>

              <button type="submit" className="primary-btn" disabled={!accept || loading}>{loading ? 'Creating...' : 'Create account'}</button>
            </form>

            <div className="auth-footer">
              <span>Already have an account? </span>
              <button className="link-btn" onClick={() => onSwitchMode?.('login')}>Login</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}