import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  UserRound, 
  Clock, 
  ArrowLeft, 
  LogOut, 
  Activity, 
  AlertTriangle, 
  CalendarClock, 
  ShieldAlert, 
  Sparkles, 
  Trash2, 
  Settings, 
  Calendar, 
  Stethoscope, 
  Leaf, 
  Filter, 
  ChevronRight, 
  ExternalLink,
  Phone,
  Droplet,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getAppSocket } from '../utils/socket';
import ReportView from './ReportView';
import AyushResources from './AyushResources';
import { calculateClinicalRisk } from '../utils/clinicalRisk';
import SettingsDrawer from './SettingsDrawer';
import RetractableBackButton from './RetractableBackButton';

type DoctorTab = 'pending' | 'reviewed' | 'appointments' | 'history' | 'ayush';

// Helper to highlight matching search queries
function HighlightText({ text, query }: { text?: string; query: string }) {
  if (!text) return null;
  if (!query || !query.trim()) return <>{text}</>;
  const cleanQ = query.trim();
  const regex = new RegExp(`(${cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-300 dark:bg-amber-500 text-slate-950 font-black px-1 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Helper to convert slot string into minutes from midnight for accurate chronological ordering
function getSlotSortValue(slot: string = ''): number {
  if (!slot) return 9999;
  const lower = slot.toLowerCase();
  if (lower.includes('immediate') || lower.includes('urgent') || lower.includes('priority')) {
    return -1; // Highest priority, top of queue
  }
  const match = slot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const meridian = (match[3] || '').toUpperCase();
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }
  return 5000;
}

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const doctorId = localStorage.getItem('doctorId') || '';
  const doctorName = localStorage.getItem('doctorName') || doctorId || 'Dr. Specialist';
  const doctorHospital = localStorage.getItem('doctorHospital') || 'HealthPoint Hospital';
  const doctorDepartment = localStorage.getItem('doctorDepartment') || 'General Medicine';

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<DoctorTab>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // UI & Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Hidden empty cases list stored in session/localStorage to remove only from UI
  const [hiddenCaseIds, setHiddenCaseIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(`doctor_hidden_empty_cases_${doctorId}`);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Critical alerts tracking
  const [criticalToasts, setCriticalToasts] = useState<{ id: string; patientId: string; name: string }[]>([]);
  const prevCriticalIdsRef = useRef<Set<string>>(new Set());

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ type, message });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  // Fetch Patients & Reports
  const fetchDoctorData = async () => {
    if (!doctorId) {
      navigate('/doctor/login');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch Patients & Cases (strictly isolated for this doctor's database)
      const pRes = await fetch(`/api/doctor/patients/search?query=${encodeURIComponent(searchQuery)}&doctorId=${encodeURIComponent(doctorId)}&doctorName=${encodeURIComponent(doctorName)}&doctorHospital=${encodeURIComponent(doctorHospital)}`);
      if (pRes.ok) {
        const data = await pRes.json();
        setPatients(data.patients || []);
      }

      // 2. Fetch Appointments (strictly isolated for this doctor's database)
      const apptRes = await fetch(`/api/appointments/${encodeURIComponent(doctorName || doctorId)}?hospital=${encodeURIComponent(doctorHospital)}&doctorId=${encodeURIComponent(doctorId)}`);
      if (apptRes.ok) {
        const apptData = await apptRes.json();
        setAppointments(apptData.appointments || []);
      }
    } catch (e) {
      console.error('Error fetching doctor dashboard data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId, doctorName, doctorHospital, searchQuery]);

  // Real-time socket sync
  useEffect(() => {
    const socket = getAppSocket();
    const handleSync = () => {
      fetchDoctorData();
    };

    socket.on('clinical_report_generated', handleSync);
    socket.on('patient_intake_submitted', handleSync);
    socket.on('appointment_booked', handleSync);
    socket.on('report_updated', handleSync);
    socket.on('new_patient_report', handleSync);

    return () => {
      socket.off('clinical_report_generated', handleSync);
      socket.off('patient_intake_submitted', handleSync);
      socket.off('appointment_booked', handleSync);
      socket.off('report_updated', handleSync);
      socket.off('new_patient_report', handleSync);
    };
  }, [doctorId, doctorName, doctorHospital]);

  // Fetch specific reports when a patient is selected
  const fetchPatientReports = async (patientId: string) => {
    if (!patientId) return;
    setIsLoadingReports(true);
    try {
      const res = await fetch(`/api/reports/${encodeURIComponent(patientId)}?doctorId=${encodeURIComponent(doctorId)}&doctorName=${encodeURIComponent(doctorName)}&doctorHospital=${encodeURIComponent(doctorHospital)}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.reports || [];
        setReports(list);
        if (list.length > 0) {
          setSelectedReport(list[0]);
        } else {
          setSelectedReport(null);
        }
      }
    } catch (e) {
      console.error('Error fetching patient reports:', e);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    // Always fetch full patient reports to ensure documents and all other detailed assets are retrieved fully from Firestore
    fetchPatientReports(patient.id || patient.abhaId);
    setShowCaseModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorId');
    localStorage.removeItem('doctorName');
    localStorage.removeItem('doctorHospital');
    localStorage.removeItem('doctorDepartment');
    navigate('/doctor/login');
  };

  // Filter out UI-hidden empty cases
  const visiblePatients = useMemo(() => {
    return patients.filter((p) => {
      const id = p.id || p.abhaId;
      return !hiddenCaseIds.has(id);
    });
  }, [patients, hiddenCaseIds]);

  const isPatientReviewed = (p: any) => {
    return Boolean(p.isReviewed || p.latestReport?.isReviewed || p.latestReport?.status === 'reviewed');
  };

  // Categorize into Pending vs. Reviewed
  const pendingCases = useMemo(() => {
    return visiblePatients
      .filter((p) => !isPatientReviewed(p))
      .sort((a, b) => {
        const aRisk = a.latestReport ? calculateClinicalRisk(a.latestReport).percentage : 0;
        const bRisk = b.latestReport ? calculateClinicalRisk(b.latestReport).percentage : 0;
        return bRisk - aRisk; // Higher risk first
      });
  }, [visiblePatients]);

  const reviewedCases = useMemo(() => {
    return visiblePatients.filter((p) => isPatientReviewed(p));
  }, [visiblePatients]);

  // Sort appointments strictly by appointed time
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const timeA = getSlotSortValue(a.slot);
      const timeB = getSlotSortValue(b.slot);
      if (timeA !== timeB) return timeA - timeB;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [appointments]);

  // Memos for Active vs. History Appointments
  const activeAppointments = useMemo(() => {
    return sortedAppointments.filter(
      (a) => a.status !== 'Absent' && a.status !== 'Consulted' && a.status !== 'Done' && a.status !== 'Done (Consultation & Diagnosis)'
    );
  }, [sortedAppointments]);

  const absentAppointments = useMemo(() => {
    return sortedAppointments.filter((a) => a.status === 'Absent');
  }, [sortedAppointments]);

  const completedAppointments = useMemo(() => {
    return sortedAppointments.filter(
      (a) => a.status === 'Consulted' || a.status === 'Done' || a.status === 'Done (Consultation & Diagnosis)'
    );
  }, [sortedAppointments]);

  // Appointment History Date filter
  const [historyFilterDate, setHistoryFilterDate] = useState<string>('');
  const [historyCategory, setHistoryCategory] = useState<'all' | 'completed' | 'absent'>('all');

  // Filtered appointments for History Tab
  const filteredHistoryAppointments = useMemo(() => {
    let list = [...completedAppointments, ...absentAppointments];
    if (historyCategory === 'completed') {
      list = completedAppointments;
    } else if (historyCategory === 'absent') {
      list = absentAppointments;
    }

    if (historyFilterDate) {
      list = list.filter((a) => {
        const apptDate = a.date || '';
        const createdDate = a.createdAt ? new Date(a.createdAt).toISOString().slice(0, 10) : '';
        return apptDate.includes(historyFilterDate) || createdDate.includes(historyFilterDate);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => 
        (a.patientName && a.patientName.toLowerCase().includes(q)) ||
        (a.patientId && a.patientId.toLowerCase().includes(q)) ||
        (a.slot && a.slot.toLowerCase().includes(q))
      );
    }

    return list;
  }, [completedAppointments, absentAppointments, historyCategory, historyFilterDate, searchQuery]);

  // Critical Risk Triage Watcher
  useEffect(() => {
    const currentCritical = pendingCases.filter(
      (p) => p.latestReport && calculateClinicalRisk(p.latestReport).percentage >= 70
    );
    const newCriticals = currentCritical.filter((p) => !prevCriticalIdsRef.current.has(p.id || p.abhaId));

    if (newCriticals.length > 0) {
      const newToasts = newCriticals.map((p) => ({
        id: (p.id || p.abhaId) + '-' + Date.now(),
        patientId: p.id || p.abhaId,
        name: p.name || 'Patient',
      }));
      setCriticalToasts((prev) => [...prev, ...newToasts]);

      newToasts.forEach((toast) => {
        setTimeout(() => {
          setCriticalToasts((prev) => prev.filter((t) => t.id !== toast.id));
        }, 8000);
      });
    }

    prevCriticalIdsRef.current = new Set(currentCritical.map((p) => p.id || p.abhaId));
  }, [pendingCases]);

  // Delete Empty Case handler (Removes from Doctor Dashboard UI ONLY, does not delete from Firebase)
  const handleDeleteEmptyCase = (patient: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const pId = patient.id || patient.abhaId;
    if (!pId) return;

    // Check if the case is empty
    const rep = patient.latestReport;
    const hasSymptoms = rep?.summary?.symptoms && Array.isArray(rep.summary.symptoms) && rep.summary.symptoms.length > 0;
    const hasDiagnosis = rep?.summary?.diagnosis || rep?.allopathyDiagnosis || rep?.ayushDiagnosis;
    const hasRawOutput = Boolean(rep?.rawOutput && rep.rawOutput.trim().length > 10);
    const hasTranscript = Boolean(rep?.transcript || rep?.transcription);

    const isEmptyCase = !rep || (!hasSymptoms && !hasDiagnosis && !hasRawOutput && !hasTranscript);

    if (isEmptyCase) {
      // Remove from UI only (do NOT call Firebase delete API)
      const nextHidden = new Set(hiddenCaseIds);
      nextHidden.add(pId);
      setHiddenCaseIds(nextHidden);
      try {
        localStorage.setItem(`doctor_hidden_empty_cases_${doctorId}`, JSON.stringify(Array.from(nextHidden)));
      } catch (err) {
        console.error(err);
      }

      showToast(`Empty draft case (${patient.name || pId}) removed from Doctor Dashboard.`, 'info');
    } else {
      // Not empty
      showToast(`Active clinical record for ${patient.name || 'Patient'} cannot be deleted to preserve medical history.`, 'error');
    }
  };

  const handleReviewComplete = (arg: any) => {
    if (arg && typeof arg === 'object' && 'reviewedJustNow' in arg) {
      if (arg.reviewedJustNow) {
        showToast('Clinical case marked as reviewed.');
      } else {
        showToast('Clinical case reopened (marked as pending review).', 'info');
      }
    } else {
      showToast('Clinical case marked as reviewed with prescription saved.');
    }
    setShowCaseModal(false);
    fetchDoctorData();
  };

  const handleUpdateAppointmentStatus = async (apptId: string, newStatus: string, patientName: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: newStatus } : a))
    );

    if (newStatus === 'Absent') {
      showToast(`Marked ${patientName || 'Patient'} as Absent.`, 'info');
    } else {
      showToast(`Marked ${patientName || 'Patient'} as Done (Consultation & Diagnosis).`, 'success');
    }

    if (apptId) {
      try {
        await fetch(`/api/appointments/${encodeURIComponent(apptId)}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: newStatus,
            doctorName: doctorName,
            doctorHospital: doctorHospital
          })
        });
      } catch (err) {
        console.error('Error updating appointment status:', err);
      }
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-transparent relative transition-colors flex flex-col">

      {/* Floating Critical Alert Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {criticalToasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="p-4 bg-red-600 text-white rounded-2xl shadow-xl shadow-red-600/30 border border-red-500 flex items-start gap-3 pointer-events-auto"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 animate-pulse text-red-200" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-wider text-red-200">High Clinical Risk Triage (&gt;70%)</p>
                <p className="text-sm font-bold truncate mt-0.5">{toast.name}</p>
                <p className="text-xs text-red-100 mt-1">Requires immediate consultation evaluation.</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <RetractableBackButton onClick={() => setShowLogoutModal(true)} label="Exit" id="doctor-dashboard-exit-btn" />
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-teal-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {doctorName}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-md border border-teal-200 dark:border-teal-800">
                  {doctorDepartment}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{doctorHospital}</p>
            </div>
          </div>
        </div>

        {/* Search Bar & Settings */}
        <div className="flex items-center gap-2.5">
          <div className="relative hidden md:block w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token, ABHA, patient..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            id="doctor-settings-btn"
            onClick={() => setShowSettingsDrawer(true)}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        
        {/* Toast Feedback */}
        <AnimatePresence>
          {feedbackToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-md ${
                feedbackToast.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : feedbackToast.type === 'error'
                  ? 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  : 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : feedbackToast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Info className="w-4 h-4 text-teal-600" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button onClick={() => setFeedbackToast(null)} className="opacity-60 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Metrics Cards (Interactive Upper Navigation Boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Upper Box 1: Pending Review */}
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'pending'
                ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 shadow-md'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-600 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Pending Review</span>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{pendingCases.length}</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Awaiting review</span>
              {activeTab === 'pending' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              )}
            </div>
          </button>

          {/* Upper Box 2: Reviewed Cases */}
          <button
            type="button"
            onClick={() => setActiveTab('reviewed')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'reviewed'
                ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Reviewed Cases</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{reviewedCases.length}</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Evaluated & done</span>
              {activeTab === 'reviewed' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </div>
          </button>

          {/* Upper Box 3: Active Appointments Queue */}
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'appointments'
                ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/50 shadow-md'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Active Queue</span>
                <CalendarClock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{activeAppointments.length}</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Scheduled visits</span>
              {activeTab === 'appointments' && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              )}
            </div>
          </button>

          {/* Upper Box 4: Appointment History & Records (Absent + Completed) */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'history'
                ? 'bg-purple-500/10 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50 shadow-md'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Visit History</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {completedAppointments.length + absentAppointments.length}
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Date & year logs</span>
              {activeTab === 'history' && (
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              )}
            </div>
          </button>

          {/* Upper Box 5: AYUSH Clinical Guide */}
          <button
            type="button"
            onClick={() => setActiveTab('ayush')}
            className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeTab === 'ayush'
                ? 'bg-teal-500/10 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/50 shadow-md'
                : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">AYUSH Guide</span>
                <Leaf className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">Clinical</div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400">Integrative care</span>
              {activeTab === 'ayush' && (
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              )}
            </div>
          </button>
        </div>

        {/* TAB CONTENTS (Directly controlled by Upper Boxes) */}
        <div>
          {/* TAB 1: PENDING CASES */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-slate-500">Loading pending clinical intake cases...</p>
                </div>
              ) : pendingCases.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Active Queue Clear</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    All patient intake summaries and triage records have been evaluated.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingCases.map((patient) => {
                    const rep = patient.latestReport;
                    const risk = rep ? calculateClinicalRisk(rep) : null;
                    const isHighRisk = risk ? risk.percentage >= 70 : false;
                    const tokenStr = patient.token || `TK-${(patient.id || '0000').slice(-4).toUpperCase()}`;

                    return (
                      <motion.div
                        key={patient.id || patient.abhaId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleSelectPatient(patient)}
                        className={`p-5 bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-200 cursor-pointer hover:shadow-lg relative overflow-hidden group flex flex-col justify-between ${
                          isHighRisk
                            ? 'border-red-300 dark:border-red-900/60 shadow-red-500/5'
                            : 'border-slate-200 dark:border-slate-700 hover:border-teal-500'
                        }`}
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[11px] font-black font-mono tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg">
                              #<HighlightText text={tokenStr} query={searchQuery} />
                            </span>

                            <div className="flex items-center gap-1.5">
                              {risk && (
                                <span
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                                    isHighRisk
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800 animate-pulse'
                                      : risk.level === 'GUARDED'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  }`}
                                >
                                  {risk.level} ({risk.percentage}%)
                                </span>
                              )}
                              
                              {/* Delete button (Handles empty case UI deletion only) */}
                              <button
                                type="button"
                                onClick={(e) => handleDeleteEmptyCase(patient, e)}
                                className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Delete empty draft from dashboard view"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Patient Name */}
                          <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                            <HighlightText text={patient.name || 'Patient'} query={searchQuery} />
                          </h3>

                          {/* Demographics */}
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>{patient.age ? `${patient.age} yrs` : 'Age N/A'}</span>
                            <span>•</span>
                            <span>{patient.gender || 'Sex N/A'}</span>
                            {patient.bloodGroup && (
                              <>
                                <span>•</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">{patient.bloodGroup}</span>
                              </>
                            )}
                          </div>

                          {/* Symptoms / Chief Complaints */}
                          {rep?.summary?.symptoms && rep.summary.symptoms.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {rep.summary.symptoms.slice(0, 3).map((sym: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 rounded-md"
                                >
                                  <HighlightText text={sym} query={searchQuery} />
                                </span>
                              ))}
                              {rep.summary.symptoms.length > 3 && (
                                <span className="text-[10px] font-bold text-slate-400">
                                  +{rep.summary.symptoms.length - 3} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-3">
                              Intake recorded • Pending clinical review
                            </p>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                            ABHA: <HighlightText text={patient.abhaId || '—'} query={searchQuery} />
                          </span>
                          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Evaluate Case <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEWED CASES */}
          {activeTab === 'reviewed' && (
            <div className="space-y-4">
              {reviewedCases.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">No Reviewed Cases Yet</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Cases you evaluate and provide prescriptions for will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviewedCases.map((patient) => {
                    const tokenStr = patient.token || `TK-${(patient.id || '0000').slice(-4).toUpperCase()}`;

                    return (
                      <motion.div
                        key={patient.id || patient.abhaId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleSelectPatient(patient)}
                        className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all duration-200 cursor-pointer hover:shadow-lg flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-black font-mono tracking-wider px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg">
                              #<HighlightText text={tokenStr} query={searchQuery} />
                            </span>
                            <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Reviewed
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                            <HighlightText text={patient.name || 'Patient'} query={searchQuery} />
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {patient.age ? `${patient.age} yrs` : ''} {patient.gender ? `• ${patient.gender}` : ''}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            ABHA: <HighlightText text={patient.abhaId || '—'} query={searchQuery} />
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            View Summary <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ACTIVE APPOINTMENT QUEUES */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Consultation Queue</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Patients scheduled for upcoming and immediate consultation slots.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-xl border border-blue-200 dark:border-blue-800">
                  {activeAppointments.length} Active in Queue
                </span>
              </div>

              {activeAppointments.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                  <CalendarClock className="w-12 h-12 text-blue-300 dark:text-blue-600 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">No Active Appointments in Queue</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    All scheduled patients have either been marked consulted or absent. Check <strong>Visit History</strong> to review past visits.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAppointments.map((appt, idx) => {
                    const isImmediate = appt.slot?.toLowerCase().includes('immediate') || appt.slot?.toLowerCase().includes('priority');
                    const matchingPatient = visiblePatients.find((p) => p.id === appt.patientId || p.abhaId === appt.patientId);

                    return (
                      <motion.div
                        key={appt.id || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className={`p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isImmediate
                            ? 'border-red-300 dark:border-red-900/60 bg-red-50/20 dark:bg-red-950/10'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Time & Patient Info */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold border ${
                              isImmediate
                                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/20'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                            }`}
                          >
                            <Clock className="w-4 h-4 mb-0.5" />
                            <span className="text-[10px] font-black uppercase text-center leading-tight">
                              {isImmediate ? 'URGENT' : (appt.slot?.split(' ')[0] || 'SLOT')}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-slate-900 dark:text-white">
                                <HighlightText text={appt.patientName || matchingPatient?.name || 'Patient'} query={searchQuery} />
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  isImmediate
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <HighlightText text={appt.slot} query={searchQuery} />
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Date: <strong className="text-slate-700 dark:text-slate-300">{appt.date || 'Today'}</strong> • Status:{' '}
                              <span className="text-blue-600 dark:text-blue-400 font-bold uppercase">{appt.status || 'Confirmed'}</span>
                              {matchingPatient?.abhaId && (
                                <span> • ABHA: <HighlightText text={matchingPatient.abhaId} query={searchQuery} /></span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons: Mark Absent OR Mark Consulted */}
                        <div className="flex items-center gap-2.5 self-end sm:self-auto w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(appt.id, 'Absent', appt.patientName || matchingPatient?.name)}
                            className="flex-1 sm:flex-none py-2 px-3.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
                          >
                            Mark Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateAppointmentStatus(appt.id, 'Consulted', appt.patientName || matchingPatient?.name)}
                            className="flex-1 sm:flex-none py-2 px-4 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark Consulted</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: APPOINTMENT HISTORY (Separated into Completed Consultations & Absent Patients with Date/Year Filters) */}
          {activeTab === 'history' && (
            <div className="space-y-5">
              {/* Header & Filter Controls Bar */}
              <div className="p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Patient Appointment History & Logs
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Search and filter past consultations and absent records by specific date and year.
                    </p>
                  </div>

                  {/* Category Switcher Tabs: All / Completed Consultations / Absent */}
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setHistoryCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        historyCategory === 'all'
                          ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      All ({completedAppointments.length + absentAppointments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryCategory('completed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        historyCategory === 'completed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-emerald-700 dark:text-emerald-400 hover:text-emerald-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Completed ({completedAppointments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryCategory('absent')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        historyCategory === 'absent'
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'text-rose-700 dark:text-rose-400 hover:text-rose-800'
                      }`}
                    >
                      <AlertCircle className="w-3 h-3" />
                      Absent ({absentAppointments.length})
                    </button>
                  </div>
                </div>

                {/* Date Filter */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 items-start sm:items-center justify-between w-full">
                  <div className="w-full sm:w-72">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Filter by Specific Date:
                      </label>
                      {historyFilterDate && (
                        <button
                          type="button"
                          onClick={() => setHistoryFilterDate('')}
                          className="text-[10px] text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                        >
                          Clear Date
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={historyFilterDate}
                        onChange={(e) => setHistoryFilterDate(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-600"
                      />
                      <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* History Records List */}
              {filteredHistoryAppointments.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-black text-slate-900 dark:text-white">No Records Found</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    No matching appointments found for the selected category or date ({historyFilterDate || 'All'}).
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistoryAppointments.map((appt, idx) => {
                    const isAbsent = appt.status === 'Absent';
                    const matchingPatient = visiblePatients.find((p) => p.id === appt.patientId || p.abhaId === appt.patientId);

                    return (
                      <motion.div
                        key={appt.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 sm:p-5 bg-white dark:bg-slate-800 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isAbsent
                            ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                            : 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div
                            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold border ${
                              isAbsent
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isAbsent ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-black text-slate-900 dark:text-white">
                                <HighlightText text={appt.patientName || matchingPatient?.name || 'Patient'} query={searchQuery} />
                              </h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                  isAbsent
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {isAbsent ? 'Absent Patient' : 'Consultation Done'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Slot: <strong className="text-slate-700 dark:text-slate-300"><HighlightText text={appt.slot} query={searchQuery} /></strong> •
                              Date: <strong className="text-slate-700 dark:text-slate-300">{appt.date || 'Today'}</strong>
                              {matchingPatient?.abhaId && (
                                <span> • ABHA: <HighlightText text={matchingPatient.abhaId} query={searchQuery} /></span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Revert / Action controls */}
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          {isAbsent ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateAppointmentStatus(appt.id, 'Consulted', appt.patientName || matchingPatient?.name)}
                              className="py-1.5 px-3 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark Consulted Instead
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateAppointmentStatus(appt.id, 'Absent', appt.patientName || matchingPatient?.name)}
                              className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 transition cursor-pointer"
                            >
                              Mark Absent
                            </button>
                          )}

                          {matchingPatient && (
                            <button
                              type="button"
                              onClick={() => handleSelectPatient(matchingPatient)}
                              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
                            >
                              View Intake Summary
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AYUSH & CLINICAL GUIDELINES */}
          {activeTab === 'ayush' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6">
              <AyushResources />
            </div>
          )}
        </div>
      </main>

      {/* Case Details & Report Inspection Modal */}
      <AnimatePresence>
        {showCaseModal && selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedPatient.name || 'Patient Clinical Evaluation'}
                    </h2>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 rounded-lg">
                      #{selectedPatient.token || `TK-${(selectedPatient.id || '0000').slice(-4).toUpperCase()}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ABHA: {selectedPatient.abhaId || '—'} • {selectedPatient.age ? `${selectedPatient.age}y` : ''}{' '}
                    {selectedPatient.gender ? `• ${selectedPatient.gender}` : ''}{' '}
                    {selectedPatient.bloodGroup ? `• Blood Group ${selectedPatient.bloodGroup}` : ''}
                  </p>
                </div>

                <button
                  onClick={() => setShowCaseModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {isLoadingReports ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs font-bold text-slate-500">Retrieving comprehensive clinical report...</p>
                  </div>
                ) : selectedReport ? (
                  <ReportView
                    report={selectedReport}
                    onUpdate={handleReviewComplete}
                  />
                ) : (
                  <div className="py-16 text-center">
                    <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Generated Report File Found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Patient intake record is currently waiting for summary generation.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        userRole="doctor"
        userName={doctorName}
        userId={doctorId}
        onLogout={handleLogout}
      />

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Do you want to log out?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Are you sure you want to exit your doctor session? You will need to verify your hospital credentials to sign in again.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  No, Stay
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  Yes, Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
