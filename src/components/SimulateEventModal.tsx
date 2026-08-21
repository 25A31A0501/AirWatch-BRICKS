import React, { useState } from "react";
import { Sparkles, Flame, Factory, Wheat, Wind, MapPin, X, Loader2 } from "lucide-react";
import { Incident } from "../types";

interface SimulateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateIncident: (incident: Incident) => void;
}

export const SimulateEventModal: React.FC<SimulateEventModalProps> = ({
  isOpen,
  onClose,
  onSimulateIncident,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const simulationPresets = [
    {
      type: "Factory emission",
      location: "Balanagar Industrial Corridor, Hyderabad",
      lat: 17.47,
      lng: 78.44,
      aqi: 312,
      severity: "Critical" as const,
      weather: "Stagnant · 1.5 m/s",
      description: "Severe toxic emission from chemical solvent unit detected by nocturnal IR sensor telemetry.",
      primaryPollutant: "VOCs & PM2.5",
      imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80",
    },
    {
      type: "Crop burning",
      location: "Karnal Agriculture Tract, Haryana",
      lat: 29.6857,
      lng: 76.9905,
      aqi: 388,
      severity: "Critical" as const,
      weather: "North-Westerly · 2.8 m/s",
      description: "Multi-cluster paddy stubble burning thermal anomaly detected via Sentinel-3.",
      primaryPollutant: "PM10 & Carbon",
      imageUrl: "https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=800&q=80",
    },
    {
      type: "Industrial smoke",
      location: "Cubatao Industrial Belt, São Paulo",
      lat: -23.89,
      lng: -46.42,
      aqi: 275,
      severity: "Critical" as const,
      weather: "Coastal breeze · 3.2 m/s",
      description: "Refinery catalytic cracker unburned particulate release.",
      primaryPollutant: "SO2",
      imageUrl: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80",
    },
    {
      type: "Garbage burning",
      location: "Ghazipur Perimeter, Delhi",
      lat: 28.6258,
      lng: 77.3298,
      aqi: 295,
      severity: "High" as const,
      weather: "Low wind · 1.9 m/s",
      description: "Surface landfill smoldering triggering automated optical smoke alarms.",
      primaryPollutant: "PM2.5 & Dioxins",
      imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const handleSimulate = async () => {
    setIsProcessing(true);
    const preset = simulationPresets[selectedTemplate];
    const newId = `BRICS-${Math.floor(1040 + Math.random() * 80)}`;

    await new Promise((r) => setTimeout(r, 800));

    const simulatedIncident: Incident = {
      id: newId,
      type: preset.type,
      location: preset.location,
      latitude: preset.lat,
      longitude: preset.lng,
      aqi: preset.aqi,
      confidence: Math.floor(92 + Math.random() * 7),
      severity: preset.severity,
      status: "New",
      weather: preset.weather,
      reportedAt: "Just now",
      description: preset.description,
      imageUrl: preset.imageUrl,
      assignedTeam: "Pending Regional Task Force Dispatch",
      recommendedAuthority: "State Pollution Control Board & Rapid Action Unit",
      recommendedAction: "Deploy immediate reconnaissance drone and alert surrounding district hospital centers.",
      primaryPollutant: preset.primaryPollutant,
      dispersionRisk: "High",
      nearbyPopulationAffected: "14.5k residents",
      reasoning: `Thermal satellite detection combined with ground sensor spikes in ${preset.location} indicates urgent containment required.`,
      verificationStages: {
        citizenReport: true,
        imageAi: true,
        gpsCheck: true,
        satellite: true,
        sensorData: true,
        riskScore: true,
      },
    };

    onSimulateIncident(simulatedIncident);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E3E8E5] shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#16866B]" />
            <h3 className="text-lg font-bold text-[#26332F]">Simulate New Pollution Event</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#74817C] hover:text-[#26332F] text-lg font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#74817C]">
          Choose a scenario to test real-time AI classification, spatial triangulation on Live Map,
          and government response routing:
        </p>

        <div className="space-y-2.5">
          {simulationPresets.map((preset, index) => (
            <div
              key={preset.location}
              onClick={() => setSelectedTemplate(index)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedTemplate === index
                  ? "bg-[#E9F7F1] border-[#16866B] shadow-xs ring-1 ring-[#16866B]"
                  : "bg-[#FAFAF8] border-[#E3E8E5] hover:bg-white hover:border-[#BED6CD]"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#26332F]">{preset.type}</span>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-sm border border-red-200">
                    {preset.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#74817C] mt-0.5">{preset.location}</p>
              </div>

              <div className="text-right">
                <div className="text-xs font-extrabold text-[#26332F]">{preset.aqi} AQI</div>
                <div className="text-[10px] text-[#74817C]">{preset.weather}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#74817C] hover:bg-[#F8FAF9]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSimulate}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-[#16866B] hover:bg-[#126F58] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Signal...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#35BFAE]" />
                <span>Trigger Simulation Event →</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
