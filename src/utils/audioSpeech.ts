import { LanguageCode } from "../types";
import { SUPPORTED_LANGUAGES } from "../data/languages";

// Map LanguageCode to BCP-47 locale
export const getBcp47Locale = (langCode: LanguageCode): string => {
  const found = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  return found ? found.bcp47 : "en-US";
};

// Global audio element & speech synthesis state
let currentAudioElement: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isAudioElementPlaying: boolean = false;

export interface AudioPlaybackCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
  onBoundary?: (charIndex: number) => void;
}

// Clean markdown and formatting symbols so text reads naturally
export const sanitizeTextForSpeech = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "") // code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/#+\s+/g, "") // headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/https?:\/\/\S+/g, "") // urls
    .replace(/[•●▪■◆★☆*~_`#<>]/g, "") // bullets & symbols
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * High-quality multi-language speech playback.
 * First uses high-fidelity neural audio stream from /api/tts (works seamlessly for Telugu, Hindi, Tamil, English, etc.)
 * Gracefully falls back to browser SpeechSynthesis if offline.
 */
export const playSpeechAudio = (
  text: string,
  langCode: LanguageCode,
  rate: number = 1.0,
  callbacks?: AudioPlaybackCallbacks
): boolean => {
  if (typeof window === "undefined") {
    callbacks?.onEnd?.();
    return false;
  }

  // Stop any active audio or utterance
  stopSpeechAudio();

  const clean = sanitizeTextForSpeech(text);
  if (!clean) {
    callbacks?.onEnd?.();
    return false;
  }

  // 1. Try High-Fidelity Neural Multi-lingual Audio Stream via /api/tts
  try {
    const ttsUrl = `/api/tts?lang=${encodeURIComponent(langCode)}&text=${encodeURIComponent(clean)}`;
    const audio = new Audio();
    audio.src = ttsUrl;
    audio.playbackRate = Math.min(Math.max(rate, 0.5), 2.0);

    audio.onplay = () => {
      isAudioElementPlaying = true;
      callbacks?.onStart?.();
    };

    audio.onended = () => {
      isAudioElementPlaying = false;
      currentAudioElement = null;
      callbacks?.onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn("TTS audio stream error, falling back to browser SpeechSynthesis:", e);
      isAudioElementPlaying = false;
      currentAudioElement = null;
      // Fallback to browser SpeechSynthesis
      fallbackToBrowserSpeech(clean, langCode, rate, callbacks);
    };

    currentAudioElement = audio;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Audio autoplay blocked or failed, attempting speech synthesis fallback:", err);
        isAudioElementPlaying = false;
        currentAudioElement = null;
        fallbackToBrowserSpeech(clean, langCode, rate, callbacks);
      });
    }

    return true;
  } catch (err) {
    console.warn("Failed to init HTMLAudioElement, using SpeechSynthesis:", err);
    return fallbackToBrowserSpeech(clean, langCode, rate, callbacks);
  }
};

/**
 * Browser SpeechSynthesis fallback
 */
function fallbackToBrowserSpeech(
  cleanText: string,
  langCode: LanguageCode,
  rate: number = 1.0,
  callbacks?: AudioPlaybackCallbacks
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    callbacks?.onError?.("Speech synthesis not supported");
    callbacks?.onEnd?.();
    return false;
  }

  try {
    const locale = getBcp47Locale(langCode);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = locale;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Find best matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) => v.lang === locale || v.lang.toLowerCase().startsWith(locale.split("-")[0].toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      callbacks?.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      callbacks?.onEnd?.();
    };

    utterance.onerror = (event) => {
      currentUtterance = null;
      callbacks?.onError?.(event);
    };

    if (callbacks?.onBoundary) {
      utterance.onboundary = (event) => {
        callbacks.onBoundary?.(event.charIndex);
      };
    }

    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (e) {
    console.error("SpeechSynthesis error:", e);
    callbacks?.onError?.(e);
    callbacks?.onEnd?.();
    return false;
  }
}

/**
 * Stop any running speech synthesis audio or HTML Audio
 */
export const stopSpeechAudio = () => {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
      currentAudioElement.removeAttribute("src");
    } catch (e) {}
    currentAudioElement = null;
  }
  isAudioElementPlaying = false;

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    currentUtterance = null;
  }
};

/**
 * Pause speech
 */
export const pauseSpeechAudio = () => {
  if (currentAudioElement && !currentAudioElement.paused) {
    currentAudioElement.pause();
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.pause();
  }
};

/**
 * Resume speech
 */
export const resumeSpeechAudio = () => {
  if (currentAudioElement && currentAudioElement.paused) {
    currentAudioElement.play().catch(() => {});
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.resume();
  }
};

/**
 * Check if speech is currently active
 */
export const isSpeaking = (): boolean => {
  if (isAudioElementPlaying && currentAudioElement && !currentAudioElement.paused) {
    return true;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
};

/**
 * Speech Recognition helper for multi-language voice dictation
 */
export const createSpeechRecognizer = (
  langCode: LanguageCode,
  onResult: (transcript: string, isFinal: boolean) => void,
  onError?: (error: string) => void,
  onEnd?: () => void
) => {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("SpeechRecognition API is not supported in this browser.");
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = getBcp47Locale(langCode);
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult(finalTranscript || interimTranscript, !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      onError?.(event.error);
    };

    recognition.onend = () => {
      onEnd?.();
    };

    return recognition;
  } catch (err) {
    console.error("Error creating speech recognizer:", err);
    return null;
  }
};
