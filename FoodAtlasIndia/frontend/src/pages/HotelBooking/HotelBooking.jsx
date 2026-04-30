import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiSearch, FiStar, FiMapPin, FiWifi, FiCoffee, FiDroplet, FiArrowRight, FiHeart, FiCalendar, FiUsers } from 'react-icons/fi'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import PaymentModal from '../../components/common/PaymentModal'
import { useToast } from '../../components/common/Toast'
import './HotelBooking.css'

const amenityIcons = { WiFi: <FiWifi />, Pool: <FiDroplet />, Spa: '🧖', Restaurant: <FiCoffee />, 'Beach Access': '🏖️', Bar: '🍸', Gym: '💪', 'Mountain View': '🏔️', 'Lake View': '🏞️', 'River View': '🌊', Heritage: '🏛️', Bonfire: '🔥', Fireplace: '🔥', AC: '❄️', Ayurveda: '🧘' }

export default function HotelBooking() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('city') || '')
  const [priceRange, setPriceRange] = useState(40000)
  const [hotels, setHotels] = useState([])
  const [allCities, setAllCities] = useState([])
  const [selectedCity, setSelectedCity] = useState(searchParams.get('cityId') || '')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState([])
  const [bookingHotel, setBookingHotel] = useState(null)
  const [bookingData, setBookingData] = useState({ checkIn: '', checkOut: '', guests: 1 })
  const [showPayment, setShowPayment] = useState(null)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    api.get('/cities').then(res => setAllCities(res.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true)
      try {
        if (selectedCity) {
          const res = await api.get('/hotels', { params: { cityId: selectedCity } })
          setHotels(res.data.data || [])
        } else {
          const res = await api.get('/cities')
          const cities = res.data.data || []
          let allHotels = []
          for (const city of cities) {
            try {
              const hRes = await api.get('/hotels', { params: { cityId: city.id } })
              allHotels = [...allHotels, ...(hRes.data.data || []).map(h => ({ ...h, cityName: city.name }))]
            } catch {}
          }
          setHotels(allHotels)
        }
      } catch (err) { console.error('Failed to fetch hotels:', err) }
      finally { setLoading(false) }
    }
    fetchHotels()
  }, [selectedCity])

  const filtered = hotels.filter(h => {
    const matchSearch = !search || (h.name?.toLowerCase().includes(search.toLowerCase()) || h.cityName?.toLowerCase().includes(search.toLowerCase()) || h.nearPlace?.toLowerCase().includes(search.toLowerCase()))
    const matchPrice = (h.pricePerNight || 0) <= priceRange
    return matchSearch && matchPrice
  })

  const toggleSave = (id) => setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  const getCityName = (hotel) => hotel.cityName || allCities.find(c => c.id === parseInt(selectedCity))?.name || ''

  const handleBookClick = (hotel) => {
    if (!isAuthenticated) { toast.info('Login Required', 'Please login to book hotels.'); navigate('/login'); return }
    if (!bookingData.checkIn || !bookingData.checkOut) { toast.error('Missing Dates', 'Please select check-in and check-out dates.'); return }
    const checkIn = new Date(bookingData.checkIn)
    const checkOut = new Date(bookingData.checkOut)
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    if (nights <= 0) { toast.error('Invalid Dates', 'Check-out date must be after check-in.'); return }
    const totalAmount = hotel.pricePerNight * nights * parseInt(bookingData.guests)
    setShowPayment({ hotel, nights, totalAmount, cityName: getCityName(hotel) })
  }

  const handlePaymentSuccess = async ({ txnId, method }) => {
    const { hotel, nights, totalAmount, cityName } = showPayment
    setShowPayment(null)
    setBookingHotel(null)
    try {
      await api.post('/bookings', {
        type: 'HOTEL', referenceId: hotel.id,
        details: `${hotel.name} — ${cityName} · ${nights} night(s) · ${bookingData.guests} guest(s)`,
        passengers: parseInt(bookingData.guests), totalAmount,
        travelDate: bookingData.checkIn, paymentMethod: method, paymentId: txnId,
      })
      toast.success('Hotel Booked! 🏨', `${hotel.name} — ${nights} night(s) · ₹${totalAmount.toLocaleString()} paid via ${method}. Added to expenses.`)
    } catch (err) {
      console.error('Booking failed:', err)
      toast.error('Booking Failed', err.response?.data?.message || 'Could not complete booking. Please try again.')
    }
  }

  return (
    <div className="hotels-page">
      <section className="hotels__hero">
        <div className="hotels__hero-bg"><div className="hero__gradient-orb hero__gradient-orb--1" /><div className="hero__gradient-orb hero__gradient-orb--2" /></div>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label">🏨 Find Your Stay</span>
            <h1>Premium <span className="gradient-text">Hotels</span></h1>
            <p className="hotels__subtitle">Discover handpicked accommodations near famous attractions.</p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="hotels__toolbar">
            <div className="hotels__search glass"><FiSearch /><input type="text" placeholder="Search hotels, locations..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} style={{ padding: '0.6rem 1rem', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', fontSize: 'var(--text-sm)' }}>
                <option value="">All Cities</option>
                {allCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="hotels__price-filter">
                <label>Max ₹{priceRange.toLocaleString()}/night</label>
                <input type="range" min="1000" max="40000" step="500" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}><div className="auth-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="explorer__empty"><h3>No hotels found</h3><p>Try adjusting your filters.</p></div>
          ) : (
            <div className="hotels__grid">
              {filtered.map((hotel, i) => (
                <motion.div key={hotel.id} className="hotel-card glass" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className="hotel-card__img">
                    <img src={hotel.imageUrl} alt={hotel.name} loading="lazy" />
                    <span className="hotel-card__type">{hotel.type}</span>
                    <button className={`hotel-card__save ${saved.includes(hotel.id) ? 'hotel-card__save--active' : ''}`} onClick={(e) => { e.preventDefault(); toggleSave(hotel.id) }}><FiHeart /></button>
                  </div>
                  <div className="hotel-card__body">
                    <div className="hotel-card__top"><h4>{hotel.name}</h4><span className="hotel-card__rating"><FiStar /> {hotel.rating}</span></div>
                    <p className="hotel-card__location"><FiMapPin /> {getCityName(hotel)} — {hotel.nearPlace}</p>
                    <div className="hotel-card__amenities">
                      {(hotel.amenities || '').split(',').filter(Boolean).map((a, j) => (
                        <span key={j} className="hotel-card__amenity">{amenityIcons[a.trim()] || '✓'} {a.trim()}</span>
                      ))}
                    </div>
                    <div className="hotel-card__bottom">
                      <div className="hotel-card__price">
                        <span className="hotel-card__price-value">₹{(hotel.pricePerNight || 0).toLocaleString()}</span>
                        <span className="hotel-card__price-unit">/night</span>
                      </div>
                      <button className="btn-primary" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }}
                        onClick={() => { setBookingHotel(bookingHotel === hotel.id ? null : hotel.id) }}>
                        {bookingHotel === hotel.id ? 'Close' : 'Book Now'} <FiArrowRight />
                      </button>
                    </div>

                    {bookingHotel === hotel.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar /> Check-in</label>
                            <input type="date" value={bookingData.checkIn} onChange={e => setBookingData({...bookingData, checkIn: e.target.value})}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 120 }}>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar /> Check-out</label>
                            <input type="date" value={bookingData.checkOut} onChange={e => setBookingData({...bookingData, checkOut: e.target.value})}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                          </div>
                          <div style={{ minWidth: 80 }}>
                            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}><FiUsers /> Guests</label>
                            <select value={bookingData.guests} onChange={e => setBookingData({...bookingData, guests: e.target.value})}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </div>
                        </div>
                        {bookingData.checkIn && bookingData.checkOut && (() => {
                          const nights = Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000*60*60*24))
                          return nights > 0 ? (
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                              {nights} night(s) × {bookingData.guests} guest(s) = <strong style={{ color: 'var(--primary-400)' }}>₹{(hotel.pricePerNight * nights * bookingData.guests).toLocaleString()}</strong>
                            </p>
                          ) : null
                        })()}
                        <button className="btn-primary" onClick={() => handleBookClick(hotel)} style={{ alignSelf: 'flex-start' }}>
                          Pay & Book <FiArrowRight />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {showPayment && (
        <PaymentModal amount={showPayment.totalAmount} title={`${showPayment.hotel.name} Booking`}
          onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(null)} />
      )}
    </div>
  )
}
