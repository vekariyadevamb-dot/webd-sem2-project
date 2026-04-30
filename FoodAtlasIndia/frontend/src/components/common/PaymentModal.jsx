import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheck, FiCreditCard, FiSmartphone, FiGlobe, FiShield } from 'react-icons/fi'
import './PaymentModal.css'

const BANKS = ['SBI','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank','Bank of Baroda','Yes Bank','IndusInd Bank','Union Bank']

export default function PaymentModal({ amount, title, onSuccess, onClose }) {
  const [method, setMethod] = useState('UPI')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [bank, setBank] = useState(BANKS[0])
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(null)

  const formatCard = (v) => {
    const nums = v.replace(/\D/g, '').slice(0, 16)
    return nums.replace(/(\d{4})/g, '$1 ').trim()
  }

  const formatExpiry = (v) => {
    const nums = v.replace(/\D/g, '').slice(0, 4)
    if (nums.length > 2) return nums.slice(0, 2) + '/' + nums.slice(2)
    return nums
  }

  const isValid = () => {
    if (method === 'UPI') return upiId.includes('@')
    if (method === 'CARD') return cardNumber.replace(/\s/g,'').length === 16 && cardExpiry.length === 5 && cardCvv.length === 3 && cardName.length > 2
    if (method === 'NETBANKING') return true
    if (method === 'COD') return true
    return false
  }

  const handlePay = async () => {
    setProcessing(true)
    // Simulate payment delay
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
    const txnId = 'YM-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase()
    setSuccess({ txnId, method })
    setProcessing(false)
    setTimeout(() => { onSuccess({ txnId, method, amount }) }, 200)
  }

  const tabs = [
    { id: 'UPI', label: 'UPI', icon: <FiSmartphone /> },
    { id: 'CARD', label: 'Card', icon: <FiCreditCard /> },
    { id: 'NETBANKING', label: 'NetBanking', icon: <FiGlobe /> },
    { id: 'COD', label: 'COD', icon: '💵' },
  ]

  return (
    <AnimatePresence>
      <motion.div className="payment-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="payment-modal" initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} onClick={e => e.stopPropagation()}>
          
          {success ? (
            <motion.div className="payment-success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <div className="payment-success__icon"><FiCheck /></div>
              <h3>Payment Successful!</h3>
              <p>₹{amount?.toLocaleString()} paid via {success.method}</p>
              <div className="payment-success__txn">{success.txnId}</div>
              <button className="btn-primary payment-success__done" onClick={onClose} style={{ padding: '0.7rem 2rem' }}>Done</button>
            </motion.div>
          ) : (
            <>
              <div className="payment-modal__header">
                <h3>💳 {title || 'Payment'}</h3>
                <button className="payment-modal__close" onClick={onClose}><FiX /></button>
              </div>

              <div className="payment-modal__amount">
                <span>Amount to Pay</span>
                <strong>₹{amount?.toLocaleString()}</strong>
              </div>

              <div className="payment-tabs">
                {tabs.map(t => (
                  <button key={t.id} className={`payment-tab ${method === t.id ? 'payment-tab--active' : ''}`} onClick={() => setMethod(t.id)}>
                    <span className="payment-tab__icon">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="payment-form">
                {method === 'UPI' && (
                  <>
                    <label>UPI ID</label>
                    <input type="text" placeholder="yourname@paytm" value={upiId} onChange={e => setUpiId(e.target.value)} />
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                      <FiShield style={{ verticalAlign: 'middle' }} /> Supports Google Pay, PhonePe, Paytm & all UPI apps
                    </p>
                  </>
                )}

                {method === 'CARD' && (
                  <>
                    <label>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} />
                    <div className="payment-form__row">
                      <div>
                        <label>Expiry</label>
                        <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} />
                      </div>
                      <div>
                        <label>CVV</label>
                        <input type="password" placeholder="•••" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,'').slice(0,3))} />
                      </div>
                    </div>
                    <label>Cardholder Name</label>
                    <input type="text" placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)} />
                  </>
                )}

                {method === 'NETBANKING' && (
                  <>
                    <label>Select Bank</label>
                    <select value={bank} onChange={e => setBank(e.target.value)}>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', margin: 0 }}>
                      You will be redirected to your bank's secure page
                    </p>
                  </>
                )}

                {method === 'COD' && (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>💵</p>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Pay ₹{amount?.toLocaleString()} at the time of delivery/check-in</p>
                  </div>
                )}

                <button className="payment-btn" onClick={handlePay} disabled={!isValid() || processing}>
                  {processing ? (
                    <><div className="auth-spinner" style={{ width: 20, height: 20 }} /> Processing...</>
                  ) : (
                    <>{method === 'COD' ? 'Confirm Order' : `Pay ₹${amount?.toLocaleString()}`}</>
                  )}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
