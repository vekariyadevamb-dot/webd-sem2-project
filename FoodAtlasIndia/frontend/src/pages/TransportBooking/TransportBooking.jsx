import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiNavigation, FiClock, FiUsers, FiCalendar, FiSearch, FiArrowRight, FiStar } from 'react-icons/fi'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PaymentModal from '../../components/common/PaymentModal'
import { useToast } from '../../components/common/Toast'
import './TransportBooking.css'

const BusIcon = () => <span style={{ fontSize: '1.2em' }}>🚌</span>
const TrainIcon = () => <span style={{ fontSize: '1.2em' }}>🚂</span>
const FlightIcon = () => <span style={{ fontSize: '1.2em' }}>✈️</span>

const tabs = [
  { id: 'BUS', label: 'Bus', icon: <BusIcon />, source: 'RedBus' },
  { id: 'TRAIN', label: 'Train', icon: <TrainIcon />, source: 'Ixigo' },
  { id: 'FLIGHT', label: 'Flight', icon: <FlightIcon />, source: 'Goibibo' },
]

export default function TransportBooking() {
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('BUS')
  const [fromCity, setFromCity] = useState('Delhi')
  const [toCity, setToCity] = useState(searchParams.get('to') || 'Jaipur')
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0])
  const [passengers, setPassengers] = useState(1)
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showPayment, setShowPayment] = useState(null)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)
    setSelectedBooking(null)
    try {
      const res = await api.get('/transport/live-search', {
        params: { from: fromCity, to: toCity, type: activeTab, date }
      })
      setResults(res.data.data || [])
    } catch (err) {
      console.error('Transport search failed:', err)
      toast.error('Search Failed', 'Could not fetch transport data. Please try again.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleBookClick = (transport) => {
    if (!isAuthenticated) {
      toast.info('Login Required', 'Please login to book transport.')
      navigate('/login')
      return
    }
    const totalAmount = transport.price * parseInt(passengers)
    setShowPayment({ ...transport, totalAmount })
  }

  const handlePaymentSuccess = async ({ txnId, method }) => {
    const transport = showPayment
    setShowPayment(null)
    setSelectedBooking(null)
    try {
      await api.post('/bookings', {
        type: 'TRANSPORT',
        referenceId: transport.id || 1,
        details: `${transport.operator} — ${transport.fromCity} → ${transport.toCity} (${transport.travelClass})`,
        passengers: parseInt(passengers),
        totalAmount: transport.totalAmount,
        travelDate: date || null,
        paymentMethod: method,
        paymentId: txnId,
      })
      toast.success('Booking Confirmed! 🎉', `${transport.operator} — ₹${transport.totalAmount.toLocaleString()} paid via ${method}. Added to your expenses.`)
    } catch (err) {
      console.error('Booking failed:', err)
      toast.error('Booking Failed', err.response?.data?.message || 'Payment was processed but booking failed. Please contact support.')
    }
  }

  const currentSource = tabs.find(t => t.id === activeTab)?.source

  return (
    <div className="transport">
      <section className="transport__hero">
        <div className="transport__hero-bg">
          <div className="hero__gradient-orb hero__gradient-orb--1" />
          <div className="hero__gradient-orb hero__gradient-orb--2" />
        </div>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label">🚀 Book Transport</span>
            <h1 className="transport__title">Travel <span className="gradient-text">Anywhere</span></h1>
            <p className="transport__subtitle">Compare and book buses, trains, and flights at the best prices.</p>
          </motion.div>

          <motion.div className="transport__tabs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {tabs.map((tab) => (
              <button key={tab.id} className={`transport__tab ${activeTab === tab.id ? 'transport__tab--active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setSearched(false); setResults([]) }}>
                {tab.icon}<span>{tab.label}</span>
                {activeTab === tab.id && <motion.div className="transport__tab-indicator" layoutId="tabIndicator" />}
              </button>
            ))}
          </motion.div>

          <motion.div className="transport__search glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="transport__search-grid">
              <div className="transport__field">
                <label><FiNavigation /> From</label>
                <input type="text" value={fromCity} onChange={(e) => setFromCity(e.target.value)} placeholder="Departure city" />
              </div>
              <div className="transport__swap" onClick={() => { const t = fromCity; setFromCity(toCity); setToCity(t) }}>⇄</div>
              <div className="transport__field">
                <label><FiNavigation /> To</label>
                <input type="text" value={toCity} onChange={(e) => setToCity(e.target.value)} placeholder="Destination city" />
              </div>
              <div className="transport__field">
                <label><FiCalendar /> Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="transport__field transport__field--small">
                <label><FiUsers /> Passengers</label>
                <select value={passengers} onChange={(e) => setPassengers(e.target.value)}>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button className="transport__search-btn" onClick={handleSearch} disabled={loading}>
                <FiSearch /> {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {searched && (
        <section className="section">
          <div className="container">
            <div className="transport__results-header">
              <h3>{results.length} result{results.length !== 1 ? 's' : ''} found <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>• {fromCity} → {toCity}</span></h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: 20 }}>
                Powered by {currentSource}
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}><div className="auth-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
            ) : results.length === 0 ? (
              <div className="explorer__empty"><h3>No routes found</h3><p>Try different cities or transport type.</p></div>
            ) : (
              <div className="transport__results">
                <AnimatePresence mode="popLayout">
                  {results.map((r, i) => (
                    <motion.div key={`${activeTab}-${r.id}-${i}`}
                      className={`transport-card glass ${selectedBooking === i ? 'transport-card--selected' : ''}`}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedBooking(i)}>
                      <div className="transport-card__main">
                        <div className="transport-card__operator">
                          <h4>{r.operator}</h4>
                          <span className="transport-card__type">{r.travelClass}</span>
                          {r.flightNumber && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{r.flightNumber}</span>}
                          {r.trainNumber && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>#{r.trainNumber}</span>}
                        </div>
                        <div className="transport-card__schedule">
                          <div className="transport-card__time"><strong>{r.departure}</strong><span>{r.fromCity}</span></div>
                          <div className="transport-card__duration"><span>{r.duration}</span><div className="transport-card__line" /></div>
                          <div className="transport-card__time"><strong>{r.arrival}</strong><span>{r.toCity}</span></div>
                        </div>
                        <div className="transport-card__price-wrap">
                          <span className="transport-card__price">₹{r.price?.toLocaleString()}</span>
                          <span className="transport-card__seats">{r.availableSeats} seats left</span>
                          <span className="transport-card__rating"><FiStar /> {r.rating}</span>
                        </div>
                      </div>
                      {selectedBooking === i && (
                        <motion.div className="transport-card__booking" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                          <div className="transport-card__booking-inner">
                            <p>Total for {passengers} passenger(s): <strong>₹{(r.price * passengers).toLocaleString()}</strong></p>
                            <button className="btn-primary" onClick={(e) => { e.stopPropagation(); handleBookClick(r) }}>
                              Pay & Book <FiArrowRight />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      )}

      {showPayment && (
        <PaymentModal amount={showPayment.totalAmount} title={`${showPayment.operator} Booking`}
          onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(null)} />
      )}
    </div>
  )
}
