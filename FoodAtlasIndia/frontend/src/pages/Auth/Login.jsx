import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiArrowRight } from 'react-icons/fi'
import useAuthStore from '../../store/authStore'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const { login, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Min 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!validate()) return
    const result = await login(email, password)
    if (result.success) navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg">
        <div className="auth-page__orb auth-page__orb--1" />
        <div className="auth-page__orb auth-page__orb--2" />
        <div className="auth-page__grid-pattern" />
      </div>

      <div className="auth-page__content">
        {/* Left Panel */}
        <motion.div
          className="auth-panel auth-panel--left hide-mobile"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-panel__showcase">
            <h2>Welcome back,<br /><span className="gradient-text">Explorer!</span></h2>
            <p>Your next adventure awaits. Log in to access your journeys, bookings, and personalized travel recommendations.</p>
            <div className="auth-panel__features">
              <div className="auth-panel__feature">
                <span>🗺️</span>
                <span>Track your journeys</span>
              </div>
              <div className="auth-panel__feature">
                <span>🎫</span>
                <span>Manage your bookings</span>
              </div>
              <div className="auth-panel__feature">
                <span>💰</span>
                <span>View expense history</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel — Form */}
        <motion.div
          className="auth-panel auth-panel--right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="auth-form-wrap">
            <Link to="/" className="auth-logo">
              <span className="auth-logo__icon"><FiMapPin /></span>
              <span>Yatra<span className="navbar__logo-accent">Mind</span></span>
            </Link>

            <h3 className="auth-title">Log in to your account</h3>
            <p className="auth-subtitle">Enter your credentials to continue</p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className={`auth-input-group ${errors.email ? 'auth-input-group--error' : ''}`}>
                <label>Email</label>
                <div className="auth-input-wrap">
                  <FiMail />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="auth-input-error">{errors.email}</span>}
              </div>

              <div className={`auth-input-group ${errors.password ? 'auth-input-group--error' : ''}`}>
                <label>Password</label>
                <div className="auth-input-wrap">
                  <FiLock />
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="auth-input-error">{errors.password}</span>}
              </div>

              <div className="auth-options">
                <label className="auth-checkbox">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="#" className="auth-forgot">Forgot password?</a>
              </div>

              <button type="submit" className="auth-submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>Log In <FiArrowRight /></>
                )}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign up free</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
