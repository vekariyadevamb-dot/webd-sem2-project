import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiMapPin, FiArrowRight, FiCheck } from 'react-icons/fi'
import useAuthStore from '../../store/authStore'
import './Auth.css'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  const updateField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }))

  const validateStep1 = () => {
    const errs = {}
    if (!formData.fullName.trim()) errs.fullName = 'Name is required'
    if (!formData.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email'
    if (!formData.phone) errs.phone = 'Phone is required'
    else if (formData.phone.length < 10) errs.phone = 'Invalid phone number'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 6) errs.password = 'Min 6 characters'
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
      setErrors({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (!validateStep2()) return
    const { confirmPassword, ...data } = formData
    const result = await register(data)
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
          transition={{ duration: 0.8 }}
        >
          <div className="auth-panel__showcase">
            <h2>Start Your<br /><span className="gradient-text">Adventure</span></h2>
            <p>Create your free account and unlock a world of smart travel planning, booking, and exploration.</p>
            <div className="auth-panel__features">
              <div className="auth-panel__feature">
                <span>🆓</span>
                <span>Free forever, no hidden charges</span>
              </div>
              <div className="auth-panel__feature">
                <span>🔒</span>
                <span>Your data is secure with us</span>
              </div>
              <div className="auth-panel__feature">
                <span>🚀</span>
                <span>Get started in under 30 seconds</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="auth-panel auth-panel--right"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <div className="auth-form-wrap">
            <Link to="/" className="auth-logo">
              <span className="auth-logo__icon"><FiMapPin /></span>
              <span>Yatra<span className="navbar__logo-accent">Mind</span></span>
            </Link>

            <h3 className="auth-title">Create your account</h3>

            {/* Progress Steps */}
            <div className="auth-steps">
              <div className={`auth-step ${step >= 1 ? 'auth-step--active' : ''}`}>
                <span className="auth-step__circle">{step > 1 ? <FiCheck /> : '1'}</span>
                <span>Profile</span>
              </div>
              <div className="auth-step__line" />
              <div className={`auth-step ${step >= 2 ? 'auth-step--active' : ''}`}>
                <span className="auth-step__circle">2</span>
                <span>Security</span>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className={`auth-input-group ${errors.fullName ? 'auth-input-group--error' : ''}`}>
                    <label>Full Name</label>
                    <div className="auth-input-wrap">
                      <FiUser />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => updateField('fullName', e.target.value)}
                      />
                    </div>
                    {errors.fullName && <span className="auth-input-error">{errors.fullName}</span>}
                  </div>

                  <div className={`auth-input-group ${errors.email ? 'auth-input-group--error' : ''}`}>
                    <label>Email</label>
                    <div className="auth-input-wrap">
                      <FiMail />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                    {errors.email && <span className="auth-input-error">{errors.email}</span>}
                  </div>

                  <div className={`auth-input-group ${errors.phone ? 'auth-input-group--error' : ''}`}>
                    <label>Phone Number</label>
                    <div className="auth-input-wrap">
                      <FiPhone />
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                    {errors.phone && <span className="auth-input-error">{errors.phone}</span>}
                  </div>

                  <button type="button" className="auth-submit" onClick={handleNext}>
                    Continue <FiArrowRight />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className={`auth-input-group ${errors.password ? 'auth-input-group--error' : ''}`}>
                    <label>Password</label>
                    <div className="auth-input-wrap">
                      <FiLock />
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                      />
                      <button type="button" className="auth-input-toggle" onClick={() => setShowPass(!showPass)}>
                        {showPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {errors.password && <span className="auth-input-error">{errors.password}</span>}
                  </div>

                  <div className={`auth-input-group ${errors.confirmPassword ? 'auth-input-group--error' : ''}`}>
                    <label>Confirm Password</label>
                    <div className="auth-input-wrap">
                      <FiLock />
                      <input
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                      />
                    </div>
                    {errors.confirmPassword && <span className="auth-input-error">{errors.confirmPassword}</span>}
                  </div>

                  <div className="auth-form__actions">
                    <button type="button" className="auth-back" onClick={() => setStep(1)}>← Back</button>
                    <button type="submit" className="auth-submit" disabled={isLoading} style={{ flex: 1 }}>
                      {isLoading ? <span className="auth-spinner" /> : <>Create Account <FiArrowRight /></>}
                    </button>
                  </div>
                </motion.div>
              )}
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
