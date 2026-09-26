import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Activity, CheckCircle2, AlertCircle, Heart, Ruler, Weight, Edit3, X, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import TTSButton from './TTSButton';

export default function PatientProfileSetup({ 
  patientId, 
  onComplete, 
  initialData 
}: { 
  patientId: string; 
  onComplete: (data: any) => void; 
  initialData: any; 
}) {
  const { t, language } = useAppContext();
  const standardBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const standardSexList = ['Male', 'Female', 'Intersex'];
  
  const initialBg = initialData?.bloodGroup || '';
  const isCustomBgInitial = initialBg && !standardBloodGroups.includes(initialBg);

  const initialSex = initialData?.gender || initialData?.sex || '';
  const isCustomSexInitial = initialSex && !standardSexList.includes(initialSex);

  const [formData, setFormData] = useState({
    name: initialData?.name && !initialData?.name.startsWith('Patient ') ? initialData.name : '',
    age: initialData?.age || '',
    sex: isCustomSexInitial ? 'Others' : initialSex,
    bloodGroup: isCustomBgInitial ? 'Others' : initialBg,
    height: initialData?.height ? String(initialData.height).replace(/\D/g, '') : '',
    weight: initialData?.weight ? String(initialData.weight).replace(/[^\d.]/g, '') : '',
  });

  const [customBloodGroup, setCustomBloodGroup] = useState(isCustomBgInitial ? initialBg : '');
  const [customSex, setCustomSex] = useState(isCustomSexInitial ? initialSex : '');

  // Modal Pop Windows
  const [showBloodGroupModal, setShowBloodGroupModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);

  // Temp state inside modals before confirming
  const [tempBloodGroup, setTempBloodGroup] = useState(formData.bloodGroup || 'O+');
  const [tempCustomBg, setTempCustomBg] = useState(customBloodGroup);

  const [tempSex, setTempSex] = useState(formData.sex || 'Male');
  const [tempCustomSex, setTempCustomSex] = useState(customSex);

  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const finalBloodGroup = formData.bloodGroup === 'Others' 
    ? (customBloodGroup.trim() || 'Others') 
    : formData.bloodGroup;

  const finalSex = formData.sex === 'Others' 
    ? (customSex.trim() || 'Others') 
    : formData.sex;

  const handleOpenBloodGroupModal = () => {
    setTempBloodGroup(formData.bloodGroup || 'O+');
    setTempCustomBg(customBloodGroup);
    setShowBloodGroupModal(true);
  };

  const handleConfirmBloodGroup = () => {
    setFormData(prev => ({ ...prev, bloodGroup: tempBloodGroup }));
    setCustomBloodGroup(tempCustomBg);
    setShowBloodGroupModal(false);
  };

  const handleOpenSexModal = () => {
    setTempSex(formData.sex || 'Male');
    setTempCustomSex(customSex);
    setShowSexModal(true);
  };

  const handleConfirmSex = () => {
    setFormData(prev => ({ ...prev, sex: tempSex }));
    setCustomSex(tempCustomSex);
    setShowSexModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    // Height and weight are explicitly NOT compulsory
    if (
      !formData.name.trim() ||
      !formData.age.trim() ||
      !finalSex.trim() ||
      !finalBloodGroup.trim() ||
      (formData.bloodGroup === 'Others' && !customBloodGroup.trim()) ||
      (formData.sex === 'Others' && !customSex.trim())
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        age: formData.age.trim(),
        gender: finalSex,
        bloodGroup: finalBloodGroup,
        height: formData.height.trim() ? `${formData.height.trim()} cm` : '',
        weight: formData.weight.trim() ? `${formData.weight.trim()} kg` : ''
      };

      await fetch(`/api/patient/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      localStorage.setItem('patientName', formData.name.trim());
      onComplete({
        ...formData,
        sex: finalSex,
        gender: finalSex,
        bloodGroup: finalBloodGroup,
        height: payload.height,
        weight: payload.weight
      });
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden my-auto shrink-0"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 text-white text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider">
              <User className="w-3.5 h-3.5" /> {t('clinicalDemographicRegistration')}
            </div>
            <TTSButton
              text={`${t('patientBasicInfoTitle')}. ${t('patientBasicInfoSubtitle')}`}
              size="sm"
              label="Read Screen"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              id="patient-profile-tts-header"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{t('patientBasicInfoTitle')}</h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            {t('patientBasicInfoSubtitle')}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('fullLegalName')} <span className="text-rose-500">*</span>
                </label>
                <TTSButton 
                  text={`${t('fullLegalName')}. ${formData.name ? `Current response: ${formData.name}` : 'No name entered yet.'}`} 
                  size="sm" 
                />
              </div>
              <input 
                type="text" 
                className={`w-full p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm ${
                  attemptedSubmit && !formData.name.trim() 
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
              />
              {attemptedSubmit && !formData.name.trim() && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please enter your full name
                </p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('ageInYears')} <span className="text-rose-500">*</span>
                </label>
                <TTSButton 
                  text={`${t('ageInYears')}. ${formData.age ? `Current response: ${formData.age} years old` : 'No age entered yet.'}`} 
                  size="sm" 
                />
              </div>
              <input 
                type="number" 
                className={`w-full p-3.5 rounded-xl border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm ${
                  attemptedSubmit && !formData.age.trim() 
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                value={formData.age}
                onChange={e => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 32"
                min="1"
                max="125"
              />
              {attemptedSubmit && !formData.age.trim() && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please enter your age
                </p>
              )}
            </div>

            {/* Biological Sex (POPUP MODAL WINDOW) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t('biologicalSex')} <span className="text-rose-500">*</span>
                </label>
                <TTSButton 
                  text={`${t('biologicalSex')}. ${finalSex ? `Currently selected: ${finalSex}` : 'Not selected yet.'}`} 
                  size="sm" 
                />
              </div>
              <button
                type="button"
                onClick={handleOpenSexModal}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer font-semibold text-sm bg-slate-50 dark:bg-slate-900 ${
                  attemptedSubmit && !finalSex
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900 text-rose-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-blue-400'
                }`}
              >
                <span>{finalSex ? (formData.sex === 'Others' ? `${t('others')}: ${customSex || 'Specified'}` : (t(formData.sex.toLowerCase()) || formData.sex)) : t('chooseBiologicalSexPrompt')}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {attemptedSubmit && !finalSex && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please select biological sex
                </p>
              )}
            </div>

            {/* Blood Group (POPUP MODAL WINDOW) */}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  {t('selectBloodGroup')} <span className="text-rose-500">*</span>
                </label>
                <TTSButton 
                  text={`${t('selectBloodGroup')}. ${finalBloodGroup ? `Current selection: ${finalBloodGroup}` : 'Not selected yet.'}`} 
                  size="sm" 
                />
              </div>
              <button
                type="button"
                onClick={handleOpenBloodGroupModal}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer font-semibold text-sm bg-slate-50 dark:bg-slate-900 ${
                  attemptedSubmit && !finalBloodGroup
                    ? 'border-rose-500 ring-2 ring-rose-200 dark:ring-rose-900 text-rose-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-rose-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-base">
                    {finalBloodGroup || t('chooseBloodGroupPrompt')}
                  </span>
                  {formData.bloodGroup === 'Others' && customBloodGroup && (
                    <span className="text-xs text-slate-500">({customBloodGroup})</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              {attemptedSubmit && (!formData.bloodGroup || (formData.bloodGroup === 'Others' && !customBloodGroup.trim())) && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Please select or specify your blood group
                </p>
              )}
            </div>

            {/* Height (ONLY CM, NOT COMPULSORY) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-blue-500" />
                  {t('heightCm')}
                </label>
                <TTSButton 
                  text={`${t('heightCm')}. ${formData.height ? `Entered: ${formData.height} cm` : 'Optional, not specified.'}`} 
                  size="sm" 
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  className="w-full p-3.5 pr-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm"
                  value={formData.height}
                  onChange={e => {
                    const cleanNum = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, height: cleanNum });
                  }}
                  placeholder="e.g. 172"
                  maxLength={3}
                />
                <span className="absolute right-3.5 top-3.5 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold select-none">
                  cm
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t('optionalTag')} • Enter height in centimeters only</p>
            </div>

            {/* Weight (NOT COMPULSORY) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-emerald-500" />
                  {t('weightKg')}
                </label>
                <TTSButton 
                  text={`${t('weightKg')}. ${formData.weight ? `Entered: ${formData.weight} kilograms` : 'Optional, not specified.'}`} 
                  size="sm" 
                />
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="decimal"
                  className="w-full p-3.5 pr-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm"
                  value={formData.weight}
                  onChange={e => {
                    const cleanNum = e.target.value.replace(/[^\d.]/g, '');
                    setFormData({ ...formData, weight: cleanNum });
                  }}
                  placeholder="e.g. 68"
                  maxLength={5}
                />
                <span className="absolute right-3.5 top-3.5 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold select-none">
                  kg
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t('optionalTag')} • Enter weight in kilograms</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSaving ? (
                <span>{t('savingDetails')}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('saveAndContinue')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* POPUP WINDOW: BLOOD GROUP CHOOSER */}
      <AnimatePresence>
        {showBloodGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t('selectBloodGroup')}
                    </h3>
                    <p className="text-[11px] text-slate-500">{t('chooseBloodGroupPrompt')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBloodGroupModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {standardBloodGroups.map(bg => (
                    <button
                      type="button"
                      key={bg}
                      onClick={() => setTempBloodGroup(bg)}
                      className={`p-3 rounded-2xl text-sm font-black border text-center transition-all cursor-pointer ${
                        tempBloodGroup === bg
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTempBloodGroup('Others')}
                    className={`p-3 rounded-2xl text-sm font-black border text-center transition-all cursor-pointer ${
                      tempBloodGroup === 'Others'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                    }`}
                  >
                    {t('others')}
                  </button>
                </div>

                {/* If Others is chosen, take custom user text input inside the pop window */}
                <AnimatePresence>
                  {tempBloodGroup === 'Others' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-2 overflow-hidden"
                    >
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        {t('specifyCustomBloodGroup')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tempCustomBg}
                        onChange={e => setTempCustomBg(e.target.value)}
                        placeholder="e.g. Bombay Blood Group (hh), Rh-null, A2B+, A1-, etc."
                        className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBloodGroupModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBloodGroup}
                  disabled={tempBloodGroup === 'Others' && !tempCustomBg.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {t('confirmSelection')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POPUP WINDOW: BIOLOGICAL SEX CHOOSER */}
      <AnimatePresence>
        {showSexModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {t('biologicalSex')}
                    </h3>
                    <p className="text-[11px] text-slate-500">{t('chooseBiologicalSexPrompt')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSexModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {['Male', 'Female', 'Intersex', 'Others'].map(opt => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setTempSex(opt)}
                      className={`p-3.5 rounded-2xl text-sm font-black border text-center transition-all cursor-pointer ${
                        tempSex === opt
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500 shadow-md'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      {t(opt.toLowerCase()) || opt}
                    </button>
                  ))}
                </div>

                {/* If Others is chosen, take custom user text input inside the pop window */}
                <AnimatePresence>
                  {tempSex === 'Others' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900/60 space-y-2 overflow-hidden"
                    >
                      <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" />
                        {t('specifyCustomSex')} <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={tempCustomSex}
                        onChange={e => setTempCustomSex(e.target.value)}
                        placeholder="e.g. Non-binary, Transgender, Agender, etc."
                        className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white text-xs font-semibold outline-none focus:ring-2 focus:ring-amber-500"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSexModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSex}
                  disabled={tempSex === 'Others' && !tempCustomSex.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {t('confirmSelection')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
