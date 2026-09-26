import React, { useState, useEffect } from 'react';
import { CalendarClock, CheckCircle2, ChevronRight, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import TTSButton from './TTSButton';

interface AppointmentBookingProps {
  doctorName: string;
  hospitalName?: string;
  onConfirm: (date: string, slot: string) => void;
  onBack: () => void;
  submitting?: boolean;
}

export default function AppointmentBooking({ 
  doctorName, 
  hospitalName, 
  onConfirm, 
  onBack, 
  submitting 
}: AppointmentBookingProps) {
  const { t, language } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [takenSlots, setTakenSlots] = useState<{date: string, slot: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const availableSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  // Generate next 7 days
  const upcomingDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    // Select first day by default
    setSelectedDate(upcomingDates[0]);
    
    // Fetch taken slots for this doctor
    const fetchTakenSlots = async () => {
      if (!doctorName) {
        setLoading(false);
        return;
      }
      try {
        const url = `/api/appointments/${encodeURIComponent(doctorName)}${hospitalName ? `?hospital=${encodeURIComponent(hospitalName)}` : ''}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const taken = (data.appointments || []).map((a: any) => ({ date: a.date, slot: a.slot }));
          setTakenSlots(taken);
        }
      } catch (e) {
        console.error("Failed to fetch appointments:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTakenSlots();
  }, [doctorName, hospitalName]);

  const isSlotTaken = (date: string, slot: string) => {
    return takenSlots.some(t => t.date === date && t.slot === slot);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) {
      setErrorMsg(t('selectDateAndSlotPrompt'));
      return;
    }
    setErrorMsg('');
    onConfirm(selectedDate, selectedSlot);
  };

  const formatDateDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'bn' ? 'bn-IN' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors">
      <div className="min-h-full w-full flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 py-6 sm:py-10">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden my-0 sm:my-2 shrink-0">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider mb-2">
              <CalendarClock className="w-3.5 h-3.5" /> {t('stepScheduleAppointment')}
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">{t('bookAppointmentTitle')}</h2>
              <TTSButton 
                text={`${t('bookAppointmentTitle')} ${doctorName}. ${selectedDate ? `${t('selectConsultationDate')}: ${formatDateDisplay(selectedDate)}.` : ''} ${selectedSlot ? `Slot: ${selectedSlot}.` : ''}`} 
                size="sm" 
                label={t('readScreen')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              />
            </div>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              {t('bookAppointmentSubtitle')} <span className="font-bold text-white">{doctorName}</span>.
            </p>
          </div>

          <div className="p-6 text-left">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center p-10">
                <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Select Date */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('selectConsultationDate')}
                    </label>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {selectedDate ? formatDateDisplay(selectedDate) : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {upcomingDates.map((date) => {
                      const isSelected = selectedDate === date;
                      return (
                        <button
                          type="button"
                          key={date}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedSlot('');
                          }}
                          className={`p-3 rounded-2xl text-center border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-xs font-bold">{formatDateDisplay(date)}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                    {t('availableTimeSlots')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => {
                      const taken = isSlotTaken(selectedDate, slot);
                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          type="button"
                          key={slot}
                          disabled={taken}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setErrorMsg('');
                          }}
                          className={`p-3 rounded-2xl text-center border text-xs font-bold transition-all ${
                            taken
                              ? 'border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/20 text-slate-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500 shadow-sm cursor-pointer'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:border-emerald-300 cursor-pointer'
                          }`}
                        >
                          {slot}
                          {taken && <div className="text-[9px] font-normal text-slate-400 no-underline">{t('slotAlreadyBooked')}</div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Slot Summary Badge */}
                {selectedDate && selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                          {formatDateDisplay(selectedDate)} at {selectedSlot}
                        </div>
                        <div className="text-[11px] text-blue-700 dark:text-blue-300">
                          {doctorName} {hospitalName ? `• ${hospitalName}` : ''}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={onBack}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{t('backToQuestions')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedSlot || submitting}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span>{t('proceedingWithBooking')}</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('confirmScheduleAppointment')}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
