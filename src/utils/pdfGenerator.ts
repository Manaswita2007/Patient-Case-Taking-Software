import { jsPDF } from "jspdf";

export interface ReportPDFData {
  id?: string;
  createdAt?: string;
  ayushMode?: boolean;
  isDoctorCopy?: boolean;
  vitals?: {
    name?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    weight?: string | number;
    height?: string | number;
    bloodGroup?: string;
    bloodPressure?: string;
    pulse?: string | number;
    temperature?: string | number;
    spo2?: string | number;
    [key: string]: any;
  } | null;
  summary?: {
    chiefComplaint?: string;
    historyOfPresentIllness?: string;
    pastMedicalSurgicalHistory?: string;
    drugAllergyHistory?: string;
    familyHistory?: string;
    personalHistory?: string;
    reviewOfSystems?: string;
    priorInvestigationsSummary?: string;
    redFlags?: string[];
    anomalies?: string[];
    ayushParameters?: Record<string, string>;
  };
  allopathyDiagnosis?: string;
  allopathySuggestions?: string;
  ayushDiagnosis?: string;
  ayushSuggestions?: string;
  dietaryLifestyleOrders?: string;
  followUpDate?: string;
  messages?: Array<{ role: string; text: string; englishText?: string }>;
  appointment?: {
    date: string;
    slot: string;
    doctorName?: string;
  };
}

