import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineMenuAlt3, HiX } from 'react-icons/hi'
import { FiMapPin, FiCompass, FiCoffee, FiTruck, FiHome, FiPieChart, FiUser, FiLogOut } from 'react-icons/fi'
import useAuthStore from '../../store/authStore'
import './Navbar.css'

const navLinks = [
  { path: '/explore', label: 'Explore', icon: <FiCompass /> },
  { path: '/transport', label: 'Transport', icon: <FiTruck /> },
  { path: '/hotels', label: 'Hotels', icon: <FiHome /> },
  { path: '/food', label: 'Food', icon: <FiCoffee /> },
  { path: '/expenses', label: 'Expenses', icon: <FiPieChart /> },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <motion.nav
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="navbar__inner container">
          <Link to="/" className="navbar__logo">
            <span className="navbar__logo-icon">
              <FiMapPin />
            </span>
            <span className="navbar__logo-text">
              FoodAtlas<span className="navbar__logo-accent"> India</span>
            </span>
          </Link>

          <div className="navbar__links hide-mobile">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
                {location.pathname === link.path && (
                  <motion.div
                    className="navbar__link-indicator"
                    layoutId="navIndicator"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="navbar__actions hide-mobile">
            {isAuthenticated ? (
              <div className="navbar__user">
                <Link to="/dashboard" className="navbar__avatar">
                  <FiUser />
                  <span>{user?.fullName?.split(' ')[0] || 'User'}</span>
                </Link>
                <button onClick={logout} className="navbar__logout" title="Logout">
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="navbar__btn navbar__btn--ghost">Log In</Link>
                <Link to="/signup" className="navbar__btn navbar__btn--primary">Sign Up</Link>
              </>
            )}
          </div>

          <button
            className="navbar__hamburger show-mobile"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <HiOutlineMenuAlt3 />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="mobile-menu__header">
                <span className="navbar__logo-text">
                  FoodAtlas<span className="navbar__logo-accent"> India</span>
                </span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <HiX />
                </button>
              </div>

              <div className="mobile-menu__links">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <Link
                      to={link.path}
                      className={`mobile-menu__link ${location.pathname === link.path ? 'mobile-menu__link--active' : ''}`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mobile-menu__footer">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" className="navbar__btn navbar__btn--ghost" style={{ width: '100%', textAlign: 'center' }}>
                      <FiUser /> Dashboard
                    </Link>
                    <button onClick={logout} className="navbar__btn navbar__btn--primary" style={{ width: '100%' }}>
                      <FiLogOut /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="navbar__btn navbar__btn--ghost" style={{ width: '100%', textAlign: 'center' }}>Log In</Link>
                    <Link to="/signup" className="navbar__btn navbar__btn--primary" style={{ width: '100%', textAlign: 'center' }}>Sign Up Free</Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
