import React, { useState } from 'react'
import axios from 'axios'
import './admin.css'
import logo from '../assets/logo.png'

export default function Login() {
  const [email, setEmail] = useState('admin@pharmacy.test')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await axios.post('/api/auth/login', { email, password })
      localStorage.setItem('admin_token', data.token)
      window.location.href = '/admin'
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="login-wrapper light-blue-bg">
      <form className="login-card login-card-blue" onSubmit={handleSubmit}>
        <div className="login-brand">
          <img src={logo} alt="Logo" />
          <div className="login-title">
            <h2>Admin Login</h2>
            <p>Please sign in to manage content</p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <label>Email</label>
        <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pharmacy.test" />
        <label>Password</label>
        <input className="login-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
        <button type="submit" className="admin-add login-button">Login</button>
      </form>
    </div>
  )
}