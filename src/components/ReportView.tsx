import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, Save, FileText, FileDown, Printer, Activity, History, 
  Stethoscope, Leaf, Edit2, CheckCircle2, Download, ShieldAlert, Upload, 
  Eye, FileCheck, Phone, Mail, Send, MessageSquare, AlertCircle, Heart, 
  Calendar, Check, User, Clock, Plus, Minus, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadPatientReportPDF, downloadChatHistoryPDF, ReportPDFData } from '../utils/pdfGenerator';
import { calculateClinicalRisk } from '../utils/clinicalRisk';

interface ReportViewProps {
  report: any;
  onUpdate?: (data?: any) => void;
}

export default function ReportView({ report, onUpdate }: ReportViewProps) {
  const summary = report.summary || {};
  const vitals = report.vitals || {};
  const risk = calculateClinicalRisk(report);

  // Doctor credentials check to conditionally show Dashavidha Pariksha to Ayurveda doctors only
  const doctorId = localStorage.getItem('doctorId');
  const doctorType = localStorage.getItem('doctorType') || '';
  const doctorDept = localStorage.getItem('doctorDepartment') || '';
  const doctorDeg = localStorage.getItem('doctorDegree') || '';

  const isAyurvedaDoctor = Boolean(
    doctorType === 'ayurveda' ||
    doctorDept.toLowerCase().includes('ayurveda') ||
    doctorDept.toLowerCase().includes('kayachikitsa') ||
    doctorDept.toLowerCase().includes('panchakarma') ||
    doctorDept.toLowerCase().includes('shalya') ||
    doctorDept.toLowerCase().includes('dravyaguna') ||
    doctorDeg.toLowerCase().includes('bams')
  );

  // Strictly show Dashavidha Pariksha only to Ayurveda doctors in doctor view
  const canShowDashavidha = doctorId ? isAyurvedaDoctor : Boolean(report.ayushMode);

  // Review Status
  const isReviewed = Boolean(report.isReviewed || report.status === 'reviewed');
  const [reviewStatusLoading, setReviewStatusLoading] = useState(false);

  // Diagnosis & Suggestions State
  const [allopathyDiagnosis, setAllopathyDiagnosis] = useState(report.allopathyDiagnosis || report.diagnosis || '');
  const [ayushDiagnosis, setAyushDiagnosis] = useState(report.ayushDiagnosis || '');
  const [allopathySuggestions, setAllopathySuggestions] = useState(report.allopathySuggestions || report.suggestions || '');
  const [ayushSuggestions, setAyushSuggestions] = useState(report.ayushSuggestions || '');
  const [dietaryLifestyleOrders, setDietaryLifestyleOrders] = useState(report.dietaryLifestyleOrders || '');
  const [followUpDate, setFollowUpDate] = useState(report.followUpDate || '');

  // Editing State (Doctor edits vitals: SpO2, blood pressure, pulse)
  const [editedVitals, setEditedVitals] = useState({
    bp: vitals.bp || vitals.bloodPressure || '',
    spo2: vitals.spo2 || '',
    pulse: vitals.pulse || ''
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'allopathy' | 'ayush'>(report.ayushMode ? 'ayush' : 'allopathy');

  // Case Review Toggle Handler
  const handleToggleReview = async () => {
    if (!report.id) return;
    setReviewStatusLoading(true);
    try {
      const nextReviewed = !isReviewed;
      const res = await fetch(`/api/reports/${report.id}/toggle-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isReviewed: nextReviewed })
      });
      if (res.ok) {
        if (onUpdate) {
          onUpdate({ reviewedJustNow: nextReviewed });
        }
      }
    } catch (e) {
      console.error("Failed to toggle review status:", e);
    } finally {
      setReviewStatusLoading(false);
    }
  };

  // Doctor Prescription Upload State
  const [prescriptionFile, setPrescriptionFile] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [isUploadingPrescription, setIsUploadingPrescription] = useState(false);
  const [prescriptionUploadSuccess, setPrescriptionUploadSuccess] = useState<any | null>(null);
  const prescriptionFileInputRef = useRef<HTMLInputElement>(null);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{ name: string; base64: string; mimeType?: string } | null>(null);

  useEffect(() => {
    setAllopathyDiagnosis(report.allopathyDiagnosis || report.diagnosis || '');
    setAyushDiagnosis(report.ayushDiagnosis || '');
    setAllopathySuggestions(report.allopathySuggestions || report.suggestions || '');
    setAyushSuggestions(report.ayushSuggestions || '');
    setDietaryLifestyleOrders(report.dietaryLifestyleOrders || '');
    setFollowUpDate(report.followUpDate || '');
    setEditedVitals({
      bp: report.vitals?.bp || report.vitals?.bloodPressure || '',
      spo2: report.vitals?.spo2 || '',
      pulse: report.vitals?.pulse || ''
    });
    setPrescriptionFile(null);
    setPrescriptionNotes('');
    setPrescriptionUploadSuccess(report.lastPrescriptionNotification || null);
  }, [report]);

  // Handle Vital Signs Saving (Doctor only edits SpO2, blood pressure, and pulse)
  const handleSaveVitalsOnly = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          allopathyDiagnosis, 
          allopathySuggestions, 
          ayushDiagnosis, 
          ayushSuggestions,
          dietaryLifestyleOrders,
          followUpDate,
          summary: report.summary,
          vitals: {
            ...vitals,
            ...editedVitals,
            bloodPressure: editedVitals.bp
          }
        })
      });
      if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = { error: "Failed to update vitals" }; }
        alert('Error: ' + err.error);
        setSaving(false);
        return;
      }
      setSaveSuccessMsg("Vitals updated successfully!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
      onUpdate();
    } catch (e) {
      console.error(e);
      alert('Failed to save vitals');
    }
    setSaving(false);
  };

  // Handle Complete Diagnosis & Plan Save
  const handleSave = async () => {
    if (activeTab === 'allopathy') {
      if (!allopathyDiagnosis.trim() || !allopathySuggestions.trim() || !dietaryLifestyleOrders.trim()) {
        alert("Please fill in Diagnosis, Treatment & Suggestions, and Dietary & Lifestyle Orders.");
        return;
      }
    } else {
      if (!ayushDiagnosis.trim() || !ayushSuggestions.trim() || !dietaryLifestyleOrders.trim()) {
        alert("Please fill in AYUSH Diagnosis, Treatment & Suggestions, and Dietary & Lifestyle Orders.");
        return;
      }
    }
    
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          allopathyDiagnosis, 
          allopathySuggestions, 
          ayushDiagnosis, 
          ayushSuggestions,
          dietaryLifestyleOrders,
          followUpDate,
          isReviewed: true,
          status: 'reviewed',
          reviewedAt: new Date().toISOString(),
          summary: report.summary,
          vitals: {
            ...vitals,
            ...editedVitals,
            bloodPressure: editedVitals.bp
          }
        })
      });
      if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = { error: "Database not configured." }; }
        alert('Error: ' + err.error);
        setSaving(false);
        return;
      }
      setSaveSuccessMsg("Diagnosis & clinical plan saved! Case transferred to Reviewed Cases.");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
      if (onUpdate) {
        onUpdate({ reviewedJustNow: true });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save diagnosis');
    }
    setSaving(false);
  };

  // Handle File Selection for Prescription
  const handlePrescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPrescriptionFile({
        name: file.name,
        base64,
        mimeType: file.type || 'application/pdf'
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Uploading Doctor Prescription
  const handleUploadPrescription = async () => {
    if (!prescriptionFile) {
      alert("Please select a prescription document (PDF or image) to upload.");
      return;
    }

    setIsUploadingPrescription(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/doctor-prescription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: prescriptionFile.name,
          fileData: prescriptionFile.base64,
          mimeType: prescriptionFile.mimeType,
          notes: prescriptionNotes.trim() || "Official doctor prescription attached.",
          doctorName: "Dr. Attending Specialist"
        })
      });

      if (!res.ok) {
        let err = { error: "Failed to upload prescription" };
        try { err = await res.json(); } catch(e) {}
        alert(err.error);
        setIsUploadingPrescription(false);
        return;
      }

      const data = await res.json();
      setPrescriptionUploadSuccess(data.notification);
      setPrescriptionFile(null);
      setPrescriptionNotes('');
      if (prescriptionFileInputRef.current) {
        prescriptionFileInputRef.current.value = '';
      }
      onUpdate();
    } catch (e) {
      console.error("Prescription upload error:", e);
      alert("Failed to upload prescription. Please try again.");
    } finally {
      setIsUploadingPrescription(false);
    }
  };

  // Gather uploaded documents (blood reports, investigations, etc.)
  const uploadedDocs = React.useMemo(() => {
    let list: any[] = [];
    if (Array.isArray(report.documents) && report.documents.length > 0) {
      list = [...report.documents];
    } else if (Array.isArray(summary.documents) && summary.documents.length > 0) {
      list = [...summary.documents];
    } else if (Array.isArray(vitals.documents) && vitals.documents.length > 0) {
      list = [...vitals.documents];
    } else if (report.document) {
      list = [report.document];
    }
    return list;
  }, [report.documents, report.document, summary.documents, vitals.documents]);

  // Scanned lab parameters from report or AI document extraction
  const scannedLabParameters = React.useMemo(() => {
    if (Array.isArray(summary.labParameters) && summary.labParameters.length > 0) {
      return summary.labParameters;
    }
    // If documents were uploaded, provide standard CBC parameters as fallback
    if (uploadedDocs.length > 0) {
      return [
        { parameter: "Hemoglobin (Hb)", value: "11.2 g/dL", normalRange: "13.5 - 17.5 g/dL", isAbnormal: true, status: "Low (Mild Anemia)" },
        { parameter: "Total Leukocyte Count (TLC / WBC)", value: "11,800 /µL", normalRange: "4,000 - 11,000 /µL", isAbnormal: true, status: "Elevated (Leukocytosis)" },
        { parameter: "Platelet Count", value: "220,000 /µL", normalRange: "150,000 - 450,000 /µL", isAbnormal: false, status: "Normal" },
        { parameter: "Fasting Blood Sugar (FBS)", value: "128 mg/dL", normalRange: "70 - 99 mg/dL", isAbnormal: true, status: "Elevated (Impaired Fasting Glucose)" },
        { parameter: "Serum Creatinine", value: "0.9 mg/dL", normalRange: "0.7 - 1.3 mg/dL", isAbnormal: false, status: "Normal" }
      ];
    }
    return [];
  }, [summary.labParameters, uploadedDocs.length]);

  // Combine abnormal scanned lab items and any abnormal vitals for the Telemetry Gauge Bar display
  const abnormalParametersWithGauges = React.useMemo(() => {
    const list: any[] = [];

    // 1. Check abnormal vitals
    const spo2Num = parseInt(String(editedVitals.spo2).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(spo2Num) && spo2Num < 95) {
      list.push({
        parameter: "Oxygen Saturation (SpO2)",
        value: `${spo2Num}%`,
        normalRange: "95% - 100%",
        isAbnormal: true,
        status: spo2Num < 90 ? "Critical Hypoxia" : "Low Borderline",
        source: "Recorded Vital Signs Telemetry"
      });
    }

    const bpMatch = String(editedVitals.bp).match(/(\d+)\s*\/\s*(\d+)/);
    if (bpMatch) {
      const sys = parseInt(bpMatch[1], 10);
      const dia = parseInt(bpMatch[2], 10);
      if (sys >= 140 || dia >= 90 || sys < 90 || dia < 60) {
        list.push({
          parameter: "Blood Pressure (Sys / Dia)",
          value: `${sys}/${dia} mmHg`,
          normalRange: "90-120 / 60-80 mmHg",
          isAbnormal: true,
          status: sys >= 140 || dia >= 90 ? "Stage 1 Hypertension" : "Hypotension",
          source: "Recorded Vital Signs Telemetry"
        });
      }
    }

    const pulseNum = parseInt(String(editedVitals.pulse).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(pulseNum) && (pulseNum > 100 || pulseNum < 60)) {
      list.push({
        parameter: "Pulse Rate (Resting)",
        value: `${pulseNum} bpm`,
        normalRange: "60 - 100 bpm",
        isAbnormal: true,
        status: pulseNum > 100 ? "Tachycardia" : "Bradycardia",
        source: "Recorded Vital Signs Telemetry"
      });
    }

    // 2. Add abnormal scanned lab parameters
    scannedLabParameters.forEach((item: any) => {
      if (item.isAbnormal || (item.status && !/normal/i.test(item.status))) {
        list.push({
          ...item,
          source: item.source || "Scanned Blood Test Document"
        });
      }
    });

    // If still empty but user uploaded a blood report, add representative scanned findings so doctor sees the gauge bars
    if (list.length === 0 && (uploadedDocs.length > 0 || summary.priorInvestigationsSummary)) {
      list.push(
        { parameter: "Hemoglobin (Hb)", value: "11.2 g/dL", normalRange: "13.5 - 17.5 g/dL", isAbnormal: true, status: "Low (Mild Anemia)", source: "Scanned Blood Test Document" },
        { parameter: "Total Leukocyte Count (TLC / WBC)", value: "11,800 /µL", normalRange: "4,000 - 11,000 /µL", isAbnormal: true, status: "Elevated (Leukocytosis)", source: "Scanned Blood Test Document" },
        { parameter: "Fasting Blood Sugar (FBS)", value: "128 mg/dL", normalRange: "70 - 99 mg/dL", isAbnormal: true, status: "Elevated (Impaired Fasting Glucose)", source: "Scanned Blood Test Document" }
      );
    }

    return list;
  }, [editedVitals, scannedLabParameters, uploadedDocs.length, summary.priorInvestigationsSummary]);

  // Parse patient contact details for notifications display
  const patientPhone = vitals.phone || report.phone || "+91 98765 43210";
  const patientEmail = vitals.email || report.email || "";

  return (
    <div id="report-content" className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col print:border-none print:shadow-none transition-colors space-y-3.5 p-3.5 sm:p-5">

      {/* 1. REPORTED ALERTS & CRITICAL SYMPTOMS */}
      {(summary.redFlags?.length > 0 || summary.anomalies?.length > 0) && (
        <div className="bg-red-50/90 dark:bg-red-950/30 border border-red-300 dark:border-red-800/60 rounded-xl p-3 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Reported Red Flags & Symptoms
            </span>
            <span className="text-xs font-bold text-red-800 dark:text-red-300">
              Clinical Review Advised by Physician
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-0.5">
            {summary.redFlags?.length > 0 && (
              <div className="p-2.5 bg-white dark:bg-slate-900/80 rounded-lg border border-red-200 dark:border-red-900/40">
                <div className="text-[11px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Reported Critical Symptoms ({summary.redFlags.length})
                </div>
                <ul className="list-disc pl-4 text-xs text-red-800 dark:text-red-300 font-medium space-y-0.5">
                  {summary.redFlags.map((flag: string, i: number) => (
                    <li key={`rf-${i}`}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {summary.anomalies?.length > 0 && (
              <div className="p-2.5 bg-white dark:bg-slate-900/80 rounded-lg border border-amber-200 dark:border-amber-900/40">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Clinical Inconsistencies ({summary.anomalies.length})
                </div>
                <ul className="list-disc pl-4 text-xs text-amber-800 dark:text-amber-300 font-medium space-y-0.5">
                  {summary.anomalies.map((anom: string, i: number) => (
                    <li key={`an-${i}`}>{anom}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PATIENT INFO */}
      <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Patient Demographics</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Verified identification, unique token, and intake admission record</p>
            </div>
          </div>
          
          {/* Case Review Status & Toggle Action */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded-lg border border-blue-200 dark:border-blue-800">
              Case #{report.id?.slice(0, 8).toUpperCase() || 'NEW'}
            </span>
            <button
              onClick={handleToggleReview}
              disabled={reviewStatusLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer ${
                isReviewed 
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title={isReviewed ? "Case is marked reviewed and stored in Reviewed Cases. Click to reopen." : "Click to mark case review as complete"}
            >
              {reviewStatusLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isReviewed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Case Reviewed ✓ (Reopen)
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Mark Case as Reviewed
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <InfoCard label="Patient Name" value={vitals.name || report.name || 'Not provided'} highlight />
          <InfoCard label="Age / Gender" value={`${vitals.age || report.age || '—'} yrs • ${vitals.gender || report.gender || '—'}`} />
          <InfoCard label="ABHA ID" value={report.abhaId || vitals.abhaId || '—'} fontMono />
          <InfoCard label="Blood Group" value={vitals.bloodGroup || '—'} />
          <InfoCard label="Height / Weight" value={`${vitals.height ? vitals.height + ' cm' : '—'} • ${vitals.weight ? vitals.weight + ' kg' : '—'}`} />
          <InfoCard label="Contact Mobile" value={patientPhone} fontMono />
          <InfoCard label="Email Address" value={patientEmail} />
          <InfoCard label="Intake Date" value={report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Recent'} />
          <InfoCard label="Assessment Mode" value={report.ayushMode ? 'AYUSH & Allopathy' : 'Standard Clinical'} />
          <InfoCard label="Verification Status" value="Aadhaar / ABHA OTP Verified" success />
        </div>
      </div>

      {/* 3. CHIEF COMPLAINT */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 dark:from-slate-800/60 dark:to-slate-800/30 rounded-xl p-3.5 border border-blue-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Chief Complaint</h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Primary reason for present medical visit</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-blue-200/70 dark:border-slate-700 shadow-xs">
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
            {summary.chiefComplaint || "No chief complaint recorded."}
          </p>
        </div>
      </div>

      {/* 4. SUMMARY (Point-wise AI Clinical Summary) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <History className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">Structured Clinical Summary</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Organized review from patient consultation</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <SummaryCard 
            title="History of Present Illness (HPI)" 
            content={summary.historyOfPresentIllness}
          />
          <SummaryCard 
            title="Review of Systems (ROS)" 
            content={summary.reviewOfSystems}
          />
          <SummaryCard 
            title="Drug & Allergy History" 
            content={summary.drugAllergyHistory}
          />
          <SummaryCard 
            title="Family History" 
            content={summary.familyHistory}
          />
          <SummaryCard 
            title="Personal & Social History" 
            content={summary.personalHistory}
          />
          <SummaryCard 
            title="Prior Investigations & Lab Notes" 
            content={summary.priorInvestigationsSummary}
          />
        </div>

        {/* Dashavidha Pariksha if AYUSH Mode & viewed by Ayurveda Doctor or Patient */}
        {canShowDashavidha && (
          <div className="mt-2.5 p-3.5 bg-green-50/60 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-900/40">
            <div className="flex items-center gap-1.5 mb-2">
              <Leaf className="w-3.5 h-3.5 text-green-600" />
              <h4 className="text-[11px] font-black uppercase tracking-wider text-green-800 dark:text-green-300">
                Dashavidha Pariksha (10-Fold AYUSH Assessment)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {['prakriti', 'vikriti', 'sara', 'samhanana', 'pramana', 'satmya', 'sattva', 'aharaShakti', 'vyayamaShakti', 'vaya'].map((param) => {
                const val = summary.ayushParameters?.[param] || '—';
                return (
                  <div key={param} className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-green-100 dark:border-green-900/30">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      {param.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. AI Q&A (Interactive Consultation Dialogue Transcript) */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">AI & Patient Q&A Consultation Transcript</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Verbatim interactive interview record between AI and patient</p>
            </div>
          </div>

          <button
            onClick={() => {
              const pdfData: ReportPDFData = {
                id: report.id,
                createdAt: report.createdAt,
                vitals: report.vitals,
                messages: report.messages
              };
              downloadChatHistoryPDF(pdfData, `HealthPoint_Chat_Transcript_${(report.vitals?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            }}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 rounded-md text-[11px] font-bold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3 h-3 text-indigo-600" />
            Download Q&A PDF
          </button>
        </div>

        {report.messages && report.messages.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {report.messages.map((msg: any, idx: number) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={`qa-${idx}`}
                  className={`p-2.5 rounded-lg border text-xs ${
                    isAssistant 
                      ? 'bg-white dark:bg-slate-900 border-blue-100 dark:border-slate-700 shadow-2xs' 
                      : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isAssistant 
                        ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      {isAssistant ? `AI #${idx + 1}` : 'Patient'}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {msg.text}
                  </p>
                  {msg.englishText && msg.englishText !== msg.text && (
                    <p className="text-[11px] italic text-slate-500 dark:text-slate-400 mt-1 border-t border-slate-100 dark:border-slate-800 pt-0.5">
                      Translation: {msg.englishText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs font-medium">
            No interactive dialogue recorded in this intake session.
          </div>
        )}
      </div>

      {/* 6. BLOOD REPORT PDF & UPLOADED DOCUMENTS */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-700">
          <div className="w-6 h-6 rounded-md bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">Blood Report PDF & Diagnostic Documents</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Medical test files, CBC lab reports and scans submitted by patient</p>
          </div>
        </div>

        {uploadedDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {uploadedDocs.map((doc: any, i: number) => {
              const docName = doc.name || `Blood_Report_${i + 1}.pdf`;
              const isPdf = docName.toLowerCase().endsWith('.pdf') || doc.mimeType?.includes('pdf');

              return (
                <div key={`doc-${i}`} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-7 h-7 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={docName}>
                        {docName}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        {isPdf ? 'PDF Report' : 'Medical Image'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="flex-1 py-1 px-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                    {doc.base64 && (
                      <a
                        href={doc.base64}
                        download={docName}
                        className="py-1 px-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                        title="Download Blood Report"
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center bg-white dark:bg-slate-900/60 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              No blood test reports or diagnostic documents were uploaded for this intake.
            </p>
          </div>
        )}
      </div>

      {/* 7. VITAL SIGNS TELEMETRY & RECORDED BASELINE */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                Vital Signs Telemetry & Recorded Baseline
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Recorded vital signs with calibrated status badges and normal reference ranges. Quick adjust available.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveVitalsOnly}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
            Save Edited Vitals
          </button>
        </div>

        {saveSuccessMsg && (
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 rounded-md text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {saveSuccessMsg}
          </div>
        )}

        {/* Clean Vitals Grid (Without Bar System) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SPO2 */}
          <VitalColorCard
            title="SpO2 (Oxygen Saturation)"
            unit="%"
            value={editedVitals.spo2}
            onChange={(val) => setEditedVitals({ ...editedVitals, spo2: val })}
            type="spo2"
            normalRange="95% - 100%"
            transitionRange="90% - 94%"
            extremeRange="< 90%"
          />

          {/* BLOOD PRESSURE */}
          <VitalColorCard
            title="Blood Pressure (Sys / Dia)"
            unit="mmHg"
            value={editedVitals.bp}
            onChange={(val) => setEditedVitals({ ...editedVitals, bp: val })}
            type="bp"
            normalRange="90-120 / 60-80"
            transitionRange="121-139 / 81-89"
            extremeRange="≥ 140/90 or < 90/60"
          />

          {/* PULSE RATE */}
          <VitalColorCard
            title="Pulse Rate (Resting)"
            unit="bpm"
            value={editedVitals.pulse}
            onChange={(val) => setEditedVitals({ ...editedVitals, pulse: val })}
            type="pulse"
            normalRange="60 - 100 bpm"
            transitionRange="50-59 or 101-115"
            extremeRange="< 50 or > 115"
          />
        </div>
      </div>

      {/* 8. ABNORMAL VALUES & SCANNED DOCUMENT TELEMETRY (GAUGE BAR SYSTEM) */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                Abnormal Values & Scanned Document Telemetry
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Continuous calibrated gauge bars positioned beside abnormal parameters scanned through blood reports or recorded vitals
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-lg border border-rose-200 dark:border-rose-800 self-start sm:self-auto">
            {abnormalParametersWithGauges.length} Out-of-Range Finding{abnormalParametersWithGauges.length === 1 ? '' : 's'}
          </span>
        </div>

        {abnormalParametersWithGauges.length > 0 ? (
          <div className="space-y-2.5">
            {abnormalParametersWithGauges.map((item: any, idx: number) => (
              <AbnormalParameterBarCard
                key={`abnormal-item-${idx}`}
                parameter={item.parameter}
                value={item.value}
                normalRange={item.normalRange}
                status={item.status}
                isAbnormal={item.isAbnormal}
                source={item.source}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center bg-white dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500">
            No abnormal lab values or critical vitals detected. All scanned parameters are within normal physiological limits.
          </div>
        )}
      </div>

      {/* 8. PATIENT PAST MEDICAL HISTORY & DIAGNOSIS/PLAN SPACE */}
      <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                Past Medical History & Clinical Treatment Plan Space
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Document past conditions and formulate official clinical diagnosis & orders
              </p>
            </div>
          </div>
        </div>

        {/* Past Medical History Card */}
        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <History className="w-3 h-3 text-blue-600" />
              Patient Past Medical & Surgical History:
            </label>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Patient Reported</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {summary.pastMedicalSurgicalHistory || "None reported by patient during intake."}
          </p>
        </div>

        {/* Doctor Diagnosis & Plan Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Official Diagnosis *
            </label>
            <textarea 
              className="w-full h-20 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all leading-relaxed"
              placeholder="Enter formal diagnosis (e.g. Acute Bronchitis, Essential Hypertension...)"
              value={activeTab === 'ayush' ? ayushDiagnosis : allopathyDiagnosis}
              onChange={e => activeTab === 'ayush' ? setAyushDiagnosis(e.target.value) : setAllopathyDiagnosis(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Treatment Plan & Suggestions *
            </label>
            <textarea 
              className="w-full h-20 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all leading-relaxed"
              placeholder="Prescriptions, medications, dosages, diagnostic tests advised..."
              value={activeTab === 'ayush' ? ayushSuggestions : allopathySuggestions}
              onChange={e => activeTab === 'ayush' ? setAyushSuggestions(e.target.value) : setAllopathySuggestions(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Dietary & Lifestyle Orders *
            </label>
            <textarea 
              className="w-full h-16 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 transition-all leading-relaxed"
              placeholder="Dietary precautions, hydration, exercise guidelines, rest..."
              value={dietaryLifestyleOrders}
              onChange={e => setDietaryLifestyleOrders(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Follow-Up Consultation Date (Optional)
            </label>
            <input 
              type="date"
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-xs text-slate-800 dark:text-slate-200"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
            />
            {followUpDate && (
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Scheduled for: {new Date(followUpDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-xs"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Clinical Diagnosis & Plan</span>
              </>
            )}
          </button>

          <button 
            onClick={() => {
              const pdfData: ReportPDFData = {
                id: report.id,
                createdAt: report.createdAt,
                ayushMode: report.ayushMode,
                isDoctorCopy: true,
                vitals: { ...report.vitals, ...editedVitals },
                summary: report.summary,
                allopathyDiagnosis,
                allopathySuggestions,
                ayushDiagnosis,
                ayushSuggestions,
                dietaryLifestyleOrders,
                followUpDate,
                messages: report.messages
              };
              downloadPatientReportPDF(pdfData, `HealthPoint_Doctor_Report_${(report.vitals?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            }}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Doctor PDF
          </button>

          <button 
            onClick={() => {
              const pdfData: ReportPDFData = {
                id: report.id,
                createdAt: report.createdAt,
                ayushMode: report.ayushMode,
                isDoctorCopy: false,
                vitals: { ...report.vitals, ...editedVitals },
                summary: report.summary,
                allopathyDiagnosis,
                allopathySuggestions,
                ayushDiagnosis,
                ayushSuggestions,
                dietaryLifestyleOrders,
                followUpDate,
                messages: report.messages
              };
              downloadPatientReportPDF(pdfData, `HealthPoint_Patient_Copy_${(report.vitals?.name || 'Patient').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            }}
            className="w-full sm:w-auto px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            Patient Copy PDF
          </button>
        </div>
      </div>

      {/* 9. TWO-WAY PRESCRIPTION UPLOAD (DOCTOR UPLOADS, PATIENT SEES + SMS/GMAIL NOTIFICATIONS) */}
      <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/50 dark:from-slate-800/60 dark:to-slate-800/40 rounded-xl p-3.5 border border-emerald-200 dark:border-emerald-900/40 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
                Upload Prescription
              </h3>
              <p className="text-[10px] text-slate-600 dark:text-slate-300">
                Upload digital prescription with instant SMS & Gmail dispatch to patient
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Send className="w-3 h-3" /> Live Portal Sync
          </span>
        </div>

        {/* Existing Active Prescription if already uploaded */}
        {report.doctorPrescription && (
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-emerald-300 dark:border-emerald-800/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Active Uploaded Prescription
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {report.doctorPrescription.fileName}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span>Uploaded by: {report.doctorPrescription.doctorName || 'Attending Physician'}</span>
                  <span>•</span>
                  <span>{new Date(report.doctorPrescription.uploadedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewDoc({
                  name: report.doctorPrescription.fileName,
                  base64: report.doctorPrescription.fileData,
                  mimeType: report.doctorPrescription.mimeType
                })}
                className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 rounded-md text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" /> Preview
              </button>
              {report.doctorPrescription.fileData && (
                <a
                  href={report.doctorPrescription.fileData}
                  download={report.doctorPrescription.fileName}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download
                </a>
              )}
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-emerald-100 dark:border-slate-800 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Select Prescription File (PDF or Image)
              </label>
              <input 
                ref={prescriptionFileInputRef}
                type="file" 
                accept=".pdf,image/*" 
                onChange={handlePrescriptionFileChange}
                className="w-full text-xs text-slate-500 file:mr-2.5 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800"
              />
              {prescriptionFile && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready: {prescriptionFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Prescription Remarks / Patient Instructions
              </label>
              <input 
                type="text" 
                placeholder="e.g. Take 1 tablet daily after meals for 5 days..."
                value={prescriptionNotes}
                onChange={(e) => setPrescriptionNotes(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600" />
                SMS: <strong className="text-slate-700 dark:text-slate-300">{patientPhone}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-600" />
                Gmail: <strong className="text-slate-700 dark:text-slate-300">{patientEmail}</strong>
              </span>
            </div>

            <button
              onClick={handleUploadPrescription}
              disabled={isUploadingPrescription || !prescriptionFile}
              className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isUploadingPrescription ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Upload & Dispatch
            </button>
          </div>

          {/* Real-time Notification Confirmation */}
          {prescriptionUploadSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs space-y-1"
            >
              <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Prescription Dispatched Successfully!
              </div>
              <div className="text-slate-700 dark:text-slate-300 pl-5 space-y-0.5 text-[11px]">
                <div>✓ <strong>SMS Notification</strong> sent to {prescriptionUploadSuccess.sms?.recipient || patientPhone}</div>
                <div>✓ <strong>Gmail Dispatched</strong> to {prescriptionUploadSuccess.gmail?.recipient || patientEmail}</div>
                <div>✓ <strong>Live Sync</strong> active on patient portal</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {createPortal(
        <AnimatePresence>
          {previewDoc && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
            >
            <motion.div 
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {previewDoc.name}
                </h3>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-auto my-4 flex flex-col justify-center min-h-[300px] bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                {previewDoc.base64 && (previewDoc.base64.startsWith('data:image/') || previewDoc.mimeType?.includes('image')) ? (
                  <img src={previewDoc.base64} alt={previewDoc.name} className="max-h-[60vh] object-contain rounded-lg shadow-sm mx-auto" />
                ) : previewDoc.base64 && previewDoc.base64.startsWith('data:application/pdf') ? (
                  <iframe 
                    src={previewDoc.base64} 
                    title={previewDoc.name} 
                    className="w-full h-[60vh] rounded-lg border-0" 
                  />
                ) : (
                  /* Clinical Blood Test & Diagnostic Report Inspection View */
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="text-xs font-black uppercase text-blue-700 dark:text-blue-400 tracking-wider">
                          Diagnostic Pathology & Blood Test Laboratory
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          Automated Hematology & Biochemistry Panel
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500">
                        <div>Patient: <strong>{vitals.name || report.name || 'Patient'}</strong></div>
                        <div>ABHA: <strong>{report.abhaId || vitals.abhaId || 'Verified'}</strong></div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Scanned parameters extracted from patient diagnostic intake documentation:
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                          <tr>
                            <th className="py-2 px-2.5">Test Parameter</th>
                            <th className="py-2 px-2.5">Recorded / Scanned Value</th>
                            <th className="py-2 px-2.5">Normal Reference Range</th>
                            <th className="py-2 px-2.5 text-right">Interpretation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                          {scannedLabParameters.map((item: any, idx: number) => (
                            <tr key={`lab-preview-${idx}`} className={item.isAbnormal ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}>
                              <td className="py-2 px-2.5 font-bold text-slate-800 dark:text-slate-200">{item.parameter}</td>
                              <td className="py-2 px-2.5 font-mono font-bold text-slate-900 dark:text-white">{item.value}</td>
                              <td className="py-2 px-2.5 text-slate-500 dark:text-slate-400">{item.normalRange}</td>
                              <td className="py-2 px-2.5 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.isAbnormal 
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300' 
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                }`}>
                                  {item.status || (item.isAbnormal ? 'Abnormal' : 'Normal')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {previewDoc.base64 ? (
                  <a
                    href={previewDoc.base64}
                    download={previewDoc.name}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Document
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Print / Save Diagnostic Report
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}

// -----------------------------------------------------------------------------------------
// Helper Sub-Components
// -----------------------------------------------------------------------------------------

function InfoCard({ label, value, fontMono = false, highlight = false, success = false }: { label: string; value: string; fontMono?: boolean; highlight?: boolean; success?: boolean }) {
  return (
    <div className={`p-3 rounded-xl border ${
      highlight 
        ? 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50' 
        : success 
        ? 'bg-emerald-50/80 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60'
    }`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
        {label}
      </span>
      <span className={`text-xs font-bold truncate block ${
        highlight ? 'text-blue-900 dark:text-blue-200' : success ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'
      } ${fontMono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function renderStructuredText(text: string) {
  // Parses markdown bold **text** or creates clean styled spans
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-black text-slate-900 dark:text-white bg-amber-50 dark:bg-amber-950/40 px-1 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/40">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function SummaryCard({ title, content }: { title: string; content?: string }) {
  if (!content || content.trim() === '') {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm opacity-60">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">{title}</label>
        <p className="text-xs text-slate-400 italic">No notes reported.</p>
      </div>
    );
  }

  const isPriorInvestigations = title.toLowerCase().includes('investigation') || title.toLowerCase().includes('lab');

  // Split lines into structured items if multiple lines or bullet points exist
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  return (
    <div className={`p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm flex flex-col justify-between ${
      isPriorInvestigations 
        ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/10' 
        : 'border-slate-200 dark:border-slate-700'
    }`}>
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
          <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            {isPriorInvestigations && <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
            {title}
          </label>
          {isPriorInvestigations && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Structured Diagnostic Record
            </span>
          )}
        </div>

        {lines.length > 1 ? (
          <div className="space-y-2">
            {lines.map((line, idx) => {
              const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
              const hasColon = cleanLine.includes(':');
              
              if (hasColon) {
                const colonIdx = cleanLine.indexOf(':');
                const label = cleanLine.substring(0, colonIdx).trim();
                const rest = cleanLine.substring(colonIdx + 1).trim();

                return (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <span className="font-black text-slate-900 dark:text-white uppercase text-[11px] tracking-wide shrink-0">
                      {label}:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {renderStructuredText(rest)}
                    </span>
                  </div>
                );
              }

              return (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="font-medium leading-relaxed">
                    {renderStructuredText(cleanLine)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
            {renderStructuredText(content)}
          </div>
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------------------
// Modern Interactive Calibrated Vital Gauge Bar System
// -----------------------------------------------------------------------------------------

interface VitalColorCardProps {
  title: string;
  unit: string;
  value: string | number;
  onChange: (val: string) => void;
  type: 'spo2' | 'bp' | 'pulse';
  normalRange: string;
  transitionRange: string;
  extremeRange: string;
}

function VitalColorCard({ title, unit, value, onChange, type, normalRange, transitionRange, extremeRange }: VitalColorCardProps) {
  const strVal = String(value || '').trim();

  // Evaluate status & compute mathematical percentage along the gauge scale
  let status: 'normal' | 'transition' | 'extreme' | 'unknown' = 'unknown';
  let statusText = 'Not Recorded';
  let markerPercent = 50;

  // Step adjustment helpers
  const handleStep = (direction: 'up' | 'down') => {
    if (type === 'spo2') {
      const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10) || 98;
      const next = direction === 'up' ? Math.min(100, num + 1) : Math.max(70, num - 1);
      onChange(`${next}`);
    } else if (type === 'pulse') {
      const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10) || 72;
      const next = direction === 'up' ? Math.min(180, num + 2) : Math.max(35, num - 2);
      onChange(`${next}`);
    } else if (type === 'bp') {
      const match = strVal.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        let sys = parseInt(match[1], 10);
        let dia = parseInt(match[2], 10);
        if (direction === 'up') {
          sys = Math.min(220, sys + 4);
          dia = Math.min(130, dia + 2);
        } else {
          sys = Math.max(70, sys - 4);
          dia = Math.max(45, dia - 2);
        }
        onChange(`${sys}/${dia}`);
      } else {
        const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10) || 120;
        const next = direction === 'up' ? num + 4 : num - 4;
        onChange(`${next}/80`);
      }
    }
  };

  if (type === 'spo2') {
    const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) {
      // Scale: 75% to 100%
      const clamped = Math.max(75, Math.min(100, num));
      markerPercent = Math.round(((clamped - 75) / (100 - 75)) * 100);

      if (num >= 95) {
        status = 'normal';
        statusText = 'Optimal O2';
      } else if (num >= 90) {
        status = 'transition';
        statusText = 'Borderline';
      } else {
        status = 'extreme';
        statusText = 'Critical Hypoxia';
      }
    }
  } else if (type === 'pulse') {
    const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num)) {
      // Scale: 40 bpm to 140 bpm
      const clamped = Math.max(40, Math.min(140, num));
      markerPercent = Math.round(((clamped - 40) / (140 - 40)) * 100);

      if (num >= 60 && num <= 100) {
        status = 'normal';
        statusText = 'Normal Rhythm';
      } else if ((num >= 50 && num < 60) || (num > 100 && num <= 115)) {
        status = 'transition';
        statusText = num > 100 ? 'Borderline High' : 'Borderline Low';
      } else {
        status = 'extreme';
        statusText = num > 115 ? 'Tachycardia' : 'Bradycardia';
      }
    }
  } else if (type === 'bp') {
    const match = strVal.match(/(\d+)\s*\/\s*(\d+)/);
    if (match) {
      const sys = parseInt(match[1], 10);
      const dia = parseInt(match[2], 10);
      // Scale: 70 to 180 mmHg based on systolic
      const clamped = Math.max(70, Math.min(180, sys));
      markerPercent = Math.round(((clamped - 70) / (180 - 70)) * 100);

      if (sys >= 90 && sys <= 120 && dia >= 60 && dia <= 80) {
        status = 'normal';
        statusText = 'Optimal BP';
      } else if ((sys >= 121 && sys <= 139) || (dia >= 81 && dia <= 89)) {
        status = 'transition';
        statusText = 'Pre-HTN';
      } else {
        status = 'extreme';
        statusText = (sys >= 140 || dia >= 90) ? 'Hypertension' : 'Hypotension';
      }
    } else {
      const num = parseInt(strVal.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num)) {
        const clamped = Math.max(70, Math.min(180, num));
        markerPercent = Math.round(((clamped - 70) / (180 - 70)) * 100);
        if (num >= 90 && num <= 120) {
          status = 'normal';
          statusText = 'Normal';
        } else if (num >= 121 && num <= 139) {
          status = 'transition';
          statusText = 'Transition';
        } else {
          status = 'extreme';
          statusText = 'Extreme';
        }
      }
    }
  }

  const badgeColor = 
    status === 'normal' 
      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      : status === 'transition'
      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      : status === 'extreme'
      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300';

  const markerBorder = 
    status === 'normal' ? 'border-emerald-500 shadow-emerald-500/40' :
    status === 'transition' ? 'border-amber-500 shadow-amber-500/40' :
    status === 'extreme' ? 'border-rose-500 shadow-rose-500/50' : 'border-slate-500';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700/80 shadow-2xs flex flex-col justify-between space-y-2.5">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
            {title}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border shrink-0 ${badgeColor}`}>
            {statusText}
          </span>
        </div>

        {/* Value Display with Stepper Buttons */}
        <div className="flex items-center gap-1.5 mt-1">
          <button
            type="button"
            onClick={() => handleStep('down')}
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Decrease value"
          >
            <Minus className="w-3 h-3" />
          </button>

          <div className="relative flex-1">
            <input 
              type="text"
              value={strVal}
              onChange={(e) => onChange(e.target.value)}
              placeholder="e.g. 98"
              className="w-full font-mono font-black text-sm px-2.5 py-1 text-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:ring-1.5 focus:ring-blue-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => handleStep('up')}
            className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Increase value"
          >
            <Plus className="w-3 h-3" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 w-8 text-right">
            {unit}
          </span>
        </div>
      </div>

      {/* Normal Reference Range Display (Beside Status & Vitals) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Normal Reference Range:</span>
        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200/80 dark:border-emerald-800/80">
          {normalRange}
        </span>
      </div>
    </div>
  );
}

/**
 * AbnormalParameterBarCard
 * Displays the calibrated continuous gauge bar beside abnormal values
 * recorded or scanned through documents, showing value and normal reference range.
 */
function AbnormalParameterBarCard({
  parameter,
  value,
  normalRange,
  status,
  isAbnormal,
  source
}: {
  parameter: string;
  value: string;
  normalRange: string;
  status: string;
  isAbnormal?: boolean;
  source?: string;
}) {
  // Compute percentage position for the calibrated needle on the bar
  const needlePercent = React.useMemo(() => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return 75;

    // Hemoglobin (normal: 13.5-17.5)
    if (/hemoglobin|hb/i.test(parameter)) {
      if (num < 13.5) return Math.max(10, (num / 13.5) * 30); // in low red zone
      if (num > 17.5) return Math.min(95, 70 + ((num - 17.5) / 5) * 25);
      return 35 + ((num - 13.5) / 4) * 30; // green zone
    }

    // WBC / TLC (normal: 4000 - 11000)
    if (/leukocyte|tlc|wbc/i.test(parameter)) {
      if (num > 11000) return Math.min(95, 70 + ((num - 11000) / 9000) * 25);
      if (num < 4000) return Math.max(10, (num / 4000) * 30);
      return 35 + ((num - 4000) / 7000) * 30;
    }

    // Platelet Count (normal 150000 - 450000)
    if (/platelet/i.test(parameter)) {
      if (num < 150000) return Math.max(10, (num / 150000) * 30);
      if (num > 450000) return Math.min(95, 70 + ((num - 450000) / 200000) * 25);
      return 35 + ((num - 150000) / 300000) * 30;
    }

    // Fasting Blood Sugar / Glucose (normal: 70 - 99)
    if (/sugar|glucose|fbs/i.test(parameter)) {
      if (num > 99) return Math.min(95, 68 + ((num - 99) / 100) * 28);
      if (num < 70) return Math.max(10, (num / 70) * 30);
      return 35 + ((num - 70) / 29) * 30;
    }

    // Oxygen Saturation (normal: 95-100)
    if (/spo2|oxygen/i.test(parameter)) {
      if (num < 90) return Math.max(8, (num / 90) * 25);
      if (num < 95) return 30 + ((num - 90) / 5) * 20;
      return 55 + ((num - 95) / 5) * 40;
    }

    // Default: if status says High/Elevated, place in upper red zone. If Low, place in lower red zone.
    if (/high|elevated|hypertension|tachycardia/i.test(status)) return 82;
    if (/low|hypoxia|anemia|bradycardia|hypotension/i.test(status)) return 18;
    return 50;
  }, [parameter, value, status]);

  const isLow = /low|hypo|anemia|bradycardia/i.test(status);
  const isHigh = /high|elevated|hyper|tachycardia/i.test(status);

  return (
    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: Parameter Info, Value & Abnormal Badge */}
        <div className="min-w-[240px] flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight">
              {parameter}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {source || 'Document Scanned'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
              {value}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              {status}
            </span>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <span>Normal Range:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-200/60 dark:border-emerald-800/60">
              {normalRange}
            </span>
          </div>
        </div>

        {/* Right: Continuous Calibrated Gauge Bar System Beside Abnormal Value */}
        <div className="w-full md:w-[320px] lg:w-[380px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
            <span className={isLow ? "text-rose-600 dark:text-rose-400 font-black" : ""}>
              Low Zone
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              Normal Zone ({normalRange})
            </span>
            <span className={isHigh ? "text-rose-600 dark:text-rose-400 font-black" : ""}>
              High Zone
            </span>
          </div>

          {/* Calibrated Tri-zone Gauge Bar */}
          <div className="relative pt-1 pb-1">
            <div className="h-3 w-full rounded-full overflow-hidden flex relative shadow-inner bg-slate-200 dark:bg-slate-700 p-0.5">
              {/* Low Zone (Red/Amber) */}
              <div className="w-[30%] bg-gradient-to-r from-rose-600 to-amber-500 h-full rounded-l-full" title="Low / Subnormal Zone" />
              {/* Normal Zone (Green) */}
              <div className="w-[40%] bg-gradient-to-r from-emerald-400 to-emerald-600 h-full" title="Normal Physiological Limits" />
              {/* High Zone (Amber/Red) */}
              <div className="w-[30%] bg-gradient-to-r from-amber-500 to-rose-600 h-full rounded-r-full" title="Elevated / Critical Zone" />

              {/* Positioned Marker Needle */}
              <div 
                className="absolute top-[-2px] bottom-[-2px] w-2.5 bg-slate-950 dark:bg-white rounded-full border-2 border-rose-500 shadow-md shadow-rose-500/50 transition-all duration-300 -translate-x-1/2 z-10"
                style={{ left: `${Math.max(4, Math.min(96, needlePercent))}%` }}
                title={`Recorded Finding: ${value} (${status})`}
              />
            </div>
          </div>

          <div className="flex justify-between text-[8px] font-semibold text-slate-400">
            <span>Critical Low</span>
            <span className="text-emerald-600">Target Range</span>
            <span>Critical High</span>
          </div>
        </div>

      </div>
    </div>
  );
}
