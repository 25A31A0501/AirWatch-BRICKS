export type PollutionType =
  | "Smoke"
  | "Factory emission"
  | "Garbage burning"
  | "Crop burning"
  | "Dust"
  | "Chemical smell"
  | "Heavy smog"
  | "Unknown pollution";

export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical";
export type IncidentStatus = "New" | "Investigating" | "Response deployed" | "Resolved";

export type LanguageCode = "EN" | "HI" | "TE" | "TA" | "PT" | "RU" | "ZH" | "ES" | "AR";

export interface LanguageInfo {
  code: LanguageCode;
  label: string;
  nativeName: string;
  flag: string;
  bcp47: string;
  greeting: string;
  samplePrompt: string;
}

export interface Incident {
  id: string;
  type: string;
  location: string;
  latitude: number;
  longitude: number;
  aqi: number;
  confidence: number;
  severity: SeverityLevel;
  status: IncidentStatus;
  weather: string;
  reportedAt: string;
  description: string;
  imageUrl?: string;
  assignedTeam?: string;
  recommendedAuthority?: string;
  recommendedAction?: string;
  primaryPollutant?: string;
  dispersionRisk?: string;
  reasoning?: string;
  verificationStages?: {
    citizenReport: boolean;
    imageAi: boolean;
    gpsCheck: boolean;
    satellite: boolean;
    sensorData: boolean;
    riskScore: boolean;
  };
  nearbyPopulationAffected?: string;
}

export interface SensorStation {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  aqi: number;
  pm25: number;
  pm10: number;
  so2: number;
  no2: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  status: "Online" | "Calibrating" | "High Alert";
  lastUpdated: string;
}

export interface SafeRoutePoint {
  lat: number;
  lng: number;
  name: string;
  avgAqi: number;
}

export interface SafeRouteOption {
  id: string;
  name: string;
  distanceKm: number;
  estimatedMinutes: number;
  avgAqi: number;
  exposureRisk: "Minimal" | "Moderate" | "Severe";
  waypoints: [number, number][];
  cleanAirIndex: number;
}

export interface EvacuationShelter {
  id: string;
  name: string;
  type: "Municipal Clean Air Center" | "Hospital Triage Air Hub" | "Underground Filtration Shelter" | "Eco Botanical Clean Haven";
  city: string;
  latitude: number;
  longitude: number;
  indoorAqi: number;
  capacity: number;
  occupied: number;
  filtrationGrade: string; // e.g. "HEPA H14 / Positive Pressure"
  hasOxygenSupply: boolean;
  hasMedicalStaff: boolean;
  hasFreeRespirators: boolean;
  address: string;
  emergencyPhone: string;
  status: "Open & Accepting" | "Near Capacity" | "Full";
}

export interface EvacuationNavigationStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  durationMinutes: number;
  airQualityStatus: "Clean Air Corridor" | "Low Exposure" | "Caution Zone";
  waypoint: [number, number];
}

export interface ClimateAction {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: string;
  impactScore: string;
  steps: string[];
  tips: string[];
  hotline?: string;
}

export interface RealTimeAccessZone {
  id: string;
  name: string;
  zoneType: "Commercial" | "Residential" | "Transit Hub" | "Green Corridor" | "Industrial Perimeter" | "Educational Zone";
  city: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  aqi: number;
  pm25: number;
  accessStatus: "Open Access" | "Caution (Mask Required)" | "Restricted Transit" | "Hazard Closed";
  accessibilityScore: number; // 0 - 100%
  activeAdvisory: string;
  recommendedMode: "Walking & Cycling" | "Filtered Transit / Vehicle" | "Emergency Bypass Only";
  trafficFlow: "Smooth" | "Moderate" | "Congested";
  lastChecked: string;
}

export interface RealTimeAccessCorridor {
  id: string;
  name: string;
  city: string;
  fromLabel: string;
  toLabel: string;
  distanceKm: number;
  durationMinutes: number;
  avgAqi: number;
  cleanAirRating: "High Cleanliness" | "Moderate Filter" | "Polluted Corridor";
  accessStatus: "Full Access" | "Caution" | "Avoid";
  safetyScore: number;
  transitOptions: ("walk" | "bike" | "transit" | "car")[];
  waypoints: [number, number][];
  description: string;
}

export interface VerificationProgress {
  step: number;
  title: string;
  isComplete: boolean;
}

