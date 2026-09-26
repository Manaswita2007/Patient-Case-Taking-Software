import React from 'react';
import { Leaf } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export default function AyushAssessmentForm({ data, onChange }: { data: any, onChange: (d: any) => void }) {
  const { t } = useAppContext();
  const updateField = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-green-50/50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-2xl p-6 mt-4 overflow-hidden"
    >
      <h3 className="text-lg font-bold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
        <Leaf className="w-5 h-5" />
        Dashavidha Pariksha (Self-Assessment)
      </h3>
      <p className="text-sm text-green-700 dark:text-green-500 mb-6">
        Please provide details for the Ayurvedic assessment. This information helps in determining your Prakriti and current imbalances.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Appetite / Digestion (Ahara Shakti)
          </label>
          <select 
            value={data.aharaShakti || ''} 
            onChange={e => updateField('aharaShakti', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="">{t('selectOption')}</option>
            <option value="Strong / Excellent">{t('pravaraStrong')}</option>
            <option value="Moderate / Variable">{t('madhyamaModerate')}</option>
            <option value="Weak / Poor">{t('avaraWeak')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Physical Strength (Vyayama Shakti)
          </label>
          <select 
            value={data.vyayamaShakti || ''} 
            onChange={e => updateField('vyayamaShakti', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="">{t('selectOption')}</option>
            <option value="High (Can do heavy exercise)">{t('vyayamaPravara')}</option>
            <option value="Moderate (Average stamina)">{t('vyayamaMadhyama')}</option>
            <option value="Low (Easily fatigued)">{t('vyayamaAvara')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Mental Constitution (Sattva)
          </label>
          <select 
            value={data.sattva || ''} 
            onChange={e => updateField('sattva', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="">{t('selectOption')}</option>
            <option value="Strong (Handles stress well)">{t('sattvaPravara')}</option>
            <option value="Moderate (Sometimes anxious)">{t('vyayamaMadhyama')}</option>
            <option value="Weak (Easily stressed/fearful)">{t('sattvaAvara')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
            Body Build (Samhanana)
          </label>
          <select 
            value={data.samhanana || ''} 
            onChange={e => updateField('samhanana', e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 text-sm"
          >
            <option value="">{t('selectOption')}</option>
            <option value="Well built / Compact">{t('samhananaPravara')}</option>
            <option value="Medium build">{t('samhananaMadhyama')}</option>
            <option value="Weak / Loose joints">{t('samhananaAvara')}</option>
          </select>
        </div>
      </div>
    </motion.div>
  );
}
