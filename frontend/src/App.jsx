import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PatientDashboard from './pages/PatientDashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PatientDashboard />} />
          <Route path="/dashboard" element={<PatientDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/login" element={<PatientDashboard />} />
          <Route path="/register" element={<PatientDashboard />} />
          <Route path="/caregiver" element={<PatientDashboard />} />
          <Route path="/admin" element={<PatientDashboard />} />
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
