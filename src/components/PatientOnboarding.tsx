import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Activity, Building, ArrowRight, HeartPulse, Wind, Droplet, AlertCircle, AlertTriangle, ShieldCheck, X, Settings } from 'lucide-react';
import RetractableBackButton from './RetractableBackButton';
import SettingsDrawer from './SettingsDrawer';
import TTSButton from './TTSButton';

const DUMMY_HOSPITALS = [
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

const DUMMY_DOCTORS: Record<string, { name: string; degree: string; regNo: string; department?: string }[]> = {
  "All India Institute of Ayurveda (AIIA) Hospital": [
    { name: "Dr. Rajeshwar Sharma", degree: "BAMS, MD (Ayurveda - Kayachikitsa)", regNo: "AYU-78291" },
    { name: "Dr. Priyamvada Nair", degree: "BAMS, MD (Ayurveda - Panchakarma)", regNo: "AYU-91823" },
    { name: "Dr. Vaibhav Shastri", degree: "BAMS, MS (Ayurveda - Shalya Tantra)", regNo: "AYU-63728" }
  ],
  "National Institute of Ayurveda (NIA) Hospital": [
    { name: "Dr. Devendra Joshi", degree: "BAMS, MD (Ayurveda - Kayachikitsa)", regNo: "AYU-54912" },
    { name: "Dr. Ananya Vats", degree: "BAMS, MD (Ayurveda - Dravyaguna)", regNo: "AYU-40291" },
    { name: "Dr. Harish Bhatt", degree: "BAMS, MS (Ayurveda - Shalakya Tantra)", regNo: "AYU-88120" }
  ],
  "Dr. D.Y. Patil Ayurveda Hospital & Research Center": [
    { name: "Dr. Rameshwar Patil", degree: "BAMS, MD (Ayurveda - Panchakarma)", regNo: "AYU-22910" },
    { name: "Dr. Sunita Kulkarni", degree: "BAMS, MD (Ayurveda - Prasuti & Stri Roga)", regNo: "AYU-33019" }
  ],
  "Government Ayurveda Medical College & Hospital (GAMC)": [
    { name: "Dr. Venkatesh Murthy", degree: "BAMS, MD (Ayurveda - Kaumarbhritya)", regNo: "AYU-11928" },
    { name: "Dr. Lakshmi Prasad", degree: "BAMS, MD (Ayurveda - Swasthavritta)", regNo: "AYU-77291" }
  ],
  "Arya Vaidya Sala Charitable Hospital": [
    { name: "Dr. K. Madhavan Kutty", degree: "BAMS, Senior Vaidyaratnam", regNo: "AYU-00982" },
    { name: "Dr. Radhika Varier", degree: "BAMS, MD (Ayurveda - Kayachikitsa)", regNo: "AYU-66382" }
  ],
  "National Institute of Homoeopathy (NIH) Hospital": [
    { name: "Dr. Sourav Banerjee", degree: "BHMS, MD (Homoeopathic Materia Medica)", regNo: "HOM-44821" },
    { name: "Dr. Meenakshi Sengupta", degree: "BHMS, MD (Organon of Medicine)", regNo: "HOM-89214" },
    { name: "Dr. Pradeep Haldar", degree: "BHMS, MD (Practice of Medicine)", regNo: "HOM-38190" }
  ],
  "Nehru Homoeopathic Medical College & Hospital": [
    { name: "Dr. Ashok Sethi", degree: "BHMS, MD (Homoeopathic Repertory)", regNo: "HOM-99210" },
    { name: "Dr. Geeta Chadha", degree: "BHMS, MD (Homoeopathic Pharmacy)", regNo: "HOM-88192" }
  ],
  "Bakson Homoeopathic Medical College & Hospital": [
    { name: "Dr. Rohan Mukherjee", degree: "BHMS, MSc (Homoeopathic Clinical Practice)", regNo: "HOM-55201" },
    { name: "Dr. Smriti Bakshi", degree: "BHMS, MD (Homoeopathy - Paediatrics)", regNo: "HOM-66291" }
  ],
  "Bharati Vidyapeeth Homoeopathic Hospital": [
    { name: "Dr. Kavita Deshmukh", degree: "BHMS, MD (Homoeopathic Repertory)", regNo: "HOM-71932" },
    { name: "Dr. Nitin Shinde", degree: "BHMS, MD (Practice of Medicine)", regNo: "HOM-22918" }
  ],
  "Government Homoeopathic Medical College & Hospital": [
    { name: "Dr. Abdul Rahman", degree: "BHMS, MD (Homoeopathic Materia Medica)", regNo: "HOM-10928" },
    { name: "Dr. Fathima Beevi", degree: "BHMS, MD (Organon of Medicine)", regNo: "HOM-33829" }
  ]
};

export default function PatientOnboarding({ 
  onComplete,
  onBackToDashboard
}: { 
  onComplete: (data: any) => void;
  onBackToDashboard?: () => void;
}) {
  const [step, setStep] = useState(1);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [formData, setFormData] = useState({
    hospital: '',
    doctor: '',
    name: '',
    age: '',
    sex: '',
    bloodGroup: '',
    height: '',
    weight: '',
    hasSpo2: null as boolean | null,
    spo2: '',
    hasBp: null as boolean | null,
    bp: '',
    hasPulse: null as boolean | null,
    pulse: ''
  });

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [popupAlert, setPopupAlert] = useState<{ show: boolean, message: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measurement input refs for auto-focusing on pressing YES
  const spo2InputRef = useRef<HTMLInputElement>(null);
  const bpInputRef = useRef<HTMLInputElement>(null);
  const pulseInputRef = useRef<HTMLInputElement>(null);

  const [hasSavedDemographics, setHasSavedDemographics] = useState(false);

  // Fetch existing patient details to pre-fill the demographics
  useEffect(() => {
    const patientId = localStorage.getItem('patientId');
    if (patientId) {
      fetch(`/api/patient/${patientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.patient) {
            setFormData(prev => ({
              ...prev,
              name: data.patient.name && !data.patient.name.startsWith('Patient ') ? data.patient.name : prev.name,
              age: data.patient.age || prev.age,
              sex: data.patient.gender || data.patient.sex || prev.sex,
              bloodGroup: data.patient.bloodGroup || prev.bloodGroup,
              height: data.patient.height || prev.height,
              weight: data.patient.weight || prev.weight,
            }));
            if (data.patient.name && !data.patient.name.startsWith('Patient ') && data.patient.age && (data.patient.gender || data.patient.sex)) {
              setHasSavedDemographics(true);
            }
          }
        })
        .catch(err => console.error("Error fetching patient profile:", err));
    }
  }, []);

  // Auto-scroll to top when advancing or returning steps
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const triggerPopup = (message: string) => {
    setPopupAlert({ show: true, message });
  };

  const nextStep = () => {
    setAttemptedSubmit(true);
    if (step === 1) {
      if (!formData.hospital || !formData.doctor) {
        triggerPopup("You cannot leave this response blank. Please select both hospital and doctor to proceed.");
        return;
      }
    } else if (step === 2) {
      if (formData.hasSpo2 === null) {
        triggerPopup("You cannot leave this response blank. Please select Yes or No.");
        return;
      }
      if (formData.hasSpo2 && !formData.spo2.trim()) {
        triggerPopup("You cannot leave this response blank. Please enter your measured SpO2 (%) value.");
        return;
      }
    } else if (step === 3) {
      if (formData.hasBp === null) {
        triggerPopup("You cannot leave this response blank. Please select Yes or No.");
        return;
      }
      if (formData.hasBp && !formData.bp.trim()) {
        triggerPopup("You cannot leave this response blank. Please enter your measured Blood Pressure (mmHg) value.");
        return;
      }
    }
    
    setAttemptedSubmit(false);
    setStep(s => s + 1);
  };

  const handleComplete = async () => {
    setAttemptedSubmit(true);
    if (step === 4) {
      if (formData.hasPulse === null) {
        triggerPopup("You cannot leave this response blank. Please select Yes or No.");
        return;
      }
      if (formData.hasPulse && !formData.pulse.trim()) {
        triggerPopup("You cannot leave this response blank. Please enter your measured Pulse (bpm) value.");
        return;
      }
    }
    
    onComplete({
      ...formData,
      gender: formData.sex,
      bloodGroup: formData.bloodGroup
    });
  };

  const handleYesClick = (vitalType: 'spo2' | 'bp' | 'pulse') => {
    setAttemptedSubmit(false);
    if (vitalType === 'spo2') {
      setFormData(prev => ({ ...prev, hasSpo2: true }));
      setTimeout(() => {
        spo2InputRef.current?.focus();
      }, 60);
    } else if (vitalType === 'bp') {
      setFormData(prev => ({ ...prev, hasBp: true }));
      setTimeout(() => {
        bpInputRef.current?.focus();
      }, 60);
    } else if (vitalType === 'pulse') {
      setFormData(prev => ({ ...prev, hasPulse: true }));
      setTimeout(() => {
        pulseInputRef.current?.focus();
      }, 60);
    }
  };

  const handleNoClick = (vitalType: 'spo2' | 'bp' | 'pulse') => {
    if (vitalType === 'spo2') {
      setFormData(prev => ({ ...prev, hasSpo2: false, spo2: 'Not measured' }));
      setTimeout(() => {
        setAttemptedSubmit(false);
        setStep(3);
      }, 350);
    } else if (vitalType === 'bp') {
      setFormData(prev => ({ ...prev, hasBp: false, bp: 'Not measured' }));
      setTimeout(() => {
        setAttemptedSubmit(false);
        setStep(4);
      }, 350);
    } else if (vitalType === 'pulse') {
      setFormData(prev => ({ ...prev, hasPulse: false, pulse: 'Not measured' }));
      setTimeout(() => {
        setAttemptedSubmit(false);
        onComplete({ ...formData, hasPulse: false, pulse: 'Not measured' });
      }, 350);
    }
  };

  // Pressing Enter continues to next step or completes onboarding
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (step < 4) {
        nextStep();
      } else {
        handleComplete();
      }
    }
  };

  const stepTitles: Record<number, { title: string, icon: React.ReactNode }> = {
    1: { title: "Current Visit: Hospital", icon: <Building className="text-blue-600" /> },
    2: { title: "Current Visit: SpO2", icon: <Wind className="text-blue-600" /> },
    3: { title: "Current Visit: BP", icon: <Droplet className="text-blue-600" /> },
    4: { title: "Current Visit: Pulse", icon: <Activity className="text-blue-600" /> }
  };

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      id="patient-onboarding-container"
      onKeyDown={handleKeyDown}
      className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 relative scroll-smooth focus:outline-none"
    >
      {/* On-screen Pop-up Alert with Exclamation Mark */}
      <AnimatePresence>
        {popupAlert?.show && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-rose-500/30 text-center relative overflow-hidden"
            >
              <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-700 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4 shadow-lg shadow-rose-600/20">
                <span className="text-3xl font-black font-mono animate-bounce">!</span>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                Response Required!
                <TTSButton text={`Response Required! ${popupAlert.message}`} size="sm" autoPlay />
              </h3>
              
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 mb-5 leading-relaxed">
                {popupAlert.message}
              </p>

              <button 
                onClick={() => setPopupAlert(null)}
                className="w-full py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Understood, I will fill it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-full w-full flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 py-4 sm:py-6">
        {/* Top Control Bar with Back Button to Dashboard & Always Visible Settings Button */}
        <div className="w-full max-w-2xl mb-3 flex items-center justify-between z-20">
          <div>
            {onBackToDashboard && (
              <RetractableBackButton onClick={onBackToDashboard} label="Dashboard" id="onboarding-back-btn" />
            )}
          </div>
          <button 
            id="onboarding-settings-btn"
            onClick={() => setShowSettingsDrawer(true)} 
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-orange-500" />
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden my-0 sm:my-2 shrink-0"
        >
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-blue-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              {stepTitles[step]?.icon} {stepTitles[step]?.title}
            </h2>
            <TTSButton 
              text={`Step ${step} of 4: ${stepTitles[step]?.title}`} 
              size="sm" 
              label="Read Step"
            />
          </div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full transition-colors ${step >= s ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                      Select Hospital <span className="text-rose-500">*</span>
                    </label>
                    <TTSButton 
                      text={`Select hospital. ${formData.hospital ? `Currently selected: ${formData.hospital}` : 'Please choose a hospital from the list.'}`} 
                      size="sm" 
                    />
                  </div>
                  <select 
                    className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      attemptedSubmit && !formData.hospital ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900' : 'border-slate-200 dark:border-slate-600'
                    }`}
                    value={formData.hospital}
                    onChange={e => setFormData({...formData, hospital: e.target.value, doctor: ''})}
                  >
                    <option value="">-- Choose Hospital --</option>
                    {DUMMY_HOSPITALS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  {attemptedSubmit && !formData.hospital && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                    </p>
                  )}
                </div>

                {formData.hospital && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          Select Doctor <span className="text-rose-500">*</span>
                        </label>
                        <TTSButton 
                          text={`Select doctor. ${formData.doctor ? `Currently selected: ${formData.doctor}` : 'Please choose a doctor for your consultation.'}`} 
                          size="sm" 
                        />
                      </div>
                      <select 
                        className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          attemptedSubmit && !formData.doctor ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900' : 'border-slate-200 dark:border-slate-600'
                        }`}
                        value={formData.doctor}
                        onChange={e => setFormData({...formData, doctor: e.target.value})}
                      >
                        <option value="">-- Choose Doctor --</option>
                        {(DUMMY_DOCTORS[formData.hospital as keyof typeof DUMMY_DOCTORS] || []).map((d: any) => (
                          <option key={d.name} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                      {attemptedSubmit && !formData.doctor && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                        </p>
                      )}
                    </div>
                    
                    {formData.doctor && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700 overflow-hidden"
                      >
                        {(() => {
                          const docInfo = DUMMY_DOCTORS[formData.hospital as keyof typeof DUMMY_DOCTORS]?.find((d: any) => d.name === formData.doctor);
                          if (!docInfo) return null;
                          return (
                            <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
                              <div className="flex justify-between items-center border-b border-blue-200/50 dark:border-slate-700 pb-1">
                                <span className="font-semibold text-slate-900 dark:text-white">Degree:</span> 
                                <span>{docInfo.degree}</span>
                              </div>
                              <div className="flex justify-between items-center pb-1">
                                <span className="font-semibold text-slate-900 dark:text-white">Registration No:</span> 
                                <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-xs">{docInfo.regNo}</span>
                              </div>
                              <div className="pt-1 flex justify-end">
                                <TTSButton 
                                  text={`Selected Doctor: ${formData.doctor}. Degree: ${docInfo.degree}. Registration Number: ${docInfo.regNo}.`} 
                                  size="sm" 
                                  label="Read Doctor Details" 
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">Have you measured your SpO2?</h3>
                    <TTSButton 
                      text={`Have you measured your SpO2 blood oxygen? Tap Yes to enter your measurement, or tap No to automatically continue. ${formData.hasSpo2 === true ? `Your answer is Yes, and SpO2 value is ${formData.spo2 || 'not yet entered'}.` : formData.hasSpo2 === false ? 'Your answer is No.' : 'No response selected yet.'}`} 
                      size="sm" 
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Tap Yes to enter your measurement, or tap No to automatically continue</p>
                  
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => handleYesClick('spo2')}
                      className={`px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formData.hasSpo2 === true 
                          ? 'bg-emerald-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-600/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => handleNoClick('spo2')}
                      className={`px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formData.hasSpo2 === false 
                          ? 'bg-rose-600 text-white border-2 border-rose-500 shadow-lg shadow-rose-600/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {attemptedSubmit && formData.hasSpo2 === null && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1 mt-4">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                    </p>
                  )}
                </div>

                {formData.hasSpo2 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Enter SpO2 (%) <span className="text-rose-500">*</span>
                      </label>
                      <TTSButton 
                        text={`Enter SpO2 percentage. ${formData.spo2 ? `Current value: ${formData.spo2} percent` : 'No measurement entered yet.'}`} 
                        size="sm" 
                      />
                    </div>
                    <input 
                      ref={spo2InputRef}
                      type="text" 
                      className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold transition-all ${
                        attemptedSubmit && !formData.spo2.trim() ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900' : 'border-slate-200 dark:border-slate-600'
                      }`}
                      value={formData.spo2}
                      onChange={e => setFormData({...formData, spo2: e.target.value})}
                      placeholder="e.g. 98"
                    />
                    {attemptedSubmit && !formData.spo2.trim() && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">Have you measured your Blood Pressure?</h3>
                    <TTSButton 
                      text={`Have you measured your Blood Pressure? Tap Yes to enter your measurement, or tap No to automatically continue. ${formData.hasBp === true ? `Your answer is Yes, and Blood Pressure value is ${formData.bp || 'not yet entered'}.` : formData.hasBp === false ? 'Your answer is No.' : 'No response selected yet.'}`} 
                      size="sm" 
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Tap Yes to enter your measurement, or tap No to automatically continue</p>
                  
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => handleYesClick('bp')}
                      className={`px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formData.hasBp === true 
                          ? 'bg-emerald-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-600/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => handleNoClick('bp')}
                      className={`px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formData.hasBp === false 
                          ? 'bg-rose-600 text-white border-2 border-rose-500 shadow-lg shadow-rose-600/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {attemptedSubmit && formData.hasBp === null && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1 mt-4">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                    </p>
                  )}
                </div>

                {formData.hasBp && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Enter Blood Pressure (mmHg) <span className="text-rose-500">*</span>
                      </label>
                      <TTSButton 
                        text={`Enter Blood Pressure in millimeters of mercury. ${formData.bp ? `Current value: ${formData.bp}` : 'No measurement entered yet.'}`} 
                        size="sm" 
                      />
                    </div>
                    <input 
                      ref={bpInputRef}
                      type="text" 
                      className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold transition-all ${
                        attemptedSubmit && !formData.bp.trim() ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900' : 'border-slate-200 dark:border-slate-600'
                      }`}
                      value={formData.bp}
                      onChange={e => setFormData({...formData, bp: e.target.value})}
                      placeholder="e.g. 120/80"
                    />
                    {attemptedSubmit && !formData.bp.trim() && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 dark:text-white">Have you measured your Pulse?</h3>
                    <TTSButton 
                      text={`Have you measured your Pulse rate? Tap Yes to enter your measurement, or tap No to automatically start consultation. ${formData.hasPulse === true ? `Your answer is Yes, and Pulse value is ${formData.pulse || 'not yet entered'} beats per minute.` : formData.hasPulse === false ? 'Your answer is No.' : 'No response selected yet.'}`} 
                      size="sm" 
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Tap Yes to enter your measurement, or tap No to automatically start consultation</p>
                  
                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => handleYesClick('pulse')}
                      className={`px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formData.hasPulse === true 
                          ? 'bg-emerald-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-600/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                      }`}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => handleNoClick('pulse')}
                      className={`px-8 py-3.5 rounded-xl font-bold transition-all cursor-pointer ${
                        formData.hasPulse === false 
                          ? 'bg-rose-600 text-white border-2 border-rose-500 shadow-lg shadow-rose-600/30 scale-105' 
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-400'
                      }`}
                    >
                      No
                    </button>
                  </div>

                  {attemptedSubmit && formData.hasPulse === null && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1 mt-4">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                    </p>
                  )}
                </div>

                {formData.hasPulse && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Enter Pulse (bpm) <span className="text-rose-500">*</span>
                      </label>
                      <TTSButton 
                        text={`Enter Pulse rate in beats per minute. ${formData.pulse ? `Current value: ${formData.pulse} beats per minute` : 'No measurement entered yet.'}`} 
                        size="sm" 
                      />
                    </div>
                    <input 
                      ref={pulseInputRef}
                      type="text" 
                      className={`w-full p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl font-bold transition-all ${
                        attemptedSubmit && !formData.pulse.trim() ? 'border-rose-500 ring-2 ring-rose-300 dark:ring-rose-900' : 'border-slate-200 dark:border-slate-600'
                      }`}
                      value={formData.pulse}
                      onChange={e => setFormData({...formData, pulse: e.target.value})}
                      placeholder="e.g. 72"
                    />
                    {attemptedSubmit && !formData.pulse.trim() && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> ! You cannot leave this response blank
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <button 
                onClick={() => {
                  setAttemptedSubmit(false);
                  setStep(s => s - 1);
                }}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white px-6 py-3 rounded-xl font-bold transition-all cursor-pointer"
              >
                Back
              </button>
            ) : <div></div>}
            
            {step < 4 ? (
              <button 
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-600/30 cursor-pointer"
              >
                <HeartPulse className="w-5 h-5" /> Start Consultation
              </button>
            )}
          </div>

          {/* Patient Consent & AI Policy Notice */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Under patient consent: Personal records are encrypted and not used for training AI</span>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Slide-out Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        userRole="patient"
        userName={formData.name || localStorage.getItem('patientName') || 'Registered Patient'}
        userId={localStorage.getItem('patientId') || undefined}
        onLogout={() => {
          localStorage.removeItem('patientId');
          localStorage.removeItem('patientName');
          window.location.href = '/';
        }}
      />
    </div>
  );
}
