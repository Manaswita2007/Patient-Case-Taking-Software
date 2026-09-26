import React from 'react';
import { Leaf, BookOpen, Search, Droplet, Wind, Flame } from 'lucide-react';
import { motion } from 'motion/react';

export default function AyushResources() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-3xl border border-green-100 dark:border-green-800/50 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 dark:opacity-5 translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <Leaf className="w-64 h-64 text-green-600" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-extrabold text-green-900 dark:text-green-300 tracking-tight mb-2">
            AYUSH Medical Reference
          </h1>
          <p className="text-green-700 dark:text-green-400 font-medium text-lg">
            Guidelines, diagnostic principles, and treatment protocols for Ayurveda, Yoga & Naturopathy, Unani, Siddha, Sowa Rigpa and Homoeopathy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-500" />
            Ayurveda (Dashavidha Pariksha)
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">Tenfold Examination</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                1. <strong>Prakriti</strong> (Constitution)<br/>
                2. <strong>Vikriti</strong> (Pathological State)<br/>
                3. <strong>Sara</strong> (Tissue Vitality)<br/>
                4. <strong>Samhanana</strong> (Compactness)<br/>
                5. <strong>Pramana</strong> (Measurement)<br/>
                6. <strong>Satmya</strong> (Adaptability)<br/>
                7. <strong>Sattva</strong> (Mental Strength)<br/>
                8. <strong>Ahara Shakti</strong> (Digestive Power)<br/>
                9. <strong>Vyayama Shakti</strong> (Exercise Capacity)<br/>
                10. <strong>Vaya</strong> (Age)
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-sky-500" />
            Tridosha Principles
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Wind className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Vata (Air & Space)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Movement, breathing, circulation. Imbalance leads to pain, dryness, and anxiety.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Pitta (Fire & Water)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Digestion, metabolism, temperature. Imbalance leads to inflammation and acidity.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center shrink-0">
                <Droplet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-200">Kapha (Earth & Water)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Structure, lubrication, immunity. Imbalance leads to congestion and lethargy.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
