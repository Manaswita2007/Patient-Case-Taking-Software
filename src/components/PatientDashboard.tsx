import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Mic, Upload, FileText, CheckCircle, AlertTriangle, Languages, Square, Activity, ArrowLeft, ScanLine, Send, Download, Clock, Volume2, Printer, Loader2, FileDown, Thermometer, Settings, LayoutDashboard, LogOut, ChevronDown, X, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { getAppSocket } from '../utils/socket';
import AyushDetailedAssessment, { questions } from './AyushDetailedAssessment';
import PatientOnboarding from './PatientOnboarding';
import PatientHome from './PatientHome';
import PatientProfileSetup from './PatientProfileSetup';
import AppointmentBooking from './AppointmentBooking';
import SettingsDrawer from './SettingsDrawer';
import RetractableBackButton from './RetractableBackButton';
import TTSButton from './TTSButton';
import HospitalsNearMe, { Hospital } from './HospitalsNearMe';
import EmergencyAmbulance from './EmergencyAmbulance';
import { speakText, stopSpeech, LANG_CODE_MAP } from '../utils/speech';
import { downloadPatientReportPDF, generatePatientReportPDF, downloadChatHistoryPDF, ReportPDFData } from '../utils/pdfGenerator';

type Message = { id?: string; role: 'user' | 'assistant', text: string, englishText?: string };

