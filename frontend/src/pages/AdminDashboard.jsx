import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { 
  ShieldCheck, Users, UserCheck, Activity, Link2, CheckCircle2, 
  AlertCircle, RefreshCw, Calendar, Mail, Phone, HeartHandshake 
} from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [patients, setPatients] = useState([])
  const [caregivers, setCaregivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignLoading, setAssignLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Assignment Form State
  const [assignmentForm, setAssignmentForm] = useState({
    caregiver_id: '',
    patient_id: '',
    notes: 'Primary family caregiver assigned by Admin',
  })

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersRes, patientsRes, caregiversRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/patients'),
        api.get('/admin/caregivers'),
      ])
      setUsers(usersRes.data)
      setPatients(patientsRes.data)
      setCaregivers(caregiversRes.data)

      // Set default dropdown selections if available
      if (caregiversRes.data.length > 0 && !assignmentForm.caregiver_id) {
        setAssignmentForm((prev) => ({ ...prev, caregiver_id: caregiversRes.data[0].id }))
      }
      if (patientsRes.data.length > 0 && !assignmentForm.patient_id) {
        setAssignmentForm((prev) => ({ ...prev, patient_id: patientsRes.data[0].id }))
      }
    } catch (err) {
      console.error('Failed to load admin data:', err)
      setError('Could not fetch platform data. Ensure you are signed in as an Administrator.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assignmentForm.caregiver_id || !assignmentForm.patient_id) {
      setError('Please select both a caregiver and a patient.')
      return
    }

    setAssignLoading(true)
    setError('')
    setSuccessMsg('')
    try {
      const res = await api.post('/admin/assign-caregiver', {
        caregiver_id: parseInt(assignmentForm.caregiver_id),
        patient_id: parseInt(assignmentForm.patient_id),
        notes: assignmentForm.notes,
      })
      setSuccessMsg(res.data.message || 'Caregiver assigned to patient successfully!')
      loadData()
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err) {
      console.error('Caregiver assignment error:', err)
      setError(err.response?.data?.detail || 'Failed to assign caregiver.')
    } finally {
      setAssignLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading administrator control center...</p>
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
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-md shadow-purple-500/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-100 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator Portal • Milestone 1</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Platform Administration
            </h1>
            <p className="text-xs text-purple-100 mt-1">
              Signed in as {user?.email} • Managing roles, users & caregiver assignments
            </p>
          </div>
          <button
            onClick={loadData}
            className="self-start sm:self-auto flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
            <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Registered Patients</p>
            <h3 className="text-2xl font-bold text-slate-900">{patients.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Caregivers</p>
            <h3 className="text-2xl font-bold text-slate-900">{caregivers.length}</h3>
          </div>
        </div>
      </div>

      {/* Caregiver Assignment Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Link2 className="w-4 h-4 text-purple-600" />
            <span>Assign Caregiver to Patient</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Link a registered caregiver to a patient so they can monitor medications and health conditions
          </p>
        </div>

        <form onSubmit={handleAssign} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Caregiver</label>
            <select
              value={assignmentForm.caregiver_id}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, caregiver_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
            >
              {caregivers.length === 0 ? (
                <option value="">No caregivers registered</option>
              ) : (
                caregivers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} ({c.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Select Patient</label>
            <select
              value={assignmentForm.patient_id}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, patient_id: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
            >
              {patients.length === 0 ? (
                <option value="">No patients registered</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Assignment Notes</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. Primary Caregiver"
                value={assignmentForm.notes}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              <button
                type="submit"
                disabled={assignLoading || caregivers.length === 0 || patients.length === 0}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shrink-0 transition-colors disabled:opacity-50"
              >
                {assignLoading ? 'Linking...' : 'Assign'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* User Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Platform User Directory</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live view of all registered accounts and role assignments
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600">
            {users.length} Users
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">#{u.id}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{u.full_name}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : u.role === 'CAREGIVER'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400 text-[11px]">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
