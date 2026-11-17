import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { 
  User, Phone, HeartPulse, Plus, Trash2, Edit3, Save, X, 
  AlertCircle, CheckCircle2, Shield, Calendar, Clock, MapPin, Droplet 
} from 'lucide-react'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit Profile Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    contact_number: '',
    emergency_contact: '',
    blood_group: '',
    address: '',
    date_of_birth: '',
  })

  // Add Health Condition Modal State
  const [isAddingCondition, setIsAddingCondition] = useState(false)
  const [conditionForm, setConditionForm] = useState({
    condition_name: '',
    severity: 'Moderate',
    diagnosed_date: '',
    notes: '',
  })

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/profiles/patient')
      setProfile(response.data)
      setEditForm({
        full_name: response.data.full_name || '',
        contact_number: response.data.contact_number || '',
        emergency_contact: response.data.emergency_contact || '',
        blood_group: response.data.blood_group || '',
        address: response.data.address || '',
        date_of_birth: response.data.date_of_birth || '',
      })
    } catch (err) {
      console.error('Failed to load patient profile:', err)
      setError('Could not load profile details from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.put('/profiles/patient', editForm)
      setProfile(res.data)
      setIsEditingProfile(false)
      setSuccessMsg('Profile updated successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Update profile error:', err)
      setError('Failed to update profile.')
    }
  }

  const handleAddCondition = async (e) => {
    e.preventDefault()
    if (!conditionForm.condition_name.trim()) return
    setError('')
    try {
      await api.post('/profiles/patient/conditions', conditionForm)
      setIsAddingCondition(false)
      setConditionForm({ condition_name: '', severity: 'Moderate', diagnosed_date: '', notes: '' })
      fetchProfile()
      setSuccessMsg('Health condition added!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Add condition error:', err)
      setError('Failed to record health condition.')
    }
  }

  const handleDeleteCondition = async (conditionId) => {
    try {
      await api.delete(`/profiles/patient/conditions/${conditionId}`)
      setProfile((prev) => ({
        ...prev,
        health_conditions: prev.health_conditions.filter((c) => c.id !== conditionId),
      }))
      setSuccessMsg('Health condition removed.')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error('Delete condition error:', err)
      setError('Failed to delete condition.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading patient dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {error && (
        <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md shadow-blue-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Patient Portal • Milestone 1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Hello, {profile?.full_name || user?.full_name || 'Patient'}
            </h1>
            <p className="text-xs text-blue-100 mt-1">
              Registered Email: {profile?.email || user?.email}
            </p>
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Profile Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Personal Details</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
              Role: Patient
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-800">{profile?.full_name || 'Not provided'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Number</span>
                <span className="font-medium text-slate-800 flex items-center space-x-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{profile?.contact_number || 'None'}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Blood Group</span>
                <span className="font-medium text-slate-800 flex items-center space-x-1 mt-0.5">
                  <Droplet className="w-3 h-3 text-rose-500" />
                  <span>{profile?.blood_group || 'Not set'}</span>
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
              <span className="font-semibold text-rose-600 flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-rose-500" />
                <span>{profile?.emergency_contact || 'None registered'}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Address</span>
              <span className="font-medium text-slate-700 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{profile?.address || 'No address added'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns (Span 2): Health Conditions Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" />
                  <span>Medical & Health Conditions</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Manage chronic conditions to organize future prescriptions
                </p>
              </div>
              <button
                onClick={() => setIsAddingCondition(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Condition</span>
              </button>
            </div>

            {profile?.health_conditions?.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <HeartPulse className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">No health conditions recorded yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click 'Add Condition' to record conditions like Hypertension or Diabetes.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile?.health_conditions?.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between space-y-2 text-xs hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{c.condition_name}</h3>
                        {c.diagnosed_date && (
                          <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>Diagnosed: {c.diagnosed_date}</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          c.severity === 'Severe'
                            ? 'bg-rose-100 text-rose-700'
                            : c.severity === 'Mild'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </div>

                    {c.notes && (
                      <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-100">
                        {c.notes}
                      </p>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteCondition(c.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Delete Condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Milestone 2 Upcoming Module Preview */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Sprint 2 Preview (Weeks 3 & 4)
              </span>
              <span className="text-xs text-slate-400">Medicine Reminders</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">
              Prescription & Medicine Scheduling Coming Up
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Once Milestone 1 is evaluated, your daily medicine schedules, intake logs (Taken / Missed / Snooze), and automated reminders will appear here.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit Patient Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editForm.contact_number}
                    onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Blood Group</label>
                  <input
                    type="text"
                    placeholder="e.g. O+, A+, B+"
                    value={editForm.blood_group}
                    onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={editForm.emergency_contact}
                  onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Address</label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Health Condition Modal */}
      {isAddingCondition && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Add Medical Condition</h3>
              <button onClick={() => setIsAddingCondition(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCondition} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Condition Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hypertension, Diabetes Type 2, Thyroid"
                  value={conditionForm.condition_name}
                  onChange={(e) => setConditionForm({ ...conditionForm, condition_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Severity</label>
                  <select
                    value={conditionForm.severity}
                    onChange={(e) => setConditionForm({ ...conditionForm, severity: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Diagnosed Date</label>
                  <input
                    type="date"
                    value={conditionForm.diagnosed_date}
                    onChange={(e) => setConditionForm({ ...conditionForm, diagnosed_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Doctor's Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prescribed daily monitoring"
                  value={conditionForm.notes}
                  onChange={(e) => setConditionForm({ ...conditionForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCondition(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save Condition</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
