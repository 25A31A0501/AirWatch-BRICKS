import React, { useState } from "react";
import {
  ShieldCheck,
  MapPin,
  Route,
  Navigation,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  Wind,
  Footprints,
  Bike,
  Train,
  Car,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  Activity,
  Search,
} from "lucide-react";
import { RealTimeAccessZone, RealTimeAccessCorridor, LanguageCode } from "../types";
import { UI_TRANSLATIONS } from "../data/languages";
import { playSpeechAudio, stopSpeechAudio } from "../utils/audioSpeech";

interface RealTimeAccessPanelProps {
  userLocation: { lat: number; lng: number };
  accessZones: RealTimeAccessZone[];
  selectedZone: RealTimeAccessZone | null;
  onSelectZone: (zone: RealTimeAccessZone) => void;
  corridors: RealTimeAccessCorridor[];
  selectedCorridor: RealTimeAccessCorridor | null;
  onSelectCorridor: (corridor: RealTimeAccessCorridor) => void;
  currentLanguage?: LanguageCode;
  onLocateUser: () => void;
  activeTab: "corridors" | "zones" | "planner";
  onTabChange: (tab: "corridors" | "zones" | "planner") => void;
}

export const RealTimeAccessPanel: React.FC<RealTimeAccessPanelProps> = ({
  userLocation,
  accessZones,
  selectedZone,
  onSelectZone,
  corridors,
  selectedCorridor,
  onSelectCorridor,
  currentLanguage = "EN",
  onLocateUser,
  activeTab,
  onTabChange,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [customOrigin, setCustomOrigin] = useState("My Current Location");
  const [customDestination, setCustomDestination] = useState(corridors[0]?.toLabel || "Central Clean Air Haven");
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  const t = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.EN;

  // Calculate live city accessibility index
  const safeZones = accessZones.filter((z) => z.accessStatus === "Open Access").length;
  const cautionZones = accessZones.filter((z) => z.accessStatus === "Caution (Mask Required)").length;
  const restrictedZones = accessZones.filter((z) => z.accessStatus === "Restricted Transit" || z.accessStatus === "Hazard Closed").length;
  const cityAccessPercentage = Math.round((safeZones / (accessZones.length || 1)) * 100);

  const handlePlayAccessBriefing = () => {
    if (isPlayingAudio) {
      stopSpeechAudio();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    const text = `Clean air corridors briefing: City accessibility is currently at ${cityAccessPercentage} percent. ${safeZones} primary corridors are verified safe for unrestricted travel. ${restrictedZones > 0 ? `${restrictedZones} industrial perimeters are restricted due to high particulate plumes.` : "All major transit lines open."}`;
    playSpeechAudio(text, (currentLanguage || "EN") as LanguageCode, 1.0, {
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleCalculateCleanRoute = () => {
    setIsCalculatingRoute(true);
    setTimeout(() => {
      setIsCalculatingRoute(false);
      if (corridors.length > 0) {
        onSelectCorridor(corridors[0]);
      }
    }, 600);
  };

  const getStatusBadge = (status: RealTimeAccessZone["accessStatus"]) => {
    switch (status) {
      case "Open Access":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            OPEN ACCESS
          </span>
        );
      case "Caution (Mask Required)":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            MASK REQUIRED
          </span>
        );
      case "Restricted Transit":
      case "Hazard Closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            RESTRICTED
          </span>
        );
    }
  };

  return (
    <div id="real-time-access-panel" className="bg-white rounded-2xl border border-[#E3E8E5] shadow-xs p-5 space-y-5">
      {/* Panel Top Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[#F0F3F1] pb-3.5">
        <div>
          <h2 className="text-lg font-black text-[#26332F] flex items-center gap-2">
            <Route className="w-5 h-5 text-[#16866B]" />
            <span>Safe Transit Corridors</span>
          </h2>
        </div>

        <button
          onClick={handlePlayAccessBriefing}
          className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
            isPlayingAudio
              ? "bg-[#16866B] text-white border-[#16866B] animate-pulse"
              : "bg-[#F8FAF9] text-[#123C35] border-[#D5DDD9] hover:bg-[#E9F7F1]"
          }`}
          title="Listen to Live Access Briefing"
        >
          <Volume2 className="w-4 h-4 text-[#35BFAE]" />
          <span className="hidden sm:inline">{isPlayingAudio ? "Speaking..." : "Audio"}</span>
        </button>
      </div>

      {/* City Accessibility Summary Card */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#123C35] to-[#16866B] text-white space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#A7F3D0] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#35BFAE]" />
            Live City Access Index
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md font-extrabold">
            Real-Time Stream
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-black tracking-tight">{cityAccessPercentage}%</div>
            <div className="text-xs text-[#E9F7F1]/90 font-medium">Safe Clean-Air Corridors Open</div>
          </div>
          <div className="text-right text-[11px] space-y-0.5 font-bold">
            <div className="text-[#A7F3D0]">🟢 {safeZones} Safe Access</div>
            <div className="text-[#FDE68A]">🟡 {cautionZones} Mask Advised</div>
            <div className="text-[#FCA5A5]">🔴 {restrictedZones} High-Smoke Bypass</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden flex">
          <div style={{ width: `${cityAccessPercentage}%` }} className="bg-emerald-400 h-full" />
          <div
            style={{ width: `${Math.round((cautionZones / (accessZones.length || 1)) * 100)}%` }}
            className="bg-amber-400 h-full"
          />
          <div
            style={{ width: `${Math.round((restrictedZones / (accessZones.length || 1)) * 100)}%` }}
            className="bg-red-400 h-full"
          />
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-[#F4F7F5] p-1 rounded-xl border border-[#E3E8E5] text-xs font-bold">
        <button
          onClick={() => onTabChange("corridors")}
          className={`py-2 rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "corridors"
              ? "bg-white text-[#123C35] shadow-xs font-black"
              : "text-[#556963] hover:text-[#26332F]"
          }`}
        >
          <Route className="w-3.5 h-3.5 text-[#16866B]" />
          <span>Corridors</span>
        </button>

        <button
          onClick={() => onTabChange("zones")}
          className={`py-2 rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "zones"
              ? "bg-white text-[#123C35] shadow-xs font-black"
              : "text-[#556963] hover:text-[#26332F]"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-[#16866B]" />
          <span>Access Zones</span>
        </button>

        <button
          onClick={() => onTabChange("planner")}
          className={`py-2 rounded-lg transition text-center cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "planner"
              ? "bg-white text-[#123C35] shadow-xs font-black"
              : "text-[#556963] hover:text-[#26332F]"
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-[#16866B]" />
          <span>Route Finder</span>
        </button>
      </div>

      {/* Tab 1: Clean Air Corridors */}
      {activeTab === "corridors" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#556963]">
            <span className="font-bold">Active Real-Time Clean Corridors</span>
            <span className="text-[11px]">{corridors.length} Verified</span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {corridors.map((corr) => {
              const isSelected = selectedCorridor?.id === corr.id;
              return (
                <div
                  key={corr.id}
                  onClick={() => onSelectCorridor(corr)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-[#E9F7F1] border-[#16866B] shadow-xs ring-2 ring-[#16866B]/20"
                      : "bg-[#F8FAF9] border-[#E3E8E5] hover:bg-white hover:border-[#16866B]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-[#26332F]">{corr.name}</div>
                      <div className="text-[11px] text-[#556963] flex items-center gap-1.5">
                        <span>{corr.fromLabel}</span>
                        <ArrowRight className="w-3 h-3 text-[#16866B]" />
                        <span>{corr.toLabel}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 whitespace-nowrap">
                      {corr.avgAqi} AQI
                    </span>
                  </div>

                  <p className="text-[11px] text-[#556963] leading-relaxed line-clamp-2">
                    {corr.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-bold text-[#26332F] pt-1 border-t border-[#E3E8E5]/60">
                    <div className="flex items-center gap-3">
                      <span>📏 {corr.distanceKm} km</span>
                      <span>⏱️ ~{corr.durationMinutes} mins</span>
                    </div>

                    <div className="flex items-center gap-1 text-[#16866B]">
                      {corr.transitOptions.includes("walk") && <Footprints className="w-3.5 h-3.5" title="Pedestrian" />}
                      {corr.transitOptions.includes("bike") && <Bike className="w-3.5 h-3.5" title="Bicycle" />}
                      {corr.transitOptions.includes("transit") && <Train className="w-3.5 h-3.5" title="Metro / Bus" />}
                      {corr.transitOptions.includes("car") && <Car className="w-3.5 h-3.5" title="Car / Cabin" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Access Zones Inspector */}
      {activeTab === "zones" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#556963]">
            <span className="font-bold">Monitored Sectors</span>
            <span className="text-[11px]">{accessZones.length} Zones Tracked</span>
          </div>

          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {accessZones.map((zone) => {
              const isSelected = selectedZone?.id === zone.id;
              return (
                <div
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-[#E9F7F1] border-[#16866B] shadow-xs ring-2 ring-[#16866B]/20"
                      : "bg-[#F8FAF9] border-[#E3E8E5] hover:bg-white hover:border-[#16866B]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-black text-[#26332F]">{zone.name}</div>
                      <div className="text-[10px] text-[#74817C] uppercase font-bold">{zone.zoneType}</div>
                    </div>
                    {getStatusBadge(zone.accessStatus)}
                  </div>

                  <p className="text-[11px] text-[#556963] leading-relaxed">
                    {zone.activeAdvisory}
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-1.5 rounded-lg bg-white border border-[#E3E8E5]">
                      <span className="text-[9px] text-[#74817C] uppercase block font-bold">AQI & PM2.5</span>
                      <span className="font-black text-[#26332F]">{zone.aqi} AQI · {zone.pm25} µg</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-[#E3E8E5]">
                      <span className="text-[9px] text-[#74817C] uppercase block font-bold">Mode Advice</span>
                      <span className="font-black text-[#16866B] truncate block">{zone.recommendedMode}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Clean-Air Route Finder */}
      {activeTab === "planner" && (
        <div className="space-y-4">
          <div className="space-y-3 bg-[#F8FAF9] p-3.5 rounded-xl border border-[#E3E8E5]">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#74817C] uppercase">Departure Origin</label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#D5DDD9] text-xs font-bold text-[#26332F]">
                <MapPin className="w-3.5 h-3.5 text-[#16866B] shrink-0" />
                <input
                  type="text"
                  value={customOrigin}
                  onChange={(e) => setCustomOrigin(e.target.value)}
                  className="w-full bg-transparent outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-[#74817C] uppercase">Destination / Safe Haven</label>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-[#D5DDD9] text-xs font-bold text-[#26332F]">
                <Navigation className="w-3.5 h-3.5 text-[#35BFAE] shrink-0" />
                <input
                  type="text"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  className="w-full bg-transparent outline-hidden"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateCleanRoute}
              disabled={isCalculatingRoute}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#35BFAE]" />
              <span>{isCalculatingRoute ? "Analyzing Real-Time Plumes..." : "Find Cleanest Access Route"}</span>
            </button>
          </div>

          {selectedCorridor && (
            <div className="p-3.5 rounded-xl bg-[#E9F7F1] border border-[#16866B] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#16866B] uppercase tracking-wider">
                  OPTIMAL ACCESS CORRIDOR FOUND
                </span>
                <span className="text-xs font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-md">
                  {selectedCorridor.avgAqi} AQI Average
                </span>
              </div>
              <div className="text-xs font-black text-[#26332F]">{selectedCorridor.name}</div>
              <p className="text-[11px] text-[#556963]">{selectedCorridor.description}</p>
              <div className="flex items-center gap-4 text-xs font-bold text-[#26332F] pt-1">
                <span>📏 {selectedCorridor.distanceKm} km</span>
                <span>⏱️ {selectedCorridor.durationMinutes} mins transit</span>
                <span className="text-emerald-800 font-black">🛡️ {selectedCorridor.safetyScore}% Safe</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
