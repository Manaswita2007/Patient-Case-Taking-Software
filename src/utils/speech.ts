// Accessible Speech Synthesis Utility for Visually Impaired Patients and Multilingual Audio
// Enterprise-Grade Speech Engine with Chromium Keep-Alive, Voice Preloading & Multi-Speaker Synchronization

let speechResumeInterval: any = null;
const activeUtterances = new Set<SpeechSynthesisUtterance>();

// Global Speech State Subscriber System
type SpeechListener = (activeSpeakerId: string | null, isSpeaking: boolean) => void;
const speechListeners = new Set<SpeechListener>();
let currentActiveSpeakerId: string | null = null;

export function subscribeToSpeech(listener: SpeechListener): () => void {
  speechListeners.add(listener);
  // Synchronize initial state immediately
  try {
    listener(currentActiveSpeakerId, isSpeaking());
  } catch (err) {
    console.warn("Speech listener sync error:", err);
  }
  return () => {
    speechListeners.delete(listener);
  };
}

function notifySpeechListeners(speakerId: string | null, speaking: boolean) {
  currentActiveSpeakerId = speaking ? speakerId : null;
  speechListeners.forEach((listener) => {
    try {
      listener(currentActiveSpeakerId, speaking);
    } catch (e) {
      console.warn("Speech listener notification error:", e);
    }
  });
}

// Global window reference to guard against V8 Garbage Collection bug
declare global {
  interface Window {
    __healthPointCurrentUtterance?: SpeechSynthesisUtterance | null;
  }
}

export const LANG_CODE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  kn: 'kn-IN',
  pa: 'pa-IN',
  ml: 'ml-IN',
  English: 'en-IN',
  Hindi: 'hi-IN',
  Bengali: 'bn-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
  Tamil: 'ta-IN',
  Gujarati: 'gu-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Punjabi: 'pa-IN',
  Urdu: 'ur-PK'
};

const LANG_FULL_NAME_MAP: Record<string, string> = {
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

// Cached Voices Management
let cachedVoices: SpeechSynthesisVoice[] = [];
let currentAudioElement: HTMLAudioElement | null = null;

export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve([]);
  }

  const current = window.speechSynthesis.getVoices();
  if (current && current.length > 0) {
    cachedVoices = current;
    return Promise.resolve(current);
  }

  return new Promise((resolve) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cachedVoices = window.speechSynthesis.getVoices() || [];
        resolve(cachedVoices);
      }
    }, 600);

    const onVoices = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        cachedVoices = window.speechSynthesis.getVoices() || [];
        resolve(cachedVoices);
      }
    };

    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = onVoices;
    }
  });
}

// Initialize voices eagerly if available
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getAvailableVoices();
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices() || [];
    };
  }
}

export function stopSpeech(): void {
  if (speechResumeInterval) {
    clearInterval(speechResumeInterval);
    speechResumeInterval = null;
  }
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch (e) {
      console.warn('Audio element stop error:', e);
    }
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Speech synthesis cancel error:', e);
    }
    activeUtterances.clear();
    if (typeof window !== 'undefined') {
      window.__healthPointCurrentUtterance = null;
    }
  }
  notifySpeechListeners(null, false);
}

