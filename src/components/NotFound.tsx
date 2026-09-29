import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldAlert, Home, ArrowLeft, Siren, Building2, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TTSButton from './TTSButton';

export default function NotFound() {
  const { t } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-6 bg-transparent text-slate-900 dark:text-slate-100 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto shadow-inner border border-orange-500/20">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <span className="text-xs font-mono font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 dark:border-orange-800 inline-block mb-3">
            Error 404
          </span>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            The clinical route, hospital record, or page you requested could not be located in the HealthPoint directory.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <TTSButton
            text="404 Page Not Found. The clinical route or page you requested could not be located in HealthPoint. You can return to the home page or access emergency services."
            size="sm"
            label={t('readScreen') || 'Read Screen'}
          />
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wide transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to HealthPoint Home</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back to Previous Page</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs font-semibold text-slate-500">
          <Link to="/patient/login" className="hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1">
            <span>Patient Portal</span>
          </Link>
          <span>•</span>
          <Link to="/doctor/login" className="hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1">
            <span>Doctor Login</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
