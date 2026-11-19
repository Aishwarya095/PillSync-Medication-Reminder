import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { sound } from '../utils/sound'
import { 
  X, Check, AlertCircle, Lock, Mail, User, Shield, 
  ArrowRight, Sparkles, CheckCircle2, UserCheck, ShieldCheck
} from 'lucide-react'

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState(initialMode) // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('PATIENT')

  if (!isOpen) return null

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          role,
        })
      }
      sound.playSuccessChime()
      if (onAuthSuccess) onAuthSuccess()
      onClose()
    } catch (err) {
      console.error('Auth error:', err)
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setError(detail)
      } else if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Validation error')
      } else {
        setError('Authentication failed. Please verify your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Instant Demo Login
  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setError('')
    setLoading(true)
    try {
      await login(demoEmail, demoPassword)
      sound.playSuccessChime()
      if (onAuthSuccess) onAuthSuccess()
      onClose()
    } catch (err) {
      console.error('Demo login error:', err)
      setError('Failed to log in with demo account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1437]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden space-y-0 animate-in fade-in zoom-in-95 duration-200">
        {/* Dark Top Header matching #0B1437 sidebar */}
        <div className="bg-[#0B1437] text-white p-6 relative border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
              +
            </div>
            <span className="text-xl font-extrabold tracking-tight">PillSync</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Portal Access
            </span>
          </div>

          <h3 className="text-base font-bold text-white">
            {mode === 'login' ? 'Sign In to Your Dashboard' : 'Create New Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Role-Based Access for Patients, Caregivers, and Administrators
          </p>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-white/10 p-1 rounded-xl mt-4 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#0B1437] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setError('')
              }}
              className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#0B1437] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="flex items-center space-x-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suvashini / Dr. Ramesh"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none font-semibold text-slate-800"
                >
                  <option value="PATIENT">👤 Patient (Personal Medication & Vitals)</option>
                  <option value="CAREGIVER">🩺 Caregiver (Supervise Assigned Patients)</option>
                  <option value="ADMIN">🛡️ Admin (Platform Management & RBAC)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-2xl bg-[#5E81F4] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center justify-center space-x-1.5"
            >
              <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Dashboard →' : 'Create Account & Enter →'}</span>
            </button>
          </form>

          {/* Quick 1-Click Instant Demo Login (Only in Sign In mode) */}
          {mode === 'login' && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>1-Click Instant Demo Login (Zero Typing):</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo('anu@gmail.com', 'Password123!')}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-left transition-all group"
                >
                  <div className="text-[10px] font-extrabold text-blue-700">👤 Patient</div>
                  <div className="text-[9px] text-blue-500 truncate">anu@gmail.com</div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo('bob_caregiver@example.com', 'CaregiverPassword123!')}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-all group"
                >
                  <div className="text-[10px] font-extrabold text-emerald-700">🩺 Caregiver</div>
                  <div className="text-[9px] text-emerald-600 truncate">bob_caregiver</div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo('admin_system@example.com', 'AdminPassword123!')}
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 text-left transition-all group"
                >
                  <div className="text-[10px] font-extrabold text-purple-700">🛡️ Admin</div>
                  <div className="text-[9px] text-purple-600 truncate">admin_system</div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