export function isSpeaking(): boolean {
  if (currentAudioElement && !currentAudioElement.paused && !currentAudioElement.ended) {
    return true;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

// Check if string contains Indic script characters
function hasIndicScript(str: string): boolean {
  return /[\u0900-\u0D7F]/.test(str);
}

// Voice Finder Helper
function findBestVoice(targetLangCode: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const target = targetLangCode.toLowerCase().replace('_', '-');
  const primary = target.split('-')[0];

  // 1. Exact dialect match (e.g. hi-IN, bn-IN, en-IN)
  const exact = voices.find(v => v.lang.toLowerCase().replace('_', '-') === target);
  if (exact) return exact;

  // 2. Starts with primary language (e.g. hi, bn, ta)
  const primaryMatch = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(primary));
  if (primaryMatch) return primaryMatch;

  // 3. Indian English if English requested
  if (primary === 'en') {
    const indianEnglish = voices.find(v => 
      v.lang.toLowerCase().includes('en-in') || 
      v.name.toLowerCase().includes('india')
    );
    if (indianEnglish) return indianEnglish;

    const anyEnglish = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (anyEnglish) return anyEnglish;
  }

  // 4. Default system voice
  const defaultVoice = voices.find(v => v.default);
  if (defaultVoice) return defaultVoice;

  return voices[0] || null;
}

export interface SpeakOptions {
  speakerId?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export async function speakText(
  text: string,
  language = 'en',
  options?: SpeakOptions
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    options?.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  if (!text || !text.trim()) {
    options?.onEnd?.();
    return;
  }

  // Clean text of markdown artifacts, brackets, URLs, and excessive spaces
  let cleanText = text
    .replace(/[*#_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    options?.onEnd?.();
    return;
  }

  // Stop any previously playing speech
  stopSpeech();

  const targetLangCode = LANG_CODE_MAP[language] || 'en-IN';
  const targetFullName = LANG_FULL_NAME_MAP[language] || language;

  // If chosen language is not English, but text has no Indic script, translate it first
  if (language !== 'en' && targetFullName !== 'English' && !hasIndicScript(cleanText)) {
    try {
      const res = await fetch('/api/translate/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, targetLanguage: targetFullName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.translatedText && data.translatedText.trim()) {
          cleanText = data.translatedText.trim();
        }
      }
    } catch (e) {
      console.warn('TTS translation fetch error:', e);
    }
  }

  // Ensure voices are available
  const voices = cachedVoices.length > 0 ? cachedVoices : await getAvailableVoices();
  const selectedVoice = findBestVoice(targetLangCode, voices);

  const speakerId = options?.speakerId || `speaker-${Date.now()}`;

  // When another language is selected (e.g. Hindi, Bengali, etc.), use open-source audio TTS API
  const isNonEnglish = language !== 'en' && targetFullName !== 'English';
  if (isNonEnglish) {
    try {
      const shortLang = (targetLangCode.split('-')[0] || language).toLowerCase();
      const audioUrl = `/api/tts/speak?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(shortLang)}`;
      const audio = new Audio(audioUrl);
      currentAudioElement = audio;

      audio.onplay = () => {
        notifySpeechListeners(speakerId, true);
        options?.onStart?.();
      };

      audio.onended = () => {
        currentAudioElement = null;
        notifySpeechListeners(null, false);
        options?.onEnd?.();
      };

      audio.onerror = (e) => {
        console.warn('Open-source TTS stream error, falling back to Web Speech API:', e);
        currentAudioElement = null;
        playUtterance(cleanText, targetLangCode, selectedVoice);
      };

      await audio.play();
      return;
    } catch (streamErr) {
      console.warn('Audio play invocation error:', streamErr);
      currentAudioElement = null;
      // Fallback to Web Speech API below
    }
  }

  const playUtterance = (utteranceText: string, langCode: string, voice: SpeechSynthesisVoice | null, isFallback = false) => {
    try {
      const utterance = new SpeechSynthesisUtterance(utteranceText);
      activeUtterances.add(utterance);
      window.__healthPointCurrentUtterance = utterance;

      utterance.lang = langCode;
      utterance.rate = options?.rate || 0.95; // Clear natural clinical pacing
      utterance.pitch = options?.pitch || 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      const cleanupUtterance = () => {
        if (speechResumeInterval) {
          clearInterval(speechResumeInterval);
          speechResumeInterval = null;
        }
        activeUtterances.delete(utterance);
        if (window.__healthPointCurrentUtterance === utterance) {
          window.__healthPointCurrentUtterance = null;
        }
        notifySpeechListeners(null, false);
      };

      utterance.onstart = () => {
        notifySpeechListeners(speakerId, true);
        options?.onStart?.();

        // Chromium Keep-Alive ticker: resumes if audio thread unexpectedly pauses
        if (speechResumeInterval) clearInterval(speechResumeInterval);
        speechResumeInterval = setInterval(() => {
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          } else {
            cleanupUtterance();
          }
        }, 3000);
      };

      utterance.onend = () => {
        cleanupUtterance();
        options?.onEnd?.();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        cleanupUtterance();

        // If an Indic voice was missing and failed with language-unavailable, fallback to English system voice
        if (!isFallback && (e.error === 'language-unavailable' || e.error === 'synthesis-failed' || e.error === 'voice-unavailable')) {
          const fallbackVoice = findBestVoice('en-IN', voices) || voices[0] || null;
          console.log('[HealthPoint TTS] Attempting English audio fallback for voice compatibility...');
          playUtterance(text, 'en-IN', fallbackVoice, true);
          return;
        }

        options?.onError?.(e);
      };

      // Ensure speech synthesis is awake and ready
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Small tick delay prevents race conditions on rapid clicks
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (speakErr) {
          console.warn('Failed to invoke window.speechSynthesis.speak:', speakErr);
          cleanupUtterance();
          options?.onError?.(speakErr);
        }
      }, 50);

    } catch (err) {
      console.warn('Error constructing SpeechSynthesisUtterance:', err);
      notifySpeechListeners(null, false);
      options?.onError?.(err);
    }
  };

  playUtterance(cleanText, targetLangCode, selectedVoice);
}
