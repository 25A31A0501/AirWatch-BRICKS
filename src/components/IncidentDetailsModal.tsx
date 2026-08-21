import React from "react";
import {
  X,
  MapPin,
  Wind,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck,
  Calendar,
  Share2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Incident, IncidentStatus, LanguageCode } from "../types";
import { AudioPlayerBar } from "./AudioPlayerBar";

interface IncidentDetailsModalProps {
  incident: Incident | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus) => void;
  onNavigateToMap: (incident: Incident) => void;
  onNavigateToIntelligence: (incident: Incident) => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onNavigateToMap,
  onNavigateToIntelligence,
  currentLanguage = "EN",
  onLanguageChange,
}) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-[#E3E8E5] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#F0F3F1] pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold tracking-widest text-[#16866B] uppercase">
                INCIDENT AUDIT LOG
              </span>
              <span className="text-[10px] text-[#74817C]">· {incident.reportedAt}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#26332F] font-mono tracking-tight">
              {incident.id}
            </h2>
            <p className="text-xs font-semibold text-[#16866B]">{incident.type}</p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                incident.severity === "Critical"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : incident.severity === "High"
                  ? "bg-amber-50 text-amber-600 border border-amber-200"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
              }`}
            >
              ● {incident.severity}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#74817C] hover:text-[#26332F] text-lg font-bold cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Player Bar in preferred language */}
        <AudioPlayerBar
          compact
          textToSpeak={`Incident ${incident.id} in ${incident.location}. Classification: ${incident.type} with ${incident.aqi} AQI. Priority level: ${incident.severity}. Recommended protocol: ${incident.recommendedAction || "Dispatch field team"}.`}
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />

        {/* Visual Snapshot & Ground Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {incident.imageUrl && (
            <div className="relative h-44 rounded-xl overflow-hidden border border-[#E3E8E5]">
              <img
                src={incident.imageUrl}
                alt={incident.type}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-sm font-semibold">
                Citizen Optical Evidence Verified
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E3E8E5] flex flex-col justify-between space-y-3">
            <div>
              <span className="text-[10px] font-bold text-[#74817C] uppercase">
                Citizen Ground Report:
              </span>
              <p className="text-xs text-[#26332F] leading-relaxed mt-1 font-medium">
                "{incident.description}"
              </p>
            </div>

            <div className="pt-2 border-t border-[#E3E8E5] text-[11px] text-[#74817C] flex items-center justify-between">
              <span>Coordinates:</span>
              <span className="font-mono text-[#26332F] font-semibold">
                {incident.latitude.toFixed(3)}° N, {incident.longitude.toFixed(3)}° E
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E3E8E5]">
            <div className="text-[10px] font-bold text-[#74817C] uppercase">AQI Hotspot</div>
            <div className="text-sm font-extrabold text-[#26332F] mt-0.5">{incident.aqi} AQI</div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E3E8E5]">
            <div className="text-[10px] font-bold text-[#74817C] uppercase">AI Confidence</div>
            <div className="text-sm font-extrabold text-[#16866B] mt-0.5">
              {incident.confidence}% Match
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E3E8E5]">
            <div className="text-[10px] font-bold text-[#74817C] uppercase">Weather Flow</div>
            <div className="text-xs font-bold text-[#26332F] mt-0.5">{incident.weather}</div>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E3E8E5]">
            <div className="text-[10px] font-bold text-[#74817C] uppercase">Current Status</div>
            <div className="text-xs font-bold text-[#16866B] mt-0.5">{incident.status}</div>
          </div>
        </div>

        {/* AI Scientific Rationale */}
        <div className="p-4 rounded-xl bg-[#FAFBF9] border border-[#D8E4DF] space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16866B]" />
            <span className="text-xs font-bold text-[#26332F]">AI Verification Rationale:</span>
          </div>
          <p className="text-xs text-[#475450] leading-relaxed italic">"{incident.reasoning}"</p>
        </div>

        {/* Assigned Team & Directives */}
        <div className="p-4 rounded-xl bg-[#F0F7F4] border border-[#CDEEE1] space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#16866B]" />
            <span className="text-xs font-bold text-[#123C35]">Assigned Team & Directive:</span>
          </div>
          <p className="text-xs text-[#26332F] font-semibold">
            {incident.assignedTeam || "Awaiting Government Dispatch"}
          </p>
          <p className="text-[11px] text-[#556963]">{incident.recommendedAction}</p>
        </div>

        {/* Status Lifecycle Stepper */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold tracking-wider text-[#556963] uppercase">
            Update Incident Lifecycle:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["New", "Investigating", "Response deployed", "Resolved"] as IncidentStatus[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStatus(incident.id, st)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    incident.status === st
                      ? "bg-[#16866B] text-white border-[#16866B]"
                      : "bg-[#FAFAF8] text-[#556963] border-[#D5DDD9] hover:bg-[#E9F7F1]"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0F3F1]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToMap(incident);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDD9] hover:bg-[#F8FAF9] text-xs font-semibold text-[#26332F] flex items-center gap-1.5 cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#16866B]" />
              <span>Locate on Map</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToIntelligence(incident);
              }}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDD9] hover:bg-[#F8FAF9] text-xs font-semibold text-[#26332F] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#16866B]" />
              <span>AI Intelligence</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#16866B] text-white text-xs font-bold hover:bg-[#126F58] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