export default function PatientDashboard() {
  const { t, language, setIsTranslating } = useAppContext();
  const getFullLanguage = () => {
    const langMap: Record<string, string> = {
      en: 'English',
      hi: 'Hindi',
      bn: 'Bengali',
      ta: 'Tamil',
      te: 'Telugu',
      mr: 'Marathi',
      gu: 'Gujarati',
      kn: 'Kannada',
      pa: 'Punjabi',
      ml: 'Malayalam'
    };
    return langMap[language] || 'English';
  };
  const speakMessage = (text: string) => {
    speakText(text, language);
  };

  const renderTextWithBoldQuestions = (text: string) => {
    if (!text) return null;
    const cleanText = text.replace(/\*\*/g, '');
    const parts = cleanText.split(/([^.!?।\n]+?\?)/g);
    return parts.map((part, i) => {
      if (part.trim().endsWith('?')) {
        return <strong key={i} className="font-bold">{part}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const currentFullLanguage = getFullLanguage();
    const getInitialMessage = () => {
    if (language === 'hi') return 'नमस्ते! मैं आपका एआई क्लिनिकल असिस्टेंट हूं। क्या आप मुझे बता सकते हैं कि आज आप अस्पताल क्यों आए हैं?';
    if (language === 'bn') return 'নমস্কার! আমি আপনার এআই ক্লিনিক্যাল অ্যাসিস্ট্যান্ট। আপনি কি আমাকে বলতে পারেন আজ কেন আপনি হাসপাতালে এসেছেন?';
    return 'Hello! I am your AI clinical assistant. Can you tell me what brings you to the hospital today?';
  };

  const [messages, setMessages] = useState<Message[]>([
    { id: 'msg-init', role: 'assistant', text: getInitialMessage() }
  ]);

  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'msg-init') {
      setMessages([{ id: 'msg-init', role: 'assistant', text: getInitialMessage() }]);
    } else if (messages.length > 1) {
      let isCurrent = true;
      setIsTranslating(true);
      fetch('/api/translate/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, targetLanguage: currentFullLanguage })
      })
        .then(res => res.json())
        .then(data => {
          if (isCurrent && data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        })
        .catch(err => console.error("Real-time screen translation failed:", err))
        .finally(() => {
          if (isCurrent) {
            setIsTranslating(false);
          }
        });

      return () => {
        isCurrent = false;
      };
    }
  }, [language]);

  const [view, setView] = useState<'loading' | 'profile-setup' | 'home' | 'intake' | 'hospitals' | 'ambulance'>('loading');
  const [patientProfile, setPatientProfile] = useState<any>(null);
  const [selectedHospitalForAmbulance, setSelectedHospitalForAmbulance] = useState<Hospital | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [ayushMode, setAyushMode] = useState(false);
  const [ayushAssessmentData, setAyushAssessmentData] = useState<any>({});
  const [documents, setDocuments] = useState<{id?: string, name: string, base64: string, mimeType: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingChatPdf, setIsDownloadingChatPdf] = useState(false);
  const [isReviewingConfirmation, setIsReviewingConfirmation] = useState(false);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('patientId');
    localStorage.removeItem('patientIdentifier');
    localStorage.removeItem('identifierType');
    localStorage.removeItem('patientName');
    navigate('/');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const patientId = localStorage.getItem("patientId");
      if (!patientId) {
        navigate('/');
        return;
      }
      try {
        const res = await fetch(`/api/patient/${patientId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.patient) {
            setPatientProfile(data.patient);
            if (!data.patient.name || data.patient.name.startsWith('Patient ') || !data.patient.age || !data.patient.gender || !data.patient.height || !data.patient.weight) {
              setView('profile-setup');
            } else {
              setView('home');
            }
          } else {
            setView('profile-setup');
          }
        } else {
          setView('profile-setup');
        }
      } catch (e) {
        setView('profile-setup');
      }
    };
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    const patientId = localStorage.getItem("patientId");
    const socket = getAppSocket();

    const joinRooms = () => {
      if (patientId) {
        socket.emit("join_patient", patientId);
      }
      if (generatedReport?.id) {
        socket.emit("join_patient", generatedReport.id);
      }
    };

    joinRooms();
    socket.on("connect", joinRooms);

    const onReportUpdated = (report: any) => {
      if (
        report &&
        (report.patientId === patientId ||
          report.id === generatedReport?.id ||
          (patientId && report.id === patientId))
      ) {
        setGeneratedReport((prev: any) => ({ ...prev, ...report }));
      }
    };

    socket.on("report_updated", onReportUpdated);

    return () => {
      socket.off("connect", joinRooms);
      socket.off("report_updated", onReportUpdated);
    };
  }, [generatedReport?.id]);

  const handleDownloadPDF = async () => {
    setIsDownloadingPdf(true);
    try {
      const reportData: ReportPDFData = {
        id: generatedReport?.id,
        createdAt: generatedReport?.createdAt,
        ayushMode: Boolean(ayushMode),
        isDoctorCopy: false,
        vitals: onboardingData || generatedReport?.vitals,
        summary: generatedReport?.summary,
        allopathyDiagnosis: generatedReport?.allopathyDiagnosis,
        allopathySuggestions: generatedReport?.allopathySuggestions,
        ayushDiagnosis: generatedReport?.ayushDiagnosis,
        ayushSuggestions: generatedReport?.ayushSuggestions,
        dietaryLifestyleOrders: generatedReport?.dietaryLifestyleOrders,
        followUpDate: generatedReport?.followUpDate,
        messages: messages,
        appointment: generatedReport?.appointment
      };

      await new Promise(res => setTimeout(res, 80));
      const success = downloadPatientReportPDF(reportData);
      if (!success) {
        window.print();
      }
    } catch (err) {
      console.error("PDF download failed:", err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadChatPDF = () => {
    setIsDownloadingChatPdf(true);
    try {
      downloadChatHistoryPDF({
        id: generatedReport?.id,
        createdAt: new Date().toISOString(),
        vitals: onboardingData,
        messages: messages
      });
    } catch (e) {
      console.error("Chat PDF error:", e);
    } finally {
      setIsDownloadingChatPdf(false);
    }
  };

  const handlePrintOrViewPDF = () => {
    try {
      const reportData: ReportPDFData = {
        id: generatedReport?.id,
        createdAt: generatedReport?.createdAt,
        ayushMode: Boolean(ayushMode),
        isDoctorCopy: false,
        vitals: onboardingData || generatedReport?.vitals,
        summary: generatedReport?.summary,
        allopathyDiagnosis: generatedReport?.allopathyDiagnosis,
        allopathySuggestions: generatedReport?.allopathySuggestions,
        ayushDiagnosis: generatedReport?.ayushDiagnosis,
        ayushSuggestions: generatedReport?.ayushSuggestions,
        dietaryLifestyleOrders: generatedReport?.dietaryLifestyleOrders,
        followUpDate: generatedReport?.followUpDate,
        messages: messages,
        appointment: generatedReport?.appointment
      };

      const doc = generatePatientReportPDF(reportData);
      const blobUrl = doc.output('bloburl');
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        window.print();
      }
    } catch (e) {
      console.error("Print/preview error:", e);
      window.print();
    }
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isRecordingIntentRef = useRef<boolean>(false);
  const accumulatedTranscriptRef = useRef<string>('');
  const sessionFinalRef = useRef<string>('');
  const sessionInterimRef = useRef<string>('');
  const lastEnglishTranscriptRef = useRef<string>('');
  const recordingStartTimeRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const restartTimeoutRef = useRef<any>(null);
  const [audioVolumeLevel, setAudioVolumeLevel] = useState<number>(0);

  // Auto-focus chat input field when recording finishes or AI assistant finishes thinking
  useEffect(() => {
    if (!isRecording && !isThinking) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isRecording, isThinking]);

  // Clean up any active voice recording or mic streams on unmount
  useEffect(() => {
    return () => {
      isRecordingIntentRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch(e) {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch(e) {}
      }
    };
  }, []);

  // Review Intake Blood Group & Sex Modals
  const [showReviewBgModal, setShowReviewBgModal] = useState(false);
  const [showReviewSexModal, setShowReviewSexModal] = useState(false);
  const [customReviewBg, setCustomReviewBg] = useState('');
  const [customReviewSex, setCustomReviewSex] = useState('');

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{ name: string; base64: string; mimeType: string } | null>(null);
  const [previewZoom, setPreviewZoom] = useState(1);

  // Voice recording states & timer
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  // Global unmount cleanup for audio, speech synthesis, & speech recognition
  useEffect(() => {
    return () => {
      isRecordingIntentRef.current = false;
      stopSpeech();
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        } catch(e) {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  const prevMessagesLengthRef = useRef(messages.length);
  useEffect(() => {
    // Only auto-scroll when a new message is added or when AI starts thinking
    if (messages.length > prevMessagesLengthRef.current || isThinking) {
      const container = chatEndRef.current?.closest('.overflow-y-auto');
      if (container) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      } else {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages, isThinking]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const dataUrl = event.target.result as string;
            const [header, base64] = dataUrl.split(',');
            const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
            setDocuments(prev => [...prev, { id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9) + '-' + Math.random(), name: file.name, base64, mimeType }]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const launchNativeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return false;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = LANG_CODE_MAP[language] || 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (finalChunk) {
          sessionFinalRef.current += finalChunk;
        }
        sessionInterimRef.current = interim;
        const fullText = (accumulatedTranscriptRef.current + sessionFinalRef.current + interim).trim();
        if (fullText) {
          setLiveTranscript(fullText);
          setTextInput(fullText);
        }
      };

      recognition.onerror = (e: any) => {
        const errType = e?.error;
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          isRecordingIntentRef.current = false;
          setIsRecording(false);
          setVoiceNotice("Microphone permission denied. Please allow microphone access in your browser settings.");
          setTimeout(() => setVoiceNotice(null), 4000);
          return;
        }
        if (errType === 'audio-capture') {
          isRecordingIntentRef.current = false;
          setIsRecording(false);
          setVoiceNotice("No microphone input found. Please verify your audio hardware.");
          setTimeout(() => setVoiceNotice(null), 4000);
          return;
        }
        // Non-fatal transient events ('no-speech', 'aborted', 'network') are normal when user pauses or stops
      };

      recognition.onend = () => {
        // Commit text from this session
        if (sessionFinalRef.current) {
          accumulatedTranscriptRef.current += sessionFinalRef.current;
          sessionFinalRef.current = '';
        }
        // CRITICAL: If user still intends to record, seamlessly spin up a FRESH SpeechRecognition session
        // This ensures the AI assistant never automatically stops listening when user pauses or thinks!
        if (isRecordingIntentRef.current) {
          if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecordingIntentRef.current) {
              launchNativeSpeechRecognition();
            }
          }, 80);
          return;
        }
        setIsRecording(false);
        const finalSpoken = (accumulatedTranscriptRef.current || sessionInterimRef.current).trim();
        if (finalSpoken) {
          setTextInput(finalSpoken);
          setLiveTranscript(finalSpoken);
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (startErr) {
        // If already started or inactive, ignore gracefully
      }
      setIsRecording(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  const startRecording = async () => {
    stopSpeech(); // Immediately silence any playing TTS so it doesn't feed into the microphone
    setLiveTranscript('');
    setTextInput('');
    setVoiceNotice(null);
    isRecordingIntentRef.current = true;
    sessionFinalRef.current = '';
    sessionInterimRef.current = '';
    lastEnglishTranscriptRef.current = '';
    recordingStartTimeRef.current = Date.now();
    accumulatedTranscriptRef.current = '';

    // Warm up microphone hardware & setup real-time audio volume visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const sampleAudioLevel = () => {
            if (!isRecordingIntentRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
            requestAnimationFrame(sampleAudioLevel);
          };
          requestAnimationFrame(sampleAudioLevel);
        }
      } catch (audioErr) {
        console.warn("AudioContext visualizer setup non-critical notice:", audioErr);
      }
    } catch (err) {
      console.warn("Could not acquire mediaDevices audio stream:", err);
    }

    // 1. Start MediaRecorder on the microphone stream to capture audio chunks reliably
    let stream = micStreamRef.current;
    if (!stream || !stream.active) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      } catch (err) {
        console.error("Microphone access error:", err);
      }
    }

    if (stream) {
      try {
        let preferredMime = 'audio/webm';
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            preferredMime = 'audio/webm;codecs=opus';
          } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
            preferredMime = 'audio/mp4';
          } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
            preferredMime = 'audio/ogg';
          }
        }
        const mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMime });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          // If native speech recognition already transcribed words, we keep them.
          // BUT if native recognition was silent or blocked in iframe, transcribe with AI STT!
          const currentWords = (accumulatedTranscriptRef.current || sessionFinalRef.current || liveTranscript || textInput).trim();
          const recordedDurationMs = Date.now() - recordingStartTimeRef.current;
          if (!currentWords && audioChunksRef.current.length > 0 && recordedDurationMs >= 500) {
            const audioBlob = new Blob(audioChunksRef.current, { type: preferredMime });
            await processAudio(audioBlob);
          }
        };

        mediaRecorder.start(200);
        setIsRecording(true);
      } catch (recErr) {
        console.warn("MediaRecorder start notice:", recErr);
      }
    }

    // 2. Concurrently start native SpeechRecognition for instant, real-time live typing
    launchNativeSpeechRecognition();
    setIsRecording(true);
  };

  const stopRecording = () => {
    isRecordingIntentRef.current = false;
    setIsRecording(false);
    setAudioVolumeLevel(0);

    if (sessionFinalRef.current) {
      accumulatedTranscriptRef.current += sessionFinalRef.current;
    }
    if (sessionInterimRef.current && !accumulatedTranscriptRef.current.includes(sessionInterimRef.current)) {
      accumulatedTranscriptRef.current += sessionInterimRef.current + ' ';
    }

    const finalSpoken = (accumulatedTranscriptRef.current || sessionFinalRef.current || liveTranscript).trim();
    if (finalSpoken) {
      setTextInput(finalSpoken);
      setLiveTranscript(finalSpoken);
    }

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        if (typeof recognitionRef.current.stop === 'function') {
          recognitionRef.current.stop();
        } else {
          recognitionRef.current.abort();
        }
      } catch(e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.requestData();
        }
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch(e) {}
    }
    // Clean up tracks after onstop has captured final chunks
    setTimeout(() => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
        micStreamRef.current = null;
      }
    }, 500);
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch(e) {}
      audioContextRef.current = null;
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64AudioMessage = (reader.result as string).split(',')[1];
          const res = await fetch('/api/bhashini/asr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64AudioMessage,
              language: currentFullLanguage,
              mimeType: audioBlob.type || 'audio/webm'
            })
          });

          if (res.ok) {
            const data = await res.json();
            const verbatim = (data.transcript || data.english || '').trim();
            const translatedEnglish = (data.english || data.transcript || '').trim();
            if (verbatim) {
              setTextInput(verbatim);
              setLiveTranscript(verbatim);
              accumulatedTranscriptRef.current = verbatim;
              lastEnglishTranscriptRef.current = translatedEnglish;
            } else {
              const currentExisting = (accumulatedTranscriptRef.current || textInput || liveTranscript).trim();
              const recordedDurationMs = Date.now() - recordingStartTimeRef.current;
              // Only alert if no words exist in input and recording was deliberate (> 1500ms)
              if (!currentExisting && recordedDurationMs > 1500) {
                setVoiceNotice(t('noSpeechDetected') || "No voice detected. Please speak clearly.");
                setTimeout(() => setVoiceNotice(null), 3500);
              }
            }
          }
        } catch (fetchErr) {
          console.warn("Transcription non-critical notice:", fetchErr);
        } finally {
          setIsTranscribing(false);
        }
      };
    } catch (error) {
      console.error("Transcription error:", error);
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
    if (textInput.trim()) {
      const eng = lastEnglishTranscriptRef.current || textInput.trim();
      handleUserMessage(textInput.trim(), eng);
      setTextInput('');
      lastEnglishTranscriptRef.current = '';
    }
  };

  const handleUserMessage = async (text: string, englishText?: string) => {
    const hurryOrStopPhrases = [
      "no more question", "no more questions", "don't ask", "dont ask", 
      "stop asking", "stop questions", "stop questioning", "in a hurry", 
      "hurry", "rush", "leave now", "got to go", "have to go", "don't want any more", 
      "dont want any more", "enough questions", "no more", "stop", "finish now",
      "that's all", "thats all", "that is all", "wrap up", "done with questions",
      "no further questions", "don't ask me", "dont ask me", "leave it",
      "i am in a hurry", "i'm in a hurry", "i am busy", "in a rush"
    ];
    const isStop = hurryOrStopPhrases.some(phrase => text.toLowerCase().includes(phrase));
    if (isStop) {
      setStopRequested(true);
    }

    const newMessages = [...messages, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9), role: 'user' as const, text, englishText }];
    setMessages(newMessages);
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat/next-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, ayushMode, language: currentFullLanguage, patientProfile: onboardingData })
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9), role: 'assistant', text: data.reply, englishText: data.englishReply }]);
        if (data.reply) {
          speakMessage(data.reply);
        }
        if (data.isStopRequested || data.completed) {
          setStopRequested(true);
        }
      } else {
        const userCount = newMessages.filter(m => m.role === 'user').length;
        let fallbackText = "Thank you. Could you share how long you have experienced these symptoms and if you are currently taking any regular medications?";
        if (currentFullLanguage === 'Hindi') {
          fallbackText = userCount >= 3 
            ? "धन्यवाद। हमने आपके लक्षणों को रिकॉर्ड कर लिया है। आप रिपोर्ट की समीक्षा करने के लिए 'समाप्त करें और रिपोर्ट बनाएं' पर टैप कर सकते हैं।" 
            : "धन्यवाद। कृपया बताएं कि आप इन लक्षणों का अनुभव कब से कर रहे हैं और क्या आप कोई दवा ले रहे हैं?";
        } else if (currentFullLanguage === 'Bengali') {
          fallbackText = userCount >= 3
            ? "ধন্যবাদ। আমরা আপনার লক্ষণগুলি রেকর্ড করেছি। আপনি এখন পর্যালোচনা করতে 'শেষ করুন এবং রিপোর্ট তৈরি করুন'-এ ট্যাপ করতে পারেন।"
            : "ধন্যবাদ। আপনি কতদিন ধরে এই লক্ষণগুলি অনুভব করছেন এবং আপনি কোনো ওষুধ খাচ্ছেন কিনা অনুগ্রহ করে জানান।";
        } else if (userCount >= 3) {
          fallbackText = "Thank you. We have recorded your symptoms. You can tap Finish and Generate Report to review and submit to your doctor.";
        }
        setMessages(prev => [...prev, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9), role: 'assistant', text: fallbackText, englishText: fallbackText }]);
      }
    } catch (e) {
      console.warn("AI chat fetch error:", e);
      const userCount = newMessages.filter(m => m.role === 'user').length;
      let fallbackText = "Thank you. Could you share how long you have experienced these symptoms and if you are currently taking any regular medications?";
      if (currentFullLanguage === 'Hindi') {
        fallbackText = userCount >= 3 
          ? "धन्यवाद। हमने आपके लक्षणों को रिकॉर्ड कर लिया है। आप रिपोर्ट की समीक्षा करने के लिए 'समाप्त करें और रिपोर्ट बनाएं' पर टैप कर सकते हैं।" 
          : "धन्यवाद। कृपया बताएं कि आप इन लक्षणों का अनुभव कब से कर रहे हैं और क्या आप कोई दवा ले रहे हैं?";
      } else if (currentFullLanguage === 'Bengali') {
        fallbackText = userCount >= 3
          ? "ধন্যবাদ। আমরা আপনার লক্ষণগুলি রেকর্ড করেছি। আপনি এখন পর্যালোচনা করতে 'শেষ করুন এবং রিপোর্ট তৈরি করুন'-এ ট্যাপ করতে পারেন।"
          : "ধন্যবাদ। আপনি কতদিন ধরে এই লক্ষণগুলি অনুভব করছেন এবং আপনি কোনো ওষুধ খাচ্ছেন কিনা অনুগ্রহ করে জানান।";
      } else if (userCount >= 3) {
        fallbackText = "Thank you. We have recorded your symptoms. You can tap Finish and Generate Report to review and submit to your doctor.";
      }
      setMessages(prev => [...prev, { id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9), role: 'assistant', text: fallbackText, englishText: fallbackText }]);
    }
    setIsThinking(false);
  };

  const handleOpenConfirmation = () => {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return alert("Not logged in");
    
    if (ayushMode) {
      if (Object.keys(ayushAssessmentData).length < 10) {
        alert("Please complete all 10 questions in the Dashavidha Pariksha assessment before reviewing.");
        return;
      }
    }
    
    let activeMessages = messages;
    if (textInput.trim()) {
      const pendingText = textInput.trim();
      const newMsg = { id: 'msg-' + Date.now(), role: 'user' as const, text: pendingText, englishText: pendingText };
      activeMessages = [...messages, newMsg];
      setMessages(activeMessages);
      setTextInput('');
    }

    const hasUserContent = activeMessages.some(m => m.role === 'user') || documents.length > 0;
    if (!hasUserContent) {
      alert("Please describe your symptoms or reason for visit before reviewing.");
      return;
    }

    setIsReviewingConfirmation(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeFinalSubmission = async (appointmentDate?: string, appointmentSlot?: string) => {
    const patientId = localStorage.getItem('patientId');
    if (!patientId) return alert("Not logged in");

    setLoading(true);
    const chatHistory = messages.filter(m => m.role === 'user').map(m => m.text).join('\n\n');
    
    try {
      let formattedAyushData = ayushAssessmentData;
      if (ayushMode) {
        formattedAyushData = Object.entries(ayushAssessmentData).reduce((acc: any, [qId, optId]) => {
          const q = questions.find((q: any) => q.id === qId);
          if (q) {
            const opt = q.options.find((o: any) => o.id === optId);
            if (opt) {
              acc[q.textEn] = opt.en;
            }
          }
          return acc;
        }, {});
      }

      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientId, 
          chatHistory, 
          ayushMode, 
          ayushAssessmentData: formattedAyushData, 
          documents, 
          patientProfile: onboardingData,
          appointmentDate,
          appointmentSlot 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedReport(data);
        setIsBookingAppointment(false);
        setIsReviewingConfirmation(false);
        setReportReady(true);
      } else {
        let err;
        try { err = await res.json(); } catch(e) { err = { error: "Database error." }; }
        alert('Error: ' + err.error);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to submit');
    }
    setLoading(false);
  };

  if (view === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (view === 'profile-setup') {
    return (
      <PatientProfileSetup 
        patientId={localStorage.getItem("patientId") || ""} 
        initialData={patientProfile} 
        onComplete={(data) => {
          setPatientProfile((prev: any) => ({ ...prev, ...data, gender: data.sex }));
          setView('home');
        }} 
      />
    );
  }

  if (view === 'home') {
    return (
      <PatientHome 
        onStartIntake={() => setView('intake')}
        onOpenHospitals={() => setView('hospitals')}
        onOpenAmbulance={() => {
          setSelectedHospitalForAmbulance(null);
          setView('ambulance');
        }}
      />
    );
  }

  if (view === 'hospitals') {
    return (
      <HospitalsNearMe 
        onBack={() => setView('home')}
        onSelectForAmbulance={(hosp) => {
          setSelectedHospitalForAmbulance(hosp);
          setView('ambulance');
        }}
      />
    );
  }

  if (view === 'ambulance') {
    return (
      <EmergencyAmbulance 
        onBack={() => setView('home')}
        destinationHospital={selectedHospitalForAmbulance}
      />
    );
  }

  if (!onboardingData) {
    return (
      <PatientOnboarding 
        onComplete={(data) => setOnboardingData({ ...patientProfile, ...data })} 
        onBackToDashboard={() => setView('home')}
      />
    );
  }

  // APPOINTMENT BOOKING SCREEN
  if (isBookingAppointment) {
    return (
      <>
        {loading && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 flex flex-col items-center"
            >
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/40"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">Confirming Clinical Appointment...</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                Securing your consultation slot with the hospital queue and synchronizing your pre-intake records...
              </p>
              <div className="w-full space-y-2.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-left">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Vitals &amp; symptom transcript verified</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0"></div>
                  <span>Registering hospital appointment slot...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        <AppointmentBooking
          doctorName={onboardingData.doctor}
          hospitalName={onboardingData.hospital}
          submitting={loading}
          onBack={() => setIsBookingAppointment(false)}
          onConfirm={(date, slot) => executeFinalSubmission(date, slot)}
        />
      </>
    );
  }

  // CONFIRMATION REVIEW PAGE BEFORE FINAL SUBMISSION
  if (isReviewingConfirmation) {
    return (
      <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors">
        {loading && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 flex flex-col items-center"
            >
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/40"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-2">Generating Clinical Report...</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                Synthesizing symptoms, clinical vitals, triage risk metrics, and Dashavidha Pariksha records...
              </p>
              <div className="w-full space-y-2.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-left">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Vitals &amp; symptom transcript verified</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0"></div>
                  <span>Compiling physician assessment summary...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        <div className="min-h-full w-full flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 py-6 sm:py-10">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden my-0 sm:my-2 shrink-0">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider mb-2">
              <CheckCircle className="w-3.5 h-3.5" /> {t('stepPreSubmissionReview')}
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight">{t('reviewIntakeTitle')}</h2>
              <TTSButton 
                text={`${t('reviewIntakeTitle')}. ${t('patientFullName')}: ${onboardingData?.name || 'Patient'}, ${t('bloodPressure')}: ${onboardingData?.bloodPressure || onboardingData?.bp || t('notRecorded')}, ${t('spo2Oxygen')}: ${onboardingData?.oxygenLevel || onboardingData?.spo2 || t('notRecorded')}, ${t('pulseRate')}: ${onboardingData?.pulseRate || onboardingData?.pulse || t('notRecorded')}.`} 
                size="sm" 
                label={t('readScreen')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              />
            </div>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              {t('reviewIntakeSubtitle')}
            </p>
          </div>

          <div className="p-6 space-y-6 text-left">
            {/* Personal Demographics */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('patientDemographics')}
                </h4>
                <TTSButton 
                  text={`${t('patientDemographics')}: ${onboardingData?.name || 'Patient'}, ${onboardingData?.age ? `${onboardingData.age} ${t('yearsOld')}` : ''}, ${onboardingData?.bloodGroup || ''}.`} 
                  size="sm" 
                />
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] uppercase font-bold tracking-wider">{t('patientFullName')}</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base block">{onboardingData?.name || 'Patient'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] uppercase font-bold tracking-wider">{t('ageGender')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">
                      {onboardingData?.age ? `${onboardingData.age} ${t('yearsOld')}` : 'N/A'} • {onboardingData?.gender || onboardingData?.sex || 'N/A'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowReviewSexModal(true)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                    >
                      (Edit)
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] uppercase font-bold tracking-wider">{t('bloodGroup')}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewBgModal(true)}
                      className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-extrabold text-xs hover:border-rose-400 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{onboardingData?.bloodGroup || t('chooseBloodGroupPrompt')}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] uppercase font-bold tracking-wider">{t('heightWeight')}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">{onboardingData?.height ? `${onboardingData.height} cm` : 'N/A'} • {onboardingData?.weight ? `${onboardingData.weight} kg` : 'N/A'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] uppercase font-bold tracking-wider">{t('hospitalDoctor')}</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block leading-relaxed">{onboardingData?.hospital || 'General Hospital'} • {onboardingData?.doctor || 'Attending Physician'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px] uppercase font-bold tracking-wider">{t('abhaIdDigitalHealth')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs block break-all">{onboardingData?.abhaId || 'ABHA-VERIFIED-LINKED'}</span>
                </div>
              </div>
            </div>

            {/* Vital Signs (Editable if patient wants to adjust) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('recordedVitals')}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">{t('adjustVitalsHint')}</span>
                  <TTSButton 
                    text={`${t('recordedVitals')}: ${t('bloodPressure')}: ${onboardingData?.bloodPressure || onboardingData?.bp || t('notRecorded')}, ${t('spo2Oxygen')}: ${onboardingData?.oxygenLevel || onboardingData?.spo2 || t('notRecorded')}, ${t('pulseRate')}: ${onboardingData?.pulseRate || onboardingData?.pulse || t('notRecorded')}.`} 
                    size="sm" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">{t('bloodPressure')}</span>
                  <input
                    type="text"
                    value={onboardingData?.bloodPressure || onboardingData?.bp || ''}
                    placeholder={t('notRecorded')}
                    onChange={(e) => setOnboardingData({ ...onboardingData, bloodPressure: e.target.value, bp: e.target.value })}
                    className="w-full font-mono font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">mmHg</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">{t('spo2Oxygen')}</span>
                  <input
                    type="text"
                    value={onboardingData?.oxygenLevel || onboardingData?.spo2 || ''}
                    placeholder={t('notRecorded')}
                    onChange={(e) => setOnboardingData({ ...onboardingData, oxygenLevel: e.target.value, spo2: e.target.value })}
                    className="w-full font-mono font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">%</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">{t('pulseRate')}</span>
                  <input
                    type="text"
                    value={onboardingData?.pulseRate || onboardingData?.pulse || ''}
                    placeholder={t('notRecorded')}
                    onChange={(e) => setOnboardingData({ ...onboardingData, pulseRate: e.target.value, pulse: e.target.value })}
                    className="w-full font-mono font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">bpm</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">{t('bodyTemperature')}</span>
                  <input
                    type="text"
                    value={onboardingData?.temperature || ''}
                    placeholder={t('notRecorded')}
                    onChange={(e) => setOnboardingData({ ...onboardingData, temperature: e.target.value })}
                    className="w-full font-mono font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">°F</span>
                </div>
              </div>
            </div>

            {/* Symptoms & Dialogue Summary */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t('chiefComplaintReportedSymptoms')}
                </h4>
                <TTSButton 
                  text={`Symptoms: ${messages.filter(m => m.role === 'user').map((m, i) => `Note ${i + 1}: ${m.text}`).join('. ')}`} 
                  size="sm" 
                  label={t('readScreen')}
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 max-h-48 overflow-y-auto space-y-2">
                {messages.filter(m => m.role === 'user').map((m, idx) => (
                  <div key={idx} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-blue-600 dark:text-blue-400">#{idx + 1}:</span>
                      <TTSButton text={m.text} size="sm" />
                    </div>
                    <p className="text-slate-800 dark:text-slate-200">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Documents */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                {t('uploadedPrescriptionsReports')} ({documents.length})
              </h4>
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">{t('noDocumentsAttached')}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate max-w-[180px]">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AYUSH Dashavidha Pariksha */}
            {ayushMode && (
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  5. Dashavidha Pariksha
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completed {Object.keys(ayushAssessmentData).length} of 10 holistic diagnostic dimensions.
                </p>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsReviewingConfirmation(false)}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('backToDialogue')}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBookingAppointment(true)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>{t('submitToDoctorQueue')}</span>
                </>
              )}
            </button>
          </div>

        </div>
        </div>

        {/* Blood Group Modal in Review Intake */}
        <AnimatePresence>
          {showReviewBgModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {t('selectBloodGroup')}
                  </h3>
                  <button onClick={() => setShowReviewBgModal(false)} className="p-1 rounded text-slate-400 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => {
                          setOnboardingData({ ...onboardingData, bloodGroup: bg });
                          setShowReviewBgModal(false);
                        }}
                        className={`p-3 rounded-xl font-bold border text-center transition cursor-pointer ${
                          onboardingData?.bloodGroup === bg 
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500 ring-2 ring-rose-500' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCustomReviewBg(customReviewBg || 'Others')}
                      className={`p-3 rounded-xl font-bold border text-center transition cursor-pointer ${
                        onboardingData?.bloodGroup === 'Others' || customReviewBg
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500 ring-2 ring-amber-500' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      {t('others')}
                    </button>
                  </div>
                  {customReviewBg !== '' && (
                    <div className="space-y-1.5 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                      <label className="text-xs font-bold text-amber-900 dark:text-amber-300">{t('specifyCustomBloodGroup')}</label>
                      <input
                        type="text"
                        value={customReviewBg}
                        onChange={(e) => {
                          setCustomReviewBg(e.target.value);
                          setOnboardingData({ ...onboardingData, bloodGroup: e.target.value });
                        }}
                        placeholder="e.g. Bombay Blood Group, Rh-null"
                        className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-semibold text-slate-900 dark:text-white"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50">
                  <button
                    onClick={() => setShowReviewBgModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {t('confirmSelection')}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Biological Sex Modal in Review Intake */}
        <AnimatePresence>
          {showReviewSexModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {t('biologicalSex')}
                  </h3>
                  <button onClick={() => setShowReviewSexModal(false)} className="p-1 rounded text-slate-400 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2.5">
                    {['Male', 'Female', 'Intersex'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setOnboardingData({ ...onboardingData, gender: s, sex: s });
                          setShowReviewSexModal(false);
                        }}
                        className={`p-3 rounded-xl font-bold border text-center transition cursor-pointer ${
                          onboardingData?.gender === s || onboardingData?.sex === s
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-600 ring-2 ring-blue-500' 
                            : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                        }`}
                      >
                        {t(s.toLowerCase()) || s}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCustomReviewSex(customReviewSex || 'Others')}
                      className={`p-3 rounded-xl font-bold border text-center transition cursor-pointer ${
                        customReviewSex ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-600 ring-2 ring-amber-500' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t('others')}
                    </button>
                  </div>
                  {customReviewSex !== '' && (
                    <div className="space-y-1.5 p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                      <label className="text-xs font-bold text-amber-900 dark:text-amber-300">{t('specifyCustomSex')}</label>
                      <input
                        type="text"
                        value={customReviewSex}
                        onChange={(e) => {
                          setCustomReviewSex(e.target.value);
                          setOnboardingData({ ...onboardingData, gender: e.target.value, sex: e.target.value });
                        }}
                        placeholder="e.g. Non-binary, Transgender"
                        className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg border border-amber-300 dark:border-amber-700 text-xs font-semibold text-slate-900 dark:text-white"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50">
                  <button
                    onClick={() => setShowReviewSexModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
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

  if (reportReady) {
    return (
      <div className="flex-1 min-h-0 h-full w-full overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 relative transition-colors print:overflow-visible print:p-0 print:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 dark:from-blue-900/30 via-slate-50 dark:via-slate-900 to-slate-50 dark:to-slate-900 print:hidden pointer-events-none"></div>
        
        <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8 print:hidden">
          <button 
            id="report-settings-btn"
            onClick={() => setShowSettingsDrawer(true)} 
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-orange-500" />
          </button>
        </div>

        <div className="min-h-full w-full flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 py-6 sm:py-10 print:p-0 print:block">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
            className="bg-white dark:bg-slate-950 p-6 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-blue-900/10 border border-slate-100 dark:border-slate-800 max-w-md w-full text-center z-10 my-0 sm:my-2 shrink-0 print:bg-transparent print:border-none print:shadow-none print:p-0 print:max-w-none"
          >
          <div className="print:hidden">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3, duration: 0.8 }}
            className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">{t('reportGenerated')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed text-lg">{t('reportSentDesc')}</p>
          
          {/* Doctor Immediate Appointment Time Slot Notification Banner */}
          {generatedReport?.appointment && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-500 dark:border-emerald-600 rounded-2xl mb-6 text-left shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Clock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                      Immediate Priority Appointment Assigned
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    Your Time Slot: <span className="font-mono text-emerald-600 dark:text-emerald-400">{generatedReport.appointment.slot}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {generatedReport.appointment.notes || "The attending doctor has assigned an immediate appointment time slot for your consultation."}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="inline-block px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm uppercase tracking-wider">
                  Priority Active
                </span>
              </div>
            </motion.div>
          )}

          {generatedReport && (generatedReport.allopathyDiagnosis || generatedReport.ayushDiagnosis) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl mb-6 text-left border border-blue-100 dark:border-blue-800/50 shadow-inner"
            >
              <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Doctor's Diagnosis
              </h3>
              {generatedReport.allopathyDiagnosis && (
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Diagnosis:</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{generatedReport.allopathyDiagnosis}</p>
                </div>
              )}
              {generatedReport.allopathySuggestions && (
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Prescription/Plan:</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{generatedReport.allopathySuggestions}</p>
                </div>
              )}
              {generatedReport.ayushDiagnosis && (
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Dashavidha Pariksha Diagnosis:</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{generatedReport.ayushDiagnosis}</p>
                </div>
              )}
              {generatedReport.ayushSuggestions && (
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Dashavidha Pariksha Plan:</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{generatedReport.ayushSuggestions}</p>
                </div>
              )}
              {generatedReport.dietaryLifestyleOrders && (
                <div className="mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Dietary & Lifestyle Orders:</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{generatedReport.dietaryLifestyleOrders}</p>
                </div>
              )}
              {generatedReport.followUpDate && (
                <div className="mb-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400 mb-1">Follow-Up Reminder</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-500">
                      Your doctor has requested a follow-up appointment on <strong>{new Date(generatedReport.followUpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>. Please ensure you schedule this with the clinic.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {/* Quick Intake Summary Preview */}
          {generatedReport?.summary && (
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl mb-6 text-left border border-slate-200/80 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-2">
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Recorded Intake Summary</span>
                <span className="text-[11px] font-normal text-slate-500">ID: #{generatedReport.id?.slice(0,6).toUpperCase()}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                <strong className="font-semibold text-slate-900 dark:text-slate-100">Chief Complaint:</strong> {generatedReport.summary.chiefComplaint || 'Consultation intake recorded.'}
              </p>
              {onboardingData?.name && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>Patient: <strong>{onboardingData.name}</strong></span>
                  {onboardingData.age && <span>Age: {onboardingData.age}</span>}
                  {onboardingData.bloodGroup && <span>Blood: {onboardingData.bloodGroup}</span>}
                </div>
              )}
            </div>
          )}

          {/* Doctor Uploaded Digital Prescription */}
          {(generatedReport?.doctorPrescriptionUrl || generatedReport?.prescriptionFile) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-to-r from-teal-500/15 to-emerald-500/15 border-2 border-teal-500 dark:border-teal-600 rounded-2xl mb-6 text-left shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-normal text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md">
                    Doctor Signed Prescription Available
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    An official prescription has been uploaded by your doctor. Dispatched via SMS & Email.
                  </p>
                </div>
              </div>
              <a
                href={generatedReport.doctorPrescriptionUrl || generatedReport.prescriptionFile}
                target="_blank"
                rel="noopener noreferrer"
                download="Doctor_Prescription.pdf"
                className="shrink-0 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition cursor-pointer tracking-normal"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="tracking-normal">Download Prescription</span>
              </a>
            </motion.div>
          )}
          </div>
          
          <div className="flex flex-col gap-3 print:hidden">
            <button 
              id="download-patient-report-pdf-btn"
              onClick={handleDownloadPDF}
              disabled={isDownloadingPdf}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating Patient PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download Patient Report (PDF)</span>
                </>
              )}
            </button>

            <button 
              id="download-chat-history-pdf-btn"
              onClick={handleDownloadChatPDF}
              disabled={isDownloadingChatPdf}
              className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow active:scale-[0.98] transition-all disabled:opacity-75 cursor-pointer"
            >
              {isDownloadingChatPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Chat PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-blue-400" />
                  <span>Download AI Chat History (PDF)</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                id="print-patient-report-pdf-btn"
                onClick={handlePrintOrViewPDF}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
                title="Print or view report preview"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Preview</span>
              </button>

              <button 
                id="new-patient-session-btn"
                onClick={() => { 
                  setReportReady(false); 
                  setOnboardingData(null); 
                  setMessages([{ id: 'msg-init-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9), role: 'assistant', text: getInitialMessage()}]); 
                  setDocuments([]); 
                }}
                className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                <span>New Intake Session</span>
              </button>
            </div>

            {/* Return to Dashboard & Logout options */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                id="back-to-dashboard-btn"
                onClick={() => { 
                  setReportReady(false); 
                  setOnboardingData(null); 
                  setView('home');
                }}
                className="flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-xl border border-blue-200 dark:border-blue-900/50 transition-all cursor-pointer active:scale-98"
                title="Return to Patient Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>

              <button 
                id="patient-report-logout-btn"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 py-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900/50 transition-all cursor-pointer active:scale-98"
                title="Log Out of your account"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Printable Area - styled for paper printing */}
        <div id="patient-report-hidden" className="hidden print:block absolute inset-0 bg-white p-8 w-full z-50 text-black overflow-visible min-h-screen">
          <div className="max-w-4xl mx-auto font-sans" id="patient-report-content">
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-black tracking-tight">HEALTHPOINT CLINICAL HEALTH RECORD</h1>
                <p className="text-sm text-gray-600">Official Patient Summary, Intake History & Care Documentation</p>
              </div>
              <div className="text-right text-xs text-gray-600">
                <p><strong>Record ID:</strong> #{(generatedReport?.id || "REC").slice(0, 8).toUpperCase()}</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Demographics & Vitals */}
            {onboardingData && (
              <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50">
                <h2 className="text-sm font-bold uppercase text-gray-700 mb-2">Patient Demographics & Vitals</h2>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div><strong>Name:</strong> {onboardingData.name || 'Patient'}</div>
                  <div><strong>Age/Sex:</strong> {onboardingData.age || 'N/A'} / {onboardingData.gender || 'N/A'}</div>
                  <div><strong>Phone:</strong> {onboardingData.phone || 'N/A'}</div>
                  <div><strong>Blood Group:</strong> {onboardingData.bloodGroup || 'N/A'}</div>
                  <div><strong>Height / Weight:</strong> {onboardingData.height ? `${onboardingData.height} cm` : 'N/A'} / {onboardingData.weight ? `${onboardingData.weight} kg` : 'N/A'}</div>
                  <div><strong>BP:</strong> {onboardingData.bloodPressure || onboardingData.bp || 'Not recorded'}</div>
                  <div><strong>Pulse:</strong> {onboardingData.pulseRate || onboardingData.pulse ? `${onboardingData.pulseRate || onboardingData.pulse} bpm` : 'Not recorded'}</div>
                  <div><strong>SpO2:</strong> {onboardingData.oxygenLevel || onboardingData.spo2 ? `${onboardingData.oxygenLevel || onboardingData.spo2}%` : 'Not recorded'}</div>
                  <div><strong>Temp:</strong> {onboardingData.temperature ? `${onboardingData.temperature} °F` : 'Not recorded'}</div>
                </div>
              </div>
            )}
            
            {generatedReport && (generatedReport.allopathyDiagnosis || generatedReport.ayushDiagnosis) && (
              <div className="mb-6 border border-gray-300 rounded p-4">
                <h2 className="text-sm font-bold uppercase text-blue-900 mb-3 border-b pb-1">Doctor's Diagnosis & Plan</h2>
                <div className="space-y-3 text-sm">
                  {generatedReport.allopathyDiagnosis && (
                    <div><span className="font-bold">Diagnosis (Allopathy):</span> <p className="mt-0.5">{generatedReport.allopathyDiagnosis}</p></div>
                  )}
                  {generatedReport.allopathySuggestions && (
                    <div><span className="font-bold">Prescription & Plan:</span> <p className="mt-0.5">{generatedReport.allopathySuggestions}</p></div>
                  )}
                  {generatedReport.ayushDiagnosis && (
                    <div className="pt-2 border-t border-gray-200"><span className="font-bold">AYUSH Diagnosis:</span> <p className="mt-0.5">{generatedReport.ayushDiagnosis}</p></div>
                  )}
                  {generatedReport.ayushSuggestions && (
                    <div><span className="font-bold">AYUSH Plan:</span> <p className="mt-0.5">{generatedReport.ayushSuggestions}</p></div>
                  )}
                  {generatedReport.dietaryLifestyleOrders && (
                    <div className="pt-2 border-t border-gray-200"><span className="font-bold">Dietary & Lifestyle Orders:</span> <p className="mt-0.5">{generatedReport.dietaryLifestyleOrders}</p></div>
                  )}
                  {generatedReport.followUpDate && (
                    <div className="mt-2 bg-yellow-50 p-2 border border-yellow-200 rounded"><span className="font-bold">Scheduled Follow-up:</span> {new Date(generatedReport.followUpDate).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            )}
            
            {generatedReport && generatedReport.summary && (
              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase text-gray-800 border-b pb-1 mb-3">Clinical History Summary</h2>
                <div className="space-y-2 text-sm">
                  {generatedReport.summary.chiefComplaint && (
                    <div className="p-2 bg-gray-50 border rounded"><span className="font-bold">Chief Complaint:</span> <p className="mt-0.5">{generatedReport.summary.chiefComplaint}</p></div>
                  )}
                  {generatedReport.summary.historyOfPresentIllness && (
                    <div><span className="font-bold">History of Present Illness:</span> <p className="mt-0.5">{generatedReport.summary.historyOfPresentIllness}</p></div>
                  )}
                  {generatedReport.summary.pastMedicalSurgicalHistory && (
                    <div><span className="font-bold">Past Medical History:</span> <p className="mt-0.5">{generatedReport.summary.pastMedicalSurgicalHistory}</p></div>
                  )}
                  {generatedReport.summary.drugAllergyHistory && (
                    <div><span className="font-bold text-red-700">Drug Allergies:</span> <p className="mt-0.5">{generatedReport.summary.drugAllergyHistory}</p></div>
                  )}
                  {generatedReport.summary.reviewOfSystems && (
                    <div><span className="font-bold">Review of Systems:</span> <p className="mt-0.5">{generatedReport.summary.reviewOfSystems}</p></div>
                  )}
                  {generatedReport.summary.priorInvestigationsSummary && (
                    <div><span className="font-bold">Prior Investigations:</span> <p className="mt-0.5">{generatedReport.summary.priorInvestigationsSummary}</p></div>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-300 page-break-before">
              <h2 className="text-sm font-bold uppercase text-gray-700 mb-3">Consultation Dialogue Record</h2>
              <div className="space-y-2 text-xs">
                {messages.filter(m => m.role === 'user').map((m, i) => (
                  <div key={i} className="p-2 border-b border-gray-100">
                    <p className="font-bold text-gray-700 mb-0.5">Patient Statement #{i + 1}</p>
                    <p className="text-gray-900">{m.englishText || m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-500">
              Generated by HealthPoint AI Clinical Intake System • For medical professional evaluation and patient personal health records.
            </div>
          </div>
        </div>
        </div>

        <SettingsDrawer
          isOpen={showSettingsDrawer}
          onClose={() => setShowSettingsDrawer(false)}
          userRole="patient"
          userName={patientProfile?.name || localStorage.getItem('patientName') || 'Registered Patient'}
          userId={localStorage.getItem('patientId') || undefined}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto bg-transparent relative transition-colors">

      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 flex flex-col items-center"
          >
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/40"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-black tracking-tight mb-2">Generating Clinical Report...</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
              Synthesizing clinical symptoms, vitals, risk metrics, and preparing doctor intake summary...
            </p>
            <div className="w-full space-y-2.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-left">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Transcript &amp; vitals verified</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0"></div>
                <span>Compiling clinical summary...</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-20 md:top-8 md:left-8">
        <RetractableBackButton onClick={() => setView('home')} label="Dashboard" id="intake-exit-btn" />
      </div>

      <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8">
        <button 
          id="intake-settings-btn"
          onClick={() => setShowSettingsDrawer(true)} 
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-full text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-105 active:scale-95"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-orange-500" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-20 md:py-16 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8 md:mt-0 mt-4 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('interactiveIntake')}</h1>
              <TTSButton text={`${t('interactiveIntake')}. ${t('chatWithHealthPoint') || t('chatWithMediSwift')}`} size="sm" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">{t('chatWithHealthPoint') || t('chatWithMediSwift')}</p>
          </div>
          
        </motion.div>
        
        <div className="space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[500px]"
          >
            <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t('mediKioskAssistant')}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('online')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={msg.id || `msg-${i}`}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1.5 px-1 flex items-center gap-2">
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                      <TTSButton 
                        text={msg.text} 
                        size="sm" 
                        label={msg.role === 'user' ? 'Read your response' : 'Read assistant message'} 
                      />
                    </span>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                    }`}>
                      <div>{renderTextWithBoldQuestions(msg.text)}</div>
                      {msg.englishText && msg.englishText.toLowerCase() !== msg.text.toLowerCase() && (
                        <div className={`mt-2 pt-2 border-t text-[11px] leading-relaxed opacity-90 ${msg.role === 'user' ? 'border-blue-500/50 text-blue-100' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          <span className="font-bold opacity-75 mr-1">En:</span> {renderTextWithBoldQuestions(msg.englishText)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isThinking && (
                  <motion.div key="thinking-indicator" 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
                <div ref={chatEndRef} />
            </div>

            {stopRequested && (
              <div className="mx-4 mt-3 mb-1 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('assistantPausedQuestions') || 'Assistant paused questions as requested. You can generate your clinical summary now.'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenConfirmation}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] uppercase tracking-wider shrink-0 shadow-sm cursor-pointer"
                >
                  {t('generateReport') || 'Generate Now'}
                </button>
              </div>
            )}

            {/* Voice Notice (e.g. no speech detected) */}
            {voiceNotice && (
              <div className="mx-4 mt-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold tracking-normal leading-normal flex items-center justify-between">
                <span className="tracking-normal leading-normal">{voiceNotice}</span>
                <button type="button" onClick={() => setVoiceNotice(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer ml-2">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <form onSubmit={handleTextSubmit} className="flex gap-2 items-center">
                {/* ADVANCED MULTI-RING ACOUSTIC MIC BUTTON */}
                <div className="relative">
                  {isRecording && (
                    <>
                      {/* Outer pulsing soundwave ripples */}
                      <span className="absolute -inset-2.5 rounded-2xl bg-red-500/20 animate-ping pointer-events-none"></span>
                      <span className="absolute -inset-1.5 rounded-2xl bg-rose-500/30 animate-pulse pointer-events-none"></span>
                    </>
                  )}
                  <button 
                    type="button"
                    onClick={toggleRecording}
                    disabled={isTranscribing}
                    className={`relative p-4 rounded-xl flex items-center justify-center transition-all cursor-pointer z-10 ${
                      isRecording 
                        ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-xl shadow-red-600/50 ring-4 ring-red-400/40 scale-105' 
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/50'
                    } disabled:opacity-50`}
                    title={isRecording ? "Stop recording voice" : "Speak your symptoms"}
                  >
                    {isTranscribing ? (
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : isRecording ? (
                      <Square className="w-5 h-5 fill-current relative z-10" />
                    ) : (
                      <Mic className="w-6 h-6 relative z-10" />
                    )}
                  </button>
                </div>

                {isRecording ? (
                  <div className="flex-1 flex items-center justify-between gap-2 sm:gap-3 bg-red-50/95 dark:bg-red-950/60 border-2 border-red-500/40 rounded-xl px-3 sm:px-4 h-14 overflow-hidden relative shadow-inner">
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                          {t('listening') || 'Listening'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* LIVE VERBATIM SOUND & TRANSCRIPT DISPLAY */}
                    <div className="flex-1 flex flex-col items-center justify-center min-w-0 px-2">
                      {liveTranscript.trim() ? (
                        <div className="w-full text-center truncate">
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                            "{liveTranscript.trim()}"
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 h-6 w-full max-w-[170px] sm:max-w-xs mx-auto">
                          {[16, 26, 12, 30, 20, 28, 14, 32, 18, 28, 12, 24, 16, 30, 14, 22].map((h, i) => {
                            const isSoundActive = audioVolumeLevel > 5;
                            const dynamicHeight = isSoundActive 
                              ? Math.min(24, Math.max(4, Math.round(h * Math.min(1.4, audioVolumeLevel / 25)))) 
                              : 3;
                            return (
                              <motion.div
                                key={i}
                                animate={{
                                  height: isSoundActive ? [dynamicHeight * 0.5, dynamicHeight, dynamicHeight * 0.7] : 3,
                                  opacity: isSoundActive ? [0.7, 1, 0.7] : 0.3
                                }}
                                transition={{
                                  duration: isSoundActive ? 0.25 + (i % 4) * 0.05 : 0.8,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className={`w-1 rounded-full transition-all ${
                                  isSoundActive 
                                    ? 'bg-gradient-to-t from-red-600 via-rose-500 to-amber-400' 
                                    : 'bg-slate-400 dark:bg-slate-600'
                                }`}
                              />
                            );
                          })}
                        </div>
                      )}
                      <span className="text-[9px] font-semibold text-red-600/90 dark:text-red-300/90 truncate hidden sm:inline">
                        {liveTranscript.trim() ? "Live Voice Captured" : audioVolumeLevel > 5 ? "Sound Detected • Capturing Voice" : "Ready • Speak your symptoms clearly"}
                      </span>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {(liveTranscript.trim() || textInput.trim()) && (
                        <button
                          type="button"
                          onClick={() => {
                            const msgToSend = (liveTranscript.trim() || textInput.trim() || accumulatedTranscriptRef.current).trim();
                            const engToSend = lastEnglishTranscriptRef.current || msgToSend;
                            stopRecording();
                            if (msgToSend) {
                              handleUserMessage(msgToSend, engToSend);
                              setTextInput('');
                              setLiveTranscript('');
                              lastEnglishTranscriptRef.current = '';
                            }
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-1"
                          title="Send spoken words immediately"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Send Voice</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={stopRecording}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm cursor-pointer"
                        title="Finish recording and review text"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                ) : isTranscribing ? (
                  <div className="flex-1 flex items-center gap-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl px-4 h-14 text-sm font-semibold text-blue-600 dark:text-blue-400">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing & transcribing voice input...</span>
                  </div>
                ) : (
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder={t('typeResponse') || "Type your response or click mic to speak..."}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white h-14 text-sm font-semibold"
                  />
                )}

                <button 
                  type="submit"
                  disabled={!textInput.trim() || isThinking}
                  className="p-4 bg-slate-900 dark:bg-blue-600 text-white rounded-xl hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <div className="mt-4 text-center max-w-xl mx-auto px-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Clinical Disclaimer: </span>
                  {t('aiDisclaimer') && t('aiDisclaimer') !== 'aiDisclaimer'
                    ? t('aiDisclaimer')
                    : "HealthPoint's intelligent intake assistant helps organize symptoms and vitals for your attending physician. It does not replace direct physician diagnosis or emergency medical care."}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="bg-white dark:bg-slate-950 p-8 rounded-3xl shadow-xl shadow-slate-200/40 dark:shadow-none border border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                <ScanLine className="w-6 h-6 text-blue-600" />
                Provide Prior Records
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{t('scanDesc')}</p>
              
              <input 
                type="file" 
                multiple 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                capture="environment"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-12 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 rounded-2xl flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-400/5 group-hover:translate-y-full transition-transform duration-1000 ease-linear"></div>
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-100 dark:border-slate-700">
                  <ScanLine className="w-8 h-8 text-blue-500" />
                </div>
                <span className="font-bold text-lg text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">{t('tapToScan')}</span>
              </button>

              <AnimatePresence>
                {documents.length > 0 && (
                  <motion.div key="docs-container" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid gap-2">
                    {documents.map((doc, idx) => (
                      <motion.div 
                        key={doc.id || `doc-${idx}`} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                      >
                        <div 
                          onClick={() => {
                            setPreviewZoom(1);
                            setPreviewDoc({
                              name: doc.name,
                              base64: doc.base64.startsWith('data:') ? doc.base64 : `data:${doc.mimeType};base64,${doc.base64}`,
                              mimeType: doc.mimeType
                            });
                          }}
                          className="flex items-center overflow-hidden gap-3 flex-1 min-w-0 cursor-pointer group"
                        >
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                            Preview
                          </span>
                        </div>
                        <button onClick={() => removeDocument(idx)} className="text-xs font-bold text-slate-400 hover:text-red-600 uppercase tracking-normal ml-4 transition-colors cursor-pointer">{t('remove')}</button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('ayushAssessment')}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('ayushDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" checked={ayushMode} onChange={() => setAyushMode(!ayushMode)} />
                <div className="w-14 h-7 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <AnimatePresence>
              {ayushMode && (
                <AyushDetailedAssessment 
                  data={ayushAssessmentData} 
                  onChange={setAyushAssessmentData} 
                  onComplete={() => alert('Detailed assessment complete! You can now generate the report.')} 
                />
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="pt-4 pb-12">
            <button 
              onClick={handleOpenConfirmation}
              disabled={loading || (messages.length <= 1 && documents.length === 0)}
              className={`w-full py-5 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg ${
                stopRequested 
                  ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-700 hover:to-emerald-700 shadow-amber-600/30 ring-4 ring-amber-400/40 animate-pulse'
                  : 'bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 shadow-slate-900/10 dark:shadow-blue-900/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>{t('generatingReport')}</span>
                </>
              ) : stopRequested ? (
                <span>⚡ Finished Questions: Generate Summary for Doctor</span>
              ) : (
                t('finishGenerate')
              )}
            </button>
          </motion.div>

        </div>
      </div>
      
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Are you sure?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                You are about to exit the patient portal. You will need to log in again to access your session.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-red-600/20"
                >
                  Yes, Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Document Preview Modal with Zoom In/Out */}
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
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 gap-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate flex-1">
                  {previewDoc.name}
                </h3>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(z => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-bold font-mono px-1.5 text-slate-700 dark:text-slate-200 min-w-[42px] text-center">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(z => Math.min(3.0, Math.round((z + 0.25) * 100) / 100))}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-auto my-4 flex flex-col justify-center min-h-[300px] bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                <div 
                  className="w-full flex items-center justify-center transition-transform duration-200 origin-center"
                  style={{ transform: `scale(${previewZoom})` }}
                >
                  {previewDoc.base64 && (previewDoc.base64.startsWith('data:image/') || previewDoc.mimeType?.includes('image')) ? (
                    <img src={previewDoc.base64} alt={previewDoc.name} className="max-h-[60vh] object-contain rounded-lg shadow-sm mx-auto select-none" />
                  ) : previewDoc.base64 && previewDoc.base64.startsWith('data:application/pdf') ? (
                    <iframe 
                      src={previewDoc.base64} 
                      title={previewDoc.name} 
                      className="w-full h-[60vh] rounded-lg border-0" 
                    />
                  ) : (
                    <div className="text-center p-8 text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-semibold">{previewDoc.name}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={previewDoc.base64}
                  download={previewDoc.name}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download Document
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-out Settings Drawer */}
      <SettingsDrawer
        isOpen={showSettingsDrawer}
        onClose={() => setShowSettingsDrawer(false)}
        userRole="patient"
        userName={patientProfile?.name || localStorage.getItem('patientName') || 'Registered Patient'}
        userId={localStorage.getItem('patientId') || undefined}
        onLogout={handleLogout}
      />
    </div>
  );
}
