import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { sound } from '../utils/sound'
import SidebarLayout from '../components/SidebarLayout'
import { 
  Pill, Clock, AlertTriangle, CheckCircle2, Plus, RefreshCw, Trash2, Edit3, 
  Search, ShieldAlert, Sparkles, Volume2, Bell, HeartPulse, User, Phone, 
  Calendar, Droplet, ArrowRight, X, ChevronRight, Check, AlertCircle, Info,
  Camera, TrendingUp, FileText, Brain, Zap, Shield, Bookmark, ExternalLink,
  ChevronDown, Activity, Heart, MoreHorizontal, CheckSquare
} from 'lucide-react'

// Common Quick Presets for one-click testing
const PRESET_MEDICINES = [
  {
    name: 'Kefuclav',
    dosage: '500 mg',
    form: 'Tablet',
    disease_category: 'Infection',
    frequency: '8hour',
    meal_relation: 'After',
    current_stock: 24,
    low_stock_threshold: 5,
    schedule_times: ['08:00', '16:00', '23:00'],
    instructions: 'Take 1 tablet every 8 hours after food.',
  },
  {
    name: 'Metformin',
    dosage: '500 mg',
    form: 'Tablet',
    disease_category: 'Diabetes',
    frequency: 'Twice daily',
    meal_relation: 'After',
    current_stock: 20,
    low_stock_threshold: 5,
    schedule_times: ['08:00', '20:00'],
    instructions: 'Take with water immediately after breakfast and dinner.',
  },
  {
    name: 'Lisinopril',
    dosage: '10 mg',
    form: 'Tablet',
    disease_category: 'Blood Pressure',
    frequency: 'Once daily',
    meal_relation: 'Before',
    current_stock: 14,
    low_stock_threshold: 5,
    schedule_times: ['09:00'],
    instructions: 'Take once daily in the morning before food.',
  },
  {
    name: 'Atorvastatin',
    dosage: '20 mg',
    form: 'Tablet',
    disease_category: 'Heart Health',
    frequency: 'Once daily',
    meal_relation: 'After',
    current_stock: 4, // Triggers low-stock alert!
    low_stock_threshold: 5,
    schedule_times: ['21:00'],
    instructions: 'Take at bedtime with water.',
  },
]

