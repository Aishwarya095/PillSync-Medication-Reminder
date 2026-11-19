import React, { useState, useEffect, useMemo } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { sound } from '../utils/sound'
import { 
  Pill, Clock, AlertTriangle, CheckCircle2, Plus, RefreshCw, Trash2, Edit3, 
  Search, ShieldAlert, Sparkles, Volume2, Bell, HeartPulse, User, Phone, 
  Calendar, Droplet, ArrowRight, X, ChevronRight, Check, AlertCircle, Info
} from 'lucide-react'

// Common Quick Presets for one-click testing
const PRESET_MEDICINES = [
  {
    name: 'Metformin',
    dosage: '500 mg',
    form: 'Tablet',
    disease_category: 'Diabetes',
    frequency: 'Twice daily',
    meal_relation: 'After Meal',
    current_stock: 24,
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
    meal_relation: 'Before Meal',
    current_stock: 14,
    low_stock_threshold: 5,
    schedule_times: ['09:00'],
    instructions: 'Take once daily in the morning with a full glass of water.',
  },
  {
    name: 'Atorvastatin',
    dosage: '20 mg',
    form: 'Tablet',
    disease_category: 'Heart Health',
    frequency: 'Once daily',
    meal_relation: 'After Meal',
    current_stock: 4, // Triggers low-stock alert!
    low_stock_threshold: 5,
    schedule_times: ['21:00'],
    instructions: 'Take once daily at bedtime with water.',
  },
  {
    name: 'Aspirin',
    dosage: '75 mg',
    form: 'Tablet',
    disease_category: 'Cardiovascular',
    frequency: 'Once daily',
    meal_relation: 'After Meal',
    current_stock: 30,
    low_stock_threshold: 6,
    schedule_times: ['08:30'],
    instructions: 'Take with food to prevent gastric irritation.',
  },
]

