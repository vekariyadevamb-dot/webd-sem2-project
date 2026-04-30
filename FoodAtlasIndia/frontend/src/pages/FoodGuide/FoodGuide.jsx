import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiMapPin, FiShoppingCart, FiPlus, FiMinus, FiX, FiArrowRight, FiCheck, FiStar } from 'react-icons/fi'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import PaymentModal from '../../components/common/PaymentModal'
import { useToast } from '../../components/common/Toast'
import './FoodGuide.css'

const categoryList = ['All', 'Street Food', 'Main Course', 'Sweet', 'Drink']

export default function FoodGuide() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeCity, setActiveCity] = useState(searchParams.get('city') || 'All')
  const [foods, setFoods] = useState([])
  const [allCities, setAllCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [orderStep, setOrderStep] = useState('cart')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [address, setAddress] = useState({ fullName: '', phone: '', street: '', city: '', pincode: '' })
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    api.get('/cities').then(res => setAllCities(res.data.data || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true)
      try {
        if (activeCity !== 'All') {
          const city = allCities.find(c => c.name === activeCity)
          if (city) {
            const res = await api.get('/foods', { params: { cityId: city.id } })
            setFoods((res.data.data || []).map(f => ({ ...f, cityName: city.name })))
          }
        } else {
          const citiesRes = await api.get('/cities')
          let allFoods = []
          for (const city of (citiesRes.data.data || [])) {
            try {
              const fRes = await api.get('/foods', { params: { cityId: city.id } })
              allFoods = [...allFoods, ...(fRes.data.data || []).map(f => ({ ...f, cityName: city.name }))]
            } catch {}
          }
          setFoods(allFoods)
        }
      } catch {} finally { setLoading(false) }
    }
    if (allCities.length > 0 || activeCity === 'All') fetchFoods()
  }, [activeCity, allCities.length])

  const filtered = foods.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || f.category === activeCategory
    return matchSearch && matchCat
  })

  const getPrice = (food) => food.price || parseInt(food.priceRange?.replace(/[^\d-]/g, '').split('-')[0]) || 200

  const addToCart = (food) => {
    const existing = cart.find(c => c.id === food.id)
    if (existing) {
      setCart(cart.map(c => c.id === food.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, { ...food, qty: 1, unitPrice: getPrice(food) }])
    }
  }

  const updateQty = (id, delta) => {
    setCart(cart.map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.unitPrice * c.qty, 0)
  const deliveryFee = cartTotal > 0 ? 40 : 0
  const grandTotal = cartTotal + deliveryFee
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0)

  const isAddressValid = address.fullName && address.phone.length >= 10 && address.street && address.city && address.pincode.length >= 5

  const handleProceedToAddress = () => {
    if (!isAuthenticated) { toast.info('Login Required', 'Please login to place orders.'); navigate('/login'); return }
    setOrderStep('address')
  }

  const handleProceedToPayment = () => {
    if (!isAddressValid) { toast.error('Incomplete Address', 'Please fill all address fields.'); return }
    setShowPayment(true)
  }

  const handlePaymentSuccess = async ({ txnId, method }) => {
    setShowPayment(false)
    try {
      await api.post('/food-orders', {
        items: JSON.stringify(cart.map(c => ({ name: c.name, qty: c.qty, price: c.unitPrice }))),
        deliveryAddress: `${address.street}, ${address.city} - ${address.pincode}`,
        deliveryCity: address.city,
        pincode: address.pincode,
        phone: address.phone,
        paymentMethod: method,
        paymentId: txnId,
        totalAmount: cartTotal,
        deliveryFee,
      })
      setOrderPlaced(true)
      toast.success('Order Placed! 🎉', `₹${grandTotal.toLocaleString()} paid via ${method}. Delivery in 30-45 mins. Added to expenses.`)
      setTimeout(() => { setCart([]); setOrderPlaced(false); setShowCart(false); setOrderStep('cart'); setAddress({ fullName: '', phone: '', street: '', city: '', pincode: '' }) }, 4000)
    } catch (err) {
      console.error('Order failed:', err)
      toast.error('Order Failed', err.response?.data?.message || 'Could not place order. Please try again.')
    }
  }

  const cityNames = ['All', ...new Set(allCities.map(c => c.name))]

  return (
    <div className="food-page">
      <section className="food__hero">
        <div className="food__hero-bg"><div className="hero__gradient-orb hero__gradient-orb--1" /><div className="hero__gradient-orb hero__gradient-orb--2" /></div>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label">🍽️ Food Guide</span>
            <h1>Famous <span className="gradient-text">Cuisine</span></h1>
            <p className="food__subtitle">Discover iconic dishes and order them right here.</p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="food__filters">
            <div className="food__search glass"><FiSearch /><input type="text" placeholder="Search foods..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <div className="food__filter-row">
              <div className="food__filter-group">
                <span>City:</span>
                {cityNames.map(c => (
                  <button key={c} className={`food__filter-btn ${activeCity === c ? 'food__filter-btn--active' : ''}`} onClick={() => setActiveCity(c)}>{c}</button>
                ))}
              </div>
              <div className="food__filter-group">
                <span>Type:</span>
                {categoryList.map(c => (
                  <button key={c} className={`food__filter-btn ${activeCategory === c ? 'food__filter-btn--active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}><div className="auth-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div className="explorer__empty"><h3>No food items found</h3></div>
          ) : (
            <div className="food__grid">
              {filtered.map((food, i) => {
                const price = getPrice(food)
                const inCart = cart.find(c => c.id === food.id)
                return (
                  <motion.div key={food.id || i} className="food-card glass" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                    <div className="food-card__img">
                      <img src={food.imageUrl} alt={food.name} loading="lazy" />
                      {food.mustTry && <span className="food-card__badge">🔥 Must Try</span>}
                      <span className="food-card__category">{food.category}</span>
                    </div>
                    <div className="food-card__body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>{food.name}</h4>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {food.isVeg !== null && <span style={{ fontSize: 12, padding: '2px 6px', borderRadius: 4, border: `1px solid ${food.isVeg ? '#22c55e' : '#ef4444'}`, color: food.isVeg ? '#22c55e' : '#ef4444', fontWeight: 700 }}>{food.isVeg ? 'VEG' : 'NON-VEG'}</span>}
                          {food.rating && <span style={{ fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 2, color: '#f59e0b' }}><FiStar size={12} /> {food.rating}</span>}
                        </div>
                      </div>
                      <p className="food-card__city"><FiMapPin /> {food.cityName || activeCity}</p>
                      <p className="food-card__desc">{food.description}</p>
                      {food.restaurant && <p className="food-card__restaurant">📍 <strong>{food.restaurant}</strong></p>}
                      <div className="food-card__bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--primary-400)' }}>₹{price}</span>
                        {inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => updateQty(food.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={14} /></button>
                            <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{inCart.qty}</span>
                            <button onClick={() => addToCart(food)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--primary-500)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={14} /></button>
                          </div>
                        ) : (
                          <button onClick={() => addToCart(food)} className="btn-primary" style={{ padding: '6px 16px', fontSize: 'var(--text-sm)' }}><FiPlus /> Add</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {cartCount > 0 && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => { setShowCart(true); setOrderStep('cart') }}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-500)', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FiShoppingCart />
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#e11d48', borderRadius: '50%', width: 22, height: 22, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{cartCount}</span>
        </motion.button>
      )}

      <AnimatePresence>
        {showCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 440, background: 'var(--bg-primary)', zIndex: 201, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-primary)' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>
                  {orderStep === 'cart' ? `🛒 Your Order (${cartCount})` : '📍 Delivery Address'}
                </h3>
                <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 20 }}><FiX /></button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                {orderPlaced ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 28, color: '#fff' }}><FiCheck /></div>
                    <h3>Order Placed! 🎉</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Your food will be delivered in 30-45 mins.</p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>Amount added to your expenses automatically.</p>
                  </motion.div>
                ) : orderStep === 'cart' ? (
                  cart.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '3rem 0' }}>Cart is empty</p>
                  ) : cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-primary)' }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: 'var(--text-sm)' }}>{item.name}</strong>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>{item.cityName} · ₹{item.unitPrice}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiMinus size={12} /></button>
                        <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center', fontSize: 'var(--text-sm)' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'var(--primary-500)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiPlus size={12} /></button>
                      </div>
                      <span style={{ fontWeight: 700, minWidth: 60, textAlign: 'right', fontSize: 'var(--text-sm)' }}>₹{(item.unitPrice * item.qty).toLocaleString()}</span>
                    </div>
                  ))
                ) : orderStep === 'address' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Full Name *</label>
                      <input type="text" placeholder="Your full name" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Phone Number *</label>
                      <input type="tel" placeholder="10-digit mobile number" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} /></div>
                    <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Street Address *</label>
                      <input type="text" placeholder="House/Flat no., Street, Landmark" value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                        style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} /></div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <div style={{ flex: 1 }}><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>City *</label>
                        <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} /></div>
                      <div style={{ flex: 1 }}><label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>Pincode *</label>
                        <input type="text" placeholder="6-digit" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value.replace(/\D/g,'').slice(0,6)})}
                          style={{ width: '100%', padding: '0.65rem', borderRadius: 10, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} /></div>
                    </div>
                  </div>
                ) : null}
              </div>

              {cart.length > 0 && !orderPlaced && (
                <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 4 }}><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 8 }}><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '1rem' }}><span>Total</span><span style={{ color: 'var(--primary-400)' }}>₹{grandTotal.toLocaleString()}</span></div>
                  {orderStep === 'cart' ? (
                    <button className="btn-primary" onClick={handleProceedToAddress} style={{ width: '100%', padding: '0.85rem', fontSize: 'var(--text-base)' }}>Proceed to Address <FiArrowRight /></button>
                  ) : orderStep === 'address' ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setOrderStep('cart')} style={{ flex: '0 0 auto', padding: '0.85rem 1rem', borderRadius: 12, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }}>Back</button>
                      <button className="btn-primary" onClick={handleProceedToPayment} disabled={!isAddressValid}
                        style={{ flex: 1, padding: '0.85rem', fontSize: 'var(--text-base)', opacity: isAddressValid ? 1 : 0.5 }}>Pay ₹{grandTotal.toLocaleString()} <FiArrowRight /></button>
                    </div>
                  ) : null}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showPayment && (
        <PaymentModal amount={grandTotal} title="Food Order Payment"
          onSuccess={handlePaymentSuccess} onClose={() => setShowPayment(false)} />
      )}
    </div>
  )
}
