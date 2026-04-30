import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import SmoothScroll from './components/common/SmoothScroll'
import PageTransition from './components/common/PageTransition'
import Landing from './pages/Landing/Landing'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import CityExplorer from './pages/CityExplorer/CityExplorer'
import CityDetail from './pages/CityExplorer/CityDetail'
import TransportBooking from './pages/TransportBooking/TransportBooking'
import HotelBooking from './pages/HotelBooking/HotelBooking'
import FoodGuide from './pages/FoodGuide/FoodGuide'
import ExpenseTracker from './pages/ExpenseTracker/ExpenseTracker'
import Dashboard from './pages/Dashboard/Dashboard'

function App() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const hideNav = ['/login', '/signup'].includes(location.pathname)

  return (
    <SmoothScroll>
      {!hideNav && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
          <Route path="/explore" element={<PageTransition><CityExplorer /></PageTransition>} />
          <Route path="/city/:cityId" element={<PageTransition><CityDetail /></PageTransition>} />
          <Route path="/transport" element={<PageTransition><TransportBooking /></PageTransition>} />
          <Route path="/hotels" element={<PageTransition><HotelBooking /></PageTransition>} />
          <Route path="/food" element={<PageTransition><FoodGuide /></PageTransition>} />
          <Route path="/expenses" element={<PageTransition><ExpenseTracker /></PageTransition>} />
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      {!hideNav && <Footer />}
    </SmoothScroll>
  )
}

export default App
