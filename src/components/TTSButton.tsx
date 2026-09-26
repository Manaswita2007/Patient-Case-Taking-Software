import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { speakText, stopSpeech } from '../utils/speech';
import { useAppContext } from '../context/AppContext';

interface TTSButtonProps {
  text: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
  autoPlay?: boolean;
}

export default function TTSButton({
  text,
  label,
  size = 'md',
  className = '',
  id,
  autoPlay = false
}: TTSButtonProps) {
  const { language } = useAppContext();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay && text) {
      handleSpeak();
    }
    return () => {
      if (playing) {
        stopSpeech();
      }
    };
  }, [text]);

  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (playing) {
      stopSpeech();
      setPlaying(false);
    } else {
      setPlaying(true);
      speakText(text, language, {
        onEnd: () => setPlaying(false),
        onError: () => setPlaying(false)
      });
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const buttonPaddings = {
    sm: 'p-1.5 text-[11px]',
    md: 'p-2 text-xs',
    lg: 'px-3 py-2 text-sm'
  };

  return (
    <button
      type="button"
      id={id}
      onClick={handleSpeak}
      title={playing ? 'Stop speech' : 'Listen / Read aloud (Audio assistant)'}
      aria-label={playing ? 'Stop audio playback' : `Read aloud: ${label || text.slice(0, 40)}`}
      className={`inline-flex items-center gap-1.5 rounded-full font-bold transition-all cursor-pointer select-none shrink-0 ${
        playing
          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105 animate-pulse ring-2 ring-amber-400'
          : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800'
      } ${buttonPaddings[size]} ${className}`}
    >
      {playing ? (
        <VolumeX className={`${iconSizes[size]} text-white`} />
      ) : (
        <Volume2 className={`${iconSizes[size]} text-teal-600 dark:text-teal-400`} />
      )}
      {label && <span>{playing ? 'Stop Audio' : label}</span>}
    </button>
  );
}
