import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Pill, LogOut, User, Shield, Activity, UserCheck, ShieldCheck, Sparkles, Map } from 'lucide-react'
import ProjectRoadmapModal from './ProjectRoadmapModal'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    const role = user.role?.toUpperCase()
    if (role === 'ADMIN') return '/admin'
    if (role === 'CAREGIVER') return '/caregiver'
    return '/patient'
  }

  const getRoleIcon = () => {
    const role = user?.role?.toUpperCase()
    if (role === 'ADMIN') return ShieldCheck
    if (role === 'CAREGIVER') return UserCheck
    return Activity
  }

  const RoleIcon = getRoleIcon()

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to={getDashboardPath()} className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl text-slate-900 tracking-tight">PillSync</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center space-x-1">
                  <span>Milestone 1 ✓</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Intelligent Medication Tracking Platform</p>
            </div>
          </Link>

          {/* Navigation & User Status */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Feature Directory / Roadmap Button */}
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 hover:border-blue-300 text-blue-700 hover:text-blue-800 text-xs font-semibold shadow-xs transition-all"
              title="View full project feature roadmap"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Project Roadmap & Features</span>
              <span className="sm:hidden">Roadmap</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Dashboard Nav Link */}
                <Link
                  to={getDashboardPath()}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                    location.pathname === getDashboardPath()
                      ? 'bg-slate-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                </Link>

                {/* User Identity Pill */}
                <div className="hidden sm:flex items-center space-x-2 pl-3 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <RoleIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{user.full_name || user.email}</p>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'CAREGIVER'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Project Roadmap Modal */}
      <ProjectRoadmapModal isOpen={isRoadmapOpen} onClose={() => setIsRoadmapOpen(false)} />
    </>
  )
}
