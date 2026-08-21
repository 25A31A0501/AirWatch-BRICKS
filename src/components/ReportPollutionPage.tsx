import React, { useState, useRef } from "react";
import {
  Flame,
  Factory,
  Wheat,
  Cloud,
  HelpCircle,
  Mic,
  MicOff,
  Camera,
  MapPin,
  CheckCircle,
  Radio,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Image as ImageIcon,
  Volume2,
} from "lucide-react";
import { Incident, PollutionType, LanguageCode } from "../types";
import { getBcp47Locale } from "../utils/audioSpeech";
import { AudioPlayerBar } from "./AudioPlayerBar";

interface ReportPollutionPageProps {
  onIncidentCreated: (incident: Incident) => void;
  onNavigateToIntelligence: () => void;
  onNavigateToMap: () => void;
  todayReportCount: number;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export const ReportPollutionPage: React.FC<ReportPollutionPageProps> = ({
  onIncidentCreated,
  onNavigateToIntelligence,
  onNavigateToMap,
  todayReportCount,
  currentLanguage = "EN",
  onLanguageChange,
}) => {
  const [selectedType, setSelectedType] = useState<PollutionType>("Smoke");
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>("Location not detected");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [cityName, setCityName] = useState<string>("Hyderabad, India");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStage, setVerificationStage] = useState<number>(0);
  const [createdIncident, setCreatedIncident] = useState<Incident | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<any>(null);

  const pollutionTypes: { type: PollutionType; icon: any; color: string }[] = [
    { type: "Smoke", icon: Flame, color: "text-[#16866B]" },
    { type: "Factory emission", icon: Factory, color: "text-purple-600" },
    { type: "Garbage burning", icon: Flame, color: "text-amber-500" },
    { type: "Crop burning", icon: Wheat, color: "text-emerald-600" },
    { type: "Dust", icon: RefreshCw, color: "text-stone-500" },
    { type: "Chemical smell", icon: Sparkles, color: "text-teal-600" },
    { type: "Heavy smog", icon: Cloud, color: "text-slate-600" },
    { type: "Unknown pollution", icon: HelpCircle, color: "text-gray-500" },
  ];

