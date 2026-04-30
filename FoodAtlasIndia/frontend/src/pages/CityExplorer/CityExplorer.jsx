import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FiSearch, FiFilter, FiMapPin, FiChevronRight, FiStar, FiSun } from 'react-icons/fi'
import api from '../../services/api'
import './CityExplorer.css'

gsap.registerPlugin(ScrollTrigger)

const categories = ['all', 'Heritage', 'Beach', 'Mountain', 'Nature', 'Metro']

function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >{children}</motion.div>
  )
}

export default function CityExplorer() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [activeCategory, setActiveCategory] = useState('all')
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const gridRef = useRef(null)

  // Fetch cities from backend
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (activeCategory !== 'all') params.category = activeCategory
        const res = await api.get('/cities', { params })
        setCities(res.data.data || [])
      } catch (err) {
        console.error('Failed to fetch cities:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCities()
  }, [activeCategory])

  // Client-side search filter on top of fetched data
  const filtered = cities.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.state.toLowerCase().includes(search.toLowerCase())
    return matchesSearch
  })

  useEffect(() => {
    if (filtered.length === 0) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.explorer-city-card', { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.6, ease: 'power3.out',
        scrollTrigger: { trigger: '.explorer__grid', start: 'top 85%' },
      })
    }, gridRef)
    return () => ctx.revert()
  }, [filtered.length])

  return (
    <div className="explorer" ref={gridRef}>
      {/* Hero */}
      <section className="explorer__hero">
        <div className="explorer__hero-bg">
          <div className="hero__gradient-orb hero__gradient-orb--1" />
          <div className="hero__gradient-orb hero__gradient-orb--2" />
        </div>
        <div className="container">
          <AnimatedSection>
            <span className="section-label">🧭 Discover India</span>
            <h1 className="explorer__title">
              Explore <span className="gradient-text">Destinations</span>
            </h1>
            <p className="explorer__subtitle">Choose your dream city and start planning your perfect getaway.</p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="explorer__search glass">
              <FiSearch />
              <input
                type="text"
                placeholder="Search cities, states..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FiFilter className="explorer__filter-icon" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="explorer__categories">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`explorer__cat-btn ${activeCategory === cat ? 'explorer__cat-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* Grid */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="explorer__empty">
              <div className="auth-spinner" style={{ width: 40, height: 40 }} />
              <p>Loading destinations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="explorer__empty">
              <h3>No cities found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="explorer__grid">
              {filtered.map((city) => (
                <Link to={`/city/${city.id}`} key={city.id} className="explorer-city-card">
                  <div className="explorer-city-card__img">
                    <img src={city.imageUrl} alt={city.name} loading="lazy" />
                    <div className="explorer-city-card__overlay" />
                    <span className="explorer-city-card__badge">{city.category}</span>
                  </div>
                  <div className="explorer-city-card__body">
                    <div className="explorer-city-card__top">
                      <h3>{city.name}</h3>
                      <span className="explorer-city-card__rating"><FiStar /> {city.rating}</span>
                    </div>
                    <p className="explorer-city-card__state"><FiMapPin /> {city.state}</p>
                    <p className="explorer-city-card__tagline">{city.tagline}</p>
                    <div className="explorer-city-card__meta">
                      <span><FiSun /> {city.bestTime}</span>
                      <span className="explorer-city-card__explore">Explore <FiChevronRight /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
