import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMapPin, FiCalendar, FiDollarSign, FiMap, FiTruck, FiHome, FiHeart, FiArrowRight, FiStar } from 'react-icons/fi'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import './Dashboard.css'

export default function Dashboard() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard')
        setDashboard(res.data.data)
      } catch (err) {
        console.error('Failed to fetch dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [isAuthenticated])

  const displayUser = dashboard?.user || user || { fullName: 'Explorer', email: 'explorer@foodatlasindia.com' }

  const stats = [
    { icon: <FiMap />, value: dashboard?.totalTrips ?? 0, label: 'Total Trips', color: '#0d9488' },
    { icon: <FiDollarSign />, value: `₹${((dashboard?.totalSpent ?? 0) / 1000).toFixed(0)}K`, label: 'Total Spent', color: '#f59e0b' },
    { icon: <FiCalendar />, value: dashboard?.activeBookings ?? 0, label: 'Active Bookings', color: '#7e22ce' },
    { icon: <FiHeart />, value: dashboard?.savedPlaces ?? 0, label: 'Saved Places', color: '#e11d48' },
  ]

  const recentBookings = dashboard?.recentBookings || []
  const expenseBreakdown = dashboard?.expenseBreakdown || []

  return (
    <div className="dashboard">
      <section className="dashboard__hero">
        <div className="dashboard__hero-bg"><div className="hero__gradient-orb hero__gradient-orb--1" /><div className="hero__gradient-orb hero__gradient-orb--2" /></div>
        <div className="container">
          <motion.div className="dashboard__profile" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dashboard__avatar">
              <FiUser />
            </div>
            <div className="dashboard__user-info">
              <h1>Welcome back, <span className="gradient-text">{displayUser.fullName?.split(' ')[0]}</span>!</h1>
              <p>{displayUser.email}</p>
            </div>
            {!isAuthenticated && (
              <Link to="/login" className="btn-primary" style={{ marginLeft: 'auto' }}>
                Login to Access <FiArrowRight />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="auth-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} />
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="dashboard__stats">
                {stats.map((stat, i) => (
                  <motion.div key={i} className="dashboard__stat-card glass"
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  >
                    <span className="dashboard__stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</span>
                    <span className="dashboard__stat-value">{stat.value}</span>
                    <span className="dashboard__stat-label">{stat.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="dashboard__grid">
                {/* Recent Bookings */}
                <div className="dashboard__section">
                  <h3>Recent Bookings</h3>
                  <div className="dashboard__bookings">
                    {recentBookings.length === 0 ? (
                      <div className="explorer__empty" style={{ padding: '1.5rem 0' }}>
                        <p>No bookings yet. <Link to="/transport" style={{ color: 'var(--primary-400)' }}>Book your first trip!</Link></p>
                      </div>
                    ) : recentBookings.map((b, i) => (
                      <motion.div key={b.id} className="booking-card glass"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      >
                        <span className="booking-card__type">{b.type === 'TRANSPORT' ? <FiTruck /> : <FiHome />}</span>
                        <div className="booking-card__info">
                          <strong>{b.details || `${b.type} Booking`}</strong>
                          <span><FiCalendar /> {b.travelDate || 'Flexible'} · ₹{(b.totalAmount || 0).toLocaleString()}</span>
                        </div>
                        <span className="booking-card__status">✓ {b.status}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Expense Summary */}
                <div className="dashboard__section">
                  <h3>Expense Summary</h3>
                  <div className="dashboard__saved">
                    {expenseBreakdown.length === 0 ? (
                      <div className="explorer__empty" style={{ padding: '1.5rem 0' }}>
                        <p>No expenses tracked. <Link to="/expenses" style={{ color: 'var(--primary-400)' }}>Start tracking!</Link></p>
                      </div>
                    ) : expenseBreakdown.map((item, i) => (
                      <motion.div key={i} className="saved-card glass"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      >
                        <FiDollarSign style={{ color: '#f59e0b' }} />
                        <span>{item.category}</span>
                        <span className="saved-card__rating">₹{(item.total || 0).toLocaleString()}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="dashboard__links">
                <Link to="/explore" className="dashboard__link glass"><FiMap /> Explore Cities</Link>
                <Link to="/transport" className="dashboard__link glass"><FiTruck /> Book Transport</Link>
                <Link to="/hotels" className="dashboard__link glass"><FiHome /> Find Hotels</Link>
                <Link to="/expenses" className="dashboard__link glass"><FiDollarSign /> Track Expenses</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