export default function PatientDashboard() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('tracker') // 'tracker' | 'vitals' | 'history' | 'roadmap' | 'prescriptions' | 'refill' | 'profile'

  // Data States
  const [summary, setSummary] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState('')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false)
  const [selectedMedForRefill, setSelectedMedForRefill] = useState(null)
  const [refillQuantity, setRefillQuantity] = useState(30)

  // Profile Edit State (Milestone 1)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    contact_number: '',
    emergency_contact: '',
    blood_group: '',
    address: '',
    date_of_birth: '',
  })

  // Add Health Condition Modal State (Milestone 1)
  const [isAddingCondition, setIsAddingCondition] = useState(false)
  const [conditionForm, setConditionForm] = useState({
    condition_name: '',
    severity: 'Moderate',
    diagnosed_date: '',
    notes: '',
  })

  // Add Medicine Form
  const [medForm, setMedForm] = useState({
    name: '',
    dosage: '500 mg',
    form: 'Tablet',
    disease_category: 'General',
    frequency: '8hour',
    meal_relation: 'After',
    current_stock: 30,
    low_stock_threshold: 5,
    schedule_times: ['08:00'],
    instructions: '',
  })

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Fetch Backend Data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [summaryRes, medsRes, profileRes] = await Promise.all([
        api.get('/medicines/timeline/today'),
        api.get('/medicines'),
        api.get('/profiles/patient'),
      ])
      setSummary(summaryRes.data)
      setMedicines(medsRes.data)
      setProfile(profileRes.data)
      setProfileForm({
        full_name: profileRes.data.full_name || '',
        contact_number: profileRes.data.contact_number || '',
        emergency_contact: profileRes.data.emergency_contact || '',
        blood_group: profileRes.data.blood_group || '',
        address: profileRes.data.address || '',
        date_of_birth: profileRes.data.date_of_birth || '',
      })
    } catch (err) {
      console.error('Failed to load patient dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Real-Time Dose Action
  const handleDoseAction = async (item, action = 'TAKEN') => {
    try {
      const payload = {
        medicine_id: item.medicine_id,
        schedule_id: item.schedule_id,
        scheduled_time: item.scheduled_time,
        action: action,
      }
      const res = await api.post('/medicines/doses/action', payload)
      setSummary(res.data)

      const medsRes = await api.get('/medicines')
      setMedicines(medsRes.data)

      if (action === 'TAKEN') {
        sound.playSuccessChime()
        showToast(`✓ Marked ${item.medicine_name} (${item.dosage}) as Taken! Stock updated.`)
      } else {
        showToast(`Logged ${item.medicine_name} status updated.`)
      }
    } catch (err) {
      console.error('Dose action failed:', err)
      showToast('Failed to record dose action.')
    }
  }

  // Quick Refill Stock
  const handleRefill = async (e) => {
    e.preventDefault()
    if (!selectedMedForRefill) return
    try {
      await api.post(`/medicines/${selectedMedForRefill.id}/refill`, {
        quantity: parseInt(refillQuantity, 10),
      })
      sound.playRefillTone()
      setIsRefillModalOpen(false)
      showToast(`+${refillQuantity} pills added to ${selectedMedForRefill.name} inventory!`)
      fetchData()
    } catch (err) {
      console.error('Refill failed:', err)
      showToast('Failed to refill medicine.')
    }
  }

  // Add Medicine Submit
  const handleAddMedicine = async (e) => {
    e.preventDefault()
    try {
      await api.post('/medicines', medForm)
      sound.playSuccessChime()
      setIsAddModalOpen(false)
      showToast(`Medicine "${medForm.name}" added to tracker!`)
      setMedForm({
        name: '',
        dosage: '500 mg',
        form: 'Tablet',
        disease_category: 'General',
        frequency: '8hour',
        meal_relation: 'After',
        current_stock: 30,
        low_stock_threshold: 5,
        schedule_times: ['08:00'],
        instructions: '',
      })
      fetchData()
    } catch (err) {
      console.error('Add medicine error:', err)
      showToast('Failed to add medicine.')
    }
  }

  // Delete Medicine
  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your medications?`)) return
    try {
      await api.delete(`/medicines/${id}`)
      showToast(`Removed ${name}.`)
      fetchData()
    } catch (err) {
      showToast('Failed to delete medicine.')
    }
  }

  // Profile Update (Milestone 1)
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/profiles/patient', profileForm)
      setProfile(res.data)
      setIsEditingProfile(false)
      showToast('Profile updated successfully!')
    } catch (err) {
      showToast('Failed to update profile.')
    }
  }

  // Condition CRUD (Milestone 1)
  const handleAddCondition = async (e) => {
    e.preventDefault()
    if (!conditionForm.condition_name.trim()) return
    try {
      await api.post('/profiles/patient/conditions', conditionForm)
      setIsAddingCondition(false)
      setConditionForm({ condition_name: '', severity: 'Moderate', diagnosed_date: '', notes: '' })
      showToast('Health condition recorded!')
      fetchData()
    } catch (err) {
      showToast('Failed to add condition.')
    }
  }

  const handleDeleteCondition = async (id) => {
    try {
      await api.delete(`/profiles/patient/conditions/${id}`)
      showToast('Condition removed.')
      fetchData()
    } catch (err) {
      showToast('Failed to remove condition.')
    }
  }

  // Presets helper
  const applyPreset = (preset) => {
    setMedForm({ ...preset, schedule_times: [...preset.schedule_times] })
    showToast(`Loaded ${preset.name} template!`)
  }

  const displayName = profile?.full_name || user?.full_name || 'Suvashini'

  return (
    <SidebarLayout activeSection={activeSection} onSelectSection={setActiveSection}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb matching "☷ / Medication Tracker" */}
      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
        <span className="font-bold text-slate-500">☷</span>
        <span>/</span>
        <span className="text-slate-600 font-semibold capitalize">
          {activeSection === 'tracker' ? 'Medication Tracker' : activeSection}
        </span>
      </div>

      {/* Greeting Header matching "Welcome back, Suvashini" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">Welcome back,</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1437] tracking-tight">
            {displayName}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              sound.playReminderAlarm()
              showToast('🔔 Chime sound alert tested successfully!')
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Volume2 className="w-4 h-4 text-blue-600" />
            <span>Test Sound</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#5E81F4] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* 4 TOP HORIZONTAL METRIC CARDS (Exact Match to Reference Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Medication Tracker (Blue #5E81F4) */}
        <div className="rounded-3xl p-5 bg-[#5E81F4] text-white shadow-lg shadow-blue-500/20 relative flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold tracking-tight">Medication Tracker</span>
            <button className="text-white/70 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-blue-100 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>05 May - Jun 03</span>
            </div>
            {/* Circular Progress 20% / Adherence */}
            <div className="w-11 h-11 rounded-full border-3 border-white/30 border-t-white flex items-center justify-center font-bold text-xs">
              {summary?.adherence_percentage ? `${Math.round(summary.adherence_percentage)}%` : '75%'}
            </div>
          </div>
        </div>

        {/* Card 2: Regular Test Reports (Sea Green / Mint #48BB78) */}
        <div className="rounded-3xl p-5 bg-[#58B896] text-white shadow-lg shadow-teal-500/20 relative flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold tracking-tight">Regular Test Reports</span>
            <button className="text-white/70 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-teal-100 font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>Today's Doses</span>
            </div>
            <div className="w-11 h-11 rounded-full border-3 border-white/30 border-t-white flex items-center justify-center font-bold text-xs">
              {summary?.taken_doses ? `${summary.taken_doses}/${summary.today_scheduled_doses}` : '45%'}
            </div>
          </div>
        </div>

        {/* Card 3: Health History (Pink / Rose #ED64A6) */}
        <div className="rounded-3xl p-5 bg-[#E2619B] text-white shadow-lg shadow-pink-500/20 relative flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold tracking-tight">Health History</span>
            <button className="text-white/70 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-pink-100 font-medium">
              <Heart className="w-3.5 h-3.5" />
              <span>05 May - Jun 03</span>
            </div>
            <div className="w-11 h-11 rounded-full border-3 border-white/30 border-t-white flex items-center justify-center font-bold text-xs">
              20%
            </div>
          </div>
        </div>

        {/* Card 4: Monthly Progress / Milestone 1 Completed (Slate Navy) */}
        <div className="rounded-3xl p-5 bg-[#4A5568] text-white shadow-lg shadow-slate-600/20 relative flex flex-col justify-between h-32">
          <div className="flex items-start justify-between">
            <span className="text-sm font-bold tracking-tight">Monthly Progress</span>
            <button className="text-white/70 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Milestone 1 Completed ✓</span>
            </div>
            <div className="w-11 h-11 rounded-full border-3 border-white/30 border-t-emerald-400 flex items-center justify-center font-bold text-xs text-emerald-300">
              100%
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: "Today's Test Report" (Vitals & Clinical Status) */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Today's Health & Clinical Reports
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Blood Glucose Donut Widget (Matches reference photo) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-slate-800">Blood Glucose</span>
                <span className="flex items-center space-x-1 text-[11px] text-slate-400 border border-slate-200 px-2.5 py-1 rounded-xl">
                  <span>Today</span>
                  <ChevronDown className="w-3 h-3" />
                </span>
              </div>

              {/* Multi-Ring Donut with "Elevated" in center */}
              <div className="flex items-center justify-center my-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                    {/* Pink arc */}
                    <circle cx="50" cy="50" r="40" stroke="#E2619B" strokeWidth="8" strokeDasharray="180 250" strokeLinecap="round" fill="none" />
                    {/* Purple inner arc */}
                    <circle cx="50" cy="50" r="30" stroke="#5E81F4" strokeWidth="6" strokeDasharray="120 200" strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xs font-extrabold text-slate-800 block">Elevated</span>
                    <span className="text-[10px] text-slate-400 font-medium">185 mg/dl</span>
                  </div>
                </div>

                <div className="ml-4 space-y-1.5 text-[11px]">
                  <div className="text-slate-500">Yesterday status - <span className="text-rose-500 font-bold">High</span></div>
                  <div className="text-slate-500">This week status - <span className="text-amber-500 font-bold">Elevated</span></div>
                  <div className="text-slate-500">Last week status - <span className="text-emerald-500 font-bold">Normal</span></div>
                </div>
              </div>
            </div>

            {/* Today's Data Points */}
            <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1">
              <div className="font-bold text-slate-700 flex items-center space-x-1 mb-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                <span>Today's data</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#E2619B]" />
                <span>185 mg/dl • After meal</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <span className="w-2 h-2 rounded-full bg-[#5E81F4]" />
                <span>110 mg/dl • Before meal</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Status - In Active Management</span>
              </div>
            </div>
          </div>

          {/* Card 2: Blood Pressure & Heartbeat Wave Widget (Matches reference photo) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-800">Blood Pressure</span>
                <span className="flex items-center space-x-1 text-[11px] text-slate-400 border border-slate-200 px-2.5 py-1 rounded-xl">
                  <span>Today</span>
                  <ChevronDown className="w-3 h-3" />
                </span>
              </div>

              {/* Orange Wave Curve Chart */}
              <div className="h-28 w-full relative my-2">
                <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F6AD55" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#F6AD55" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0 50 Q 50 20, 100 45 T 200 30 T 300 35 L 300 80 L 0 80 Z"
                    fill="url(#bpGrad)"
                  />
                  <path
                    d="M 0 50 Q 50 20, 100 45 T 200 30 T 300 35"
                    fill="none"
                    stroke="#ED8936"
                    strokeWidth="2.5"
                  />
                  <circle cx="280" cy="35" r="4" fill="#ED8936" />
                </svg>
                {/* Timeline Axis */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1 px-1">
                  <span>8.00</span>
                  <span>11.00</span>
                  <span>14.00</span>
                  <span>17.00</span>
                </div>
              </div>
            </div>

            {/* Split Metrics: Blood Pressure & Heartbeat */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Blood Pressure</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">120/80 mmHg</div>
                <div className="text-[10px] text-slate-400">Highest 140/90 • Lowest 118/74</div>
              </div>

              <div className="space-y-1 pl-4 border-l border-slate-100">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Heartbeat</span>
                </div>
                <div className="text-base font-extrabold text-slate-900">88 BPM</div>
                <div className="text-[10px] text-slate-400">Sinus Rhythm Average</div>
              </div>
            </div>
          </div>

          {/* Card 3: Weight Chart & Upcoming Modules Sandbox (Sprint 3 & 4 Preview) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-800">Weight & Vitals</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold">
                  Sprint 3 & 4
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between mb-3 shadow-sm">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Baseline Weight</span>
                  <div className="text-lg font-bold">180.0 lb</div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-emerald-400 text-xs">
                  -2.4
                </div>
              </div>

              {/* Upcoming Feature Badges */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-4 h-4 text-purple-600" />
                    <div>
                      <div className="font-bold text-[11px] text-purple-900 leading-tight">AI Prescription OCR</div>
                      <div className="text-[9px] text-purple-600">Camera recognition in Sprint 3</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-800">Soon</span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <div>
                      <div className="font-bold text-[11px] text-amber-900 leading-tight">Smart Refill Forecast</div>
                      <div className="text-[9px] text-amber-600">Burn-rate math in Sprint 4</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-800">Soon</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSection('roadmap')}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Explore All Upcoming Modules</span>
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: "Medication Tracker" Table (Exact Reference Match) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Medication Tracker</h2>
            <p className="text-xs text-slate-400">Real-time daily schedule, dose intake logger, and prescription cabinet.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#5E81F4] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          </div>
        </div>

        {/* The Exact Clean Table matching the photo */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px]">
                <th className="pb-3 font-semibold">Name</th>
                <th className="pb-3 font-semibold">Frequency</th>
                <th className="pb-3 font-semibold">Dosage</th>
                <th className="pb-3 font-semibold">Taken</th>
                <th className="pb-3 font-semibold">Meal Timing</th>
                <th className="pb-3 font-semibold">Next Dose</th>
                <th className="pb-3 font-semibold text-right">Live Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No medications in tracker yet. Click "+ Add Medication" above.
                  </td>
                </tr>
              ) : (
                medicines.map((med, index) => {
                  const scheduleTime = med.schedules?.[0]?.time_str || '08:00'
                  const isLow = med.current_stock <= med.low_stock_threshold
                  const formattedNum = String(index + 1).padStart(2, '0')

                  // Find today's timeline item for live status
                  const timelineItem = summary?.timeline?.find((t) => t.medicine_id === med.id)
                  const isTaken = timelineItem?.status === 'TAKEN'

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name */}
                      <td className="py-4 font-bold text-slate-900 whitespace-nowrap">
                        <span className="text-slate-400 font-normal mr-2">{formattedNum}.</span>
                        <span>{med.name} {med.dosage}</span>
                        {isLow && (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                            ⚠️ Low Stock ({med.current_stock} left)
                          </span>
                        )}
                      </td>

                      {/* Frequency */}
                      <td className="py-4 font-medium text-slate-500 whitespace-nowrap">
                        {med.frequency || '8hour'}
                      </td>

                      {/* Dosage */}
                      <td className="py-4 font-semibold text-slate-800 whitespace-nowrap">
                        1 {med.form || 'Tablet'}
                      </td>

                      {/* Taken */}
                      <td className="py-4 whitespace-nowrap">
                        {isTaken ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            <Check className="w-3 h-3" />
                            <span>1</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold text-xs">0</span>
                        )}
                      </td>

                      {/* Meal Timing */}
                      <td className="py-4 font-medium text-slate-600 whitespace-nowrap">
                        {med.meal_relation || 'After'}
                      </td>

                      {/* Next Dose */}
                      <td className="py-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {scheduleTime}
                      </td>

                      {/* Live Action */}
                      <td className="py-4 text-right whitespace-nowrap">
                        {isTaken ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Taken</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDoseAction({ medicine_id: med.id, schedule_id: med.schedules?.[0]?.id, scheduled_time: scheduleTime, medicine_name: med.name, dosage: med.dosage }, 'TAKEN')}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Take Dose</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedMedForRefill(med)
                            setIsRefillModalOpen(true)
                          }}
                          className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                          title="Refill stock"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteMedicine(med.id, med.name)}
                          className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW MEDICATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Medication</h3>
                <p className="text-xs text-slate-400">Configure dosage, daily schedule, and inventory alerts.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates Picker */}
            <div className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>One-Click Clinical Presets (Quick Fill):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_MEDICINES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-[11px] font-medium hover:bg-blue-100 transition-colors"
                  >
                    + {p.name} ({p.dosage})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kefuclav"
                    value={medForm.name}
                    onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500 mg, 1 tablet"
                    value={medForm.dosage}
                    onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Form</label>
                  <select
                    value={medForm.form}
                    onChange={(e) => setMedForm({ ...medForm, form: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
                  <input
                    type="text"
                    placeholder="e.g. 8hour, Once daily"
                    value={medForm.frequency}
                    onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Timing</label>
                  <select
                    value={medForm.meal_relation}
                    onChange={(e) => setMedForm({ ...medForm, meal_relation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="After">After</option>
                    <option value="Before">Before</option>
                    <option value="With Food">With Food</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Times (comma-separated, 24h format)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00, 16:00, 23:00"
                    value={medForm.schedule_times.join(', ')}
                    onChange={(e) =>
                      setMedForm({
                        ...medForm,
                        schedule_times: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current Pill Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={medForm.current_stock}
                    onChange={(e) => setMedForm({ ...medForm, current_stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK REFILL */}
      {isRefillModalOpen && selectedMedForRefill && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Refill Stock</h3>
              <button onClick={() => setIsRefillModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Replenish pills for:</p>
              <div className="text-sm font-bold text-slate-800">{selectedMedForRefill.name} ({selectedMedForRefill.dosage})</div>
              <div className="text-xs text-slate-400">Current stock: {selectedMedForRefill.current_stock} pills</div>
            </div>

            <form onSubmit={handleRefill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Quantity to Add</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[15, 30, 60].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRefillQuantity(qty)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border ${
                        refillQuantity === qty
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={refillQuantity}
                  onChange={(e) => setRefillQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRefillModalOpen(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-sm"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
