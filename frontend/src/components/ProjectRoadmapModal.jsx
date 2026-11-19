import React from 'react'
import { 
  X, CheckCircle2, Clock, Sparkles, Camera, Brain, TrendingUp, 
  ShieldAlert, Bell, FileText, Pill, Calendar, ArrowRight, Zap 
} from 'lucide-react'

export default function ProjectRoadmapModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const milestones = [
    {
      id: 1,
      badge: 'Milestone 1',
      title: 'Foundation, Database & Role-Based Access Control',
      timeline: 'Week 1 - Week 2',
      status: 'ACHIEVED',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      description: 'Core application structure, database architecture, and secure role-based access.',
      features: [
        { name: 'FastAPI REST Architecture', desc: 'Modular backend with SQLAlchemy ORM & Pydantic v2 schemas' },
        { name: 'PostgreSQL / SQLite Database Schema', desc: 'Relational models for Users, Roles, Patients, and Caregivers' },
        { name: 'JWT & Bcrypt Authentication', desc: 'Industry-standard password hashing and signed bearer tokens' },
        { name: 'Role-Based Access Control (RBAC)', desc: 'Strict 403 authorization guards for Patient, Caregiver, and Admin' },
        { name: 'Patient & Caregiver Profile Management', desc: 'Personal details, emergency contacts, and chronic health conditions CRUD' },
      ],
    },
    {
      id: 2,
      badge: 'Milestone 2',
      title: 'Medicine Lifecycle & Smart Reminder Engine',
      timeline: 'Week 3 - Week 4',
      status: 'ACTIVE / READY',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Prescription inventory management, scheduled dose reminders, and live intake tracking.',
      features: [
        { name: 'Medication Cabinet & Disease Categorization', desc: 'Full inventory management with dosage, form, disease tags, and meal relations' },
        { name: 'Multi-Dose Daily Timeline', desc: 'Chronological Morning, Afternoon, Evening, and Night schedule generation' },
        { name: 'Real-Time Dose Logger (Taken / Snooze / Skip)', desc: 'Interactive dose actions that auto-decrement inventory stock and calculate adherence' },
        { name: 'Web Audio API Chime & Notifications', desc: 'Immediate auditory feedback and browser alert reminders' },
        { name: 'Inventory Stock Depletion Warning', desc: 'Automatic low-stock threshold triggers with 1-click quick refill' },
      ],
    },
    {
      id: 3,
      badge: 'Milestone 3',
      title: 'AI Prescription Recognition & Computer Vision (OCR)',
      timeline: 'Week 5 - Week 6',
      status: 'UPCOMING (COMING SOON)',
      statusColor: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Intelligent optical character recognition for digitizing handwritten & printed prescriptions.',
      features: [
        { name: 'Prescription Image Upload & Camera Capture', desc: 'Drag-and-drop or mobile camera image upload for prescription slips' },
        { name: 'Tesseract OCR & Image Preprocessing Pipeline', desc: 'Grayscale, adaptive thresholding, and contrast enhancement for text extraction' },
        { name: 'NLP Drug Entity Extraction', desc: 'Pattern matching heuristics extracting medication name, dosage strength, and frequency' },
        { name: 'Interactive Verification & Confirmation Drawer', desc: 'Review and edit scanned medications before committing into cabinet' },
        { name: 'Pill Bottle Label Barcode Scanner', desc: 'Barcode/QR code scanning for instant drug information lookup' },
      ],
    },
    {
      id: 4,
      badge: 'Milestone 4',
      title: 'Smart Refill Prediction & Adherence Analytics',
      timeline: 'Week 6 - Week 7',
      status: 'UPCOMING (COMING SOON)',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-200',
      description: 'Mathematical depletion velocity models, automated refill triggers, and compliance analytics.',
      features: [
        { name: 'Stock Depletion Velocity Algorithm', desc: 'Calculates Daily Burn Rate and Days Remaining based on active dosing frequency' },
        { name: 'Predictive Stock Depletion Forecasting', desc: 'Estimates exact calendar date when pills will run out and fires proactive warnings' },
        { name: '7-Day & 30-Day Medication Adherence Analytics', desc: 'Interactive visual charts displaying intake adherence trends over time' },
        { name: 'Caregiver Escalation for Missed Doses', desc: 'Automated notification to caregiver when a high-priority dose remains untaken for >2 hours' },
      ],
    },
    {
      id: 5,
      badge: 'Milestone 5',
      title: 'Clinical Safety & Doctor Export Reports (Capstone Innovations)',
      timeline: 'Week 8',
      status: 'UPCOMING (COMING SOON)',
      statusColor: 'bg-rose-100 text-rose-800 border-rose-200',
      description: 'Polypharmacy drug safety checks and comprehensive clinical export tools.',
      features: [
        { name: 'Drug-Drug & Food-Drug Interaction Safety Engine', desc: 'Contraindication alerts against adverse drug combinations using open FDA databases' },
        { name: 'Emergency SOS & Caregiver Alert System', desc: 'One-touch SOS button sharing patient location and emergency contact info' },
        { name: 'Physician Consultation PDF Report Generator', desc: 'Exportable clinical summary of medication adherence and conditions for doctor appointments' },
      ],
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>PillSync 8-Week Implementation Roadmap</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Project Architecture & Feature Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Overview of all application features across all development milestones.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Milestones Accordion / List */}
        <div className="space-y-4">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl p-5 border transition-all ${
                m.status === 'ACHIEVED'
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : m.status.includes('ACTIVE')
                  ? 'bg-blue-50/30 border-blue-200'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white font-mono">
                    {m.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{m.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400 font-medium">{m.timeline}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${m.statusColor}`}>
                    {m.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3">{m.description}</p>

              {/* Feature Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {m.features.map((f, idx) => (
                  <div key={idx} className="flex items-start space-x-2 p-2 rounded-xl bg-white border border-slate-100 shadow-xs">
                    <div className="mt-0.5">
                      {m.status === 'ACHIEVED' || m.status.includes('ACTIVE') ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">{f.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Milestone 1</strong> is 100% verified and achieved. Upcoming features are scheduled for subsequent sprints.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Close Roadmap
          </button>
        </div>
      </div>
    </div>
  )
}
