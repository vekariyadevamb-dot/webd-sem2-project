import { Link } from 'react-router-dom'
import { FiMapPin, FiMail, FiPhone, FiGithub, FiTwitter, FiInstagram, FiYoutube, FiHeart } from 'react-icons/fi'
import './Footer.css'

const footerLinks = {
  explore: [
    { label: 'Destinations', path: '/explore' },
    { label: 'Famous Places', path: '/explore' },
    { label: 'City Guides', path: '/explore' },
    { label: 'Travel Tips', path: '/explore' },
  ],
  services: [
    { label: 'Bus Booking', path: '/transport' },
    { label: 'Train Booking', path: '/transport' },
    { label: 'Flight Booking', path: '/transport' },
    { label: 'Hotel Booking', path: '/hotels' },
  ],
  more: [
    { label: 'Food Guide', path: '/food' },
    { label: 'Expense Tracker', path: '/expenses' },
    { label: 'My Dashboard', path: '/dashboard' },
    { label: 'Support', path: '/' },
  ],
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <span className="footer__logo-icon"><FiMapPin /></span>
              <span>FoodAtlas<span className="navbar__logo-accent"> India</span></span>
            </Link>
            <p className="footer__desc">
              Your intelligent travel companion. Discover cities, book transport, find hotels, 
              explore cuisine, and track every moment of your journey.
            </p>
            <div className="footer__socials">
              <a href="#" aria-label="Twitter"><FiTwitter /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
              <a href="#" aria-label="YouTube"><FiYoutube /></a>
              <a href="#" aria-label="GitHub"><FiGithub /></a>
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            {footerLinks.explore.map((link, i) => (
              <Link key={i} to={link.path} className="footer__link">{link.label}</Link>
            ))}
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Services</h4>
            {footerLinks.services.map((link, i) => (
              <Link key={i} to={link.path} className="footer__link">{link.label}</Link>
            ))}
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">More</h4>
            {footerLinks.more.map((link, i) => (
              <Link key={i} to={link.path} className="footer__link">{link.label}</Link>
            ))}
          </div>
        </div>

        <div className="footer__newsletter">
          <div className="footer__newsletter-text">
            <h5>Stay Updated</h5>
            <p>Get travel inspiration and deals delivered to your inbox.</p>
          </div>
          <form className="footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <div className="footer__input-wrap">
              <FiMail />
              <input type="email" placeholder="Enter your email" />
            </div>
            <button type="submit" className="footer__subscribe-btn">Subscribe</button>
          </form>
        </div>

        <div className="footer__bottom">
          <p>© 2026 FoodAtlas India. All rights reserved.</p>
          <p className="footer__made-with">
            Made with <FiHeart className="footer__heart" /> in India
          </p>
        </div>
      </div>
    </footer>
  )
}
