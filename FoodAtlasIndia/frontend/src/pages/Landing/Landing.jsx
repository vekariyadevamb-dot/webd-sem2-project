import { useEffect, useRef, useState, Suspense, lazy } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FiSearch, FiMapPin, FiArrowRight, FiTruck, FiHome, FiCoffee, FiPieChart, FiStar, FiUsers, FiMap, FiChevronRight } from 'react-icons/fi'
import { useInView as useIntersectionView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import './Landing.css'

gsap.registerPlugin(ScrollTrigger)

const Globe3D = lazy(() => import('../../components/three/Globe3D'))

/* ---- City Data ---- */
const trendingCities = [
  { id: 1, name: 'Jaipur', tagline: 'The Pink City', image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80', color: '#e91e63' },
  { id: 2, name: 'Goa', tagline: 'Sun, Sand & Serenity', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80', color: '#00bcd4' },
  { id: 3, name: 'Varanasi', tagline: 'City of Light', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&q=80', color: '#ff9800' },
  { id: 4, name: 'Manali', tagline: 'Valley of Gods', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', color: '#4caf50' },
  { id: 5, name: 'Udaipur', tagline: 'City of Lakes', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80', color: '#9c27b0' },
  { id: 6, name: 'Kerala', tagline: 'God\'s Own Country', image: 'https://images.unsplash.com/photo-1602158123539-5c7c53b69383?w=600&q=80', color: '#2e7d32' },
]

const features = [
  { icon: <FiTruck />, title: 'Smart Transport', desc: 'Book buses, trains & flights with one tap. Compare prices, check availability, and get the best deals instantly.', gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)' },
  { icon: <FiHome />, title: 'Hotel Booking', desc: 'Discover premium stays near famous attractions. From budget-friendly to luxury — find your perfect accommodation.', gradient: 'linear-gradient(135deg, #7e22ce, #a855f7)' },
  { icon: <FiCoffee />, title: 'Food Discovery', desc: 'Explore iconic local cuisine. From street food gems to fine dining — order directly from our platform.', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
  { icon: <FiPieChart />, title: 'Expense Tracker', desc: 'Track every rupee of your journey. Smart categorization, visual breakdowns, and complete trip summaries.', gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)' },
]

const stats = [
  { value: 50, suffix: '+', label: 'Cities', icon: <FiMap /> },
  { value: 10000, suffix: '+', label: 'Happy Travelers', icon: <FiUsers /> },
  { value: 500, suffix: '+', label: 'Hotels Listed', icon: <FiHome /> },
  { value: 4.9, decimals: 1, suffix: '', label: 'User Rating', icon: <FiStar /> },
]

const testimonials = [
  { name: 'Priya Sharma', role: 'Travel Blogger', text: 'FoodAtlas India transformed how I plan my trips. The expense tracker alone saved me so much hassle!', avatar: '👩‍💻' },
  { name: 'Rahul Verma', role: 'Solo Traveler', text: 'Booking transport and hotels in one place is a game-changer. The food recommendations were spot on!', avatar: '🧑‍💼' },
  { name: 'Anita Desai', role: 'Family Traveler', text: 'We planned our entire Rajasthan trip on FoodAtlas India. The kids loved the city exploration feature!', avatar: '👩‍👧' },
]

/* ---- Animated Section ---- */
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ---- Landing Page ---- */
export default function Landing() {
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  // GSAP scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax
      gsap.to('.hero__content', {
        yPercent: -30,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      // Floating elements
      gsap.to('.hero__float-1', {
        y: -30, rotation: 10, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut',
      })
      gsap.to('.hero__float-2', {
        y: 20, rotation: -8, duration: 3.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5,
      })
      gsap.to('.hero__float-3', {
        y: -15, rotation: 5, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1,
      })

      // Feature cards stagger
      gsap.fromTo('.feature-card', {
        opacity: 0, y: 80, scale: 0.9,
      }, {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features__grid',
          start: 'top 80%',
        },
      })

      // Trending cities horizontal scroll effect
      gsap.fromTo('.city-card', {
        opacity: 0, x: 60,
      }, {
        opacity: 1, x: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.trending__scroll',
          start: 'top 85%',
        },
      })

      // Stats count up
      gsap.fromTo('.stat-item', {
        opacity: 0, y: 40, scale: 0.9,
      }, {
        opacity: 1, y: 0, scale: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.2)',
        scrollTrigger: {
          trigger: '.stats',
          start: 'top 85%',
        },
      })

    }, heroRef)

    return () => ctx.revert()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const [statsRef, statsInView] = useIntersectionView({ triggerOnce: true, threshold: 0.3 })

  return (
    <div ref={heroRef} className="landing">

      {/* ========== HERO ========== */}
      <section className="hero">
        <div className="hero__bg-effects">
          <div className="hero__gradient-orb hero__gradient-orb--1" />
          <div className="hero__gradient-orb hero__gradient-orb--2" />
          <div className="hero__gradient-orb hero__gradient-orb--3" />
          <div className="hero__grid-pattern" />
        </div>

        <div className="hero__globe">
          <Suspense fallback={<div className="hero__globe-fallback" />}>
            <Globe3D />
          </Suspense>
        </div>

        {/* Floating decorative elements */}
        <div className="hero__floats hide-mobile">
          <div className="hero__float hero__float-1">✈️</div>
          <div className="hero__float hero__float-2">🏔️</div>
          <div className="hero__float hero__float-3">🌴</div>
        </div>

        <div className="hero__content container">
          <motion.div
            className="hero__badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="hero__badge-dot" />
            India's Smartest Travel Companion
          </motion.div>

          <motion.h1
            className="hero__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Explore India Like
            <br />
            <span className="gradient-text">Never Before</span>
          </motion.h1>

          <motion.p
            className="hero__subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            Discover breathtaking destinations, book transport & hotels, savor local cuisine, 
            and track your journey — all in one intelligent platform.
          </motion.p>

          <motion.form
            className="hero__search"
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="hero__search-inner">
              <FiSearch className="hero__search-icon" />
              <input
                type="text"
                placeholder="Where do you want to go? Try 'Jaipur' or 'Goa'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero__search-input"
              />
              <button type="submit" className="hero__search-btn">
                Explore
                <FiArrowRight />
              </button>
            </div>

            <div className="hero__search-tags">
              <span>Popular:</span>
              {['Jaipur', 'Goa', 'Manali', 'Kerala'].map((city) => (
                <button
                  key={city}
                  type="button"
                  className="hero__tag"
                  onClick={() => { setSearchQuery(city); navigate(`/explore?search=${city}`) }}
                >
                  <FiMapPin /> {city}
                </button>
              ))}
            </div>
          </motion.form>

          <motion.div
            className="hero__metrics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="hero__metric">
              <span className="hero__metric-value">50+</span>
              <span className="hero__metric-label">Cities</span>
            </div>
            <div className="hero__metric-divider" />
            <div className="hero__metric">
              <span className="hero__metric-value">10K+</span>
              <span className="hero__metric-label">Travelers</span>
            </div>
            <div className="hero__metric-divider" />
            <div className="hero__metric">
              <span className="hero__metric-value">4.9★</span>
              <span className="hero__metric-label">Rating</span>
            </div>
          </motion.div>
        </div>

        <div className="hero__scroll-indicator">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span>Scroll to explore</span>
            <div className="hero__scroll-line" />
          </motion.div>
        </div>
      </section>

      {/* ========== TRENDING DESTINATIONS ========== */}
      <section className="section trending">
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">🔥 Trending Now</span>
              <h2>Popular <span className="gradient-text">Destinations</span></h2>
              <p className="section-desc">Discover India's most loved travel destinations, handpicked for unforgettable experiences.</p>
            </div>
          </AnimatedSection>

          <div className="trending__scroll">
            {trendingCities.map((city, i) => (
              <Link to={`/city/${city.id}`} key={city.id} className="city-card" style={{ '--accent': city.color }}>
                <div className="city-card__img-wrap">
                  <img src={city.image} alt={city.name} loading="lazy" />
                  <div className="city-card__overlay" />
                </div>
                <div className="city-card__content">
                  <span className="city-card__tagline">{city.tagline}</span>
                  <h3 className="city-card__name">{city.name}</h3>
                  <span className="city-card__cta">
                    Explore <FiChevronRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <AnimatedSection className="trending__action" delay={0.3}>
            <Link to="/explore" className="btn-primary">
              View All Destinations <FiArrowRight />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="section features" ref={featuresRef}>
        <div className="features__bg-glow" />
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">⚡ Everything You Need</span>
              <h2>One Platform, <span className="gradient-text">Infinite Possibilities</span></h2>
              <p className="section-desc">From planning to exploring — FoodAtlas India handles every detail of your journey.</p>
            </div>
          </AnimatedSection>

          <div className="features__grid">
            {features.map((feat, i) => (
              <div className="feature-card glass" key={i}>
                <div className="feature-card__icon" style={{ background: feat.gradient }}>
                  {feat.icon}
                </div>
                <h4 className="feature-card__title">{feat.title}</h4>
                <p className="feature-card__desc">{feat.desc}</p>
                <div className="feature-card__glow" style={{ background: feat.gradient }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="section stats" ref={statsRef}>
        <div className="container">
          <div className="stats__grid">
            {stats.map((stat, i) => (
              <div className="stat-item glass" key={i}>
                <div className="stat-item__icon">{stat.icon}</div>
                <div className="stat-item__value">
                  {statsInView ? (
                    <CountUp
                      end={stat.value}
                      decimals={stat.decimals || 0}
                      duration={2.5}
                      suffix={stat.suffix}
                    />
                  ) : '0'}
                </div>
                <div className="stat-item__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="section testimonials">
        <div className="container">
          <AnimatedSection>
            <div className="section-header">
              <span className="section-label">💬 What Travelers Say</span>
              <h2>Loved by <span className="gradient-text">Thousands</span></h2>
            </div>
          </AnimatedSection>

          <div className="testimonials__grid">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} delay={i * 0.15}>
                <div className="testimonial-card glass">
                  <div className="testimonial-card__stars">
                    {[...Array(5)].map((_, j) => <FiStar key={j} />)}
                  </div>
                  <p className="testimonial-card__text">"{t.text}"</p>
                  <div className="testimonial-card__author">
                    <span className="testimonial-card__avatar">{t.avatar}</span>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="section cta">
        <div className="cta__bg">
          <div className="cta__gradient-1" />
          <div className="cta__gradient-2" />
        </div>
        <div className="container">
          <AnimatedSection className="cta__content">
            <h2>Ready to Start Your <span className="gradient-text">Journey?</span></h2>
            <p>Join thousands of travelers who plan smarter with FoodAtlas India. Your next adventure is just a click away.</p>
            <div className="cta__buttons">
              <Link to="/signup" className="btn-primary btn-lg">
                Get Started Free <FiArrowRight />
              </Link>
              <Link to="/explore" className="btn-ghost btn-lg">
                Explore Destinations
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
