import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Navigation,
  Volume2,
  Phone,
  Users,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Share2,
  MapPin,
  Sparkles,
  Compass,
  Radio,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react";
import { EvacuationShelter, EvacuationNavigationStep, LanguageCode } from "../types";
import { calculateGeoDistanceKm, generateEvacuationCorridor } from "../data/sensorStations";
import { SUPPORTED_LANGUAGES } from "../data/languages";
import { playSpeechAudio, stopSpeechAudio, getBcp47Locale } from "../utils/audioSpeech";

interface EvacuationPanelProps {
  userLocation: { lat: number; lng: number } | null;
  shelters: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number })[];
  selectedShelter: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number }) | null;
  onSelectShelter: (shelter: EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number }) => void;
  evacuationSteps: EvacuationNavigationStep[];
  currentStepIndex: number;
  onSetStepIndex: (index: number) => void;
  currentLanguage: LanguageCode;
  onLocateUser: () => void;
  onShareEvacuationPlan: () => void;
  isSosAlertActive: boolean;
  onTriggerSosAlert: () => void;
}

export const EvacuationPanel: React.FC<EvacuationPanelProps> = ({
  userLocation,
  shelters,
  selectedShelter,
  onSelectShelter,
  evacuationSteps,
  currentStepIndex,
  onSetStepIndex,
  currentLanguage,
  onLocateUser,
  onShareEvacuationPlan,
  isSosAlertActive,
  onTriggerSosAlert,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [evacVoiceDirective, setEvacVoiceDirective] = useState<string>("");
  const [isLoadingDirective, setIsLoadingDirective] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const langInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // Fetch AI evacuation directive when selected shelter or language changes
  useEffect(() => {
    if (!selectedShelter || !userLocation) return;

    const fetchEvacGuide = async () => {
      setIsLoadingDirective(true);
      try {
        const res = await fetch("/api/gemini/evacuation-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: currentLanguage,
            userLocation,
            shelter: selectedShelter,
            distanceKm: selectedShelter.distanceKm,
            etaMinutes: selectedShelter.etaWalkingMinutes,
            hazardCount: 2,
          }),
        });
        const data = await res.json();
        if (data.guide) {
          setEvacVoiceDirective(data.guide);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDirective(false);
      }
    };

    fetchEvacGuide();
  }, [selectedShelter?.id, currentLanguage, userLocation?.lat, userLocation?.lng]);

  const handlePlayVoiceGuidance = () => {
    if (isPlayingAudio) {
      stopSpeechAudio();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak =
      evacVoiceDirective ||
      `Emergency evacuation active. Proceed along the green corridor to ${selectedShelter?.name}. Distance ${selectedShelter?.distanceKm} km. Indoor AQI is ${selectedShelter?.indoorAqi}. Safe haven ready.`;

    setIsPlayingAudio(true);
    playSpeechAudio(textToSpeak, currentLanguage, 1.0, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleShareClick = () => {
    onShareEvacuationPlan();
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/30 shadow-lg space-y-6 animate-in fade-in duration-200">
      {/* Header with SOS Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0F3F1] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-[#35BFAE]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold tracking-widest text-emerald-800 uppercase">
                EMERGENCY EVACUATION SYSTEM
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h2 className="text-xl font-black text-[#26332F]">Real-Time Safe Haven Guidance</h2>
          </div>
        </div>

        {/* SOS Emergency Dispatch Button */}
        <button
          onClick={onTriggerSosAlert}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
            isSosAlertActive
              ? "bg-red-600 text-white animate-pulse"
              : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span>{isSosAlertActive ? "🚨 SOS Broadcast Active" : "Trigger Emergency SOS"}</span>
        </button>
      </div>

      {/* Voice Audio Directive Player */}
      <div className="p-4 rounded-xl bg-[#F0F7F4] border border-[#CDEEE1] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16866B]" />
            <span className="text-xs font-extrabold text-[#123C35] uppercase tracking-wider">
              AI Spoken Evacuation Guidance ({langInfo.flag} {langInfo.nativeName})
            </span>
          </div>

          <button
            onClick={handlePlayVoiceGuidance}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              isPlayingAudio
                ? "bg-red-600 text-white animate-pulse"
                : "bg-[#16866B] text-white hover:bg-[#126F58]"
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? "Pause Audio" : "Listen in " + currentLanguage}</span>
          </button>
        </div>

        <p className="text-xs text-[#26332F] font-medium leading-relaxed italic">
          {isLoadingDirective
            ? "Generating real-time emergency evacuation directive..."
            : `"${evacVoiceDirective || "Proceed along the designated green clean-air corridor to your nearest filtered refuge."}"`}
        </p>
      </div>

      {/* Recommended Nearest Safe Shelters Carousel / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#26332F] tracking-wide uppercase flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#16866B]" />
            Verified Safe Shelters Near You ({shelters.length} Available)
          </span>

          <button
            onClick={onLocateUser}
            className="text-[11px] font-bold text-[#16866B] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            Refresh My GPS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shelters.map((sh) => {
            const isSelected = selectedShelter?.id === sh.id;
            return (
              <div
                key={sh.id}
                onClick={() => onSelectShelter(sh)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-[#E9F7F1] border-[#16866B] shadow-sm ring-1 ring-[#16866B]"
                    : "bg-[#FAFAF8] border-[#E3E8E5] hover:bg-[#F4FAF7]"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 bg-[#16866B] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                    SELECTED HAVEN
                  </span>
                )}

                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#123C35] text-[#35BFAE] flex items-center justify-center shrink-0 text-xs font-black">
                    {sh.indoorAqi}
                    <span className="text-[8px] block font-normal">AQI</span>
                  </div>

                  <div className="space-y-1 min-w-0 pr-12">
                    <h4 className="text-xs font-bold text-[#26332F] truncate">{sh.name}</h4>
                    <p className="text-[10px] text-[#74817C] truncate">{sh.address}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px]">
                      <span className="font-extrabold text-[#16866B]">
                        📍 {sh.distanceKm} km away
                      </span>
                      <span className="text-[#556963]">
                        🚶 ~{sh.etaWalkingMinutes} min · 🚗 ~{sh.etaDrivingMinutes} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#E3E8E5] flex items-center justify-between text-[10px] text-[#556963]">
                  <span>Air Grade: <strong className="text-[#26332F]">{sh.filtrationGrade.split(" ")[0]}</strong></span>
                  <span className="font-bold text-emerald-700">● {sh.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Shelter Full Detail & Live Turn-by-Turn Navigation */}
      {selectedShelter && (
        <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E3E8E5] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3E8E5] pb-3">
            <div>
              <span className="text-[10px] font-extrabold text-[#16866B] uppercase tracking-wider">
                ACTIVE EVACUATION TARGET
              </span>
              <h3 className="text-sm font-black text-[#26332F]">{selectedShelter.name}</h3>
              <p className="text-[11px] text-[#74817C]">{selectedShelter.type} · {selectedShelter.address}</p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedShelter.emergencyPhone}`}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D5DDD9] text-[#26332F] text-xs font-bold hover:bg-[#F0F7F4] flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#16866B]" />
                <span>Call Center</span>
              </a>

              <button
                onClick={handleShareClick}
                className="px-3 py-1.5 rounded-lg bg-white border border-[#D5DDD9] text-[#26332F] text-xs font-bold hover:bg-[#F0F7F4] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#16866B]" />
                <span>{copiedShareLink ? "Copied!" : "Share Route"}</span>
              </button>
            </div>
          </div>

          {/* Shelter Capabilities Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white border border-[#E3E8E5]">
              <span className="text-[10px] text-[#74817C] block uppercase font-bold">Indoor Clean Air</span>
              <span className="text-sm font-extrabold text-emerald-800">{selectedShelter.indoorAqi} AQI (Pristine)</span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-[#E3E8E5]">
              <span className="text-[10px] text-[#74817C] block uppercase font-bold">Capacity Occupancy</span>
              <span className="text-sm font-extrabold text-[#26332F]">
                {selectedShelter.occupied} / {selectedShelter.capacity}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-[#E3E8E5]">
              <span className="text-[10px] text-[#74817C] block uppercase font-bold">Oxygen Reserves</span>
              <span className="text-sm font-extrabold text-[#16866B]">
                {selectedShelter.hasOxygenSupply ? "Available 24/7" : "Ambient Filtered"}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-[#E3E8E5]">
              <span className="text-[10px] text-[#74817C] block uppercase font-bold">Free Respirators</span>
              <span className="text-sm font-extrabold text-[#16866B]">
                {selectedShelter.hasFreeRespirators ? "N95 / FFP3 Stocked" : "BYO Mask"}
              </span>
            </div>
          </div>

          {/* Turn-by-Turn Safe Navigation Steps */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#26332F] uppercase tracking-wider flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#16866B]" />
                Live Evacuation Route Corridor (94% Hazard Clearance)
              </span>
              <span className="text-[10px] font-bold text-[#16866B]">
                Step {currentStepIndex + 1} of {evacuationSteps.length}
              </span>
            </div>

            {/* Stepper Display */}
            <div className="space-y-2">
              {evacuationSteps.map((step, idx) => {
                const isActive = currentStepIndex === idx;
                return (
                  <div
                    key={step.stepNumber}
                    onClick={() => onSetStepIndex(idx)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? "bg-white border-[#16866B] shadow-xs ring-1 ring-[#16866B]"
                        : "bg-white/60 border-[#E3E8E5] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        isActive
                          ? "bg-[#16866B] text-white"
                          : "bg-[#E9F0EC] text-[#556963]"
                      }`}
                    >
                      {step.stepNumber}
                    </div>

                    <div className="flex-1 space-y-1">
                      <p className="text-xs text-[#26332F] font-bold leading-snug">
                        {step.instruction}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-[#74817C]">
                        <span>~{step.distanceMeters}m</span>
                        <span>·</span>
                        <span>~{step.durationMinutes} min</span>
                        <span>·</span>
                        <span className="text-emerald-800 font-bold">● {step.airQualityStatus}</span>
                      </div>
                    </div>

                    {isActive && (
                      <CheckCircle2 className="w-4 h-4 text-[#16866B] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
