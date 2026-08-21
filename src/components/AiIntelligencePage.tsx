import React, { useState } from "react";
import {
  Activity,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  MapPin,
  Wind,
  Gauge,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Clock,
  Layers,
  ChevronRight,
  Send,
  Zap,
  Volume2,
} from "lucide-react";
import { Incident, LanguageCode } from "../types";
import { AudioPlayerBar } from "./AudioPlayerBar";

interface AiIntelligencePageProps {
  incidents: Incident[];
  featuredIncident: Incident;
  onSelectFeatured: (incident: Incident) => void;
  onOpenSimulateModal: () => void;
  onNavigateToMap: (incident?: Incident) => void;
  onNavigateToGovernment: (incident?: Incident) => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const AiIntelligencePage: React.FC<AiIntelligencePageProps> = ({
  incidents,
  featuredIncident,
  onSelectFeatured,
  onOpenSimulateModal,
  onNavigateToMap,
  onNavigateToGovernment,
  currentLanguage = "EN",
  onLanguageChange,
}) => {
  const [isGeneratingAiReasoning, setIsGeneratingAiReasoning] = useState(false);
  const [dynamicExplanation, setDynamicExplanation] = useState<string | null>(null);

  // Dynamic calculations
  const activeCount = incidents.filter((i) => i.status !== "Resolved").length;
  const criticalCount = incidents.filter((i) => i.severity === "Critical").length;
  const avgConfidence = Math.round(
    incidents.reduce((acc, curr) => acc + curr.confidence, 0) / (incidents.length || 1)
  );

  // Queue of other active incidents
  const reviewQueue = incidents
    .filter((i) => i.id !== featuredIncident.id && i.status !== "Resolved")
    .slice(0, 5);

  // Gemini dynamic AI reasoning trigger
  const handleRegenerateReasoning = async () => {
    setIsGeneratingAiReasoning(true);
    try {
      const res = await fetch("/api/gemini/explain-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incident: featuredIncident, language: currentLanguage }),
      });
      if (res.ok) {
        const data = await res.json();
        setDynamicExplanation(data.explanation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAiReasoning(false);
    }
  };

  const currentReasoning =
    dynamicExplanation ||
    featuredIncident.reasoning ||
    "Satellite imagery indicates a nearby thermal anomaly. Citizen image shows visible smoke. Local air-quality data indicates elevated particulate matter, and low wind may keep it concentrated.";

  return (
    <div id="ai-intelligence-page" className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Title & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#16866B] uppercase">
            AI VERIFICATION LAYER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#26332F] tracking-tight">
            Climate intelligence
          </h1>
          <p className="text-sm sm:text-base text-[#74817C] max-w-2xl font-normal leading-relaxed">
            Signals become decisions. Review verified incidents, understand why they matter, and
            route urgent alerts to the right team.
          </p>
        </div>

        {/* Simulate New Event Button */}
        <button
          id="simulate-new-event-btn"
          onClick={onOpenSimulateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E9F7F1] border border-[#16866B]/30 hover:bg-[#D8F1E7] text-[#16866B] text-xs font-bold transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#16866B]" />
          <span>Simulate new event</span>
        </button>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          id="stat-active-incidents"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-[#E9F7F1] text-[#16866B] flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">{activeCount}</div>
            <div className="text-xs font-medium text-[#26332F]">Active incidents</div>
            <div className="text-[11px] text-[#16866B] font-semibold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> ↑ 3 this morning
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div
          id="stat-critical-priority"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">
              {criticalCount < 10 ? `0${criticalCount}` : criticalCount}
            </div>
            <div className="text-xs font-medium text-[#26332F]">Critical priority</div>
            <div className="text-[11px] text-red-600 font-semibold mt-0.5">Needs attention</div>
          </div>
        </div>

        {/* Card 3 */}
        <div
          id="stat-ai-confidence"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">{avgConfidence}%</div>
            <div className="text-xs font-medium text-[#26332F]">AI confidence</div>
            <div className="text-[11px] text-[#74817C] mt-0.5">Across active reports</div>
          </div>
        </div>

        {/* Card 4 */}
        <div
          id="stat-citizens-nearby"
          className="bg-white rounded-2xl p-5 border border-[#E3E8E5] shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#26332F]">4.8k</div>
            <div className="text-xs font-medium text-[#26332F]">Citizens nearby</div>
            <div className="text-[11px] text-[#74817C] mt-0.5">Within alert zones</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Featured Incident on Left (8 cols), Queue on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Featured Incident Card */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#E3E8E5] shadow-xs space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#16866B] uppercase">
                FEATURED INCIDENT
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#26332F] font-mono tracking-tight">
                {featuredIncident.id}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              ● {featuredIncident.severity}
            </span>
          </div>

          {/* Quick Telemetry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8FAF9] border border-[#E3E8E5]">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#16866B] shrink-0" />
              <div>
                <div className="text-[10px] text-[#74817C] uppercase font-bold">Location</div>
                <div className="text-xs font-bold text-[#26332F] truncate">
                  {featuredIncident.location}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Wind className="w-4 h-4 text-[#35BFAE] shrink-0" />
              <div>
                <div className="text-[10px] text-[#74817C] uppercase font-bold">Weather</div>
                <div className="text-xs font-bold text-[#26332F] truncate">
                  {featuredIncident.weather}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <div className="text-[10px] text-[#74817C] uppercase font-bold">Sensor AQI</div>
                <div className="text-xs font-extrabold text-[#26332F]">
                  {featuredIncident.aqi}{" "}
                  <span className="text-[10px] font-normal text-red-600">
                    ({featuredIncident.aqi > 250 ? "Severe" : "Unhealthy"})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal AI Verification Workflow */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold tracking-wider text-[#556963] uppercase">
              Verification Workflow
            </span>
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-[620px]">
                {[
                  { label: "Citizen report", done: true },
                  { label: "Image AI", done: true },
                  { label: "GPS check", done: true },
                  { label: "Satellite", done: true },
                  { label: "Sensor data", done: true },
                  { label: "Risk score", done: true },
                ].map((step, idx, arr) => (
                  <React.Fragment key={step.label}>
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E9F7F1] border border-[#CDEEE1] text-xs font-semibold text-[#16866B] shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16866B]" />
                      <span>{step.label}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <span className="text-[#A1C2BC] font-bold text-xs shrink-0">→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Why is this high priority? Card */}
          <div className="p-5 rounded-xl bg-[#FAFBF9] border border-[#D8E4DF] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#26332F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16866B]" />
                Why is this high priority?
              </h3>
              <button
                type="button"
                onClick={handleRegenerateReasoning}
                disabled={isGeneratingAiReasoning}
                className="text-[11px] font-semibold text-[#16866B] hover:underline flex items-center gap-1"
                title="Query Gemini for fresh environmental rationale"
              >
                <RotateCw
                  className={`w-3 h-3 ${isGeneratingAiReasoning ? "animate-spin" : ""}`}
                />
                {isGeneratingAiReasoning ? "Analyzing..." : "Re-evaluate with Gemini"}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#475450] leading-relaxed italic bg-white p-3.5 rounded-lg border border-[#E3E8E5]">
              "{currentReasoning}"
            </p>

            {/* AI Voice Playback in User's Preferred Language */}
            <AudioPlayerBar
              textToSpeak={`AI Priority Breakdown: ${currentReasoning}. Recommended Action: ${featuredIncident.recommendedAction || "Immediate dispatch"}.`}
              currentLanguage={currentLanguage}
              title="Listen to AI Environmental Rationale"
              onLanguageChange={onLanguageChange}
            />

            {/* Environmental Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-white border border-[#E3E8E5]">
                <div className="text-[10px] text-[#74817C] uppercase font-bold">Primary Agent</div>
                <div className="text-xs font-extrabold text-[#26332F]">
                  {featuredIncident.primaryPollutant || "PM2.5"}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E3E8E5]">
                <div className="text-[10px] text-[#74817C] uppercase font-bold">Dispersion</div>
                <div className="text-xs font-extrabold text-amber-600">
                  {featuredIncident.dispersionRisk || "High Risk"}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E3E8E5]">
                <div className="text-[10px] text-[#74817C] uppercase font-bold">AI Match</div>
                <div className="text-xs font-extrabold text-[#16866B]">
                  {featuredIncident.confidence}% confidence
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E3E8E5]">
                <div className="text-[10px] text-[#74817C] uppercase font-bold">Status</div>
                <div className="text-xs font-extrabold text-[#16866B]">
                  {featuredIncident.status}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Authority & Action Protocol */}
          <div className="p-4 rounded-xl bg-[#F0F7F4] border border-[#CDEEE1] space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#16866B]" />
              <span className="text-xs font-bold text-[#123C35]">
                Recommended Authority & Protocol:
              </span>
            </div>
            <p className="text-xs text-[#26332F] font-medium leading-normal">
              <strong>{featuredIncident.recommendedAuthority}</strong> —{" "}
              {featuredIncident.recommendedAction}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToGovernment(featuredIncident)}
              className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-[#16866B] hover:bg-[#126F58] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Send className="w-4 h-4" />
              <span>Route Alert to Government Desk →</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToMap(featuredIncident)}
              className="py-3 px-5 rounded-xl bg-white border border-[#D5DDD9] hover:bg-[#F8FAF9] text-[#26332F] font-semibold text-xs transition flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-[#16866B]" />
              <span>Inspect on Live Map</span>
            </button>
          </div>
        </div>

        {/* Right 4 Columns: Reports to Review Queue */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E3E8E5] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#16866B] uppercase">
                INCOMING QUEUE
              </span>
              <h3 className="text-lg font-bold text-[#26332F]">Reports to review</h3>
            </div>
            <span className="text-xs font-bold text-[#74817C]">{reviewQueue.length} active</span>
          </div>

          {/* Queue List */}
          <div className="space-y-2.5">
            {reviewQueue.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectFeatured(item)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                  featuredIncident.id === item.id
                    ? "bg-[#E9F7F1] border-[#16866B] shadow-xs"
                    : "bg-[#FAFAF8] border-[#E3E8E5] hover:bg-white hover:border-[#BED6CD]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      item.severity === "Critical"
                        ? "bg-red-500 ring-2 ring-red-200 animate-pulse"
                        : item.severity === "High"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#26332F] group-hover:text-[#16866B] transition">
                      {item.type}
                    </h4>
                    <p className="text-[11px] text-[#74817C] truncate max-w-[150px]">
                      {item.location}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#16866B]">{item.confidence}%</div>
                  <div className="text-[10px] text-[#74817C]">confidence</div>
                </div>
              </div>
            ))}

            {reviewQueue.length === 0 && (
              <div className="text-center py-8 text-xs text-[#74817C]">
                All incoming signals currently verified.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
