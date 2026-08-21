import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play, Sparkles, Globe, RefreshCw } from "lucide-react";
import { LanguageCode } from "../types";
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from "../data/languages";
import { playSpeechAudio, stopSpeechAudio, isSpeaking } from "../utils/audioSpeech";

interface AudioPlayerBarProps {
  textToSpeak: string;
  currentLanguage: LanguageCode;
  title?: string;
  compact?: boolean;
  onLanguageChange?: (lang: LanguageCode) => void;
  className?: string;
  autoPlay?: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  textToSpeak,
  currentLanguage,
  title = "AI Audio Assistance",
  compact = false,
  onLanguageChange,
  className = "",
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const langInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSpeechAudio();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playSpeechAudio(textToSpeak, currentLanguage, playbackRate, {
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  const handleChangeRate = () => {
    const nextRate = playbackRate === 1.0 ? 1.25 : playbackRate === 1.25 ? 0.85 : 1.0;
    setPlaybackRate(nextRate);
    if (isPlaying) {
      stopSpeechAudio();
      playSpeechAudio(textToSpeak, currentLanguage, nextRate, {
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
  };

  useEffect(() => {
    if (autoPlay && textToSpeak) {
      setIsPlaying(true);
      playSpeechAudio(textToSpeak, currentLanguage, playbackRate, {
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }
    return () => {
      stopSpeechAudio();
    };
  }, [textToSpeak, currentLanguage]);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            isPlaying
              ? "bg-[#16866B] text-white shadow-xs animate-pulse"
              : "bg-[#E9F7F1] text-[#16866B] border border-[#C5DDD4] hover:bg-[#D5EBE2]"
          }`}
          title={`Listen in ${langInfo.label}`}
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop audio</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>
                Listen in {langInfo.label} ({langInfo.flag})
              </span>
            </>
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-0.5 px-1 py-0.5">
            <span className="w-1 h-3 bg-[#16866B] rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-4 bg-[#16866B] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-2 bg-[#16866B] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      id="ai-audio-player-bar"
      className={`bg-[#F4FAF7] border border-[#C5DDD4] rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Main Icon Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition shadow-xs cursor-pointer ${
            isPlaying
              ? "bg-[#16866B] text-white ring-4 ring-[#16866B]/20"
              : "bg-white text-[#16866B] border border-[#C5DDD4] hover:bg-[#E3EFEA]"
          }`}
          aria-label={isPlaying ? "Stop audio" : "Play audio"}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider text-[#16866B] uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {title}
            </span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-[#D5DDD9] font-bold text-[#26332F] flex items-center gap-1">
              <span>{langInfo.flag}</span>
              <span>{langInfo.label}</span>
            </span>
          </div>
          <p className="text-xs text-[#556963] font-medium mt-0.5">
            {isPlaying ? "Speaking briefing in your preferred language..." : "Click play to listen to spoken AI environmental intelligence"}
          </p>
        </div>
      </div>

      {/* Right Controls: Equalizer Animation, Speed, & Language Switcher */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {/* Waveform Equalizer */}
        {isPlaying && (
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/80 rounded-lg border border-[#C5DDD4]">
            <span className="w-1 h-3.5 bg-[#16866B] rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-5 bg-[#35BFAE] rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-3 bg-[#16866B] rounded-full animate-bounce [animation-delay:300ms]" />
            <span className="w-1 h-4 bg-[#123C35] rounded-full animate-bounce [animation-delay:450ms]" />
          </div>
        )}

        {/* Speed Pill */}
        <button
          type="button"
          onClick={handleChangeRate}
          className="px-2 py-1 bg-white hover:bg-[#E9F0EC] border border-[#D5DDD9] rounded-lg text-[11px] font-bold text-[#26332F] transition cursor-pointer"
          title="Toggle speed"
        >
          {playbackRate}x
        </button>

        {/* Quick Language Dropdown */}
        {onLanguageChange && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#E9F0EC] border border-[#D5DDD9] rounded-lg text-xs font-semibold text-[#26332F] transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#16866B]" />
              <span className="text-[11px] font-bold">{currentLanguage}</span>
            </button>

            {showLangPicker && (
              <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-[#E3E8E5] py-1.5 z-50 animate-in fade-in slide-in-from-bottom-1 max-h-56 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#74817C] uppercase border-b border-[#F0F3F1]">
                  SELECT AUDIO LANGUAGE
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setShowLangPicker(false);
                      stopSpeechAudio();
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#E9F7F1] transition ${
                      currentLanguage === lang.code
                        ? "text-[#16866B] font-bold bg-[#F4FAF7]"
                        : "text-[#26332F]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
