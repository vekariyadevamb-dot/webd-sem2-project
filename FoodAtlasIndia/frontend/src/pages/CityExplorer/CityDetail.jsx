import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiStar, FiSun, FiClock, FiTruck, FiHome, FiCoffee, FiArrowRight, FiChevronRight } from 'react-icons/fi'
import api from '../../services/api'
import './CityExplorer.css'

export default function CityDetail() {
  const { cityId } = useParams()
  const [city, setCity] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCity = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/cities/${cityId}`)
        setCity(res.data.data)
      } catch (err) {
        console.error('Failed to fetch city:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCity()
  }, [cityId])

  if (loading) {
    return (
      <div className="city-detail" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-spinner" style={{ width: 48, height: 48 }} />
      </div>
    )
  }

  if (!city) {
    return (
      <div className="city-detail" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h2>City not found</h2>
        <Link to="/explore" className="btn-primary">Back to Explore</Link>
      </div>
    )
  }

  const places = city.places || []
  const foods = city.foods || []

  return (
    <div className="city-detail">
      {/* Hero */}
      <section className="city-detail__hero" style={{ backgroundImage: `url(${city.imageUrl})` }}>
        <div className="city-detail__hero-overlay" />
        <div className="container city-detail__hero-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="city-detail__badge">{city.state}</span>
            <h1>{city.name}</h1>
            <p className="city-detail__tagline">{city.tagline}</p>
            <div className="city-detail__meta">
              <span><FiStar /> {city.rating}</span>
              <span><FiSun /> {city.bestTime}</span>
              <span><FiMapPin /> {city.language}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About */}
      <section className="section">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p style={{ fontSize: 'var(--text-lg)', maxWidth: '800px', lineHeight: 1.8 }}>{city.description}</p>
          </motion.div>

          {/* Quick Actions */}
          <div className="city-detail__actions">
            <Link to={`/transport?to=${city.name}`} className="city-detail__action-card glass">
              <FiTruck /> <span>Book Transport to {city.name}</span> <FiArrowRight />
            </Link>
            <Link to={`/hotels?cityId=${city.id}&city=${city.name}`} className="city-detail__action-card glass">
              <FiHome /> <span>Find Hotels in {city.name}</span> <FiArrowRight />
            </Link>
            <Link to={`/food?cityId=${city.id}&city=${city.name}`} className="city-detail__action-card glass">
              <FiCoffee /> <span>Explore {city.name} Food</span> <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Famous Places */}
      {places.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header" style={{ textAlign: 'left' }}>
              <span className="section-label">📍 Famous Places</span>
              <h2>Top Attractions in <span className="gradient-text">{city.name}</span></h2>
            </div>
            <div className="city-detail__places-grid">
              {places.map((place, i) => (
                <motion.div
                  key={place.id || i}
                  className="place-card glass"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="place-card__img">
                    <img src={place.imageUrl} alt={place.name} loading="lazy" />
                    <span className="place-card__category">{place.category}</span>
                  </div>
                  <div className="place-card__body">
                    <div className="place-card__top">
                      <h4>{place.name}</h4>
                      <span className="place-card__rating"><FiStar /> {place.rating}</span>
                    </div>
                    <p>{place.description}</p>
                    <div className="place-card__info">
                      {place.timings && <span><FiClock /> {place.timings}</span>}
                      {place.entryFee && <span>🎫 {place.entryFee}</span>}
                    </div>
                    <Link to={`/hotels?cityId=${city.id}&city=${city.name}`} className="place-card__cta">
                      Hotels Nearby <FiChevronRight />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Famous Foods */}
      {foods.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header" style={{ textAlign: 'left' }}>
              <span className="section-label">🍽️ Must Try Foods</span>
              <h2>Famous Cuisine of <span className="gradient-text">{city.name}</span></h2>
            </div>
            <div className="city-detail__places-grid">
              {foods.map((food, i) => (
                <motion.div key={food.id || i} className="place-card glass"
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                >
                  <div className="place-card__img">
                    <img src={food.imageUrl} alt={food.name} loading="lazy" />
                    {food.mustTry && <span className="place-card__category" style={{ background: '#e11d48' }}>🔥 Must Try</span>}
                  </div>
                  <div className="place-card__body">
                    <div className="place-card__top">
                      <h4>{food.name}</h4>
                      <span className="place-card__rating">{food.priceRange}</span>
                    </div>
                    <p>{food.description}</p>
                    {food.restaurant && <p style={{ color: 'var(--primary-400)', fontSize: 'var(--text-sm)', marginTop: '0.5rem' }}>📍 Best at: <strong>{food.restaurant}</strong></p>}
                  </div>
                </motion.div>
              ))}
            </div>
            <Link to={`/food?cityId=${city.id}&city=${city.name}`} className="btn-primary" style={{ marginTop: 'var(--space-8)', display: 'inline-flex' }}>
              Full Food Guide <FiArrowRight />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
