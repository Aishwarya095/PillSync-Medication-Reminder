import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HealthStatus from './components/HealthStatus'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import CaregiverDashboard from './pages/CaregiverDashboard'
import AdminDashboard from './pages/AdminDashboard'

// Helper component to redirect authenticated users to their specific dashboard
function DashboardRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const role = user.role?.toUpperCase()
  if (role === 'ADMIN') return <Navigate to="/admin" replace />
  if (role === 'CAREGIVER') return <Navigate to="/caregiver" replace />
  return <Navigate to="/patient" replace />
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* System Heartbeat & API Health Indicator */}
        <HealthStatus />

        {/* Application Navigation Routes */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/" element={<DashboardRedirect />} />

          {/* Protected Patient Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
            <Route path="/patient" element={<PatientDashboard />} />
          </Route>

          {/* Protected Caregiver Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CAREGIVER']} />}>
            <Route path="/caregiver" element={<CaregiverDashboard />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          PillSync © 2026 • AI-Driven Medication Recognition & Personalized Reminder Platform • Milestone 1
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
