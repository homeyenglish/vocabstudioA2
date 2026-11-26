import { AccentType } from '../types/vocab';

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakEnglish(
  text: string,
  accent: AccentType = 'en-GB',
  onEnd?: () => void
): boolean {
  if (!isSpeechSupported()) {
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = accent;
    utterance.rate = 0.92;

    const voices = window.speechSynthesis.getVoices();
    const exactVoice = voices.find((v) => v.lang.toLowerCase() === accent.toLowerCase());
    const prefixVoice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(accent.split('-')[0].toLowerCase())
    );
    if (exactVoice) {
      utterance.voice = exactVoice;
    } else if (prefixVoice) {
      utterance.voice = prefixVoice;
    }

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}
