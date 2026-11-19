import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import CaregiverDashboard from './pages/CaregiverDashboard'
import AdminDashboard from './pages/AdminDashboard'

function AppRoutes() {
  const location = useLocation()
  
  // Public auth pages only for explicit /login and /register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/patient" replace />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <div>
              PillSync © 2026 • AI-Driven Medication Recognition & Personalized Reminder Platform • Milestone 1
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FastAPI & SQLite Live</span>
              </span>
              <a
                href="http://127.0.0.1:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Swagger Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Primary Clinical Dashboard Layout (Matches reference image directly)
  return (
    <Routes>
      <Route path="/" element={<PatientDashboard />} />
      <Route path="/dashboard" element={<PatientDashboard />} />
      <Route path="/patient" element={<PatientDashboard />} />

      <Route element={<ProtectedRoute allowedRoles={['CAREGIVER', 'ADMIN']} />}>
        <Route path="/caregiver" element={<CaregiverDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Fallback to Patient Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
