import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Pill, Lock, Mail, ArrowRight, AlertCircle, Sparkles, User, UserCheck, ShieldCheck, RotateCcw } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleClear = () => {
    setEmail('')
    setPassword('')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await login(email, password)
      // Reset form fields on successful authentication
      setEmail('')
      setPassword('')
      
      const role = userData.role.toUpperCase()
      if (role === 'ADMIN') {
        navigate('/admin')
      } else if (role === 'CAREGIVER') {
        navigate('/caregiver')
      } else {
        navigate('/patient')
      }
    } catch (err) {
      console.error('Login error:', err)
      const message = err.response?.data?.detail || 'Invalid email or password. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Demo accounts helper
  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-4">
            <Pill className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back to PillSync</h1>
          <p className="text-xs text-slate-500 mt-1">
            Intelligent Medicine Reminder & Healthcare Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 flex items-center space-x-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                {(email || password) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear form</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs transition-all bg-slate-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {(email || password) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                  title="Clear inputs"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Quick Demo Pre-fills */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Demo Test Logins:</span>
              </div>
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-slate-400 hover:text-slate-600 font-medium"
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('alice_patient@example.com', 'Password123!')}
                className="flex items-center justify-center space-x-1 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium transition-colors border border-blue-100"
              >
                <User className="w-3 h-3" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('bob_caregiver@example.com', 'CaregiverPassword123!')}
                className="flex items-center justify-center space-x-1 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium transition-colors border border-emerald-100"
              >
                <UserCheck className="w-3 h-3" />
                <span>Caregiver</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin_system@example.com', 'AdminPassword123!')}
                className="flex items-center justify-center space-x-1 p-2 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-medium transition-colors border border-purple-100"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline">
            Register an account
          </Link>
        </p>
      </div>
    </div>
  )
}
