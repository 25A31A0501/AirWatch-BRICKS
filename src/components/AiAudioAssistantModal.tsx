import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  X,
  Globe,
  Radio,
  RefreshCw,
  Play,
  Pause,
  ShieldCheck,
  Activity,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { LanguageCode, Incident } from "../types";
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from "../data/languages";
import {
  playSpeechAudio,
  stopSpeechAudio,
  createSpeechRecognizer,
} from "../utils/audioSpeech";

interface AiAudioAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  incidents: Incident[];
  currentCity?: string;
  currentPage?: string;
}

interface Message {
  sender: "user" | "assistant";
  text: string;
  language: LanguageCode;
  timestamp: string;
}

export const AiAudioAssistantModal: React.FC<AiAudioAssistantModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  incidents,
  currentCity = "Hyderabad",
  currentPage = "report",
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  const recognizerRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const langInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;
  const avgAqi = Math.round(
    incidents.reduce((acc, curr) => acc + curr.aqi, 0) / (incidents.length || 1)
  );

  // Initialize greeting on open or language switch
  useEffect(() => {
    if (isOpen) {
      const greetingMsg: Message = {
        sender: "assistant",
        text: langInfo.greeting,
        language: currentLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([greetingMsg]);

      // Speak greeting
      setIsSpeakingNow(true);
      playSpeechAudio(langInfo.greeting, currentLanguage, speechSpeed, {
        onEnd: () => setIsSpeakingNow(false),
        onError: () => setIsSpeakingNow(false),
      });
    } else {
      stopSpeechAudio();
      stopListening();
    }
  }, [isOpen, currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Start voice listening with browser Speech Recognition in user's preferred language
  const startListening = () => {
    stopSpeechAudio();
    setIsSpeakingNow(false);

    const recognizer = createSpeechRecognizer(
      currentLanguage,
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          stopListening();
          handleSendMessage(transcript);
        }
      },
      (err) => {
        console.warn("Recognition error:", err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      try {
        recognizer.start();
        recognizerRef.current = recognizer;
        setIsListening(true);
      } catch (e) {
        console.error("Recognizer start error:", e);
        setIsListening(false);
      }
    } else {
      setInputText((prev) => (prev ? prev : ""));
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      sender: "user",
      text: query.trim(),
      language: currentLanguage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);
    stopSpeechAudio();

    try {
      const response = await fetch("/api/gemini/voice-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query.trim(),
          language: currentLanguage,
          context: {
            currentPage,
            city: currentCity,
            criticalCount,
            avgAqi,
          },
        }),
      });

      const data = await response.json();
      const assistantReply =
        data.text ||
        "BRICS AirWatch environmental telemetry is active. Particulate levels are elevated in industrial corridors.";

      const assistantMsg: Message = {
        sender: "assistant",
        text: assistantReply,
        language: currentLanguage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak the response in preferred language
      setIsSpeakingNow(true);
      playSpeechAudio(assistantReply, currentLanguage, speechSpeed, {
        onEnd: () => setIsSpeakingNow(false),
        onError: () => setIsSpeakingNow(false),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplayAudio = (text: string, lang: LanguageCode) => {
    stopSpeechAudio();
    setIsSpeakingNow(true);
    playSpeechAudio(text, lang, speechSpeed, {
      onEnd: () => setIsSpeakingNow(false),
      onError: () => setIsSpeakingNow(false),
    });
  };

  const handleStopAudio = () => {
    stopSpeechAudio();
    setIsSpeakingNow(false);
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-audio-assistant-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="ai-audio-assistant-modal"
        className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E3E8E5] flex flex-col h-[85vh] max-h-[680px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
      >
        {/* Modal Header */}
        <div className="bg-[#123C35] px-6 py-4 text-white flex items-center justify-between border-b border-[#1A5249]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#16866B] flex items-center justify-center text-[#35BFAE] shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-wide uppercase">
                  AI AUDIO ASSISTANT
                </h2>
                <span className="text-[10px] bg-[#16866B] px-2 py-0.5 rounded-full font-bold text-white tracking-wider uppercase">
                  Multilingual
                </span>
              </div>
              <p className="text-xs text-[#A1C2BC] font-medium">
                Voice intelligence in your preferred language
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSpeakingNow && (
              <button
                onClick={handleStopAudio}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition"
                title="Stop Audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={() => {
                stopSpeechAudio();
                stopListening();
                onClose();
              }}
              className="p-2 rounded-xl text-[#A1C2BC] hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language Selection & Audio Status Banner */}
        <div className="bg-[#F4FAF7] px-6 py-3 border-b border-[#D5DDD9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#16866B]" />
            <span className="text-xs font-bold text-[#26332F]">Preferred Language:</span>
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-white border border-[#C5DDD4] rounded-lg px-2.5 py-1 text-xs font-bold text-[#16866B] focus:outline-hidden focus:ring-2 focus:ring-[#16866B]/30 cursor-pointer shadow-2xs"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Equalizer when speaking */}
          <div className="flex items-center gap-3">
            {isSpeakingNow ? (
              <div className="flex items-center gap-1.5 bg-[#E3EFEA] px-3 py-1 rounded-full border border-[#C5DDD4]">
                <Volume2 className="w-3.5 h-3.5 text-[#16866B] animate-pulse" />
                <span className="text-[11px] font-bold text-[#16866B]">AI Speaking</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-[#16866B] rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1 h-4.5 bg-[#35BFAE] rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1 h-2.5 bg-[#16866B] rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-200 animate-pulse">
                <Mic className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Listening to you...</span>
              </div>
            ) : (
              <span className="text-[11px] text-[#74817C] font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 text-[#16866B]" /> Ready for voice / text
              </span>
            )}

            {/* Speed controller */}
            <div className="flex items-center gap-1 bg-white border border-[#D5DDD9] rounded-lg p-0.5 text-[10px] font-bold text-[#26332F]">
              <button
                onClick={() => setSpeechSpeed(0.85)}
                className={`px-1.5 py-0.5 rounded-sm ${speechSpeed === 0.85 ? "bg-[#16866B] text-white" : ""}`}
              >
                0.8x
              </button>
              <button
                onClick={() => setSpeechSpeed(1.0)}
                className={`px-1.5 py-0.5 rounded-sm ${speechSpeed === 1.0 ? "bg-[#16866B] text-white" : ""}`}
              >
                1.0x
              </button>
              <button
                onClick={() => setSpeechSpeed(1.25)}
                className={`px-1.5 py-0.5 rounded-sm ${speechSpeed === 1.25 ? "bg-[#16866B] text-white" : ""}`}
              >
                1.2x
              </button>
            </div>
          </div>
        </div>

        {/* Conversation Message List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFBF9]">
          {messages.map((msg, index) => {
            const isAss = msg.sender === "assistant";
            return (
              <div
                key={index}
                className={`flex gap-3 ${isAss ? "items-start" : "items-end justify-end"}`}
              >
                {isAss && (
                  <div className="w-8 h-8 rounded-xl bg-[#16866B] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Sparkles className="w-4 h-4 text-[#35BFAE]" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed shadow-2xs ${
                    isAss
                      ? "bg-white border border-[#E3E8E5] text-[#26332F]"
                      : "bg-[#16866B] text-white font-medium rounded-br-xs"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm">{msg.text}</p>

                  <div className="flex items-center justify-between gap-4 mt-2.5 pt-2 border-t border-[#F0F3F1]/80 text-[10px]">
                    <span className={isAss ? "text-[#74817C]" : "text-white/80"}>
                      {msg.timestamp}
                    </span>

                    {isAss && (
                      <button
                        onClick={() => handleReplayAudio(msg.text, msg.language)}
                        className="flex items-center gap-1 text-[#16866B] font-bold hover:underline cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Replay Audio</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#16866B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 animate-spin text-[#35BFAE]" />
              </div>
              <div className="bg-white border border-[#E3E8E5] rounded-2xl p-3.5 text-xs text-[#74817C] flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#16866B] animate-ping" />
                <span>Thinking in {langInfo.label}... Generating spoken intelligence</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-white px-6 py-2.5 border-t border-[#F0F3F1] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold text-[#74817C] uppercase tracking-wider shrink-0">
            Quick Ask:
          </span>
          <button
            onClick={() => handleSendMessage(langInfo.samplePrompt)}
            className="px-3 py-1 rounded-full bg-[#F4FAF7] hover:bg-[#E3EFEA] text-[#16866B] border border-[#C5DDD4] font-semibold whitespace-nowrap transition cursor-pointer text-xs"
          >
            {langInfo.samplePrompt}
          </button>
          <button
            onClick={() =>
              handleSendMessage(
                currentLanguage === "HI"
                  ? "क्या मुझे आज बाहर जाने पर N95 मास्क पहनना चाहिए?"
                  : currentLanguage === "TE"
                  ? "నేను ఈరోజు బయటకు వెళ్లేటప్పుడు N95 మాస్క్ ధరించాలా?"
                  : currentLanguage === "TA"
                  ? "இன்று வெளியே செல்லும்போது N95 முகக்கவசம் அணிய வேண்டுமா?"
                  : currentLanguage === "ZH"
                  ? "今天外出需要佩戴N95口罩吗？"
                  : currentLanguage === "PT"
                  ? "Devo usar máscara de proteção para sair hoje?"
                  : currentLanguage === "RU"
                  ? "Нужно ли сегодня надевать маску N95 на улице?"
                  : currentLanguage === "ES"
                  ? "¿Debo usar mascarilla N95 para salir hoy?"
                  : currentLanguage === "AR"
                  ? "هل يجب ارتداء كمامة N95 عند الخروج اليوم؟"
                  : "Should I wear an N95 mask when going outdoors today?"
              )
            }
            className="px-3 py-1 rounded-full bg-[#F4FAF7] hover:bg-[#E3EFEA] text-[#16866B] border border-[#C5DDD4] font-semibold whitespace-nowrap transition cursor-pointer text-xs"
          >
            Health & mask advice
          </button>
        </div>

        {/* Input Bar with Mic & Send */}
        <div className="p-4 bg-white border-t border-[#E3E8E5] flex items-center gap-2">
          {/* Voice Mic Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`p-3 rounded-xl transition cursor-pointer shadow-xs ${
              isListening
                ? "bg-red-600 text-white ring-4 ring-red-200 animate-pulse"
                : "bg-[#E9F7F1] text-[#16866B] hover:bg-[#D8F1E7] border border-[#C5DDD4]"
            }`}
            title={isListening ? "Stop voice listening" : `Speak in ${langInfo.label}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={`Ask or type in ${langInfo.nativeName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 bg-[#F8FAF9] border border-[#D5DDD9] rounded-xl px-4 py-2.5 text-xs text-[#26332F] focus:outline-hidden focus:ring-2 focus:ring-[#16866B]/30"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-[#16866B] hover:bg-[#126F58] disabled:opacity-40 text-white font-bold transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
