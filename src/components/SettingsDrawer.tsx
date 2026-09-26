import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Languages, 
  Moon, 
  Sun, 
  Activity, 
  LogOut, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useAppContext, LANGUAGE_NAMES } from '../context/AppContext';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'doctor' | 'patient';
  userName?: string;
  userId?: string;
  onLogout: () => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  userRole,
  userName,
  userId,
  onLogout,
}: SettingsDrawerProps) {
  const { theme, toggleTheme, language, setLanguage, isTranslating, translatingLanguageName, t } = useAppContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (showLogoutConfirm) setShowLogoutConfirm(false);
              else onClose();
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-sm sm:max-w-md h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t('settings')}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('preferencesAccount')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
              {/* Profile Card */}
              <div className="p-4 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
                  userRole === 'doctor' 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-600 shadow-emerald-500/20'
                }`}>
                  {userRole === 'doctor' ? <Stethoscope className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {userRole === 'doctor' ? t('specialistPhysician') : t('registeredPatient')}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm truncate mt-1">
                    {userName || (userRole === 'doctor' ? 'Attending Physician' : 'Registered Patient')}
                  </h4>
                  {userId && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      ID: {userId}
                    </div>
                  )}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 text-orange-500" />
                  {t('selectLanguage')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => setLanguage(code as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                        language === code
                          ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-xs ring-1 ring-orange-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {language === code && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-orange-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Appearance Mode */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  {t('appearanceTheme')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>{t('lightMode')}</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-900/30 text-blue-400 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-blue-400" />
                    <span>{t('darkMode')}</span>
                  </button>
                </div>
              </div>

              {/* ABDM Live Sync Status */}
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{t('abdmLiveSyncActive')}</span>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed font-medium">
                  {t('abdmSyncDesc')}
                </p>
              </div>
            </div>

            {/* Drawer Footer / Logout with Confirmation Flow */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50">
              <AnimatePresence mode="wait">
                {!showLogoutConfirm ? (
                  <motion.button
                    key="logout-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-sm border border-rose-200 dark:border-rose-900/60 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logOut')}</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="confirm-box"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-800 space-y-2.5 text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('confirmSignOutTitle')}</span>
                    </div>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 leading-snug">
                      {t('confirmSignOutDesc')}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowLogoutConfirm(false)}
                        className="flex-1 py-2 px-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                      >
                        {t('staySignedIn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLogoutConfirm(false);
                          onClose();
                          onLogout();
                        }}
                        className="flex-1 py-2 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                      >
                        {t('yesSignOut')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
