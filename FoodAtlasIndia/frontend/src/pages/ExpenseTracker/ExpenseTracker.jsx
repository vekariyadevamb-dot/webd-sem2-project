import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiTrash2, FiTruck, FiHome, FiCoffee, FiShoppingBag, FiDollarSign, FiPieChart, FiCalendar, FiRefreshCw } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import './ExpenseTracker.css'

const categoryIcons = { Transport: <FiTruck />, Hotel: <FiHome />, Food: <FiCoffee />, Shopping: <FiShoppingBag />, Tickets: '🎫', Misc: <FiDollarSign /> }
const categoryColors = { Transport: '#0d9488', Hotel: '#7e22ce', Food: '#f59e0b', Shopping: '#e11d48', Tickets: '#3b82f6', Misc: '#64748b' }

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [newExpense, setNewExpense] = useState({ category: 'Food', description: '', amount: '', date: new Date().toISOString().split('T')[0], journeyName: 'My Trip' })
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    fetchExpenses()
  }, [isAuthenticated])

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses')
      setExpenses(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch expenses:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchExpenses()
  }

  const totalExpense = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + (e.amount || 0)
    return acc
  }, {})

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) return
    try {
      const res = await api.post('/expenses', {
        category: newExpense.category,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: newExpense.date,
        journeyName: newExpense.journeyName,
      })
      setExpenses([res.data.data, ...expenses])
      setNewExpense({ category: 'Food', description: '', amount: '', date: new Date().toISOString().split('T')[0], journeyName: 'My Trip' })
      setShowForm(false)
    } catch (err) {
      console.error('Failed to add expense:', err)
    }
  }

  const deleteExpense = async (id) => {
    try {
      await api.delete(`/expenses/${id}`)
      setExpenses(expenses.filter(e => e.id !== id))
    } catch (err) {
      console.error('Failed to delete expense:', err)
    }
  }

  const maxCategoryTotal = Math.max(...Object.values(categoryTotals), 1)

  // Group expenses by journey
  const journeyGroups = expenses.reduce((acc, e) => {
    const key = e.journeyName || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="expense-page">
      <section className="expense__hero">
        <div className="expense__hero-bg"><div className="hero__gradient-orb hero__gradient-orb--1" /><div className="hero__gradient-orb hero__gradient-orb--2" /></div>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="section-label">💰 Track Spending</span>
            <h1>Expense <span className="gradient-text">Tracker</span></h1>
            <p className="expense__subtitle">Keep track of every rupee spent on your journey. Bookings are auto-synced.</p>
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}><div className="auth-spinner" style={{ width: 40, height: 40, margin: '0 auto' }} /></div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="expense__summary">
                <motion.div className="expense__total-card glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <FiPieChart className="expense__total-icon" />
                  <div>
                    <span className="expense__total-label">Total Expenses</span>
                    <span className="expense__total-value">₹{totalExpense.toLocaleString()}</span>
                  </div>
                </motion.div>
                <motion.div className="expense__total-card glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                  <FiCalendar className="expense__total-icon" style={{ color: 'var(--accent-400)' }} />
                  <div>
                    <span className="expense__total-label">Entries</span>
                    <span className="expense__total-value" style={{ fontSize: 'var(--text-xl)' }}>{expenses.length} expenses</span>
                  </div>
                </motion.div>
              </div>

              {/* Category Breakdown */}
              {Object.keys(categoryTotals).length > 0 && (
                <div className="expense__breakdown glass">
                  <h3>Spending Breakdown</h3>
                  <div className="expense__bars">
                    {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => (
                      <div key={cat} className="expense__bar-row">
                        <div className="expense__bar-label">
                          <span className="expense__bar-icon" style={{ color: categoryColors[cat] || '#64748b' }}>{categoryIcons[cat] || <FiDollarSign />}</span>
                          <span>{cat}</span>
                        </div>
                        <div className="expense__bar-track">
                          <motion.div className="expense__bar-fill" style={{ background: categoryColors[cat] || '#64748b' }}
                            initial={{ width: 0 }} animate={{ width: `${(total / maxCategoryTotal) * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
                        </div>
                        <span className="expense__bar-amount">₹{total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expense List */}
              <div className="expense__list-header">
                <h3>All Expenses ({expenses.length})</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleRefresh} style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', borderRadius: 10, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiRefreshCw className={refreshing ? 'spin' : ''} /> Sync
                  </button>
                  <button className="btn-primary" style={{ padding: 'var(--space-2) var(--space-5)', fontSize: 'var(--text-sm)' }} onClick={() => setShowForm(!showForm)}>
                    <FiPlus /> Add Expense
                  </button>
                </div>
              </div>

              {showForm && (
                <motion.div className="expense__form glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}>
                    {Object.keys(categoryIcons).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="text" placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} />
                  <input type="number" placeholder="Amount (₹)" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} />
                  <input type="text" placeholder="Journey Name" value={newExpense.journeyName} onChange={(e) => setNewExpense({ ...newExpense, journeyName: e.target.value })} />
                  <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} />
                  <button className="btn-primary" style={{ padding: 'var(--space-3) var(--space-5)' }} onClick={addExpense}>Add</button>
                </motion.div>
              )}

              <div className="expense__list">
                {expenses.length === 0 ? (
                  <div className="explorer__empty" style={{ padding: '2rem 0' }}>
                    <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>📊</p>
                    <h3>No expenses yet</h3>
                    <p>Book a transport, hotel, or food order — expenses are added automatically!<br />Or click "Add Expense" to manually track spending.</p>
                  </div>
                ) : expenses.map((exp, i) => (
                  <motion.div key={exp.id} className="expense__item glass"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                    <span className="expense__item-icon" style={{ background: `${categoryColors[exp.category] || '#64748b'}20`, color: categoryColors[exp.category] || '#64748b' }}>
                      {categoryIcons[exp.category] || <FiDollarSign />}
                    </span>
                    <div className="expense__item-info">
                      <strong>{exp.description}</strong>
                      <span>{exp.category} · {exp.date} {exp.journeyName && `· ${exp.journeyName}`}</span>
                    </div>
                    <span className="expense__item-amount">₹{(exp.amount || 0).toLocaleString()}</span>
                    <button className="expense__item-delete" onClick={() => deleteExpense(exp.id)}><FiTrash2 /></button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