export default function PatientDashboard() {
  const { user } = useAuth()

  // State Management
  const [activeTab, setActiveTab] = useState('timeline') // 'timeline' | 'cabinet' | 'profile'
  const [currentTime, setCurrentTime] = useState(new Date())
  const [summary, setSummary] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDisease, setSelectedDisease] = useState('All')

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false)
  const [selectedMedForRefill, setSelectedMedForRefill] = useState(null)
  const [refillQuantity, setRefillQuantity] = useState(30)
  const [editingMed, setEditingMed] = useState(null)

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    contact_number: '',
    emergency_contact: '',
    blood_group: '',
    address: '',
    date_of_birth: '',
  })

  // Health Condition State
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
    dosage: '',
    form: 'Tablet',
    disease_category: 'General',
    frequency: 'Once daily',
    meal_relation: 'After Meal',
    current_stock: 30,
    low_stock_threshold: 5,
    schedule_times: ['08:00'],
    instructions: '',
  })

  // Real-time Clock (ticks every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show Toast
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Fetch Data
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
      setError('Unable to load dashboard data. Check backend connectivity.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Real-time Dose Action: TAKEN / MISSED / SNOOZED
  const handleDoseAction = async (item, action) => {
    try {
      const payload = {
        medicine_id: item.medicine_id,
        schedule_id: item.schedule_id,
        scheduled_time: item.scheduled_time,
        action: action,
      }
      const res = await api.post('/medicines/doses/action', payload)
      setSummary(res.data)

      // Refresh medicine inventory stock count
      const medsRes = await api.get('/medicines')
      setMedicines(medsRes.data)

      if (action === 'TAKEN') {
        sound.playSuccessChime()
        showToast(`✓ Marked ${item.medicine_name} (${item.dosage}) as Taken! Stock updated.`)
      } else if (action === 'SNOOZED') {
        sound.playReminderAlarm()
        showToast(`⏰ Snoozed ${item.medicine_name} for 15 minutes.`)
      } else {
        showToast(`Logged ${item.medicine_name} as Missed.`)
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
      showToast(`Medicine "${medForm.name}" added successfully!`)
      // Reset form
      setMedForm({
        name: '',
        dosage: '',
        form: 'Tablet',
        disease_category: 'General',
        frequency: 'Once daily',
        meal_relation: 'After Meal',
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
    if (!window.confirm(`Are you sure you want to remove ${name} from your medications?`)) return
    try {
      await api.delete(`/medicines/${id}`)
      showToast(`Removed ${name} from medications.`)
      fetchData()
    } catch (err) {
      console.error('Delete med error:', err)
      showToast('Failed to delete medicine.')
    }
  }

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/profiles/patient', profileForm)
      setProfile(res.data)
      setIsEditingProfile(false)
      showToast('Profile updated successfully!')
    } catch (err) {
      console.error('Update profile error:', err)
      showToast('Failed to update profile.')
    }
  }

  // Add Condition
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
      console.error('Add condition error:', err)
      showToast('Failed to add condition.')
    }
  }

  // Delete Condition
  const handleDeleteCondition = async (id) => {
    try {
      await api.delete(`/profiles/patient/conditions/${id}`)
      showToast('Health condition removed.')
      fetchData()
    } catch (err) {
      console.error('Delete condition error:', err)
      showToast('Failed to remove condition.')
    }
  }

  // Presets Quick-fill
  const applyPreset = (preset) => {
    setMedForm({
      ...preset,
      schedule_times: [...preset.schedule_times],
    })
    showToast(`Loaded ${preset.name} template!`)
  }

  // Filtered Medicines
  const filteredMeds = useMemo(() => {
    return medicines.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.dosage.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.disease_category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDisease =
        selectedDisease === 'All' ||
        m.disease_category.toLowerCase() === selectedDisease.toLowerCase()
      return matchesSearch && matchesDisease
    })
  }, [medicines, searchQuery, selectedDisease])

  // Unique Disease Categories
  const diseaseCategories = useMemo(() => {
    const set = new Set(['All'])
    medicines.forEach((m) => {
      if (m.disease_category) set.add(m.disease_category)
    })
    return Array.from(set)
  }, [medicines])

  // Next Dose Computation
  const nextDose = useMemo(() => {
    if (!summary || !summary.timeline || summary.timeline.length === 0) return null
    const pending = summary.timeline.filter((item) => item.status !== 'TAKEN')
    return pending.length > 0 ? pending[0] : null
  }, [summary])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading your health dashboard...</p>
          <p className="text-xs text-slate-400">Syncing real-time reminders and medicine inventory</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Real-Time Status Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-blue-100 border border-white/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PillSync Real-Time Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {profile?.full_name || user?.full_name || 'Patient'}!
            </h1>
            <p className="text-xs text-blue-100 max-w-xl">
              Track your daily medication schedule, log doses in real time, and keep your care team synchronized.
            </p>
          </div>

          {/* Live Clock & Audio Test */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-blue-200">Current Time</div>
              <div className="text-lg font-mono font-bold tracking-wide">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            <button
              onClick={() => {
                sound.playReminderAlarm()
                showToast('🔔 Medical chime sound alert tested successfully!')
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-semibold transition-all"
              title="Test real-time alert sound"
            >
              <Volume2 className="w-4 h-4 text-emerald-300" />
              <span>Test Chime</span>
            </button>
          </div>
        </div>

        {/* Next Dose Banner */}
        {nextDose && (
          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-blue-200">Next Upcoming Dose: </span>
                <span className="font-bold text-white text-sm">{nextDose.medicine_name} ({nextDose.dosage})</span>
                <span className="ml-2 px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-semibold">{nextDose.scheduled_time}</span>
              </div>
            </div>

            <button
              onClick={() => handleDoseAction(nextDose, 'TAKEN')}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-md transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Take Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Medications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Inventory</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">{summary?.total_medicines || medicines.length}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Active Prescriptions</div>
        </div>

        {/* Today's Intake */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Today</span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {summary?.taken_doses || 0} <span className="text-sm font-normal text-slate-400">/ {summary?.today_scheduled_doses || 0}</span>
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">Doses Completed</div>
        </div>

        {/* Adherence Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Adherence</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold text-slate-800">{summary?.adherence_percentage || 0}%</div>
            <span className="text-[11px] font-semibold text-emerald-600">
              {summary?.adherence_percentage >= 80 ? 'Optimal' : 'Needs attention'}
            </span>
          </div>
          {/* Visual Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                summary?.adherence_percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, summary?.adherence_percentage || 0)}%` }}
            />
          </div>
        </div>

        {/* Refill Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              summary?.low_stock_count > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            {summary?.low_stock_count > 0 ? (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full animate-pulse">
                Action Needed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Stock OK
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-slate-800">{summary?.low_stock_count || 0}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Medications Low on Stock</div>
        </div>
      </div>

      {/* Interactive Tabs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Live Timeline</span>
            {summary?.pending_doses > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px]">
                {summary.pending_doses}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('cabinet')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'cabinet'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medication Cabinet ({medicines.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Health Profile</span>
          </button>
        </div>

        {activeTab === 'cabinet' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        )}
      </div>

      {/* TAB 1: TODAY'S TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Today's Intake Schedule</h2>
              <p className="text-xs text-slate-500">Real-time status updates as you take or log each prescribed medication.</p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {summary?.timeline.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-700">No scheduled doses for today</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add medications into your cabinet to establish an intelligent daily schedule.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Medicine</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary?.timeline.map((item) => {
                const isTaken = item.status === 'TAKEN'
                const isDue = item.status === 'DUE_NOW'
                const isSnoozed = item.status === 'SNOOZED'

                return (
                  <div
                    key={item.timeline_id}
                    className={`rounded-2xl p-5 border transition-all ${
                      isTaken
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : isDue
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-md'
                        : 'bg-white border-slate-200/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                          {item.scheduled_time}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">{item.time_period}</span>
                      </div>

                      {/* Status Badge */}
                      {isTaken ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          <Check className="w-3 h-3" />
                          <span>Taken</span>
                        </span>
                      ) : isDue ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-semibold animate-pulse">
                          <span>Due Now</span>
                        </span>
                      ) : isSnoozed ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                          <span>Snoozed</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div className="mb-3">
                      <h3 className="text-base font-bold text-slate-800">{item.medicine_name}</h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs font-semibold text-blue-600">{item.dosage}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{item.form}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[11px] font-medium text-slate-500">{item.meal_relation}</span>
                      </div>
                      {item.instructions && (
                        <p className="text-[11px] text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg italic">
                          "{item.instructions}"
                        </p>
                      )}
                    </div>

                    {/* Stock level info */}
                    <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 mb-4">
                      <span className="text-slate-400">Stock available:</span>
                      <span className={`font-semibold ${item.is_low_stock ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                        {item.current_stock} pills left {item.is_low_stock && '⚠️ Low'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {isTaken ? (
                        <button
                          onClick={() => handleDoseAction(item, 'SNOOZED')}
                          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-white text-xs font-medium transition-colors"
                        >
                          Undo / Change
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDoseAction(item, 'TAKEN')}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Take Dose</span>
                          </button>
                          <button
                            onClick={() => handleDoseAction(item, 'SNOOZED')}
                            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                            title="Snooze 15 minutes"
                          >
                            Snooze
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEDICATION CABINET */}
      {activeTab === 'cabinet' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search medication, dosage, disease..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Disease Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {diseaseCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedDisease(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedDisease === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Medicine Cards Grid */}
          {filteredMeds.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <Pill className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No medications found</p>
              <p className="text-xs text-slate-400">Try adjusting your search criteria or add a new medication.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMeds.map((med) => (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px]">
                        {med.disease_category}
                      </span>
                      {med.is_low_stock && (
                        <span className="px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[11px] animate-pulse">
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{med.name}</h3>
                    <div className="text-xs font-semibold text-slate-500 mb-3">
                      {med.dosage} • {med.form} • {med.frequency}
                    </div>

                    {med.instructions && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-3">
                        {med.instructions}
                      </p>
                    )}

                    {/* Scheduled Times */}
                    <div className="space-y-1 mb-4">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scheduled Times</div>
                      <div className="flex flex-wrap gap-1.5">
                        {med.schedules.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-medium"
                          >
                            {s.time_str}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stock & Quick Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Remaining pills:</span>
                      <span className={`font-bold ${med.is_low_stock ? 'text-rose-600' : 'text-slate-800'}`}>
                        {med.current_stock} pills
                      </span>
                    </div>

                    {/* Stock Progress Meter */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          med.is_low_stock ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (med.current_stock / 30) * 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedMedForRefill(med)
                          setIsRefillModalOpen(true)
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1"
                      >
                        <RefreshCw className="w-3 h-3 text-blue-600" />
                        <span>Refill (+30)</span>
                      </button>

                      <button
                        onClick={() => handleDeleteMedicine(med.id, med.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete medicine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HEALTH PROFILE & CONDITIONS */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Details Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Personal Information</h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.contact_number}
                    onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={profileForm.emergency_contact}
                    onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+, A+, B+"
                    value={profileForm.blood_group}
                    onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs mt-2"
                >
                  Save Profile
                </button>
              </form>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Name</span>
                  <span className="font-semibold text-slate-800">{profile?.full_name || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Email</span>
                  <span className="font-semibold text-slate-800">{user?.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{profile?.contact_number || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                  <span className="font-semibold text-rose-600 font-bold">{profile?.emergency_contact || 'None registered'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Blood Group</span>
                  <span className="font-semibold text-slate-800">{profile?.blood_group || 'Not specified'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Chronic Health Conditions */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Chronic Health Conditions</h3>
                <p className="text-xs text-slate-400">Recorded medical history linked to your medication reminders.</p>
              </div>
              <button
                onClick={() => setIsAddingCondition(!isAddingCondition)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
            </div>

            {/* Add Condition Inline Form */}
            {isAddingCondition && (
              <form onSubmit={handleAddCondition} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Condition Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Type 2 Diabetes, Hypertension"
                      value={conditionForm.condition_name}
                      onChange={(e) => setConditionForm({ ...conditionForm, condition_name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Severity</label>
                    <select
                      value={conditionForm.severity}
                      onChange={(e) => setConditionForm({ ...conditionForm, severity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    >
                      <option value="Mild">Mild</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Severe">Severe</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingCondition(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                  >
                    Save Condition
                  </button>
                </div>
              </form>
            )}

            {/* Conditions List */}
            {profile?.health_conditions?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No chronic conditions recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {profile?.health_conditions?.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-xs">{c.condition_name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.severity === 'Severe'
                            ? 'bg-rose-100 text-rose-700'
                            : c.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {c.severity}
                        </span>
                      </div>
                      {c.notes && <p className="text-[11px] text-slate-500">{c.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleDeleteCondition(c.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5"
                      title="Remove condition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW MEDICATION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
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
                    placeholder="e.g. Metformin"
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
                    <option value="Drops">Drops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Disease / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Diabetes, BP"
                    value={medForm.disease_category}
                    onChange={(e) => setMedForm({ ...medForm, disease_category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Relation</label>
                  <select
                    value={medForm.meal_relation}
                    onChange={(e) => setMedForm({ ...medForm, meal_relation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="After Meal">After Meal</option>
                    <option value="Before Meal">Before Meal</option>
                    <option value="With Food">With Food</option>
                    <option value="Empty Stomach">Empty Stomach</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Reminder Times (comma-separated, 24h format)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00, 20:00"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Instructions / Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Take with a warm glass of water after breakfast."
                  value={medForm.instructions}
                  onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Refill Stock</h3>
              <button onClick={() => setIsRefillModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-500">Add pills to replenish inventory for:</p>
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
    </div>
  )
}