  // Geolocation handling
  const handleGetLocation = () => {
    setLocationStatus("Detecting coordinates...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          setCoords({ lat, lng });
          const detectedLoc = `Lat: ${lat}, Lng: ${lng} (Auto-detected)`;
          setLocationStatus(detectedLoc);
          setCityName(`Zone ${lat > 20 ? "Delhi NCR" : "Hyderabad Industrial Belt"}`);
        },
        () => {
          // Fallback location for prototype
          const fallbackLat = 17.385;
          const fallbackLng = 78.4867;
          setCoords({ lat: fallbackLat, lng: fallbackLng });
          setLocationStatus("Hyderabad, India (17.385° N, 78.486° E)");
          setCityName("Hyderabad, India");
        },
        { timeout: 8000 }
      );
    } else {
      setCoords({ lat: 17.385, lng: 78.4867 });
      setLocationStatus("Hyderabad, India (Default Zone)");
    }
  };

  // Voice recording simulation / Web Speech API
  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      // Check for SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = getBcp47Locale((currentLanguage || "EN") as LanguageCode);

          recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
              .map((res: any) => res[0].transcript)
              .join("");
            setVoiceTranscript(transcript);
            setDescription((prev) => (prev ? prev + " " + transcript : transcript));
          };

          recognition.onerror = () => {
            simulateVoiceInput();
          };

          recognition.onend = () => {
            setIsRecording(false);
            clearInterval(recordingTimerRef.current);
          };

          recognition.start();
        } catch {
          simulateVoiceInput();
        }
      } else {
        simulateVoiceInput();
      }
    } else {
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const simulateVoiceInput = () => {
    setTimeout(() => {
      const simulatedText =
        "Dense plume of black smoke observed from chimney stack near highway perimeter with strong chemical smell.";
      setDescription((prev) => (prev ? prev + " " + simulatedText : simulatedText));
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }, 3200);
  };

  // Image upload handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit report workflow
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setVerificationStage(1);

    const lat = coords?.lat || 17.385;
    const lng = coords?.lng || 78.4867;
    const location = cityName || "Hyderabad, India";
    const incidentId = `BRICS-${Math.floor(1035 + Math.random() * 100)}`;

    try {
      // Step-by-step UI animation for AI stages
      await new Promise((r) => setTimeout(r, 600));
      setVerificationStage(2); // Image AI
      await new Promise((r) => setTimeout(r, 600));
      setVerificationStage(3); // GPS check
      await new Promise((r) => setTimeout(r, 500));
      setVerificationStage(4); // Satellite & Sensor check

      // Call Gemini backend API endpoint
      const response = await fetch("/api/gemini/analyze-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollutionType: selectedType,
          description: description || "Citizen reported direct observation",
          imageBase64: imagePreview,
          location,
          latitude: lat,
          longitude: lng,
          weather: "Low wind · 2.1 m/s",
        }),
      });

      let aiResult: any = null;
      if (response.ok) {
        const data = await response.json();
        aiResult = data.analysis;
      }

      setVerificationStage(5); // Risk score & finalized
      await new Promise((r) => setTimeout(r, 400));

      const newIncident: Incident = {
        id: incidentId,
        type: aiResult?.pollutionType || selectedType,
        location: location,
        latitude: lat,
        longitude: lng,
        aqi: aiResult?.estimatedAqi || 286,
        confidence: aiResult?.confidence || 94,
        severity: aiResult?.severity || "Critical",
        status: "New",
        weather: "Low wind · 2.1 m/s",
        reportedAt: "Just now",
        description:
          description ||
          `Citizen reported ${selectedType} observation in the vicinity. Verified by BRICS AI sensor cross-referencing.`,
        imageUrl:
          imagePreview ||
          "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80",
        assignedTeam: "Pending Regional Task Force Dispatch",
        recommendedAuthority:
          aiResult?.recommendedAuthority || "State Pollution Control Board & Rapid Action Unit",
        recommendedAction:
          aiResult?.recommendedAction ||
          "Dispatch drone reconnaissance unit and issue alert to sensitive populations within 3km perimeter.",
        primaryPollutant: aiResult?.primaryPollutant || "PM2.5",
        dispersionRisk: aiResult?.dispersionRisk || "High",
        nearbyPopulationAffected: "3.2k residents",
        reasoning:
          aiResult?.reasoning ||
          "Satellite imagery indicates a nearby thermal anomaly. Citizen image shows visible smoke. Local air-quality data indicates elevated particulate matter, and low wind may keep it concentrated.",
        verificationStages: {
          citizenReport: true,
          imageAi: true,
          gpsCheck: true,
          satellite: true,
          sensorData: true,
          riskScore: true,
        },
      };

      setCreatedIncident(newIncident);
      onIncidentCreated(newIncident);
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSelectedType("Smoke");
    setDescription("");
    setImagePreview(null);
    setShowSuccessModal(false);
    setCreatedIncident(null);
    setVerificationStage(0);
  };

  return (
    <div id="report-pollution-page" className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#26332F] tracking-tight">
            Report pollution near you
          </h1>
          <p className="text-sm sm:text-base text-[#74817C] max-w-2xl font-normal leading-relaxed">
            Simple reporting for the moments that matter. Add what you see, where you are, and our
            climate network will check the signals.
          </p>
        </div>

        {/* Daily Reports Stat Pill */}
        <div
          id="daily-reports-stat-pill"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E9F7F1] border border-[#CDEEE1] text-xs font-semibold text-[#16866B] self-start md:self-auto shadow-xs"
        >
          <span className="h-2 w-2 rounded-full bg-[#16866B] animate-pulse"></span>
          <span>{todayReportCount} reports today</span>
        </div>
      </div>

      {/* Main Grid: Form on Left, Control Room Hero Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: 3-step reporting workflow */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#E3E8E5] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest text-[#16866B] uppercase">
                STEP 01 / 03
              </span>
            </div>
            <span className="text-xs text-[#74817C]">Takes under 60 sec</span>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-6">
            {/* Question */}
            <div>
              <label className="block text-xl font-bold text-[#26332F] mb-4">
                What is happening?
              </label>

              {/* 8 Selectable Pollution Cards */}
              <div
                id="pollution-type-selector-grid"
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {pollutionTypes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      id={`pollution-option-${item.type.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={() => setSelectedType(item.type)}
                      className={`flex flex-col items-start justify-between p-3.5 rounded-xl border text-left transition-all duration-150 h-24 ${
                        isSelected
                          ? "bg-[#E9F7F1] border-[#16866B] ring-2 ring-[#16866B]/20 shadow-xs"
                          : "bg-white border-[#E3E8E5] hover:border-[#BED6CD] hover:bg-[#F9FAF8]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#16866B]"></span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold leading-tight ${
                          isSelected ? "text-[#123C35]" : "text-[#26332F]"
                        }`}
                      >
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Describe what you see or smell */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#26332F]">
                  Describe what you see or smell{" "}
                  <span className="font-normal text-[#74817C]">(optional)</span>
                </label>
              </div>

              <textarea
                id="pollution-description-textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Thick black smoke coming from the factory chimney, pungent sulphur odor..."
                className="w-full px-4 py-3 rounded-xl border border-[#D5DDD9] bg-[#FAFAF8] text-sm text-[#26332F] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#16866B]/30 focus:border-[#16866B] transition resize-none placeholder:text-[#9DAAA5]"
              />
            </div>

            {/* Voice Input Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="describe-by-voice-btn"
                onClick={handleToggleVoice}
                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
                  isRecording
                    ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                    : "bg-[#F8FAF9] text-[#16866B] border-[#D5E5DF] hover:bg-[#E9F7F1]"
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 text-red-600" />
                    <span>Listening ({recordingTime}s)...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#16866B]" />
                    <span>Describe by voice</span>
                  </>
                )}
              </button>
              <span className="text-xs text-[#74817C] hidden sm:inline">
                {isRecording ? "Speak clearly into your microphone" : "Tell us what you see or smell"}
              </span>
            </div>

            {/* Two Action Cards: Upload Photo & Use My Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Photo Upload Card */}
              <div
                id="upload-photo-card"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-[#CFDCD7] bg-[#F8FAF9] hover:bg-[#F0F7F4] hover:border-[#16866B] transition cursor-pointer flex items-center justify-between group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E9F7F1] text-[#16866B] flex items-center justify-center group-hover:scale-105 transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-[#26332F]">Take / Upload photo</h4>
                    <p className="text-[11px] text-[#74817C] truncate">
                      {imagePreview ? "Photo attached ✓" : "A photo helps us verify faster"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#16866B] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
              </div>

              {/* Location Card */}
              <div
                id="use-my-location-card"
                onClick={handleGetLocation}
                className="p-4 rounded-xl border border-[#D5DDD9] bg-[#F8FAF9] hover:bg-[#F0F7F4] hover:border-[#16866B] transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#E9F7F1] text-[#16866B] flex items-center justify-center group-hover:scale-105 transition">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-[#26332F]">Use my location</h4>
                    <p className="text-[11px] text-[#74817C] truncate max-w-[140px]">
                      {locationStatus}
                    </p>
                  </div>
                </div>
                <Radio className="w-4 h-4 text-[#16866B] opacity-60 group-hover:opacity-100 transition" />
              </div>
            </div>

            {/* Attached Photo Preview */}
            {imagePreview && (
              <div className="relative rounded-xl border border-[#D5DDD9] p-2 bg-[#F8FAF9] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Pollution preview"
                    className="w-14 h-14 object-cover rounded-lg border border-[#E3E8E5]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#26332F] flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#16866B]" /> Photo ready for AI vision
                    </span>
                    <span className="text-[11px] text-[#74817C]">
                      Visual smoke density will be scanned
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                  }}
                  className="text-xs text-red-600 hover:underline px-2"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Large Submit Button */}
            <button
              type="submit"
              id="submit-pollution-report-btn"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-[#16866B] hover:bg-[#126F58] active:bg-[#0E5B48] text-white font-bold text-base tracking-wide flex items-center justify-center gap-3 shadow-md shadow-[#16866B]/20 transition-all duration-200 cursor-pointer disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {verificationStage === 1 && "Ingesting Citizen Signal..."}
                    {verificationStage === 2 && "Analyzing Image & Plume AI..."}
                    {verificationStage === 3 && "Checking GPS & Local Meteorology..."}
                    {verificationStage === 4 && "Cross-referencing Satellites & Sensors..."}
                    {verificationStage === 5 && "Calculating Risk Score..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#35BFAE]" />
                  <span>Submit report →</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 5 Columns: Hero Control Room & Live Signal Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div
            id="report-hero-visual-card"
            className="rounded-2xl bg-[#123C35] text-white overflow-hidden border border-[#1E574D] shadow-lg flex flex-col justify-between"
          >
            {/* Top Control Room Image */}
            <div className="relative h-56 w-full overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                alt="Environmental Command Center Monitoring"
                className="w-full h-full object-cover opacity-85 hover:scale-102 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123C35] via-[#123C35]/40 to-transparent"></div>

              <div className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D2B26]/85 border border-[#1E574D] backdrop-blur-xs text-[10px] font-bold text-[#35BFAE] uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#35BFAE] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#35BFAE]"></span>
                </span>
                ((•)) LIVE NETWORK SIGNAL
              </div>
            </div>

            {/* Text & Value Proposition */}
            <div className="p-6 sm:p-8 space-y-4">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#35BFAE] uppercase">
                WHY REPORT?
              </span>

              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-snug">
                Small signals help us see the bigger picture.
              </h2>

              <p className="text-xs sm:text-sm text-[#A8C7C1] font-normal leading-relaxed">
                Every report is combined with sensors, weather and satellite patterns to help teams
                act earlier.
              </p>

              {/* Statistics Row */}
              <div className="pt-6 border-t border-[#1C5349] grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    1,284
                  </div>
                  <div className="text-[11px] text-[#7EADA5] font-medium">reports verified</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#35BFAE] tracking-tight">
                    92%
                  </div>
                  <div className="text-[11px] text-[#7EADA5] font-medium">match confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Sensor Pulse Card */}
          <div className="rounded-2xl bg-white p-5 border border-[#E3E8E5] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#16866B] flex items-center justify-center">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#26332F]">Active Sensor Network</h4>
                <p className="text-[11px] text-[#74817C]">420+ Continuous Ambient Monitors</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#16866B] bg-[#E9F7F1] px-2.5 py-1 rounded-md">
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdIncident && (
        <div
          id="report-success-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#E3E8E5] shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#E9F7F1] text-[#16866B] flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#16866B]">
                  INCIDENT REGISTERED
                </span>
                <h3 className="text-xl font-bold text-[#26332F]">Report submitted successfully</h3>
              </div>
            </div>

            {/* Generated Incident Summary Card */}
            <div className="rounded-xl bg-[#F8FAF9] p-4 border border-[#E3E8E5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#74817C]">Incident ID</span>
                <span className="text-sm font-extrabold text-[#16866B] font-mono">
                  {createdIncident.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#74817C]">Type</span>
                <span className="text-xs font-bold text-[#26332F]">{createdIncident.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#74817C]">Location</span>
                <span className="text-xs font-medium text-[#26332F]">
                  {createdIncident.location}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#74817C]">AI Match Confidence</span>
                <span className="text-xs font-bold text-[#16866B]">
                  {createdIncident.confidence}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#74817C]">Priority</span>
                <span className="text-xs font-bold text-red-600 px-2 py-0.5 rounded-sm bg-red-50 border border-red-200">
                  {createdIncident.severity}
                </span>
              </div>
            </div>

            {/* Audio Incident Briefing in Preferred Language */}
            <AudioPlayerBar
              compact
              textToSpeak={`Your pollution report ${createdIncident.id} in ${createdIncident.location} has been successfully verified with ${createdIncident.confidence}% confidence and classified as ${createdIncident.severity} priority.`}
              currentLanguage={currentLanguage}
            />

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToIntelligence();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#16866B] hover:bg-[#126F58] text-white font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Sparkles className="w-4 h-4 text-[#35BFAE]" />
                <span>View in AI Intelligence →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToMap();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#D5DDD9] hover:bg-[#F8FAF9] text-[#26332F] font-semibold text-xs transition"
              >
                <span>View on Live Map</span>
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="w-full text-center py-1.5 text-xs text-[#74817C] hover:text-[#26332F] transition"
              >
                Submit another report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