export function generatePatientReportPDF(data: ReportPDFData): jsPDF {
  const isDoctorCopy = Boolean(data.isDoctorCopy);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 15;
  const rightMargin = 15;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const bottomMargin = 20;

  let y = 14;

  const checkPageBreak = (neededHeight: number): boolean => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 15;
      renderRunningHeader();
      return true;
    }
    return false;
  };

  const renderRunningHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      isDoctorCopy ? "HEALTHPOINT CLINICAL RECORD - DOCTOR'S COPY" : "HEALTHPOINT PATIENT HEALTH RECORD - PATIENT COPY",
      leftMargin,
      10
    );
    const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`DATE: ${dateStr} | ID: #${(data.id || "REC").slice(0, 8).toUpperCase()}`, pageWidth - rightMargin, 10, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
  };

  // --- TOP HEADER BANNER ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(leftMargin, y, contentWidth, 24, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(
    isDoctorCopy ? "HEALTHPOINT CLINICAL INTAKE REPORT (DOCTOR COPY)" : "HEALTHPOINT PATIENT HEALTH RECORD",
    leftMargin + 6,
    y + 9
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(
    isDoctorCopy
      ? "Confidential Clinical Evaluation & Comprehensive Medical Intake"
      : "Personal Patient Summary, Consultation Points & Response Log",
    leftMargin + 6,
    y + 15
  );

  const reportDate = data.createdAt ? new Date(data.createdAt).toLocaleString() : new Date().toLocaleString();
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${reportDate}`, leftMargin + 6, y + 20);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const repId = (data.id || "PATIENT-REPORT").slice(0, 10).toUpperCase();
  doc.text(`RECORD ID: #${repId}`, pageWidth - rightMargin - 6, y + 9, { align: "right" });

  if (data.ayushMode) {
    doc.setFillColor(34, 197, 94); // emerald-500
    doc.roundedRect(pageWidth - rightMargin - 36, y + 13, 30, 6, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.text("AYUSH INTEGRATED", pageWidth - rightMargin - 21, y + 17, { align: "center" });
  }

  y += 28;

  // --- PATIENT DEMOGRAPHICS & VITALS ---
  const v = data.vitals || {};
  const boxHeight = 33;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(leftMargin, y, contentWidth, boxHeight, 2, 2, "FD");

  // Section Header bar inside box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(leftMargin, y, contentWidth, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("BASIC INFORMATION & RECORDED VITALS", leftMargin + 6, y + 4.8);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(leftMargin, y + 7, pageWidth - rightMargin, y + 7);

  const c1 = leftMargin + 5;
  const c2 = leftMargin + 48;
  const c3 = leftMargin + 93;
  const c4 = leftMargin + 138;

  // Row 1: Demographics
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("PATIENT NAME", c1, y + 11.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  const pName = doc.splitTextToSize(v.name ? String(v.name) : "Patient", 40);
  doc.text(pName[0] || "Patient", c1, y + 16);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("AGE / GENDER", c2, y + 11.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const ageSexStr = [v.age ? `${v.age} Yrs` : "", v.gender || v.sex ? String(v.gender || v.sex) : ""].filter(Boolean).join(" / ") || "N/A";
  doc.text(ageSexStr, c2, y + 16);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("BLOOD GROUP", c3, y + 11.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text(v.bloodGroup ? String(v.bloodGroup) : "N/A", c3, y + 16);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("HEIGHT / WEIGHT", c4, y + 11.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const ht = v.height ? `${v.height} cm` : "";
  const wt = v.weight ? `${v.weight} kg` : "";
  const htWtStr = [ht, wt].filter(Boolean).join(" / ") || "N/A";
  doc.text(htWtStr, c4, y + 16);

  // Sub-divider line
  doc.setDrawColor(241, 245, 249);
  doc.line(leftMargin + 4, y + 19, pageWidth - rightMargin - 4, y + 19);

  // Row 2: Recorded Vitals
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("BLOOD PRESSURE", c1, y + 23.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const bpVal = v.bloodPressure ? String(v.bloodPressure) : (v.bp ? String(v.bp) : "Not recorded");
  doc.text(bpVal.includes("mmHg") || bpVal.includes("Not") ? bpVal : `${bpVal} mmHg`, c1, y + 28);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("PULSE RATE", c2, y + 23.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const pulseVal = v.pulseRate || v.pulse ? `${v.pulseRate || v.pulse} bpm` : "Not recorded";
  doc.text(pulseVal, c2, y + 28);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("SPO2 OXYGEN", c3, y + 23.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const spo2Val = v.oxygenLevel || v.spo2 ? `${v.oxygenLevel || v.spo2}%` : "Not recorded";
  doc.text(spo2Val, c3, y + 28);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("TEMPERATURE", c4, y + 23.5);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  const tempVal = v.temperature ? `${v.temperature} °F` : "Normal";
  doc.text(tempVal, c4, y + 28);

  y += boxHeight + 7;

  // Helper to render a section
  const renderSectionHeader = (title: string, color = [30, 58, 138]) => {
    checkPageBreak(14);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(leftMargin, y, 2.5, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title.toUpperCase(), leftMargin + 5, y + 4.8);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(leftMargin, y + 7.5, pageWidth - rightMargin, y + 7.5);
    y += 11;
  };

  const renderField = (label: string, value?: string | null, isHighlighted = false) => {
    if (!value) return;
    const cleanValue = value.trim();
    if (cleanValue === "") return;
    const lower = cleanValue.toLowerCase();
    // Leave blank if no real information was given
    if (
      lower === "not specified" || 
      lower === "none reported" || 
      lower === "none provided" || 
      lower === "none" ||
      lower === "n/a" ||
      lower.includes("to be confirmed") ||
      lower.includes("recorded in consultation transcript")
    ) {
      return;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const labelLines = doc.splitTextToSize(`${label}:`, 42);
    const valueLines = doc.splitTextToSize(cleanValue, contentWidth - 44);
    const fieldHeight = Math.max(labelLines.length, valueLines.length) * 4.2 + 2;

    checkPageBreak(fieldHeight);

    // Only allow amber highlight if isDoctorCopy or non-critical follow-up
    if (isHighlighted && isDoctorCopy) {
      doc.setFillColor(254, 243, 199); // amber-100
      doc.roundedRect(leftMargin, y - 2, contentWidth, fieldHeight + 2, 1, 1, "F");
    }

    doc.text(labelLines, leftMargin + 2, y + 2);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(valueLines, leftMargin + 44, y + 2);

    y += fieldHeight + 1.5;
  };

  // --- APPOINTMENT DETAILS ---
  if (data.appointment) {
    checkPageBreak(25);
    doc.setFillColor(220, 252, 231); // emerald-100
    doc.setDrawColor(34, 197, 94); // emerald-500
    doc.roundedRect(leftMargin, y, contentWidth, 22, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text("SCHEDULED APPOINTMENT CONFIRMED", leftMargin + 4, y + 6);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    
    const formattedDate = new Date(data.appointment.date).toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric", year: "numeric"
    });

    doc.text(`Doctor: ${data.appointment.doctorName || "Assigned Specialist"}`, leftMargin + 4, y + 12);
    doc.setFont("helvetica", "bold");
    doc.text(`Date & Time: ${formattedDate} at ${data.appointment.slot}`, leftMargin + 4, y + 17);
    
    y += 26;
  }

  // --- DOCTOR'S DIAGNOSIS & PLAN (If provided) ---
  const hasDoctorInput = Boolean(
    data.allopathyDiagnosis ||
    data.allopathySuggestions ||
    data.ayushDiagnosis ||
    data.ayushSuggestions ||
    data.dietaryLifestyleOrders ||
    data.followUpDate
  );

  if (hasDoctorInput) {
    renderSectionHeader("Doctor's Diagnosis & Care Plan", [14, 116, 144]); // cyan-700

    if (data.allopathyDiagnosis) {
      renderField("Diagnosis (Allopathy)", data.allopathyDiagnosis);
    }
    if (data.allopathySuggestions) {
      renderField("Prescription / Plan", data.allopathySuggestions);
    }
    if (data.ayushDiagnosis) {
      renderField("AYUSH Diagnosis", data.ayushDiagnosis);
    }
    if (data.ayushSuggestions) {
      renderField("AYUSH Plan", data.ayushSuggestions);
    }
    if (data.dietaryLifestyleOrders) {
      renderField("Diet & Lifestyle Orders", data.dietaryLifestyleOrders);
    }
    if (data.followUpDate) {
      const followUpFormatted = new Date(data.followUpDate).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      renderField("Scheduled Follow-up", followUpFormatted, isDoctorCopy);
    }
    y += 4;
  }

  // --- RED FLAGS & ALERTS (EXCLUSIVELY IN DOCTOR'S COPY) ---
  // The user explicitly stated: "do not add red flags and highlighted symptoms in patient's copy."
  if (isDoctorCopy) {
    const redFlags = data.summary?.redFlags || [];
    const anomalies = data.summary?.anomalies || [];
    if (redFlags.length > 0 || anomalies.length > 0) {
      checkPageBreak(18);
      doc.setFillColor(254, 242, 242); // red-50
      doc.setDrawColor(248, 113, 113); // red-400
      doc.roundedRect(leftMargin, y, contentWidth, 14 + (redFlags.length + anomalies.length) * 4, 1.5, 1.5, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text("CRITICAL ALERTS & CLINICAL RED FLAGS (CLINICIAN ONLY):", leftMargin + 4, y + 5);

      let alertY = y + 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      redFlags.forEach((flag) => {
        doc.text(`• ${flag}`, leftMargin + 6, alertY);
        alertY += 4;
      });
      anomalies.forEach((anomaly) => {
        doc.text(`• Abnormal: ${anomaly}`, leftMargin + 6, alertY);
        alertY += 4;
      });
      y = alertY + 4;
    }
  }

  // --- CLINICAL HISTORY SUMMARY (Basic Information) ---
  const s = data.summary || {};
  renderSectionHeader(isDoctorCopy ? "Clinical Intake History" : "Consultation Summary", [30, 58, 138]);

  if (s.chiefComplaint) {
    renderField("Chief Complaint", s.chiefComplaint, isDoctorCopy);
  }
  if (s.historyOfPresentIllness) {
    renderField("History of Illness", s.historyOfPresentIllness);
  }
  if (s.pastMedicalSurgicalHistory) {
    renderField("Past Medical/Surgical", s.pastMedicalSurgicalHistory);
  }
  if (s.drugAllergyHistory) {
    renderField("Known Allergies", s.drugAllergyHistory);
  }
  if (s.familyHistory) {
    renderField("Family History", s.familyHistory);
  }
  if (s.personalHistory) {
    renderField("Personal History", s.personalHistory);
  }
  if (s.reviewOfSystems) {
    renderField("Review of Systems", s.reviewOfSystems);
  }
  if (s.priorInvestigationsSummary) {
    renderField("Prior Investigations", s.priorInvestigationsSummary);
  }

  // --- AYUSH / DASHAVIDHA PARIKSHA ASSESSMENT ---
  if (data.ayushMode && s.ayushParameters && Object.keys(s.ayushParameters).length > 0) {
    y += 2;
    renderSectionHeader("AYUSH Assessment Parameters", [22, 101, 52]); // emerald-700
    
    const params = s.ayushParameters;
    const entries = Object.entries(params);
    
    entries.forEach(([key, val]) => {
      if (val && typeof val === "string") {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase());
        renderField(formattedKey, val);
      }
    });
  }

  // --- POINT-WISE SUMMARY OF THE CHAT WITH AI ---
  // Only extract what was actually discussed/given by the patient; do not add filler or unprovided info
  if (!isDoctorCopy && data.messages && data.messages.length > 0) {
    const summaryPoints: string[] = [];

    const isGiven = (val?: string | null) => {
      if (!val) return false;
      const clean = val.trim().toLowerCase();
      if (!clean) return false;
      if (
        clean === "not specified" || 
        clean === "none reported" || 
        clean === "none provided" || 
        clean === "none" ||
        clean === "n/a" ||
        clean.includes("to be confirmed") ||
        clean.includes("recorded in consultation transcript")
      ) {
        return false;
      }
      return true;
    };

    if (isGiven(s.chiefComplaint)) {
      summaryPoints.push(`Primary reason for visit: ${s.chiefComplaint!.trim()}`);
    }
    if (isGiven(s.historyOfPresentIllness)) {
      summaryPoints.push(`Symptom timeline & progression: ${s.historyOfPresentIllness!.trim()}`);
    }
    if (isGiven(s.drugAllergyHistory)) {
      summaryPoints.push(`Allergies / Current Medications: ${s.drugAllergyHistory!.trim()}`);
    }
    if (isGiven(s.pastMedicalSurgicalHistory)) {
      summaryPoints.push(`Past Medical History: ${s.pastMedicalSurgicalHistory!.trim()}`);
    }
    if (isGiven(s.familyHistory)) {
      summaryPoints.push(`Family History: ${s.familyHistory!.trim()}`);
    }
    if (isGiven(s.personalHistory)) {
      summaryPoints.push(`Personal / Lifestyle History: ${s.personalHistory!.trim()}`);
    }

    if (summaryPoints.length > 0) {
      y += 3;
      renderSectionHeader("Point-wise Summary of Consultation with AI", [59, 130, 246]); // blue-500

      summaryPoints.forEach((point) => {
        const pointText = `•  ${point}`;
        const lines = doc.splitTextToSize(pointText, contentWidth - 6);
        const h = lines.length * 4.2 + 2;
        checkPageBreak(h);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, leftMargin + 3, y + 2);
        y += h;
      });
      y += 2;
    }
  }

  // --- PATIENT'S EVERY RESPONSES ---
  // Only render responses actually submitted by the patient; do not fabricate filler responses
  if (data.messages && data.messages.length > 0) {
    const userMessages = data.messages.filter((m) => m.role === "user" && ((m.englishText && m.englishText.trim()) || (m.text && m.text.trim())));
    if (userMessages.length > 0) {
      y += 3;
      renderSectionHeader(
        isDoctorCopy ? "Patient Consultation Transcript" : "Patient's Recorded Responses (Point-by-Point)",
        [71, 85, 105]
      );

      userMessages.forEach((msg, idx) => {
        const text = (msg.englishText || msg.text || "").trim();
        if (text) {
          const label = `Response #${idx + 1}`;
          renderField(label, text);
        }
      });
    }
  }

  // --- FOOTER ON ALL PAGES ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      isDoctorCopy
        ? "CONFIDENTIAL CLINICAL RECORD • DOCTOR COPY • For authorized medical professional reference only."
        : "CONFIDENTIAL PATIENT HEALTH RECORD • PATIENT COPY • HealthPoint AI Clinical Intake Documentation.",
      leftMargin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin, pageHeight - 8, { align: "right" });
  }

  return doc;
}

/**
 * Downloads the PDF directly to the user's device
 */
export function downloadPatientReportPDF(data: ReportPDFData, customFilename?: string): boolean {
  try {
    const doc = generatePatientReportPDF(data);
    const patientName = data.vitals?.name ? data.vitals.name.replace(/[^a-zA-Z0-9]/g, "_") : "Patient";
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = customFilename || `HealthPoint_Clinical_Summary_${patientName}_${dateStr}.pdf`;

    // Direct save via jsPDF
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to generate and download PDF:", error);
    return false;
  }
}

/**
 * Generates a separate, dedicated PDF containing the verbatim Chat History between the Patient and AI
 */
export function generateChatHistoryPDF(data: ReportPDFData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 15;
  const rightMargin = 15;
  const contentWidth = pageWidth - leftMargin - rightMargin;
  const bottomMargin = 20;

  let y = 14;

  const checkPageBreak = (neededHeight: number): boolean => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 15;
      renderRunningHeader();
      return true;
    }
    return false;
  };

  const renderRunningHeader = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("MEDIKIOSK CLINICAL AI DIALOGUE TRANSCRIPT • CHAT HISTORY", leftMargin, 10);
    const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    doc.text(`DATE: ${dateStr} | ID: #${(data.id || "REC").slice(0, 8).toUpperCase()}`, pageWidth - rightMargin, 10, { align: "right" });
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
  };

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(leftMargin, y, contentWidth, 24, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AI CLINICAL INTAKE • COMPLETE CHAT TRANSCRIPT", leftMargin + 6, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  doc.text(
    "Verbatim chronological consultation dialogue between Patient and HealthPoint Clinical Assistant.",
    leftMargin + 6,
    y + 15
  );
  doc.text(
    `ABHA / Record ID: ${(data.id || "NEW-INTAKE").toUpperCase()} • Generated: ${new Date().toLocaleString()}`,
    leftMargin + 6,
    y + 20
  );

  y += 30;

  // Patient Info Strip
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(leftMargin, y, contentWidth, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`Patient: ${data.vitals?.name || "Patient"}`, leftMargin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const vitalsText = [
    data.vitals?.age ? `Age: ${data.vitals.age}` : "",
    data.vitals?.gender ? `Gender: ${data.vitals.gender}` : "",
    data.vitals?.phone ? `Phone: ${data.vitals.phone}` : "",
    data.vitals?.hospital ? `Hospital: ${data.vitals.hospital}` : "",
    data.vitals?.doctor ? `Doctor: ${data.vitals.doctor}` : ""
  ].filter(Boolean).join("  |  ");
  doc.text(vitalsText || "Demographics recorded at intake", leftMargin + 4, y + 10.5);

  y += 19;

  // Dialogue Messages List
  const msgs = data.messages || [];
  if (msgs.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No dialogue messages recorded for this session.", leftMargin + 4, y + 6);
    y += 15;
  } else {
    msgs.forEach((msg, idx) => {
      const isAI = msg.role === "assistant";
      const speakerLabel = isAI ? "HealthPoint Clinical AI Assistant" : (data.vitals?.name || "Patient");
      const primaryText = (msg.englishText || msg.text || "").trim();
      const originalLangText = (msg.text && msg.text !== msg.englishText) ? msg.text.trim() : "";

      const splitPrimary = doc.splitTextToSize(primaryText, contentWidth - 16);
      const splitOrig = originalLangText ? doc.splitTextToSize(`Original input: "${originalLangText}"`, contentWidth - 16) : [];

      const boxHeight = 10 + (splitPrimary.length * 4.2) + (splitOrig.length ? (splitOrig.length * 3.8 + 3) : 0) + 4;

      checkPageBreak(boxHeight + 4);

      if (isAI) {
        doc.setFillColor(241, 245, 249); // slate-100
        doc.setDrawColor(203, 213, 225);
      } else {
        doc.setFillColor(238, 242, 255); // indigo-50
        doc.setDrawColor(199, 210, 254);
      }
      doc.roundedRect(leftMargin, y, contentWidth, boxHeight, 1.5, 1.5, "FD");

      // Speaker Tag
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      if (isAI) {
        doc.setTextColor(30, 58, 138); // blue-900
      } else {
        doc.setTextColor(67, 56, 202); // indigo-700
      }
      doc.text(`#${idx + 1}  ${speakerLabel}`, leftMargin + 4, y + 5.5);

      // Primary dialogue text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      let textY = y + 10;
      doc.text(splitPrimary, leftMargin + 4, textY);
      textY += splitPrimary.length * 4.2;

      // Original language text if bilingual
      if (splitOrig.length > 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(splitOrig, leftMargin + 4, textY + 1.5);
      }

      y += boxHeight + 3.5;
    });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "CONFIDENTIAL PATIENT RECORD • VERBATIM AI CHAT TRANSCRIPT • Protected by Medical Privacy Standards.",
      leftMargin,
      pageHeight - 8
    );
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin, pageHeight - 8, { align: "right" });
  }

  return doc;
}

/**
 * Downloads the Chat History PDF directly to the user's device
 */
export function downloadChatHistoryPDF(data: ReportPDFData, customFilename?: string): boolean {
  try {
    const doc = generateChatHistoryPDF(data);
    const patientName = data.vitals?.name ? data.vitals.name.replace(/[^a-zA-Z0-9]/g, "_") : "Patient";
    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = customFilename || `HealthPoint_Chat_History_${patientName}_${dateStr}.pdf`;

    doc.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to generate and download Chat History PDF:", error);
    return false;
  }
}
