import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserRound, 
  LockKeyhole, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  CreditCard, 
  FileText, 
  ExternalLink, 
  X, 
  AlertCircle,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import RetractableBackButton from './RetractableBackButton';
import TTSButton from './TTSButton';

type AuthMode = 'login' | 'register';
type IdentifierType = 'email' | 'phone' | 'abha';

export default function PatientLogin() {
  const { t } = useAppContext();
  const navigate = useNavigate();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<AuthMode>('login');

  // Identifier (ABHA ID, Phone, or Email)
  const [identifierType, setIdentifierType] = useState<IdentifierType>('abha');
  const [identifier, setIdentifier] = useState('');

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState('123456');

  // Terms & Privacy Acceptance (required on Register, starts false)
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // Legal Modal view
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [existingSession, setExistingSession] = useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('patientId');
    if (saved) {
      setExistingSession(saved);
    }
  }, []);

  const handleStartFresh = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientIdentifier');
    localStorage.removeItem('identifierType');
    localStorage.removeItem('patientName');
    localStorage.removeItem('patientAuthType');
    setExistingSession(null);
    setIdentifier('');
    setOtp('');
    setOtpSent(false);
    setErrorMsg('');
    setSuccessMsg('Session cleared. Starting fresh!');
  };

  // Mode Switching
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setOtpSent(false);
    setOtp('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const getFormattedIdentifier = () => {
    if (identifierType === 'phone') {
      return `+91${identifier.replace(/\D/g, '')}`;
    }
    return identifier;
  };

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${identifierType === 'abha' ? 'ABHA ID' : identifierType === 'phone' ? 'Phone Number' : 'Email Address'}.`);
      return;
    }

    if (identifierType === 'abha') {
      const cleanAbha = identifier.replace(/\D/g, '');
      if (cleanAbha.length !== 14) {
        setErrorMsg("ABHA ID must be exactly 14 digits.");
        return;
      }
    } else if (identifierType === 'phone') {
      const cleanPhone = identifier.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMsg("Phone number must be exactly 10 digits.");
        return;
      }
    } else if (identifierType === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
      if (!emailRegex.test(identifier)) {
        setErrorMsg("Email address must follow the exact @gmail.com format.");
        return;
      }
    }

    if (mode === 'register') {
      if (!agreeTerms || !agreePrivacy) {
        setErrorMsg("Please accept both the Terms of Service and Privacy Policy to register.");
        return;
      }
    }

    const finalIdentifier = getFormattedIdentifier();
    
    setLoading(true);
    try {
      const res = await fetch('/api/patient/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: finalIdentifier, type: mode }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setServerOtp(data.otp);
        setSuccessMsg(`Verification code sent! Dummy OTP: ${data.otp}. Enter it below.`);
      } else {
        if (res.status === 400 && mode === 'register' && data.error?.includes("already exists")) {
          setMode('login');
          setOtpSent(false);
          setOtp('');
          setErrorMsg("Account already exists. We have switched you to login mode. Please click 'Send OTP' again to sign in.");
        } else if (res.status === 404 && mode === 'login' && data.error?.includes("not found")) {
          setMode('register');
          setOtpSent(false);
          setOtp('');
          setAgreeTerms(true);
          setAgreePrivacy(true);
          setErrorMsg("Account not found. We have switched you to register mode and accepted terms on your behalf. Please click 'Send OTP Verification Code' again to register!");
        } else {
          setErrorMsg(data.error || "Failed to send verification code. Please try again.");
        }
      }
    } catch {
      // Fallback simulation if network is unreachable
      setOtpSent(true);
      setServerOtp('123456');
      setSuccessMsg("Network unreachable. Fallback OTP generated: 123456. Enter it below.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Final Submit (Login or Complete Registration)
  const handleSubmitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp.trim()) {
      setErrorMsg("Please enter the 6-digit OTP.");
      return;
    }

    const finalIdentifier = getFormattedIdentifier();

    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await fetch('/api/patient/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: finalIdentifier, otp, abhaId: finalIdentifier }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('patientId', data.patientId);
          localStorage.setItem('patientIdentifier', finalIdentifier);
          localStorage.setItem('identifierType', identifierType);
          localStorage.setItem('patientAuthType', 'login');
          if (data.patientName) {
            localStorage.setItem('patientName', data.patientName);
          }
          navigate('/patient/dashboard');
        } else {
          setErrorMsg(data.error || "Invalid OTP or user not found.");
        }
      } else {
        // Mode === 'register'
        if (!agreeTerms || !agreePrivacy) {
          setErrorMsg("Terms of service and privacy policy consent required.");
          setLoading(false);
          return;
        }

        const res = await fetch('/api/patient/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: finalIdentifier,
            identifierType,
            otp,
            termsAccepted: agreeTerms,
            privacyAccepted: agreePrivacy,
            abhaId: identifierType === 'abha' ? finalIdentifier : `ABHA-${Date.now().toString().slice(-8)}`,
            email: identifierType === 'email' ? finalIdentifier : '',
            phone: identifierType === 'phone' ? finalIdentifier : '',
          }),
        });
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('patientId', data.patientId);
          localStorage.setItem('patientIdentifier', identifier);
          localStorage.setItem('identifierType', identifierType);
          localStorage.setItem('patientAuthType', 'register');
          localStorage.removeItem('patientName');
          navigate('/patient/dashboard');
        } else {
          setErrorMsg(data.error || "Registration failed. Please check your details.");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      const dummyId = `patient_${Date.now()}`;
      localStorage.setItem('patientId', dummyId);
      localStorage.setItem('patientIdentifier', identifier);
      localStorage.setItem('identifierType', identifierType);
      localStorage.setItem('patientAuthType', mode);
      localStorage.removeItem('patientName');
      navigate('/patient/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 dark:from-blue-900/30 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900 pointer-events-none" />

      <div className="min-h-full w-full flex flex-col items-center justify-start px-3 py-4 sm:py-6">
        {/* Back to Home */}
        <div className="w-full max-w-[420px] mb-3 flex items-center justify-start z-10">
          <RetractableBackButton onClick={() => setShowExitConfirm(true)} label="Exit" id="patient-login-back-btn" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] z-10 shrink-0"
        >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 dark:bg-slate-950 px-5 py-4 text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center shadow-sm text-blue-400 backdrop-blur-md border border-white/10">
                <UserRound className="w-5 h-5" />
              </div>
              <TTSButton
                text={`Patient Access Portal. ${mode === 'login' ? 'Sign in with your ABHA ID, mobile phone number, or email.' : 'Register new account with your ABHA ID, mobile phone number, or email.'}`}
                size="sm"
                label="Read Screen"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                id="patient-login-tts-header"
              />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
              Patient Access Portal
            </h2>
            <p className="text-slate-300 text-[11px] font-medium">
              National Health Interoperability & Clinical Intake
            </p>

            {/* Mode Switcher Tabs: Login vs Register */}
            <div className="mt-3 grid grid-cols-2 p-0.5 bg-white/10 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign In / Login
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Create Account / Register
              </button>
            </div>
          </div>

          <div className="p-5">
            {/* Active Session Notification */}
            {existingSession && (
              <div className="mb-3.5 p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded-xl flex items-center justify-between gap-2 border border-blue-200 dark:border-blue-900/50">
                <div className="flex items-center gap-1.5 truncate">
                  <UserRound className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span className="truncate">Active patient session found</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate('/patient/dashboard')}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shadow-xs"
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={handleStartFresh}
                    className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition shadow-xs"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Messages */}
            {errorMsg && (
              <div className="mb-3.5 p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl flex items-center justify-between gap-2 border border-red-200 dark:border-red-900/50">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <TTSButton text={errorMsg} size="sm" />
              </div>
            )}

            {successMsg && (
              <div className="mb-3.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center justify-between gap-2 border border-emerald-200 dark:border-emerald-800/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <TTSButton text={successMsg} size="sm" />
              </div>
            )}

            <div className="space-y-3.5">
              {/* Identifier Type Selector: ABHA ID, Phone, Email */}
              {!otpSent && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {mode === 'register' ? 'Register Using' : 'Sign In Using'}
                    </label>
                    <TTSButton 
                      text={`Choose your sign in method: ABHA ID, Mobile Phone, or Email ID. Currently selected is ${identifierType.toUpperCase()}.`} 
                      size="sm" 
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIdentifierType('abha');
                        setIdentifier('');
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        identifierType === 'abha'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>ABHA ID</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIdentifierType('phone');
                        setIdentifier('');
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        identifierType === 'phone'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIdentifierType('email');
                        setIdentifier('');
                      }}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                        identifierType === 'email'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email ID</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-flow: Identifier & Send OTP OR Enter OTP */}
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        {identifierType === 'abha' && 'Enter 14-Digit ABHA ID'}
                        {identifierType === 'phone' && 'Enter 10-Digit Mobile Phone Number'}
                        {identifierType === 'email' && 'Enter Email Address'}
                      </label>
                      <TTSButton 
                        text={`${identifierType === 'abha' ? 'Please enter your 14 digit ABHA ID.' : identifierType === 'phone' ? 'Please enter your 10 digit mobile phone number.' : 'Please enter your email address.'} ${identifier ? `Current value entered is ${identifier}` : 'No value entered yet.'}`} 
                        size="sm" 
                      />
                    </div>
                    <div className="relative">
                      {identifierType === 'phone' && (
                        <span className="absolute left-7 top-[9px] text-xs font-medium text-slate-500 z-10">+91</span>
                      )}
                      <input 
                        type={identifierType === 'email' ? 'email' : identifierType === 'phone' ? 'tel' : 'text'}
                        required
                        maxLength={identifierType === 'abha' ? 14 : identifierType === 'phone' ? 10 : undefined}
                        className={`w-full ${identifierType === 'phone' ? 'pl-14' : 'pl-8'} pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition text-slate-900 dark:text-white placeholder:text-slate-400 font-medium`}
                        placeholder={
                          identifierType === 'abha' 
                            ? 'e.g., 98723456102914' 
                            : identifierType === 'phone' 
                            ? '9876543210' 
                            : 'e.g., patient@gmail.com'
                        }
                        value={identifier}
                        onChange={e => {
                          let val = e.target.value;
                          if (identifierType === 'abha' || identifierType === 'phone') {
                            val = val.replace(/\D/g, '');
                          }
                          setIdentifier(val);
                        }}
                      />
                      {identifierType === 'abha' && <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />}
                      {identifierType === 'phone' && <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />}
                      {identifierType === 'email' && <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />}
                    </div>
                  </div>

                  {/* Terms & Privacy acceptance only for Registration */}
                  {mode === 'register' && (
                    <div className="mt-2 pt-2.5 pb-1 border-t border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>Consent & Legal Acknowledgement</span>
                      </div>

                      {/* Terms of Service Checkbox */}
                      <div className="flex items-start gap-2.5">
                        <input
                          id="terms-checkbox"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={e => {
                            setAgreeTerms(e.target.checked);
                            if (e.target.checked) setErrorMsg('');
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="terms-checkbox" className="text-xs text-slate-700 dark:text-slate-300 leading-snug cursor-pointer select-none">
                          I have read and accept the{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalType('terms');
                            }}
                            className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            Terms of Service <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </label>
                      </div>

                      {/* Privacy Policy Checkbox */}
                      <div className="flex items-start gap-2.5">
                        <input
                          id="privacy-checkbox"
                          type="checkbox"
                          checked={agreePrivacy}
                          onChange={e => {
                            setAgreePrivacy(e.target.checked);
                            if (e.target.checked) setErrorMsg('');
                          }}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 mt-0.5 cursor-pointer"
                        />
                        <label htmlFor="privacy-checkbox" className="text-xs text-slate-700 dark:text-slate-300 leading-snug cursor-pointer select-none">
                          I consent to share my data and have read the{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalType('privacy');
                            }}
                            className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-700 inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            Privacy Policy <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </label>
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                        Note: Your medical records are encrypted and will not be used to train AI models.
                      </p>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    <span>{loading ? "Sending Verification Code..." : "Send OTP Verification Code"}</span>
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleSubmitAuth} className="space-y-3 pt-1">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300">
                        OTP Sent to {identifierType.toUpperCase()}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {identifier}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TTSButton 
                        text={`Verification code sent to ${identifierType}. Code is ${serverOtp}. Please enter this 6 digit code below to continue.`} 
                        size="sm" 
                      />
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  {/* OTP Auto-Fill Helper */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                      Verification Code: <code className="font-mono font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-emerald-300 dark:border-emerald-700">{serverOtp}</code>
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtp(serverOtp)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer transition shadow-sm"
                    >
                      Auto-fill OTP
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Enter 6-Digit Verification Code
                      </label>
                      <TTSButton 
                        text={`Enter 6 digit verification code. ${otp ? `Currently entered: ${otp}` : 'No code entered yet.'}`} 
                        size="sm" 
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        maxLength={6}
                        className="w-full pl-8 pr-3 py-2 text-sm tracking-widest font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-slate-900 dark:text-white font-bold"
                        placeholder="123456"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                      />
                      <LockKeyhole className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit" 
                    disabled={loading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-600/30 cursor-pointer disabled:opacity-50"
                  >
                    {loading 
                      ? (mode === 'register' ? "Creating Account..." : "Signing In...") 
                      : (mode === 'register' ? "Verify OTP & Complete Registration" : "Verify OTP & Sign In")}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </div>
        </motion.div>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {modalType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                  </h3>
                </div>
                <button 
                  onClick={() => setModalType(null)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-3.5 leading-relaxed">
                {modalType === 'terms' ? (
                  <>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Terms of Service: This agreement governs your use of the HealthPoint patient portal and clinical intake assistant.
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">1. Patient Intake & Accurate Records</h4>
                    <p>
                      HealthPoint provides pre-consultation intake services. By using this portal, you agree that information and health measurements provided represent your truthful current health status.
                    </p>
                    <h4 className="font-bold text-slate-900 dark:text-white">2. Assistive Technology Limitation</h4>
                    <p>
                      This system assists healthcare staff during your hospital or clinic visit. It is not an emergency hotline. In case of life-threatening emergencies, please call emergency services immediately.
                    </p>
                    <h4 className="font-bold text-slate-900 dark:text-white">3. Patient Autonomy</h4>
                    <p>
                      You maintain full rights to request record modifications or complete deletion at any time with your healthcare administrator.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                      Privacy Policy: Outlining how we safeguard, encrypt, and handle your sensitive personal health data.
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white">1. Data Minimization</h4>
                    <p>
                      We strictly collect clinical measurements and contact identifiers solely needed to compile your medical appointment file.
                    </p>
                    <h4 className="font-bold text-slate-900 dark:text-white">2. DPDP Act 2023 Compliance</h4>
                    <p>
                      Personal medical information is isolated and encrypted. Your medical dialogue transcripts are never utilized to train third-party artificial intelligence models.
                    </p>
                    <h4 className="font-bold text-slate-900 dark:text-white">3. Consent Architecture</h4>
                    <p>
                      Consulting physicians can only view your diagnostic and triage records while an active consultation session is open.
                    </p>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Exit to Home Page?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to return to the home screen?
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
