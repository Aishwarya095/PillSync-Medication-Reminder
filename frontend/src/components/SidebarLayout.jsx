import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sound } from '../utils/sound'
import { 
  Pill, LayoutDashboard, FileText, History, TrendingUp, ShieldAlert, 
  Settings, LogOut, Search, Bell, Menu, X, CheckCircle2, Sparkles, 
  UserCheck, ShieldCheck, Camera, Activity, HeartPulse, Zap, Users,
  Check, ArrowRight, Shield
} from 'lucide-react'
import ProjectRoadmapModal from './ProjectRoadmapModal'

export default function SidebarLayout({ children, activeSection, onSelectSection, onRoleSwitch }) {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const role = user?.role?.toUpperCase() || 'PATIENT'
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'

  // Seamless 1-Click Role Switcher for Milestone 1 Review
  const handleRoleSwitch = async (targetRole) => {
    if (role === targetRole) return
    setSwitchingRole(true)
    try {
      if (targetRole === 'PATIENT') {
        await login('anu@gmail.com', 'Password123!')
        if (onSelectSection) onSelectSection('tracker')
      } else if (targetRole === 'CAREGIVER') {
        await login('bob_caregiver@example.com', 'CaregiverPassword123!')
        if (onSelectSection) onSelectSection('caregiver_portal')
      } else if (targetRole === 'ADMIN') {
        await login('admin_system@example.com', 'AdminPassword123!')
        if (onSelectSection) onSelectSection('admin_portal')
      }
      sound.playSuccessChime()
      if (onRoleSwitch) onRoleSwitch(targetRole)
    } catch (err) {
      console.error('Role switch failed:', err)
    } finally {
      setSwitchingRole(false)
      setMobileMenuOpen(false)
    }
  }

  // Navigation Links tailored to Milestone 1 & Reference Design
  const navItems = [
    {
      group: 'Clinical Dashboard',
      items: [
        { id: 'tracker', label: 'Medication Tracker', icon: LayoutDashboard },
        { id: 'vitals', label: 'Test Reports & Vitals', icon: Activity },
      ],
    },
    {
      group: 'Milestone 1 Core Profiles',
      items: [
        { 
          id: 'patient_profile', 
          label: 'Patient Profile & Conditions', 
          icon: HeartPulse,
          badge: role === 'PATIENT' ? 'Active' : null,
          roleTarget: 'PATIENT'
        },
        { 
          id: 'caregiver_portal', 
          label: 'Caregiver Supervision', 
          icon: UserCheck,
          badge: role === 'CAREGIVER' ? 'Active' : null,
          roleTarget: 'CAREGIVER'
        },
        { 
          id: 'admin_portal', 
          label: 'Admin User Management', 
          icon: ShieldCheck,
          badge: role === 'ADMIN' ? 'Active' : null,
          roleTarget: 'ADMIN'
        },
      ],
    },
    {
      group: 'Curriculum & Progress',
      items: [
        { id: 'roadmap', label: '8-Week Project Roadmap', icon: TrendingUp, badge: 'M1 Done' },
      ],
    },
    {
      group: 'Upcoming Modules (Preview)',
      items: [
        { id: 'prescriptions', label: 'Prescriptions (AI OCR)', icon: Camera, badge: 'Sprint 3' },
        { id: 'refill', label: 'Refill Forecast (ML)', icon: Zap, badge: 'Sprint 4' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F7FE] flex">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Dark Sidebar (Matches reference image #0B1437) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1437] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header matching "+ PillSync" with Green Cross */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
            <Link to="/patient" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                +
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">PillSync</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Role Switcher Inside Mobile / Top Sidebar */}
          <div className="px-4 pt-4 pb-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-2">
              Active Role Profile
            </div>
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => handleRoleSwitch('PATIENT')}
                disabled={switchingRole}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                  role === 'PATIENT'
                    ? 'bg-[#5E81F4] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Patient: Anu"
              >
                👤 Patient
              </button>
              <button
                onClick={() => handleRoleSwitch('CAREGIVER')}
                disabled={switchingRole}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                  role === 'CAREGIVER'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Caregiver: Bob"
              >
                🩺 Carer
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                disabled={switchingRole}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center transition-all ${
                  role === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="Admin: System"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Nav Menu */}
          <div className="py-4 px-4 space-y-5 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        // Auto-switch role if clicking a role-specific profile
                        if (item.roleTarget && item.roleTarget !== role) {
                          handleRoleSwitch(item.roleTarget)
                        } else {
                          if (onSelectSection) onSelectSection(item.id)
                        }
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#5E81F4] text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          item.badge === 'Active'
                            ? 'bg-emerald-500/30 text-emerald-200'
                            : item.badge === 'M1 Done'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-purple-500/30 text-purple-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer with Milestone 1 Badge & Log Out */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <button
            onClick={() => setIsRoadmapOpen(true)}
            className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Milestone 1</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">100% ✓</span>
            </div>
            <p className="text-[10px] text-slate-400">Core Setup, DB & Auth complete. Click for full roadmap.</p>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header matching reference (Search, Role Switcher, Notifications, Avatar) */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Rounded Search Bar */}
            <div className="relative w-44 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/80 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none text-xs text-slate-700 transition-all"
              />
            </div>
          </div>

          {/* Center: Milestone 1 Role Switcher (Desktop) */}
          <div className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => handleRoleSwitch('PATIENT')}
              disabled={switchingRole}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                role === 'PATIENT'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>👤 Patient (Anu)</span>
            </button>
            <button
              onClick={() => handleRoleSwitch('CAREGIVER')}
              disabled={switchingRole}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                role === 'CAREGIVER'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🩺 Caregiver (Bob)</span>
            </button>
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              disabled={switchingRole}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                role === 'ADMIN'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>🛡️ Admin (System)</span>
            </button>
          </div>

          {/* User Controls & Bell Notification */}
          <div className="flex items-center space-x-3">
            {/* Roadmap Modal Button */}
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 hover:bg-blue-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Roadmap</span>
            </button>

            {/* Notification Bell with Badge '11' */}
            <div className="relative cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                11
              </span>
            </div>

            {/* User Profile Avatar with dynamic role color */}
            <div className="flex items-center space-x-2.5 pl-1">
              <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-sm shadow-md ${
                role === 'CAREGIVER'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20'
                  : role === 'ADMIN'
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20'
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
              }`}>
                {userName[0]?.toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{userName}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  role === 'CAREGIVER'
                    ? 'text-emerald-600'
                    : role === 'ADMIN'
                    ? 'text-purple-600'
                    : 'text-blue-600'
                }`}>
                  {role}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 space-y-6 flex-1">
          {children}
        </main>
      </div>

      {/* Project Roadmap Modal */}
      <ProjectRoadmapModal isOpen={isRoadmapOpen} onClose={() => setIsRoadmapOpen(false)} />
    </div>
  )
}
