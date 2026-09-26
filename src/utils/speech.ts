// Accessible Speech Synthesis Utility for Visually Impaired Patients and Multilingual Audio

let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechResumeInterval: any = null;

// Keep utterance reference on window to prevent Chromium garbage collection bug
declare global {
  interface Window {
    __mediSwiftCurrentUtterance?: SpeechSynthesisUtterance | null;
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

export function stopSpeech(): void {
  if (speechResumeInterval) {
    clearInterval(speechResumeInterval);
    speechResumeInterval = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
      if (typeof window !== 'undefined') {
        window.__mediSwiftCurrentUtterance = null;
      }
    } catch (e) {
      console.warn('Speech synthesis cancel error:', e);
    }
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

// Check if string contains Indic script characters
function hasIndicScript(str: string): boolean {
  // Unicode ranges for Devanagari, Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam
  return /[\u0900-\u0D7F]/.test(str);
}

export async function speakText(
  text: string,
  language = 'en',
  options?: {
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  if (!text || !text.trim()) return;

  // Clean text of markdown artifacts for natural speaking
  let cleanText = text
    .replace(/[*#_~`>]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

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

  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;
    window.__mediSwiftCurrentUtterance = utterance;

    utterance.lang = targetLangCode;
    utterance.rate = options?.rate || 0.95; // Slightly relaxed for clinical clarity
    utterance.pitch = options?.pitch || 1.0;

    // Pick best matching voice if available
    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const primary = targetLangCode.split('-')[0].toLowerCase();
        const matchedVoice = voices.find(v => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          return vLang === targetLangCode.toLowerCase() || vLang.startsWith(primary);
        }) || voices.find(v => v.lang.toLowerCase().includes(primary)) || (targetLangCode.startsWith('en') ? voices.find(v => v.lang.toLowerCase().includes('en')) : null);

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }
    };

    selectVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = selectVoice;
    }

    const cleanup = () => {
      if (speechResumeInterval) {
        clearInterval(speechResumeInterval);
        speechResumeInterval = null;
      }
      currentUtterance = null;
      window.__mediSwiftCurrentUtterance = null;
    };

    utterance.onstart = () => {
      options?.onStart?.();
      // Workaround for Chrome bug where speech stalls after ~14 seconds
      if (speechResumeInterval) clearInterval(speechResumeInterval);
      speechResumeInterval = setInterval(() => {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          cleanup();
        }
      }, 5000);
    };

    utterance.onend = () => {
      cleanup();
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      cleanup();
      options?.onError?.(e);
    };

    // Ensure speech synthesis is active and not stuck in paused state
    window.speechSynthesis.cancel();
    setTimeout(() => {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('speak invocation error:', e);
        options?.onError?.(e);
      }
    }, 40);

  } catch (err) {
    console.warn('Error in speakText:', err);
    options?.onError?.(err);
  }
}
