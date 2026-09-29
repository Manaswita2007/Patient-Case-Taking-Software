import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Home from './components/Home';
import PatientLogin from './components/PatientLogin';
import DoctorLogin from './components/DoctorLogin';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import HospitalsNearMe, { Hospital } from './components/HospitalsNearMe';
import EmergencyAmbulance from './components/EmergencyAmbulance';
import NotFound from './components/NotFound';
import { ShieldCheck, Moon, Sun, Languages, Activity } from 'lucide-react';
import { AppProvider, useAppContext, LANGUAGE_NAMES } from './context/AppContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { stopSpeech } from './utils/speech';

// Advanced 3D Tech Loader
function GlobalLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  const handleFinish = () => {
    sessionStorage.setItem('loaderCompleted', 'true');
    onComplete();
  };

  useEffect(() => {
    if (sessionStorage.getItem('loaderCompleted')) {
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          sessionStorage.setItem('loaderCompleted', 'true');
          setTimeout(onComplete, 250);
          return 100;
        }
        return p + Math.floor(Math.random() * 22) + 8;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      onClick={handleFinish}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030712] overflow-hidden cursor-pointer"
      exit={{ opacity: 0, y: -50, scale: 1.05 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Background grid for loader */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      <div className="relative z-10 flex flex-col items-center perspective-1000">
        <motion.div
          animate={{ 
            rotateX: [0, 360],
            rotateY: [0, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-32 h-32 mb-12 transform-style-3d"
        >
          {/* 3D Core */}
          <div className="absolute inset-0 border-4 border-orange-500/30 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)]" style={{ transform: 'translateZ(20px)' }}>
             <Activity className="w-12 h-12 text-orange-400" />
          </div>
          <div className="absolute inset-0 border-4 border-blue-800/30 rounded-full rotate-90" style={{ transform: 'translateZ(-20px) rotateX(90deg)' }} />
          <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full" style={{ transform: 'translateZ(0px) rotateY(90deg)' }} />
        </motion.div>

        <div className="text-orange-400 font-mono text-xl font-bold tracking-[0.1em] mb-4">
          SETTING UP YOUR HEALTH COMPANION
        </div>
        
        {/* Progress Bar */}
        <div className="w-64 h-1 bg-slate-800 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-orange-400 via-white to-emerald-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>
        
        <div className="mt-4 flex items-center gap-3 text-slate-500 font-mono text-xs">
          <span>{Math.min(progress, 100)}%</span>
          <span className="text-[10px] tracking-wider uppercase text-slate-400 font-sans">• Click to start</span>
        </div>
      </div>
    </motion.div>
  );
}

function Navbar() {
  const { theme, toggleTheme, language, setLanguage, isTranslating, translatingLanguageName, t } = useAppContext();

  return (
    <div className="p-3 md:px-6 shrink-0 relative z-30 print:hidden bg-transparent">
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
        className="h-14 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between px-4 md:px-5 rounded-2xl shadow-sm font-sans transition-colors relative"
      >
        <Link to="/" className="flex items-center gap-2.5 select-none hover:opacity-90 transition-opacity" style={{ transform: "translateZ(20px)" }}>
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <div className="w-4 h-4 border-[2px] border-white rotate-45 rounded-sm"></div>
          </div>
          <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white transition-colors">
            {t('appTitle')}
          </span>
        </Link>
        <div className="flex items-center gap-2 md:gap-3" style={{ transform: "translateZ(10px)" }}>
          
          <div className="flex items-center bg-slate-100/70 dark:bg-slate-800/70 gap-1.5 px-3 py-1 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <Languages className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
            <select 
              id="global-language-selector"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-transparent border-none text-[13px] font-bold outline-none focus:ring-0 cursor-pointer pr-2 appearance-none text-slate-800 dark:text-slate-100"
              title="Select interface and clinical translation language"
            >
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <option key={code} value={code} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                  {name}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-xl text-slate-700 dark:text-slate-300 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all active:scale-95 border border-transparent dark:border-slate-700/50"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>

          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
               {t('liveSync')}
            </span>
          </div>
        </div>
      </motion.nav>

      {/* Real-Time Screen Translation Notification Toast */}
      <AnimatePresence>
        {isTranslating && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-orange-500/40"
          >
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
            <Languages className="w-3.5 h-3.5 text-orange-400" />
            <span>Translating screen and clinical conversation into {translatingLanguageName} in real time...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PatientProtectedRoute({ children }: { children: React.ReactNode }) {
  const patientId = typeof window !== 'undefined' ? localStorage.getItem('patientId') : null;
  if (!patientId) {
    return <Navigate to="/patient/login" replace />;
  }
  return <>{children}</>;
}

function DoctorProtectedRoute({ children }: { children: React.ReactNode }) {
  const doctorId = typeof window !== 'undefined' ? (localStorage.getItem('doctorId') || localStorage.getItem('doctorEmail')) : null;
  if (!doctorId) {
    return <Navigate to="/doctor/login" replace />;
  }
  return <>{children}</>;
}

function HealthAmbientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* 1. Base Multi-Stop Layer: Smooth Clinical Gradient Transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/70 via-slate-50/90 to-slate-100/90 dark:from-[#060913] dark:via-[#04060c] dark:to-[#020307] transition-colors duration-500" />

      {/* 2. Light Mode: Luminous Fluid Gradients (Clinical Sky, Healing Mint, Vitality Rose) */}
      <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-700 pointer-events-none">
        <div className="absolute -top-[18%] left-1/2 -translate-x-1/2 w-[85vw] h-[55vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(186,230,253,0.7),rgba(224,242,254,0.35),transparent_70%)] blur-2xl" />
        <div className="absolute top-[25%] -right-[10%] w-[55vw] h-[50vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(167,243,208,0.48),rgba(209,250,229,0.2),transparent_65%)] blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50vw] h-[50vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(254,226,226,0.45),rgba(255,237,213,0.2),transparent_65%)] blur-3xl" />
      </div>

      {/* 3. Dark Mode: Deep Obsidian Auroras (Electric Cyan, Emerald Vitality, Deep Indigo) */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[90vw] h-[60vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.18),rgba(2,132,199,0.08),transparent_70%)] blur-3xl" />
        <div className="absolute top-[20%] -right-[15%] w-[60vw] h-[55vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14),rgba(5,150,105,0.05),transparent_65%)] blur-3xl" />
        <div className="absolute -bottom-[15%] -left-[10%] w-[60vw] h-[55vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.14),rgba(79,70,229,0.06),transparent_65%)] blur-3xl" />
      </div>

      {/* 4. Fine Architectural Matrix (Dot Grid) */}
      <div className="absolute inset-0 bg-[radial-gradient(#64748b_1.1px,transparent_1.1px)] dark:bg-[radial-gradient(#38bdf8_1.1px,transparent_1.1px)] [background-size:26px_26px] opacity-25 dark:opacity-15 transition-all duration-500" />

      {/* 5. Geometric Precision Grid (Hairline Mesh) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(56,189,248,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.035)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(ellipse_90%_80%_at_50%_50%,#000_65%,transparent_100%)]" />

      {/* 6. Dynamic Rhythmic ECG Heart Rate Animation (Vital Pulse Waveform) */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none overflow-hidden flex items-center justify-center opacity-40 dark:opacity-30">
        <svg 
          className="w-full h-32 max-w-7xl mx-auto" 
          viewBox="0 0 1200 120" 
          fill="none" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="ecgGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
              <stop offset="20%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
            <filter id="ecgPulseBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Faint static clinical baseline gridline */}
          <line x1="0" y1="60" x2="1200" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-slate-300 dark:text-cyan-950/60" />

          {/* Static ECG Baseline Track */}
          <path
            d="M0,60 L200,60 L215,60 L225,52 L235,66 L245,18 L255,102 L265,54 L275,64 L290,60 L500,60 L515,60 L525,52 L535,66 L545,18 L555,102 L565,54 L575,64 L590,60 L800,60 L815,60 L825,52 L835,66 L845,18 L855,102 L865,54 L875,64 L890,60 L1100,60 L1115,60 L1125,52 L1135,66 L1145,18 L1155,102 L1165,54 L1175,64 L1200,60"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            className="text-slate-300/40 dark:text-cyan-900/30"
          />

          {/* Animated Sweeping Heartbeat Wave with Glowing Head */}
          <motion.path
            d="M0,60 L200,60 L215,60 L225,52 L235,66 L245,18 L255,102 L265,54 L275,64 L290,60 L500,60 L515,60 L525,52 L535,66 L545,18 L555,102 L565,54 L575,64 L590,60 L800,60 L815,60 L825,52 L835,66 L845,18 L855,102 L865,54 L875,64 L890,60 L1100,60 L1115,60 L1125,52 L1135,66 L1145,18 L1155,102 L1165,54 L1175,64 L1200,60"
            stroke="url(#ecgGlowGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#ecgPulseBloom)"
            initial={{ pathLength: 0.18, pathOffset: 0 }}
            animate={{ pathOffset: [0, 1] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </svg>
      </div>
    </div>
  );
}

function HospitalsRoute() {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <HospitalsNearMe 
        onBack={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }} 
        onSelectForAmbulance={(hosp) => navigate('/emergency', { state: { hospital: hosp } })} 
      />
    </div>
  );
}

function EmergencyRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const destinationHospital = (location.state as any)?.hospital || null;
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <EmergencyAmbulance 
        onBack={() => {
          if (window.history.length > 2) {
            navigate(-1);
          } else {
            navigate('/');
          }
        }} 
        destinationHospital={destinationHospital} 
      />
    </div>
  );
}

function ScrollToTopAndFocus() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    stopSpeech();
    const mainContent = document.getElementById('main-app-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location.pathname]);

  return null;
}

function MainLayout() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/patient/dashboard') || location.pathname.startsWith('/doctor/dashboard');
  const isFullScreenApp = isDashboard || location.pathname === '/emergency' || location.pathname === '/hospitals';

  return (
    <div className="flex flex-col h-screen overflow-hidden antialiased text-slate-900 dark:text-slate-50 selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-500 print:h-auto print:overflow-visible print:block relative">
      <ScrollToTopAndFocus />
      <HealthAmbientBackground />
      {!isFullScreenApp && <Navbar />}
      <main id="main-app-content" tabIndex={-1} className="flex-1 flex flex-col min-h-0 overflow-hidden relative print:overflow-visible print:block z-10 outline-none">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hospitals" element={<HospitalsRoute />} />
          <Route path="/emergency" element={<EmergencyRoute />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route 
            path="/patient/dashboard" 
            element={
              <PatientProtectedRoute>
                <PatientDashboard />
              </PatientProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/dashboard" 
            element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            } 
          />
          {/* Custom 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function AppContent() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && <GlobalLoader onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

