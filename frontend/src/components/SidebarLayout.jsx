import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Pill, LayoutDashboard, FileText, History, TrendingUp, ShieldAlert, 
  Settings, LogOut, Search, Bell, Menu, X, CheckCircle2, Sparkles, 
  UserCheck, ShieldCheck, Camera, Activity, HeartPulse
} from 'lucide-react'
import ProjectRoadmapModal from './ProjectRoadmapModal'

export default function SidebarLayout({ children, activeSection, onSelectSection }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const role = user?.role?.toUpperCase() || 'PATIENT'
  const userName = user?.full_name || user?.email?.split('@')[0] || 'User'

  // Navigation Links tailored to the reference design
  const navItems = [
    {
      group: 'Dashboard',
      items: [
        { id: 'tracker', label: 'Medication Tracker', icon: LayoutDashboard },
        { id: 'vitals', label: 'Test Reports & Vitals', icon: Activity },
        { id: 'history', label: 'Health History', icon: HeartPulse },
        { id: 'roadmap', label: 'Monthly Progress & Roadmap', icon: TrendingUp },
      ],
    },
    {
      group: 'Upcoming Modules',
      items: [
        { id: 'prescriptions', label: 'Prescriptions (AI OCR)', icon: Camera, badge: 'Sprint 3' },
        { id: 'refill', label: 'Refill Prediction', icon: TrendingUp, badge: 'Sprint 4' },
      ],
    },
    {
      group: 'Platform',
      items: [
        { id: 'profile', label: 'Account Profile', icon: Settings },
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

      {/* Dark Sidebar (Matches reference image #0B1437 / #0A1128) */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0B1437] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header matching "+ Medic" with Green Cross */}
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

          {/* Nav Menu */}
          <div className="py-6 px-4 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
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
                        if (onSelectSection) onSelectSection(item.id)
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
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
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
            className="w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header matching reference (Search, Notifications, Avatar) */}
        <header className="h-20 bg-white/70 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Rounded Search Bar */}
            <div className="relative w-48 sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-100/80 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none text-xs text-slate-700 transition-all"
              />
            </div>
          </div>

          {/* User Controls & Bell Notification */}
          <div className="flex items-center space-x-3.5">
            {/* Roadmap Modal Button */}
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 hover:bg-blue-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Roadmap</span>
            </button>

            {/* Notification Bell with Badge '11' like in photo */}
            <div className="relative cursor-pointer">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                11
              </span>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center space-x-2.5 pl-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                {userName[0]?.toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{userName}</div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{role}</div>
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
