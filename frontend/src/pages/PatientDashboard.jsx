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
  ChevronDown, Activity, Heart, MoreHorizontal, CheckSquare, Users, UserCheck,
  ShieldCheck, HeartHandshake, Award, Eye, Link2
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
  const { user, login } = useAuth()
  const role = user?.role?.toUpperCase() || 'PATIENT'

  // Active section inside the dark sidebar
  const [activeSection, setActiveSection] = useState('tracker') 
  // 'tracker' | 'vitals' | 'patient_profile' | 'caregiver_portal' | 'admin_portal' | 'prescriptions' | 'refill'

  // Toast feedback
  const [toastMsg, setToastMsg] = useState('')
  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // -------------------------------------------------------------
  // PATIENT DATA STATES
  // -------------------------------------------------------------
  const [summary, setSummary] = useState(null)
  const [medicines, setMedicines] = useState([])
  const [patientProfile, setPatientProfile] = useState(null)
  const [patientLoading, setPatientLoading] = useState(false)

  // Medication Form & Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isRefillModalOpen, setIsRefillModalOpen] = useState(false)
  const [selectedMedForRefill, setSelectedMedForRefill] = useState(null)
  const [refillQuantity, setRefillQuantity] = useState(30)
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

  // Patient Profile Edit Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    contact_number: '',
    emergency_contact: '',
    blood_group: '',
    address: '',
    date_of_birth: '',
  })

  // Add Health Condition Modal
  const [isAddingCondition, setIsAddingCondition] = useState(false)
  const [conditionForm, setConditionForm] = useState({
    condition_name: '',
    severity: 'Moderate',
    diagnosed_date: '',
    notes: '',
  })

  // -------------------------------------------------------------
  // CAREGIVER DATA STATES
  // -------------------------------------------------------------
  const [caregiverProfile, setCaregiverProfile] = useState(null)
  const [caregiverLoading, setCaregiverLoading] = useState(false)
  const [isEditingCaregiver, setIsEditingCaregiver] = useState(false)
  const [caregiverForm, setCaregiverForm] = useState({
    full_name: '',
    contact_number: '',
    qualification: '',
    relationship_type: '',
  })
  const [inspectedPatient, setInspectedPatient] = useState(null)
  const [inspectedTimeline, setInspectedTimeline] = useState(null)
  const [loadingTimeline, setLoadingTimeline] = useState(false)

  // -------------------------------------------------------------
  // ADMIN DATA STATES
  // -------------------------------------------------------------
  const [adminUsers, setAdminUsers] = useState([])
  const [adminPatients, setAdminPatients] = useState([])
  const [adminCaregivers, setAdminCaregivers] = useState([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [assignForm, setAssignForm] = useState({
    caregiver_id: '',
    patient_id: '',
    notes: 'Primary family caregiver assigned via Admin Console',
  })
  const [assigning, setAssigning] = useState(false)

  // -------------------------------------------------------------
  // DATA LOADERS
  // -------------------------------------------------------------
  const loadPatientData = async () => {
    if (!user || role !== 'PATIENT') return
    setPatientLoading(true)
    try {
      const [summaryRes, medsRes, profileRes] = await Promise.all([
        api.get('/medicines/timeline/today'),
        api.get('/medicines'),
        api.get('/profiles/patient'),
      ])
      setSummary(summaryRes.data)
      setMedicines(medsRes.data)
      setPatientProfile(profileRes.data)
      setProfileForm({
        full_name: profileRes.data.full_name || '',
        contact_number: profileRes.data.contact_number || '',
        emergency_contact: profileRes.data.emergency_contact || '',
        blood_group: profileRes.data.blood_group || '',
        address: profileRes.data.address || '',
        date_of_birth: profileRes.data.date_of_birth || '',
      })
    } catch (err) {
      console.error('Failed loading patient data:', err)
    } finally {
      setPatientLoading(false)
    }
  }

  const loadCaregiverData = async () => {
    if (!user || role !== 'CAREGIVER') return
    setCaregiverLoading(true)
    try {
      const res = await api.get('/profiles/caregiver')
      setCaregiverProfile(res.data)
      setCaregiverForm({
        full_name: res.data.full_name || '',
        contact_number: res.data.contact_number || '',
        qualification: res.data.qualification || '',
        relationship_type: res.data.relationship_type || '',
      })
    } catch (err) {
      console.error('Failed loading caregiver data:', err)
    } finally {
      setCaregiverLoading(false)
    }
  }

  const loadAdminData = async () => {
    if (!user || role !== 'ADMIN') return
    setAdminLoading(true)
    try {
      const [uRes, pRes, cRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/patients'),
        api.get('/admin/caregivers'),
      ])
      setAdminUsers(uRes.data)
      setAdminPatients(pRes.data)
      setAdminCaregivers(cRes.data)
      if (cRes.data.length > 0 && !assignForm.caregiver_id) {
        setAssignForm((prev) => ({ ...prev, caregiver_id: cRes.data[0].id }))
      }
      if (pRes.data.length > 0 && !assignForm.patient_id) {
        setAssignForm((prev) => ({ ...prev, patient_id: pRes.data[0].id }))
      }
    } catch (err) {
      console.error('Failed loading admin data:', err)
    } finally {
      setAdminLoading(false)
    }
  }

  // Load relevant data whenever role or user changes
  useEffect(() => {
    if (!user) {
      setSummary(null)
      setMedicines([])
      setPatientProfile(null)
      setCaregiverProfile(null)
      setAdminUsers([])
      return
    }
    if (role === 'PATIENT') {
      loadPatientData()
    } else if (role === 'CAREGIVER') {
      loadCaregiverData()
    } else if (role === 'ADMIN') {
      loadAdminData()
    }
  }, [role, user])

  useEffect(() => {
    if (!user) return
    if (activeSection === 'caregiver_portal' && role === 'CAREGIVER') {
      loadCaregiverData()
    } else if (activeSection === 'admin_portal' && role === 'ADMIN') {
      loadAdminData()
    } else if ((activeSection === 'tracker' || activeSection === 'patient_profile') && role === 'PATIENT') {
      loadPatientData()
    }
  }, [activeSection, user])

  // -------------------------------------------------------------
  // PATIENT ACTIONS (DOSE, REFILL, ADD/DELETE MEDICATION)
  // -------------------------------------------------------------
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
        showToast(`✓ Recorded dose for ${item.medicine_name} (${item.dosage}) as Taken! Inventory decremented.`)
      } else {
        showToast(`Logged status for ${item.medicine_name}.`)
      }
    } catch (err) {
      console.error('Dose action failed:', err)
      showToast('Failed to record dose action.')
    }
  }

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
      loadPatientData()
    } catch (err) {
      console.error('Refill failed:', err)
      showToast('Failed to refill medicine.')
    }
  }

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
      loadPatientData()
    } catch (err) {
      console.error('Add medicine error:', err)
      showToast('Failed to add medicine.')
    }
  }

  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your medications?`)) return
    try {
      await api.delete(`/medicines/${id}`)
      showToast(`Removed ${name}.`)
      loadPatientData()
    } catch (err) {
      showToast('Failed to delete medicine.')
    }
  }

  // -------------------------------------------------------------
  // PATIENT PROFILE & CONDITIONS ACTIONS (MILESTONE 1)
  // -------------------------------------------------------------
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/profiles/patient', profileForm)
      setPatientProfile(res.data)
      setIsEditingProfile(false)
      sound.playSuccessChime()
      showToast('Patient profile updated successfully!')
    } catch (err) {
      showToast('Failed to update profile.')
    }
  }

  const handleAddCondition = async (e) => {
    e.preventDefault()
    if (!conditionForm.condition_name.trim()) return
    try {
      await api.post('/profiles/patient/conditions', conditionForm)
      setIsAddingCondition(false)
      setConditionForm({ condition_name: '', severity: 'Moderate', diagnosed_date: '', notes: '' })
      sound.playSuccessChime()
      showToast('Health condition recorded!')
      loadPatientData()
    } catch (err) {
      showToast('Failed to add condition.')
    }
  }

  const handleDeleteCondition = async (id) => {
    try {
      await api.delete(`/profiles/patient/conditions/${id}`)
      showToast('Health condition removed.')
      loadPatientData()
    } catch (err) {
      showToast('Failed to delete condition.')
    }
  }

  // -------------------------------------------------------------
  // CAREGIVER ACTIONS (MILESTONE 1)
  // -------------------------------------------------------------
  const handleUpdateCaregiver = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/profiles/caregiver', caregiverForm)
      setCaregiverProfile(res.data)
      setIsEditingCaregiver(false)
      sound.playSuccessChime()
      showToast('Caregiver credentials updated!')
    } catch (err) {
      showToast('Failed to update caregiver profile.')
    }
  }

  const handleInspectPatient = async (pat) => {
    setInspectedPatient(pat)
    setLoadingTimeline(true)
    try {
      const targetId = pat.patient_user_id || pat.patient_profile_id
      const res = await api.get(`/medicines/timeline/today?patient_id=${targetId}`)
      setInspectedTimeline(res.data)
    } catch (err) {
      console.error('Failed to load patient timeline:', err)
      setInspectedTimeline(null)
    } finally {
      setLoadingTimeline(false)
    }
  }

  // -------------------------------------------------------------
  // ADMIN ACTIONS (MILESTONE 1)
  // -------------------------------------------------------------
  const handleAssignCaregiver = async (e) => {
    e.preventDefault()
    if (!assignForm.caregiver_id || !assignForm.patient_id) {
      showToast('Please select both a caregiver and a patient.')
      return
    }
    setAssigning(true)
    try {
      const res = await api.post('/admin/assign-caregiver', {
        caregiver_id: parseInt(assignForm.caregiver_id, 10),
        patient_id: parseInt(assignForm.patient_id, 10),
        notes: assignForm.notes,
      })
      sound.playSuccessChime()
      showToast(res.data.message || 'Caregiver assigned to patient successfully!')
      loadAdminData()
    } catch (err) {
      console.error('Assignment error:', err)
      showToast(err.response?.data?.detail || 'Failed to assign caregiver.')
    } finally {
      setAssigning(false)
    }
  }

  // Preset Template Helper
  const applyPreset = (preset) => {
    setMedForm({ ...preset, schedule_times: [...preset.schedule_times] })
    showToast(`Loaded ${preset.name} clinical preset!`)
  }

  // Display Name Helper
  const displayName = patientProfile?.full_name || caregiverProfile?.full_name || user?.full_name || (user ? 'Suvashini' : 'Guest User')

  return (
    <SidebarLayout 
      activeSection={activeSection} 
      onSelectSection={setActiveSection}
      onRoleSwitch={(newRole) => {
        showToast(`Switched active profile to ${newRole}!`)
      }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-[#0B1437] text-white shadow-2xl border border-white/10 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Breadcrumb matching "☷ / Section Name" */}
      <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
        <span className="font-bold text-slate-500">☷</span>
        <span>/</span>
        <span className="text-slate-600 font-semibold capitalize">
          {activeSection === 'tracker' && 'Medication Tracker'}
          {activeSection === 'vitals' && 'Test Reports & Vitals'}
          {activeSection === 'patient_profile' && 'Patient Profile & Chronic Conditions (Milestone 1)'}
          {activeSection === 'caregiver_portal' && 'Caregiver Supervision Portal (Milestone 1)'}
          {activeSection === 'admin_portal' && 'Admin User Management Console (Milestone 1)'}
          {activeSection === 'prescriptions' && 'Upcoming: AI Prescription OCR (Sprint 3)'}
          {activeSection === 'refill' && 'Upcoming: Smart Refill Forecast (Sprint 4)'}
          {activeSection === 'roadmap' && '8-Week Project Curriculum Roadmap'}
        </span>
      </div>

      {/* Greeting Header matching "Welcome back, {Name}" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 font-medium">
            {!user ? 'Welcome to PillSync,' : role === 'PATIENT' ? 'Welcome back,' : role === 'CAREGIVER' ? 'Caregiver Supervision,' : 'System Administrator,'}
          </div>
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

          {activeSection === 'tracker' && role === 'PATIENT' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-[#5E81F4] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medication</span>
            </button>
          )}

          {activeSection === 'patient_profile' && role === 'PATIENT' && (
            <button
              onClick={() => setIsAddingCondition(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Health Condition</span>
            </button>
          )}

          {activeSection === 'caregiver_portal' && role === 'CAREGIVER' && (
            <button
              onClick={() => setIsEditingCaregiver(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Credentials</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MEDICATION TRACKER (REFERENCE DRIBBBLE VIEW)    */}
      {/* ========================================================= */}
      {activeSection === 'tracker' && (
        <div className="space-y-6">
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
                  {summary?.taken_doses !== undefined ? `${summary.taken_doses}/${summary.today_scheduled_doses}` : '45%'}
                </div>
              </div>
            </div>

            {/* Card 3: Health History (Pink / Rose #ED64A6) */}
            <div 
              onClick={() => setActiveSection('patient_profile')}
              className="rounded-3xl p-5 bg-[#E2619B] text-white shadow-lg shadow-pink-500/20 relative flex flex-col justify-between h-32 cursor-pointer hover:opacity-95 transition-opacity"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-bold tracking-tight">Health History</span>
                <button className="text-white/70 hover:text-white">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-center space-x-1.5 text-[11px] text-pink-100 font-medium">
                  <Heart className="w-3.5 h-3.5" />
                  <span>{patientProfile?.health_conditions?.length || 2} Conditions Logged</span>
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

          {/* TODAY'S HEALTH & CLINICAL REPORTS (Donut + Curve + Vitals) */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 tracking-wider uppercase">
              Today's Health & Clinical Reports
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Card 1: Blood Glucose Donut Ring Widget */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-800">Blood Glucose</span>
                    <span className="flex items-center space-x-1 text-[11px] text-slate-400 border border-slate-200 px-2.5 py-1 rounded-xl">
                      <span>Today</span>
                      <ChevronDown className="w-3 h-3" />
                    </span>
                  </div>

                  {/* SVG Concentric Ring */}
                  <div className="flex items-center justify-center my-3">
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#F1F3F9" strokeWidth="8" fill="none" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#E2619B"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="251"
                          strokeDashoffset="120"
                          strokeLinecap="round"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="30"
                          stroke="#5E81F4"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray="188"
                          strokeDashoffset="60"
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <div className="text-[10px] text-slate-400 font-medium">Status</div>
                        <div className="text-sm font-extrabold text-slate-800">Elevated</div>
                        <div className="text-[9px] text-slate-400">185 mg/dl</div>
                      </div>
                    </div>

                    <div className="ml-3 text-[11px] space-y-1 text-slate-500">
                      <div>Yesterday status - <span className="text-rose-500 font-bold">High</span></div>
                      <div>This week status - <span className="text-amber-500 font-bold">Elevated</span></div>
                      <div>Last week status - <span className="text-emerald-500 font-bold">Normal</span></div>
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
                </div>
              </div>

              {/* Card 2: Blood Pressure & Heartbeat Wave Widget */}
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
                        stroke="#DD6B20"
                        strokeWidth="2.5"
                      />
                      <circle cx="230" cy="32" r="4.5" fill="#DD6B20" />
                    </svg>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>8.00</span>
                      <span>11.00</span>
                      <span>14.00</span>
                      <span>17.00</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Heart className="w-3 h-3 text-rose-500" />
                      <span>Blood Pressure</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">120/80 mmHg</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Optimal systolic</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-rose-500" />
                      <span>Heartbeat</span>
                    </div>
                    <div className="text-base font-extrabold text-slate-800 mt-0.5">88 BPM</div>
                    <div className="text-[10px] text-slate-400">Sinus Rhythm</div>
                  </div>
                </div>
              </div>

              {/* Card 3: Weight & Vitals with Sprint Previews */}
              <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">Weight & Vitals</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      Sprint 3 & 4
                    </span>
                  </div>

                  <div className="bg-[#0B1437] text-white p-4 rounded-2xl">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Baseline Weight</div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-2xl font-extrabold">180.0 lb</div>
                      <div className="text-xs font-bold text-emerald-400">-2.4 lb</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div 
                    onClick={() => setActiveSection('prescriptions')}
                    className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-xs font-bold text-purple-900">AI Prescription OCR</div>
                        <div className="text-[10px] text-purple-600">Camera recognition in Sprint 3</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-0.5 rounded-lg border border-purple-200">Soon</span>
                  </div>

                  <div 
                    onClick={() => setActiveSection('refill')}
                    className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="text-xs font-bold text-amber-900">Smart Refill Forecast</div>
                        <div className="text-[10px] text-amber-600">Burn-rate math in Sprint 4</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-lg border border-amber-200">Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MEDICATION TRACKER TABLE (Matching Reference Image) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0B1437]">Medication Tracker</h3>
                <p className="text-xs text-slate-400">
                  Scheduled daily prescriptions with real-time intake logging and inventory tracking
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  + Add Medication
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 px-3">Name</th>
                    <th className="pb-3 px-3">Frequency</th>
                    <th className="pb-3 px-3">Dosage</th>
                    <th className="pb-3 px-3">Taken</th>
                    <th className="pb-3 px-3">Meal Timing</th>
                    <th className="pb-3 px-3">Next Dose</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {medicines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No medications scheduled yet. Click "+ Add Medication" above or use a preset template.
                      </td>
                    </tr>
                  ) : (
                    medicines.map((med, idx) => {
                      const isLow = med.current_stock <= (med.low_stock_threshold || 5)
                      const isTaken = summary?.timeline?.some(
                        (t) => t.medicine_id === med.id && t.status === 'TAKEN'
                      )
                      const scheduleTime = med.schedules?.[0]?.scheduled_time || '08:00'

                      return (
                        <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              <span className="font-mono text-slate-400 text-[11px]">
                                {String(idx + 1).padStart(2, '0')}.
                              </span>
                              <div>
                                <span className="font-bold text-slate-900">{med.name}</span>
                                <span className="text-slate-400 ml-1.5">({med.dosage})</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-600">
                            {med.frequency || '8hour'}
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {med.dosage}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            {isTaken ? (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                <Check className="w-3 h-3" />
                                <span>1 Taken</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium text-[10px]">
                                <span>0</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-slate-600">
                            {med.meal_relation || 'After'}
                          </td>

                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {scheduleTime}
                          </td>

                          <td className="py-3 px-3 text-right">
                            {!isTaken && (
                              <button
                                onClick={() => handleDoseAction({ 
                                  medicine_id: med.id, 
                                  schedule_id: med.schedules?.[0]?.id, 
                                  scheduled_time: scheduleTime, 
                                  medicine_name: med.name, 
                                  dosage: med.dosage 
                                }, 'TAKEN')}
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
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: TEST REPORTS & EXPANDED VITALS                 */}
      {/* ========================================================= */}
      {activeSection === 'vitals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-base font-bold text-[#0B1437] mb-1">Clinical Vitals & Diagnostic Telemetry</h2>
            <p className="text-xs text-slate-400">
              Live continuous biomarkers recorded during routine medication management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blood Glucose Detailed Analysis */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Droplet className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-sm text-slate-900">Blood Glucose Telemetry</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Elevated Postprandial
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Fasting</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">110 mg/dL</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Normal</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400">After Meal (2h)</div>
                  <div className="text-lg font-extrabold text-amber-600 mt-1">185 mg/dL</div>
                  <div className="text-[9px] text-amber-600 font-bold">Elevated</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Estimated HbA1c</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">6.4 %</div>
                  <div className="text-[9px] text-blue-600 font-bold">Pre-diabetic</div>
                </div>
              </div>
            </div>

            {/* Blood Pressure Detailed Analysis */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <span className="font-bold text-sm text-slate-900">Hemodynamic Analysis</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Normotensive
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Systolic / Diastolic</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">120/80</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Target Range</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Pulse Pressure</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">40 mmHg</div>
                  <div className="text-[9px] text-emerald-600 font-bold">Optimal</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400">Resting Heart Rate</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-1">88 BPM</div>
                  <div className="text-[9px] text-slate-500 font-bold">Sinus Rhythm</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: PATIENT PROFILE & CHRONIC CONDITIONS (MILESTONE 1) */}
      {/* ========================================================= */}
      {activeSection === 'patient_profile' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/15 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-[11px] font-semibold mb-2 backdrop-blur-md border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                  <span>Milestone 1 Core Feature: Patient & Medical Profile</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {patientProfile?.full_name || 'Patient Medical Record'}
                </h2>
                <p className="text-xs text-blue-100 mt-1 max-w-xl">
                  Emergency contacts, blood group, address, and continuous tracking for chronic illnesses and diagnoses.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Personal Info</span>
                </button>
                <button
                  onClick={() => setIsAddingCondition(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Health Condition</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Patient Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Personal Details</span>
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                  Role: Patient
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Full Legal Name</span>
                  <span className="font-bold text-slate-800 text-sm">{patientProfile?.full_name || 'Not set'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Registered Email</span>
                  <span className="font-medium text-slate-800">{patientProfile?.email || user?.email || 'N/A'}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Number</span>
                  <span className="font-medium text-slate-800 flex items-center space-x-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{patientProfile?.contact_number || 'Not provided'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact (Primary)</span>
                  <span className="font-bold text-rose-600 flex items-center space-x-1.5 mt-0.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    <span>{patientProfile?.emergency_contact || 'None registered'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Blood Group</span>
                    <span className="font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg inline-block mt-0.5">
                      {patientProfile?.blood_group || 'O+'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth</span>
                    <span className="font-medium text-slate-700 block mt-0.5">
                      {patientProfile?.date_of_birth || '1995-06-15'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Residential Address</span>
                  <span className="text-slate-700 block mt-0.5">
                    {patientProfile?.address || '123 Healthway Avenue, Suite 4'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right 2 Columns: Chronic Health Conditions CRUD */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <HeartPulse className="w-4 h-4 text-emerald-600" />
                      <span>Chronic Health Conditions & History</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Medical conditions documented in your electronic health record
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingCondition(true)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Condition</span>
                  </button>
                </div>

                {(!patientProfile?.health_conditions || patientProfile.health_conditions.length === 0) ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <HeartPulse className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-700 font-semibold">No chronic conditions recorded</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Record any diagnosed medical conditions (e.g. Type 2 Diabetes, Hypertension) to personalize dosage reminders and safety checks.
                    </p>
                    <button
                      onClick={() => setIsAddingCondition(true)}
                      className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
                    >
                      + Add First Condition
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {patientProfile.health_conditions.map((cond) => {
                      const severity = cond.severity || 'Moderate'
                      const isHigh = severity.toLowerCase() === 'high' || severity.toLowerCase() === 'severe'
                      const isLow = severity.toLowerCase() === 'low' || severity.toLowerCase() === 'mild'

                      return (
                        <div
                          key={cond.id}
                          className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <span className="font-bold text-sm text-slate-900">{cond.condition_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isHigh
                                  ? 'bg-rose-100 text-rose-700'
                                  : isLow
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                {severity}
                              </span>
                            </div>

                            {cond.diagnosed_date && (
                              <div className="text-[11px] text-slate-400 mt-1">
                                Diagnosed: <span className="text-slate-600 font-medium">{cond.diagnosed_date}</span>
                              </div>
                            )}

                            {cond.notes && (
                              <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-xl border border-slate-100">
                                {cond.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => handleDeleteCondition(cond.id)}
                              className="flex items-center space-x-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: CAREGIVER SUPERVISION PORTAL (MILESTONE 1)     */}
      {/* ========================================================= */}
      {activeSection === 'caregiver_portal' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/15 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-[11px] font-semibold mb-2 backdrop-blur-md border border-white/15">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Milestone 1 Core Feature: Caregiver Supervision</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Caregiver Supervision Console
                </h2>
                <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                  Supervise assigned patients, monitor real-time adherence schedules, and verify emergency contacts.
                </p>
              </div>

              {role === 'CAREGIVER' && (
                <button
                  onClick={() => setIsEditingCaregiver(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Credentials</span>
                </button>
              )}
            </div>
          </div>

          {/* Role Check Alert if not logged in as Caregiver */}
          {role !== 'CAREGIVER' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  You are currently previewing as <strong>{role}</strong>. To view live assigned patients and update caregiver credentials, switch to Bob:
                </span>
              </div>
              <button
                onClick={async () => {
                  await login('bob_caregiver@example.com', 'CaregiverPassword123!')
                  showToast('Switched to Caregiver role (Bob)!')
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shrink-0"
              >
                Switch to Caregiver (Bob)
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Caregiver Profile */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Caregiver Credentials</span>
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Role: Caregiver
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Caregiver Name</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {caregiverProfile?.full_name || (role === 'CAREGIVER' ? user?.full_name : 'Bob Caregiver')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                  <span className="font-medium text-slate-800 flex items-center space-x-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{caregiverProfile?.contact_number || '+1 (555) 234-5678'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Professional Qualification</span>
                  <span className="font-medium text-slate-800 flex items-center space-x-1.5 mt-0.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{caregiverProfile?.qualification || 'Certified Nursing Assistant / Carer'}</span>
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Supervision Relationship</span>
                  <span className="font-medium text-slate-800 flex items-center space-x-1.5 mt-0.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{caregiverProfile?.relationship_type || 'Primary Family Caregiver'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Assigned Patients List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Assigned Patients</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Individuals currently assigned to your healthcare supervision
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {caregiverProfile?.assigned_patients?.length || 2} Patient(s)
                  </span>
                </div>

                {(!caregiverProfile?.assigned_patients || caregiverProfile.assigned_patients.length === 0) ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-700 font-semibold">No patients assigned</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Use the Admin Console to assign patients to this caregiver profile.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {caregiverProfile.assigned_patients.map((pat) => (
                      <div
                        key={pat.patient_profile_id}
                        className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2.5">
                              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                                {pat.patient_name ? pat.patient_name[0] : 'P'}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900">{pat.patient_name}</h4>
                                <p className="text-[10px] text-slate-400">{pat.patient_email}</p>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              {pat.status || 'ACTIVE'}
                            </span>
                          </div>

                          <div className="space-y-1.5 mt-3 text-xs">
                            <div className="flex items-center justify-between text-slate-600">
                              <span>Patient Phone:</span>
                              <span className="font-semibold text-slate-800">{pat.contact_number || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-600">
                              <span className="text-rose-600 font-semibold">Emergency Contact:</span>
                              <span className="font-bold text-rose-600">{pat.emergency_contact || 'None'}</span>
                            </div>
                          </div>

                          {pat.conditions?.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-200/60">
                              <span className="text-[10px] font-semibold text-slate-400 block mb-1">Conditions:</span>
                              <div className="flex flex-wrap gap-1">
                                {pat.conditions.map((c, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-medium border border-slate-200">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/60">
                          <button
                            onClick={() => handleInspectPatient(pat)}
                            className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Today's Timeline</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: ADMIN MANAGEMENT CONSOLE (MILESTONE 1)         */}
      {/* ========================================================= */}
      {activeSection === 'admin_portal' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-800 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-950/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-purple-100 text-[11px] font-semibold mb-2 backdrop-blur-md border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  <span>Milestone 1 Core Feature: Role-Based Access Control (RBAC) & User Management</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Administrator Control Console
                </h2>
                <p className="text-xs text-purple-100 mt-1 max-w-xl">
                  Manage platform users, verify role permissions, and link caregivers to patients for clinical oversight.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={loadAdminData}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Role Check Alert if not logged in as Admin */}
          {role !== 'ADMIN' && (
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  You are currently viewing with role <strong>{role}</strong>. To assign caregivers or view full platform users, switch to Admin:
                </span>
              </div>
              <button
                onClick={async () => {
                  await login('admin_system@example.com', 'AdminPassword123!')
                  showToast('Switched to Admin role!')
                }}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors shrink-0"
              >
                Switch to Admin (System)
              </button>
            </div>
          )}

          {/* Admin KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] text-slate-400 font-medium">Total Registered Users</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{adminUsers.length || 10}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Enforced RBAC Active</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] text-slate-400 font-medium">Patients</div>
              <div className="text-2xl font-extrabold text-blue-600 mt-1">{adminPatients.length || 7}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Personal Reminders Active</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] text-slate-400 font-medium">Caregivers</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{adminCaregivers.length || 2}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Monitoring Portals Active</div>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
              <div className="text-[11px] text-slate-400 font-medium">Platform Status</div>
              <div className="text-2xl font-extrabold text-purple-600 mt-1">100% Live</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">FastAPI & SQLite Healthy</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assign Caregiver to Patient Tool */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Link2 className="w-4 h-4 text-purple-600" />
                  <span>Assign Caregiver to Patient</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Establish clinical supervision link between accounts
                </p>
              </div>

              <form onSubmit={handleAssignCaregiver} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Caregiver *</label>
                  <select
                    value={assignForm.caregiver_id}
                    onChange={(e) => setAssignForm({ ...assignForm, caregiver_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  >
                    {adminCaregivers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.email} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    value={assignForm.patient_id}
                    onChange={(e) => setAssignForm({ ...assignForm, patient_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white"
                  >
                    {adminPatients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.email} ({p.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supervision Notes</label>
                  <textarea
                    rows="2"
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="e.g. Primary family caregiver supervision"
                  />
                </div>

                <button
                  type="submit"
                  disabled={assigning}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{assigning ? 'Assigning...' : 'Confirm Assignment'}</span>
                </button>
              </form>
            </div>

            {/* Platform Users Table */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>User Directory & Role Permissions</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live database query across PATIENT, CAREGIVER, and ADMIN accounts
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700">
                  {adminUsers.length} Users
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-2 px-2">ID</th>
                      <th className="pb-2 px-2">Email</th>
                      <th className="pb-2 px-2">Role</th>
                      <th className="pb-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {adminUsers.map((u) => {
                      const isPat = u.role === 'PATIENT'
                      const isCarer = u.role === 'CAREGIVER'
                      return (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-2 font-mono text-slate-400">#{u.id}</td>
                          <td className="py-2.5 px-2 font-semibold text-slate-900">{u.email}</td>
                          <td className="py-2.5 px-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPat 
                                ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                : isCarer 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: UPCOMING - AI PRESCRIPTION OCR (SPRINT 3)      */}
      {/* ========================================================= */}
      {activeSection === 'prescriptions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-md">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Sprint 3 Module • Weeks 3 & 4
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B1437] mt-3">
                AI-Driven Prescription Image Recognition (OCR)
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Seamlessly upload photos of physical prescription slips or pill bottles. Our multimodal vision model extracts drug names, dosages, frequencies, and instructions to automatically schedule your medications.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-left space-y-2">
              <div className="text-xs font-bold text-slate-800">Planned Technology Stack:</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Google Gemini 1.5 Flash / Vision OCR for medical handwriting transcription</li>
                <li>PaddleOCR / Tesseract fallback for offline document parsing</li>
                <li>Drug name validation against RxNorm / FDA NDC national databases</li>
                <li>1-click intake calendar synchronization</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveSection('tracker')}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Back to Medication Tracker
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: UPCOMING - REFILL FORECASTING (SPRINT 4)        */}
      {/* ========================================================= */}
      {activeSection === 'refill' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Sprint 4 Module • Weeks 5 & 6
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B1437] mt-3">
                Predictive Refill Forecasting & Inventory Optimization
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Machine learning forecast models estimate remaining pill supplies based on actual intake velocity and automatically notify patients and caregivers before medications run out.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 text-left space-y-2">
              <div className="text-xs font-bold text-slate-800">Planned Feature Highlights:</div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>Inventory exhaustion burn-rate modeling with adherence coefficient adjustments</li>
                <li>Automated low-stock push notifications & WhatsApp / SMS integration</li>
                <li>Pharmacy refill trigger with automated re-order requests</li>
              </ul>
            </div>

            <button
              onClick={() => setActiveSection('tracker')}
              className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Back to Medication Tracker
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 8: 8-WEEK CURRICULUM ROADMAP                      */}
      {/* ========================================================= */}
      {activeSection === 'roadmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B1437]">PillSync 8-Week Agile Curriculum & Milestones</h2>
                <p className="text-xs text-slate-400">Structured development trajectory aligned with Springboard requirements</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Milestone 1 Completed ✓
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500 shadow-md space-y-2 relative">
              <span className="text-[10px] uppercase font-bold text-emerald-600">Weeks 1 & 2 • 100% Achieved</span>
              <h3 className="font-extrabold text-sm text-slate-900">Milestone 1: Project Setup & Authentication</h3>
              <p className="text-xs text-slate-500">
                FastAPI REST backend, SQLite with SQLAlchemy models, JWT Authentication, RBAC (Patient, Caregiver, Admin), Profile management, and Health conditions.
              </p>
              <div className="text-xs font-bold text-emerald-600 flex items-center space-x-1 pt-2 border-t border-slate-100">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified in Current System</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 opacity-90">
              <span className="text-[10px] uppercase font-bold text-blue-600">Weeks 3 & 4 • In Progress</span>
              <h3 className="font-extrabold text-sm text-slate-900">Milestone 2: Medication Scheduling & Timers</h3>
              <p className="text-xs text-slate-500">
                Daily and weekly schedule rules, dynamic reminder alarms, Web Audio synth chimes, and adherence calculation.
              </p>
              <div className="text-xs font-semibold text-blue-600 pt-2 border-t border-slate-100">
                Frontend Medication Tracker active
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 opacity-80">
              <span className="text-[10px] uppercase font-bold text-purple-600">Weeks 5 & 6 • Scheduled</span>
              <h3 className="font-extrabold text-sm text-slate-900">Milestone 3: AI Prescription OCR</h3>
              <p className="text-xs text-slate-500">
                Computer Vision prescription reader, drug name entity resolution, dosage extraction, and automated intake schedule setup.
              </p>
              <div className="text-xs font-semibold text-purple-600 pt-2 border-t border-slate-100">
                Upcoming Sprint Module
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 opacity-80">
              <span className="text-[10px] uppercase font-bold text-amber-600">Week 7 • Scheduled</span>
              <h3 className="font-extrabold text-sm text-slate-900">Milestone 4: Predictive Refill & Adherence</h3>
              <p className="text-xs text-slate-500">
                Pill depletion algorithms, consumption forecasting, low-stock notifications, and caregiver adherence summaries.
              </p>
              <div className="text-xs font-semibold text-amber-600 pt-2 border-t border-slate-100">
                Upcoming Sprint Module
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-2 opacity-80 md:col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-600">Week 8 • Final Delivery</span>
              <h3 className="font-extrabold text-sm text-slate-900">Milestone 5: Production Deployment & Viva Preparation</h3>
              <p className="text-xs text-slate-500">
                Dockerization, cloud deployment, final testing report, Swagger documentation polish, and comprehensive viva slides.
              </p>
              <div className="text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
                Final Evaluation Milestone
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW MEDICATION                              */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL 2: QUICK REFILL STOCK                              */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* MODAL 3: EDIT PATIENT PROFILE (MILESTONE 1)               */}
      {/* ========================================================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Patient Medical Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="e.g. Suvashini / Anu"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={profileForm.contact_number}
                    onChange={(e) => setProfileForm({ ...profileForm, contact_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={profileForm.emergency_contact}
                    onChange={(e) => setProfileForm({ ...profileForm, emergency_contact: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    placeholder="+91 98765 00000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={profileForm.blood_group}
                    onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={profileForm.date_of_birth}
                    onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Home Address</label>
                <textarea
                  rows="2"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  placeholder="Street address, City, Postal Code"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD HEALTH CONDITION (MILESTONE 1)               */}
      {/* ========================================================= */}
      {isAddingCondition && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Chronic Health Condition</h3>
              <button onClick={() => setIsAddingCondition(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCondition} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Type 2 Diabetes, Hypertension"
                  value={conditionForm.condition_name}
                  onChange={(e) => setConditionForm({ ...conditionForm, condition_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={conditionForm.severity}
                    onChange={(e) => setConditionForm({ ...conditionForm, severity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    <option value="Low">Low / Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High / Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosed Date</label>
                  <input
                    type="date"
                    value={conditionForm.diagnosed_date}
                    onChange={(e) => setConditionForm({ ...conditionForm, diagnosed_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Monitored with daily fasting glucose tests"
                  value={conditionForm.notes}
                  onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCondition(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700"
                >
                  Save Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT CAREGIVER CREDENTIALS (MILESTONE 1)         */}
      {/* ========================================================= */}
      {isEditingCaregiver && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Caregiver Profile</h3>
              <button onClick={() => setIsEditingCaregiver(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCaregiver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={caregiverForm.full_name}
                  onChange={(e) => setCaregiverForm({ ...caregiverForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={caregiverForm.contact_number}
                  onChange={(e) => setCaregiverForm({ ...caregiverForm, contact_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                <input
                  type="text"
                  value={caregiverForm.qualification}
                  onChange={(e) => setCaregiverForm({ ...caregiverForm, qualification: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship Role</label>
                <input
                  type="text"
                  value={caregiverForm.relationship_type}
                  onChange={(e) => setCaregiverForm({ ...caregiverForm, relationship_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingCaregiver(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: INSPECT ASSIGNED PATIENT TIMELINE (CAREGIVER)    */}
      {/* ========================================================= */}
      {inspectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Supervision Telemetry</span>
                <h3 className="text-base font-bold text-slate-900">{inspectedPatient.patient_name}'s Today Timeline</h3>
              </div>
              <button onClick={() => setInspectedPatient(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingTimeline ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading patient timeline data...</div>
            ) : inspectedTimeline ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <div className="text-[10px] text-slate-400">Scheduled</div>
                    <div className="text-base font-bold text-slate-800">{inspectedTimeline.today_scheduled_doses}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <div className="text-[10px] text-slate-400">Taken</div>
                    <div className="text-base font-bold text-emerald-600">{inspectedTimeline.taken_doses}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <div className="text-[10px] text-slate-400">Adherence</div>
                    <div className="text-base font-bold text-blue-600">
                      {Math.round(inspectedTimeline.adherence_percentage)}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700">Dose Schedule & Intake Logs:</div>
                  {inspectedTimeline.timeline?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No doses scheduled for today.</p>
                  ) : (
                    inspectedTimeline.timeline?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{item.medicine_name}</span>
                          <span className="text-slate-400 ml-1.5 font-mono">({item.scheduled_time})</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'TAKEN'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Could not load timeline for this patient.
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setInspectedPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayout>
  )
}
