export interface ClinicalRiskAssessment {
  percentage: number; // 0 to 100
  level: 'STABLE' | 'GUARDED' | 'CRITICAL';
  color: string; // hex color
  colorClass: string; // text class
  barGradient: string; // tailwind gradient
  bgClass: string; // tailwind bg
  borderClass: string; // tailwind border
  badgeText: string;
  summary: string;
  contributingRedFlags: string[];
  contributingAnomalies: string[];
  contributingSymptoms: string[];
  vitalConcerns: string[];
}

/**
 * Calculates a clinical lethality / health risk score based on
 * red flags, anomalies, triage vitals, and highlighted symptoms.
 */
export function calculateClinicalRisk(report: any): ClinicalRiskAssessment {
  if (!report) {
    return {
      percentage: 12,
      level: 'STABLE',
      color: '#10b981',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      barGradient: 'from-emerald-500 to-green-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      badgeText: 'Low Risk / Stable',
      summary: 'Patient vitals and clinical intake within standard outpatient limits.',
      contributingRedFlags: [],
      contributingAnomalies: [],
      contributingSymptoms: [],
      vitalConcerns: []
    };
  }

  const summary = report.summary || {};
  const vitals = report.vitals || {};

  const redFlags: string[] = Array.isArray(summary.redFlags) ? summary.redFlags : [];
  const anomalies: string[] = Array.isArray(summary.anomalies) ? summary.anomalies : [];
  const chiefComplaint: string = String(summary.chiefComplaint || '').toLowerCase();
  const hpi: string = String(summary.historyOfPresentIllness || '').toLowerCase();

  const contributingRedFlags: string[] = [...redFlags];
  const contributingAnomalies: string[] = [...anomalies];
  const contributingSymptoms: string[] = [];
  const vitalConcerns: string[] = [];

  // Base clinical intake risk (routine baseline)
  let score = 12;

  // 1. High critical red flags (Emergency signs)
  const criticalKeywords = [
    'chest pain', 'cardiac', 'angina', 'myocardial', 'heart attack',
    'stroke', 'hemiparesis', 'facial droop', 'slurred speech', 'paralysis',
    'shortness of breath', 'breathlessness', 'severe dyspnea', 'choking', 'cyanosis',
    'hemoptysis', 'coughing blood', 'vomiting blood', 'hematemesis', 'melena',
    'syncope', 'unconscious', 'loss of consciousness', 'blackout', 'seizure', 'convulsion',
    'anaphylaxis', 'stridor', 'severe allergic reaction',
    'severe bleeding', 'hemorrhage', 'sepsis', 'septic shock'
  ];

  let hasHighCriticalFlag = false;

  for (const flag of redFlags) {
    const fLower = flag.toLowerCase();
    const isCritical = criticalKeywords.some(kw => fLower.includes(kw));
    if (isCritical) {
      hasHighCriticalFlag = true;
      score += 38;
    } else {
      score += 24;
    }
  }

  // 2. Clinical Anomalies
  for (const anomaly of anomalies) {
    score += 15;
  }

  // 3. Vitals evaluation
  // Blood Pressure
  const bpStr = String(vitals.bloodPressure || vitals.bp || '');
  if (bpStr) {
    const parts = bpStr.split('/');
    if (parts.length === 2) {
      const sys = parseInt(parts[0], 10);
      const dia = parseInt(parts[1], 10);
      if (!isNaN(sys)) {
        if (sys >= 180 || dia >= 120) {
          score += 35;
          vitalConcerns.push(`Hypertensive Crisis (${bpStr} mmHg)`);
          hasHighCriticalFlag = true;
        } else if (sys >= 140 || dia >= 90) {
          score += 18;
          vitalConcerns.push(`Elevated BP (${bpStr} mmHg)`);
        } else if (sys < 90 || dia < 60) {
          score += 26;
          vitalConcerns.push(`Hypotension / Shock Risk (${bpStr} mmHg)`);
          hasHighCriticalFlag = true;
        }
      }
    }
  }

  // Oxygen Saturation (SpO2)
  const spo2Val = parseFloat(String(vitals.spo2 || ''));
  if (!isNaN(spo2Val)) {
    if (spo2Val < 90) {
      score += 42;
      vitalConcerns.push(`Severe Hypoxia (SpO2 ${spo2Val}%)`);
      hasHighCriticalFlag = true;
    } else if (spo2Val <= 93) {
      score += 26;
      vitalConcerns.push(`Moderate Desaturation (SpO2 ${spo2Val}%)`);
    } else if (spo2Val <= 95) {
      score += 12;
      vitalConcerns.push(`Borderline SpO2 (${spo2Val}%)`);
    }
  }

  // Pulse rate
  const pulseVal = parseFloat(String(vitals.pulse || ''));
  if (!isNaN(pulseVal)) {
    if (pulseVal >= 125) {
      score += 26;
      vitalConcerns.push(`Severe Tachycardia (${pulseVal} bpm)`);
    } else if (pulseVal > 100) {
      score += 14;
      vitalConcerns.push(`Tachycardia (${pulseVal} bpm)`);
    } else if (pulseVal < 45) {
      score += 30;
      vitalConcerns.push(`Severe Bradycardia (${pulseVal} bpm)`);
      hasHighCriticalFlag = true;
    } else if (pulseVal < 55) {
      score += 14;
      vitalConcerns.push(`Bradycardia (${pulseVal} bpm)`);
    }
  }

  // Temperature
  const tempVal = parseFloat(String(vitals.temperature || ''));
  if (!isNaN(tempVal)) {
    if (tempVal >= 103) {
      score += 25;
      vitalConcerns.push(`High Grade Pyrexia (${tempVal}°F)`);
    } else if (tempVal >= 100.4) {
      score += 14;
      vitalConcerns.push(`Pyrexia (${tempVal}°F)`);
    } else if (tempVal < 95) {
      score += 28;
      vitalConcerns.push(`Hypothermia (${tempVal}°F)`);
      hasHighCriticalFlag = true;
    }
  }

  // 4. Highlighted Acute Symptoms in Chief Complaint / HPI
  const acuteSymptomTerms = [
    { term: 'chest pain', label: 'Acute Chest Pain' },
    { term: 'shortness of breath', label: 'Dyspnea / Breathlessness' },
    { term: 'difficulty breathing', label: 'Respiratory Distress' },
    { term: 'severe headache', label: 'Thunderclap / Severe Cephalea' },
    { term: 'high fever', label: 'Spiking High Fever' },
    { term: 'radiating', label: 'Radiating Pain Pattern' },
    { term: 'fainted', label: 'Syncopal Episode' },
    { term: 'dizziness', label: 'Vertigo / Presyncope' },
    { term: 'palpitation', label: 'Cardiac Palpitations' },
    { term: 'vomiting blood', label: 'Hematemesis' },
    { term: 'intense pain', label: 'Severe Pain Score' },
    { term: 'unbearable', label: 'Intractable Acute Pain' }
  ];

  for (const item of acuteSymptomTerms) {
    if (chiefComplaint.includes(item.term) || hpi.includes(item.term)) {
      if (!contributingSymptoms.includes(item.label)) {
        contributingSymptoms.push(item.label);
        score += 16;
      }
    }
  }

  // Enforce boundaries based on clinical reality:
  if (hasHighCriticalFlag) {
    // If there is an active emergency red flag or severe hypoxia/hypertensive crisis,
    // minimum lethality score is 72% (Red category)
    score = Math.max(score, 74);
  } else if (redFlags.length > 0 || anomalies.length >= 2 || vitalConcerns.length >= 2) {
    // If there are anomalies or non-critical red flags, score is at least 42% (Yellow category)
    score = Math.max(score, 45);
  } else if (redFlags.length === 0 && anomalies.length === 0 && vitalConcerns.length === 0) {
    // If completely clean routine intake, cap at 30% (Green category)
    score = Math.min(score, 28);
  }

  // Bound score strictly between 5% and 98%
  const percentage = Math.min(Math.max(Math.round(score), 6), 98);

  // Determine Level, Color, and Styling
  if (percentage >= 70) {
    return {
      percentage,
      level: 'CRITICAL',
      color: '#ef4444',
      colorClass: 'text-red-600 dark:text-red-400',
      barGradient: 'from-orange-500 via-rose-500 to-red-600',
      bgClass: 'bg-red-50 dark:bg-red-950/40',
      borderClass: 'border-red-200 dark:border-red-900/60',
      badgeText: 'Critical / High Urgency',
      summary: 'Urgent risk factors detected. Immediate physician clinical evaluation recommended.',
      contributingRedFlags,
      contributingAnomalies,
      contributingSymptoms,
      vitalConcerns
    };
  } else if (percentage >= 35) {
    return {
      percentage,
      level: 'GUARDED',
      color: '#f59e0b',
      colorClass: 'text-amber-600 dark:text-amber-400',
      barGradient: 'from-amber-400 to-yellow-500',
      bgClass: 'bg-amber-50 dark:bg-amber-950/30',
      borderClass: 'border-amber-200 dark:border-amber-800/60',
      badgeText: 'Moderate / Guarded Risk',
      summary: 'Moderate risk indicators present. Prompt clinical review and close vital monitoring advised.',
      contributingRedFlags,
      contributingAnomalies,
      contributingSymptoms,
      vitalConcerns
    };
  } else {
    return {
      percentage,
      level: 'STABLE',
      color: '#10b981',
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      barGradient: 'from-emerald-500 to-green-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderClass: 'border-emerald-200 dark:border-emerald-800/60',
      badgeText: 'Low Risk / Stable',
      summary: 'Low lethality risk. Standard outpatient queue priority appropriate.',
      contributingRedFlags,
      contributingAnomalies,
      contributingSymptoms,
      vitalConcerns
    };
  }
}
