import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi'
import './Toast.css'

const ToastContext = createContext(null)

let globalAddToast = null

export function useToast() {
  const ctx = useContext(ToastContext)
  if (ctx) return ctx
  // fallback for components outside provider
  return { success: (t, m) => globalAddToast?.('success', t, m), error: (t, m) => globalAddToast?.('error', t, m), info: (t, m) => globalAddToast?.('info', t, m) }
}

// Global function accessible without hooks
export const toast = {
  success: (title, msg) => globalAddToast?.('success', title, msg),
  error: (title, msg) => globalAddToast?.('error', title, msg),
  info: (title, msg) => globalAddToast?.('info', title, msg),
}

const icons = { success: <FiCheck />, error: <FiAlertCircle />, info: <FiInfo /> }

function ToastItem({ toast: t, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(t.id), 5000)
    return () => clearTimeout(timer)
  }, [t.id, onClose])

  return (
    <motion.div
      className={`toast toast--${t.type}`}
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
    >
      <div className="toast__icon">{icons[t.type]}</div>
      <div className="toast__content">
        <p className="toast__title">{t.title}</p>
        {t.msg && <p className="toast__msg">{t.msg}</p>}
      </div>
      <button className="toast__close" onClick={() => onClose(t.id)}><FiX /></button>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, title, msg) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-4), { id, type, title, msg }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    globalAddToast = addToast
    return () => { globalAddToast = null }
  }, [addToast])

  const ctx = {
    success: (title, msg) => addToast('success', title, msg),
    error: (title, msg) => addToast('error', title, msg),
    info: (title, msg) => addToast('info', title, msg),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => <ToastItem key={t.id} toast={t} onClose={removeToast} />)}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
