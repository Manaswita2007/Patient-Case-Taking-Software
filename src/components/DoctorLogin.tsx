import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  LockKeyhole, 
  Mail, 
  Building2, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import RetractableBackButton from './RetractableBackButton';

export const AYUSH_HOSPITALS = [
  "All India Institute of Ayurveda (AIIA) Hospital",
  "National Institute of Ayurveda (NIA) Hospital",
  "Dr. D.Y. Patil Ayurveda Hospital & Research Center",
  "Government Ayurveda Medical College & Hospital (GAMC)",
  "Arya Vaidya Sala Charitable Hospital",
  "National Institute of Homoeopathy (NIH) Hospital",
  "Nehru Homoeopathic Medical College & Hospital",
  "Bakson Homoeopathic Medical College & Hospital",
  "Bharati Vidyapeeth Homoeopathic Hospital",
  "Government Homoeopathic Medical College & Hospital"
];

export const DOCTORS_BY_HOSPITAL: Record<string, Array<{ name: string; department: string; degree: string; type: 'ayurveda' | 'homeopathy' }>> = {
  "All India Institute of Ayurveda (AIIA) Hospital": [
    { name: 'Dr. Rajeshwar Sharma', department: 'Kayachikitsa (Internal Medicine)', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
    { name: 'Dr. Priyamvada Nair', department: 'Panchakarma Department', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
    { name: 'Dr. Vaibhav Shastri', department: 'Shalya Tantra', degree: 'BAMS, MS (Ayurveda)', type: 'ayurveda' },
  ],
  "National Institute of Ayurveda (NIA) Hospital": [
    { name: 'Dr. Devendra Joshi', department: 'Kayachikitsa', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
    { name: 'Dr. Ananya Vats', department: 'Dravyaguna', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
    { name: 'Dr. Harish Bhatt', department: 'Shalakya Tantra', degree: 'BAMS, MS (Ayurveda)', type: 'ayurveda' },
  ],
  "Dr. D.Y. Patil Ayurveda Hospital & Research Center": [
    { name: 'Dr. Rameshwar Patil', department: 'Panchakarma', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
    { name: 'Dr. Sunita Kulkarni', department: 'Prasuti & Stri Roga', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
  ],
  "Government Ayurveda Medical College & Hospital (GAMC)": [
    { name: 'Dr. Venkatesh Murthy', department: 'Kaumarbhritya', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
    { name: 'Dr. Lakshmi Prasad', department: 'Swasthavritta', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
  ],
  "Arya Vaidya Sala Charitable Hospital": [
    { name: 'Dr. K. Madhavan Kutty', department: 'Panchakarma & Rasayana', degree: 'BAMS, Senior Vaidyaratnam', type: 'ayurveda' },
    { name: 'Dr. Radhika Varier', department: 'Kayachikitsa', degree: 'BAMS, MD (Ayurveda)', type: 'ayurveda' },
  ],
  "National Institute of Homoeopathy (NIH) Hospital": [
    { name: 'Dr. Sourav Banerjee', department: 'Homoeopathic Materia Medica', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
    { name: 'Dr. Meenakshi Sengupta', department: 'Organon of Medicine & Philosophy', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
    { name: 'Dr. Pradeep Haldar', department: 'Practice of Medicine', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
  ],
  "Nehru Homoeopathic Medical College & Hospital": [
    { name: 'Dr. Ashok Sethi', department: 'Homoeopathic Repertory', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
    { name: 'Dr. Geeta Chadha', department: 'Homoeopathic Pharmacy', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
  ],
  "Bakson Homoeopathic Medical College & Hospital": [
    { name: 'Dr. Rohan Mukherjee', department: 'Clinical Homoeopathy', degree: 'BHMS, MSc (Homoeopathy)', type: 'homeopathy' },
    { name: 'Dr. Smriti Bakshi', department: 'Homoeopathic Paediatrics', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
  ],
  "Bharati Vidyapeeth Homoeopathic Hospital": [
    { name: 'Dr. Kavita Deshmukh', department: 'Homoeopathic Repertory', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
    { name: 'Dr. Nitin Shinde', department: 'Practice of Medicine', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
  ],
  "Government Homoeopathic Medical College & Hospital": [
    { name: 'Dr. Abdul Rahman', department: 'Homoeopathic Materia Medica', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
    { name: 'Dr. Fathima Beevi', department: 'Organon of Medicine & Philosophy', degree: 'BHMS, MD (Homoeopathy)', type: 'homeopathy' },
  ],
};

export default function DoctorLogin() {
  const { t } = useAppContext();
  const navigate = useNavigate();

  // Sequential selection steps: 1. Hospital -> 2. Doctor -> 3. Email Input
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('123456');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('doctorId')) {
      navigate('/doctor/dashboard');
    }
  }, [navigate]);

  const availableDoctors = selectedHospital ? (DOCTORS_BY_HOSPITAL[selectedHospital] || []) : [];
  const selectedDoctorObj = availableDoctors.find(d => d.name === selectedDoctorName);

  const handleHospitalChange = (hospital: string) => {
    setSelectedHospital(hospital);
    setSelectedDoctorName('');
    setLoginEmail('');
    setOtpSent(false);
    setOtp('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleDoctorChange = (doctorName: string) => {
    setSelectedDoctorName(doctorName);
    setLoginEmail(''); // Do NOT automatically fill email
    setOtpSent(false);
    setOtp('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const validateHospitalEmail = (email: string) => {
    const clean = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(clean);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedHospital) {
      setErrorMsg('Please select your affiliated Ayurveda or Homeopathy hospital first.');
      return;
    }

    if (!selectedDoctorName) {
      setErrorMsg('Please select your doctor profile.');
      return;
    }

    const cleanEmail = loginEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your genuine hospital email address (e.g. dr.name@hospital.com).');
      return;
    }

    if (!validateHospitalEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid hospital email format (e.g. doctor@hospital.com).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/doctor/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail,
          hospital: selectedHospital,
          doctorName: selectedDoctorName,
          department: selectedDoctorObj?.department,
          degree: selectedDoctorObj?.degree,
          type: selectedDoctorObj?.type
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const receivedOtp = data.otp || '123456';
        setGeneratedOtp(receivedOtp);
        setOtpSent(true);
        setSuccessMsg(`Verification code generated! OTP: ${receivedOtp}`);
      } else {
        setErrorMsg(data.error || 'Failed to send verification code.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otp.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const res = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanEmail, 
          otp,
          doctorName: selectedDoctorName,
          hospital: selectedHospital
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('doctorId', data.doctorId || selectedDoctorName || cleanEmail);
        localStorage.setItem('doctorName', data.doctor?.name || selectedDoctorName);
        localStorage.setItem('doctorHospital', data.doctor?.hospital || selectedHospital);
        localStorage.setItem('doctorDepartment', data.doctor?.department || selectedDoctorObj?.department || 'Ayurveda & Homeopathy');
        localStorage.setItem('doctorDegree', data.doctor?.degree || selectedDoctorObj?.degree || '');
        localStorage.setItem('doctorType', data.doctor?.type || selectedDoctorObj?.type || 'ayurveda');
        if (data.doctorDatabase) {
          localStorage.setItem('doctorDatabase', data.doctorDatabase);
        }
        navigate('/doctor/dashboard');
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please check your OTP.');
      }
    } catch (err) {
      setErrorMsg('A network error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-transparent relative transition-colors">
      <div className="min-h-full w-full flex flex-col items-center justify-start px-3 py-4 sm:py-6 relative z-10">
        {/* Retractable Back / Exit Button with Confirmation Flow */}
        <div className="w-full max-w-md mb-3 flex items-center justify-start z-20">
          <RetractableBackButton onClick={() => setShowExitConfirm(true)} label="Exit" id="doctor-login-exit-btn" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 to-emerald-800 dark:from-teal-900 dark:to-slate-950 px-6 py-6 text-center text-white relative overflow-hidden">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-2.5 backdrop-blur-md border border-white/20 shadow-inner">
              <Stethoscope className="w-6 h-6 text-teal-200" />
            </div>
            <h2 className="text-xl font-black tracking-tight">{t('doctorLoginTitle')}</h2>
            <p className="text-teal-100/80 text-xs mt-1 font-medium">Ayurveda & Homeopathy Clinical Portal</p>
          </div>

          <div className="p-6 sm:p-7">
            {/* Feedback Messages */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs font-medium"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 rounded-xl flex items-start gap-2.5 text-teal-800 dark:text-teal-200 text-xs font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {!otpSent ? (
              /* STEP 1: Hospital -> Doctor -> Email Selection */
              <form onSubmit={handleSendOtp} className="space-y-4">
                
                {/* 1. Hospital Selection First */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    1. Select AYUSH Hospital
                  </label>
                  <div className="relative">
                    <select
                      value={selectedHospital}
                      onChange={(e) => handleHospitalChange(e.target.value)}
                      required
                      className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs font-bold focus:ring-2 focus:ring-teal-600 outline-none cursor-pointer appearance-none pr-9"
                    >
                      <option value="">-- Choose Affiliated Hospital --</option>
                      {AYUSH_HOSPITALS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* 2. Doctor List According to Hospital */}
                {selectedHospital && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      2. Select Doctor Profile
                    </label>
                    <div className="relative">
                      <select
                        value={selectedDoctorName}
                        onChange={(e) => handleDoctorChange(e.target.value)}
                        required
                        className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-xs font-bold focus:ring-2 focus:ring-teal-600 outline-none cursor-pointer appearance-none pr-9"
                      >
                        <option value="">-- Choose Doctor in {selectedHospital.split('(')[0]} --</option>
                        {availableDoctors.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name} • {d.degree}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                    </div>

                    {selectedDoctorObj && (
                      <div className="mt-2 p-2.5 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/50 rounded-xl flex items-center gap-2 text-[11px] text-teal-900 dark:text-teal-200 font-semibold">
                        <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{selectedDoctorObj.department} ({selectedDoctorObj.degree})</span>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. Take Login Email (Not Auto-filled) */}
                {selectedDoctorName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      3. Hospital Domain Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. dr.sharma@hospital.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 text-sm font-medium focus:ring-2 focus:ring-teal-600 focus:border-transparent outline-none transition"
                      />
                      <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      Enter your genuine hospital email address (<code className="text-teal-600 dark:text-teal-400">@hospital.com</code>).
                    </p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !selectedHospital || !selectedDoctorName || !loginEmail}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm mt-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: OTP Verification (No email shown in OTP section) */
              <form onSubmit={handleVerifyAndLogin} className="space-y-5">
                <div className="text-center pb-2">
                  <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/40 rounded-full flex items-center justify-center mx-auto mb-2 text-teal-600 dark:text-teal-400">
                    <LockKeyhole className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Enter Verification Code</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Enter the 6-digit one-time password to verify your clinical credentials.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(generatedOtp);
                        setErrorMsg('');
                      }}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      ⚡ Autofill OTP
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-3 text-center text-2xl font-mono tracking-widest bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-600 outline-none transition"
                  />
                </div>

                <div className="space-y-2.5">
                  <button
                    type="submit"
                    disabled={loading || otp.length < 6}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-teal-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setErrorMsg('');
                    }}
                    className="w-full py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold transition cursor-pointer"
                  >
                    ← Change Hospital / Doctor Selection
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Do you want to exit?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                Are you sure you want to exit the Doctor Portal?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  No, Stay
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20 cursor-pointer"
                >
                  Yes, Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
