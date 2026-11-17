import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { 
  UserCheck, Users, Phone, HeartPulse, Edit3, Save, X, 
  AlertCircle, CheckCircle2, Shield, Calendar, Award, HeartHandshake, User 
} from 'lucide-react'

export default function CaregiverDashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    full_name: '',
    contact_number: '',
    qualification: '',
    relationship_type: '',
  })

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/profiles/caregiver')
      setProfile(response.data)
      setEditForm({
        full_name: response.data.full_name || '',
        contact_number: response.data.contact_number || '',
        qualification: response.data.qualification || '',
        relationship_type: response.data.relationship_type || '',
      })
    } catch (err) {
      console.error('Failed to load caregiver profile:', err)
      setError('Could not load caregiver profile details from server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.put('/profiles/caregiver', editForm)
      setProfile(res.data)
      setIsEditing(false)
      setSuccessMsg('Caregiver profile updated!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Update caregiver error:', err)
      setError('Failed to update caregiver profile.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading caregiver dashboard...</p>
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
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md shadow-emerald-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Caregiver Monitoring Portal • Milestone 1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Welcome, {profile?.full_name || user?.full_name || 'Caregiver'}
            </h1>
            <p className="text-xs text-emerald-100 mt-1">
              Active Monitoring: {profile?.assigned_patients?.length || 0} Assigned Patient(s)
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Caregiver Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Caregiver Credentials</span>
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
              Role: Caregiver
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Full Name</span>
              <span className="font-semibold text-slate-800">{profile?.full_name || 'Not provided'}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Contact Number</span>
              <span className="font-medium text-slate-800 flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{profile?.contact_number || 'None'}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Qualification / Title</span>
              <span className="font-medium text-slate-800 flex items-center space-x-1 mt-0.5">
                <Award className="w-3 h-3 text-emerald-600" />
                <span>{profile?.qualification || 'Registered Caregiver'}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Relationship Type</span>
              <span className="font-medium text-slate-800 flex items-center space-x-1 mt-0.5">
                <HeartHandshake className="w-3 h-3 text-emerald-600" />
                <span>{profile?.relationship_type || 'Primary Caregiver'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Columns: Assigned Patients List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Assigned Patients</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Patients assigned to your supervision by the Administrator
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {profile?.assigned_patients?.length || 0} Patient(s)
              </span>
            </div>

            {profile?.assigned_patients?.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">No patients assigned yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                  When an administrator assigns a patient to your care, their medical conditions, emergency contacts, and schedules will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile?.assigned_patients?.map((pat) => (
                  <div
                    key={pat.patient_profile_id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {pat.patient_name ? pat.patient_name[0] : 'P'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{pat.patient_name}</h3>
                            <p className="text-[10px] text-slate-400">{pat.patient_email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {pat.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="space-y-1.5 mt-3 text-[11px]">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Patient Contact:</span>
                          <span className="font-medium text-slate-800">{pat.contact_number || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-rose-600 font-medium">Emergency Phone:</span>
                          <span className="font-bold text-rose-600">{pat.emergency_contact || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Conditions list */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                        <span className="text-[10px] font-semibold text-slate-400 block mb-1">Diagnosed Conditions:</span>
                        {pat.conditions?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {pat.conditions.map((cond, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-medium">
                                {cond}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No chronic conditions registered</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Assigned: {new Date(pat.assigned_at).toLocaleDateString()}</span>
                      <span className="text-emerald-700 font-semibold">Active Care</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Edit Caregiver Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editForm.contact_number}
                  onChange={(e) => setEditForm({ ...editForm, contact_number: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Qualification / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Registered Nurse, Family Caregiver"
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Relationship to Patients</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Caregiver, Guardian, Spouse"
                  value={editForm.relationship_type}
                  onChange={(e) => setEditForm({ ...editForm, relationship_type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
