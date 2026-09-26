import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Download, 
  ArrowRight, 
  Settings, 
  LogOut, 
  AlertTriangle, 
  ShieldCheck,
  Building2,
  Siren,
  MapPin,
  Clock,
  Navigation
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import SettingsDrawer from './SettingsDrawer';
import RetractableBackButton from './RetractableBackButton';
import TTSButton from './TTSButton';

export default function PatientHome({ 
  onStartIntake,
  onOpenHospitals,
  onOpenAmbulance
}: { 
  onStartIntake: () => void;
  onOpenHospitals: () => void;
  onOpenAmbulance: () => void;
}) {
  const { t } = useAppContext();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const patientAuthType = localStorage.getItem('patientAuthType') || 'login';

  useEffect(() => {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) {
      navigate('/');
      return;
    }
    
    const rawStoredName = localStorage.getItem('patientName') || '';
    const cleanStoredName = rawStoredName && !rawStoredName.toLowerCase().startsWith('patient') ? rawStoredName : '';
    setPatientName(cleanStoredName);

    const fetchData = async () => {
      try {
        const [apptsRes, reportsRes, patientRes] = await Promise.all([
          fetch(`/api/patient/${patientId}/appointments`),
          fetch(`/api/reports/${patientId}`),
          fetch(`/api/patient/${patientId}`)
        ]);

        if (patientRes.ok) {
          const pData = await patientRes.json();
          if (pData.patient?.name && !pData.patient.name.toLowerCase().startsWith('patient')) {
            setPatientName(pData.patient.name);
            localStorage.setItem('patientName', pData.patient.name);
          }
        }

        if (apptsRes.ok) {
          const apptsData = await apptsRes.json();
          setAppointments(
            (apptsData.appointments || []).sort(
              (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )
          );
        }
        
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(
            (reportsData.reports || []).sort(
              (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            )
          );
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const latestPrescription = reports.find(r => r.doctorPrescription)?.doctorPrescription;

  const handleLogout = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientIdentifier');
    localStorage.removeItem('identifierType');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientAuthType');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto bg-slate-50 dark:bg-slate-900 relative transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 dark:from-blue-900/10 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900 pointer-events-none"></div>
      
      {/* Retractable Exit Button with Logout Question */}
      <div className="absolute top-4 left-4 z-20 md:top-8 md:left-8">
        <RetractableBackButton onClick={() => setShowLogoutModal(true)} label="Exit" id="patient-home-exit-btn" />
      </div>

      {/* Settings Action (Icon-Only) */}
      <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8">
        <button 
          id="patient-home-settings-btn"
          onClick={() => setShowSettingsDrawer(true)} 
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-orange-500" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 md:py-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-10 text-center md:text-left"
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {patientAuthType === 'register' ? (t('welcome') || 'Welcome') : (t('welcomeBack') || 'Welcome back')}
            {patientName ? (
              <span>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{patientName}</span></span>
            ) : '!'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg max-w-2xl">
            {t('patientHomeSubtitle') || 'View your upcoming appointments, recent prescriptions, or report a new medical problem to your doctor.'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Main Call to Action: Report a Medical Problem */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onClick={onStartIntake}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="col-span-1 md:col-span-2 relative group overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl shadow-blue-900/20 text-left border border-blue-500/30 cursor-pointer"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Activity className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-2">{t('reportMedicalProblem')}</h2>
                <p className="text-blue-100 text-sm sm:text-base max-w-xl">
                  {t('startIntakeSession')}
                </p>
              </div>
              <div className="w-14 h-14 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-blue-50 transition-colors shrink-0">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </motion.button>

          {/* TWO NEW OPTIONS BELOW REPORT A MEDICAL PROBLEM */}
          {/* 1. Hospitals Near Me */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onClick={onOpenHospitals}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-7 rounded-3xl shadow-lg shadow-emerald-900/20 text-left border border-emerald-500/40 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Building2 className="w-36 h-36" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/20">
                  {t('openSourceMap') || 'Open-Source Map'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                {t('hospitalsNearMe')}
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed mb-4">
                {t('hospitalsNearMeDesc') || 'Locate nearby verified hospitals, trauma care, and emergency OPDs categorized within 2km, 5km, and 10km on an interactive live map.'}
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-emerald-100">
                <MapPin className="w-3.5 h-3.5 text-emerald-200" /> {t('autoGpsDetection') || 'Auto GPS Detection'}
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{t('exploreMap') || 'Explore Map'}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

          {/* 2. Emergency Ambulance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            onClick={onOpenAmbulance}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-red-700 p-6 sm:p-7 rounded-3xl shadow-lg shadow-red-900/25 text-left border border-red-500/40 cursor-pointer flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Siren className="w-36 h-36" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/15 backdrop-blur-md text-white rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
                  <Siren className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 text-white px-2.5 py-1 rounded-full border border-white/25 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                  {t('dispatch24x7') || '24x7 Dispatch'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                {t('emergencyAmbulance')}
              </h3>
              <p className="text-red-100 text-xs sm:text-sm leading-relaxed mb-4">
                {t('emergencyAmbulanceDesc') || 'Book and dispatch an urgent emergency ambulance (ALS/BLS) to your current location. Track its exact live position, distance, and time to reach (ETA) on a map.'}
              </p>
            </div>

            <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-red-100">
                <Clock className="w-3.5 h-3.5 text-red-200" /> {t('liveEtaDistance') || 'Live ETA & Distance'}
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>{t('bookAmbulance')}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>

          {/* Upcoming Appointment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('upcomingAppointments')}</h3>
            </div>
            
            <div className="flex-1">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 2).map((apt, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{apt.doctorName || "Doctor"}</div>
                          {apt.hospital && (
                            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                              {apt.hospital}
                            </div>
                          )}
                          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{apt.date}</span>
                            <span>•</span>
                            <span>{apt.slot}</span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded-full">
                          {apt.status || "Scheduled"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
                  <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('noUpcomingAppointments') || 'No upcoming appointments'}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Latest Prescription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('latestPrescription') || 'Latest Prescription'}</h3>
            </div>
            
            <div className="flex-1 flex flex-col">
              {latestPrescription ? (
                <div className="flex-1 flex flex-col justify-center">
                  <div className="p-5 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-center">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate mb-1">
                      {latestPrescription.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                      Uploaded by {latestPrescription.doctorName || 'Doctor'}
                    </p>
                    <a 
                      href={latestPrescription.fileData} 
                      download={latestPrescription.fileName}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-md transition-colors"
                    >
                      <Download className="w-4 h-4" /> {t('downloadPrescription') || 'Download Prescription'}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
                  <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('noPrescriptions') || 'No prescriptions uploaded yet'}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

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
                Are you sure you want to exit your patient session? You will need to verify your credentials to sign in again.
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

      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        userRole="patient"
        userName={patientName}
        userId={localStorage.getItem('patientId') || undefined}
        onLogout={handleLogout}
      />
    </div>
  );
}
