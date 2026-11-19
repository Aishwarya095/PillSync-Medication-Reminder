import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Pill, Lock, Mail, ArrowRight, AlertCircle, Sparkles, User, UserCheck, 
  ShieldCheck, RotateCcw, CheckCircle2, Clock, Camera, TrendingUp, Shield, Activity
} from 'lucide-react'

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

  // Quick Demo Login Handler
  const handleQuickFillAndLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
    setLoading(true)
    try {
      const userData = await login(demoEmail, demoPass)
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
      setError('Could not authenticate demo user.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-6 sm:py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Healthcare Product Showcase & Feature Directory */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Milestone 1 Achieved • Intelligent Health Platform</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              AI-Driven Medication Recognition & Personalized Reminder Platform
            </h1>
            
            <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
              PillSync empowers patients, caregivers, and clinicians with scheduled intake reminders, real-time dose tracking, and predictive inventory refill alerts.
            </p>
          </div>

          {/* Feature Highlight Cards (Full Project Vision) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Feature 1: Milestone 1 Active */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Achieved ✓
                </span>
              </div>
              <div className="font-bold text-xs text-slate-800">Role-Based Access & Profiles</div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Strict JWT-guarded access for Patients, Caregivers, and Administrators with condition tracking.
              </p>
            </div>

            {/* Feature 2: Milestone 2 Active */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Real-Time Active
                </span>
              </div>
              <div className="font-bold text-xs text-slate-800">Live Intake & Dose Reminders</div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Multi-dose daily schedules, audio chime confirmation, and automatic stock depletion tracking.
              </p>
            </div>

            {/* Feature 3: Milestone 3 Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Sprint 3 Upcoming
                </span>
              </div>
              <div className="font-bold text-xs text-slate-800">AI Prescription Scanner (OCR)</div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Computer vision text extraction for handwritten doctor prescriptions and bottle labels.
              </p>
            </div>

            {/* Feature 4: Milestone 4 Preview */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Sprint 4 Upcoming
                </span>
              </div>
              <div className="font-bold text-xs text-slate-800">Smart Refill Forecasting</div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Burn-rate algorithms calculating days remaining and triggering pharmacy refill alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
            
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25 mb-3">
                <Pill className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Access Your Portal</h2>
              <p className="text-xs text-slate-400">Sign in to your patient, caregiver, or administrator account</p>
            </div>

            {error && (
              <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  {(email || password) && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-[11px] font-medium text-slate-400 hover:text-slate-600 flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>1-Click Instant Demo Login:</span>
                </span>
                <span className="text-[10px] text-slate-400">No typing needed</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFillAndLogin('anu@gmail.com', 'Password123!')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold transition-all border border-blue-200 text-center"
                >
                  <User className="w-4 h-4 text-blue-600 mb-1" />
                  <span>Patient</span>
                  <span className="text-[9px] text-blue-500 font-normal">anu@...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFillAndLogin('bob_caregiver@example.com', 'CaregiverPassword123!')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-all border border-emerald-200 text-center"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span>Caregiver</span>
                  <span className="text-[9px] text-emerald-500 font-normal">bob@...</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFillAndLogin('admin_system@example.com', 'AdminPassword123!')}
                  className="flex flex-col items-center p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-[11px] font-semibold transition-all border border-purple-200 text-center"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600 mb-1" />
                  <span>Admin</span>
                  <span className="text-[9px] text-purple-500 font-normal">admin@...</span>
                </button>
              </div>
            </div>

            {/* Footer Link */}
            <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Need a new account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 underline">
                Register here
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
