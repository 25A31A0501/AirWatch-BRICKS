import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapPin,
  Filter,
  Layers,
  Search,
  Sparkles,
  Gauge,
  Wind,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Factory,
  Radio,
  ExternalLink,
  ChevronRight,
  Crosshair,
  Compass,
  Navigation,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Activity,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Thermometer,
  Droplets,
  Route,
  RefreshCw,
  Globe,
  Share2,
  MousePointer,
  Home,
  Check,
  X,
} from "lucide-react";
import {
  Incident,
  SensorStation,
  SafeRouteOption,
  EvacuationShelter,
  EvacuationNavigationStep,
  RealTimeAccessZone,
  RealTimeAccessCorridor,
  LanguageCode,
} from "../types";
import {
  INITIAL_SENSOR_STATIONS,
  SAFE_CLEAN_AIR_ROUTES,
  EVACUATION_SHELTERS,
  INITIAL_REALTIME_ACCESS_ZONES,
  INITIAL_REALTIME_CORRIDORS,
  getNearbyAccessZones,
  calculateGeoDistanceKm,
  getNearestEvacuationShelters,
  generateEvacuationCorridor,
} from "../data/sensorStations";
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from "../data/languages";
import { AudioPlayerBar } from "./AudioPlayerBar";
import { EvacuationPanel } from "./EvacuationPanel";
import { RealTimeAccessPanel } from "./RealTimeAccessPanel";
import { GoogleLiveMapView } from "./GoogleLiveMapView";

interface LiveMapPageProps {
  incidents: Incident[];
  selectedIncident?: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onNavigateToGovernment: (incident: Incident) => void;
  onNavigateToIntelligence: (incident: Incident) => void;
  currentLanguage?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  onOpenAudioAssistant?: () => void;
}

export const LiveMapPage: React.FC<LiveMapPageProps> = ({
  incidents,
  selectedIncident: externalSelected,
  onSelectIncident,
  onNavigateToGovernment,
  onNavigateToIntelligence,
  currentLanguage = "EN",
  onLanguageChange,
  onOpenAudioAssistant,
}) => {
  // Check if Google Maps API key exists
  const apiKey =
    ((import.meta as unknown as { env: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";

  // Main View Mode: "access" (Real-Time Access Map) | "evacuation" | "monitoring"
  const [mapMode, setMapMode] = useState<"access" | "evacuation" | "monitoring">("access");

  // Map Engine: "google" (Google Maps Platform) | "osm" (Leaflet OpenStreetMap)
  const [mapEngine, setMapEngine] = useState<"google" | "osm">(apiKey ? "google" : "osm");

  const [filterType, setFilterType] = useState<string>("All");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    externalSelected || incidents[0] || null
  );
  const [selectedStation, setSelectedStation] = useState<SensorStation | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<SafeRouteOption | null>(null);

  // Real-Time Access Map States
  const [accessZones, setAccessZones] = useState<RealTimeAccessZone[]>(INITIAL_REALTIME_ACCESS_ZONES);
  const [selectedAccessZone, setSelectedAccessZone] = useState<RealTimeAccessZone | null>(INITIAL_REALTIME_ACCESS_ZONES[0]);
  const [accessCorridors, setAccessCorridors] = useState<RealTimeAccessCorridor[]>(INITIAL_REALTIME_CORRIDORS);
  const [selectedAccessCorridor, setSelectedAccessCorridor] = useState<RealTimeAccessCorridor | null>(INITIAL_REALTIME_CORRIDORS[0]);
  const [accessPanelTab, setAccessPanelTab] = useState<"corridors" | "zones" | "planner">("corridors");

  const [searchQuery, setSearchQuery] = useState("");
  const [mapLayer, setMapLayer] = useState<"standard" | "satellite" | "dark">("standard");

  // Live Map Telemetry
  const [isLiveTelemetryStreaming, setIsLiveTelemetryStreaming] = useState(true);
  const [liveStreamPings, setLiveStreamPings] = useState(1584);
  const [lastTelemetryTimestamp, setLastTelemetryTimestamp] = useState<string>("Just now");
  const [sensorStations, setSensorStations] = useState<SensorStation[]>(INITIAL_SENSOR_STATIONS);

  // Overlay Toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showSensorStations, setShowSensorStations] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showEvacCorridor, setShowEvacCorridor] = useState(true);
  const [showHazardZones, setShowHazardZones] = useState(true);
  const [showAccessZones, setShowAccessZones] = useState(true);
  const [showAccessCorridors, setShowAccessCorridors] = useState(true);

  // Real-Time GPS Tracking & User Position
  const HYDERABAD_FALLBACK = { lat: 17.385, lng: 78.4867 };
  const [isTrackingGps, setIsTrackingGps] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>(HYDERABAD_FALLBACK);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number>(15);
  const [isPinpointModeActive, setIsPinpointModeActive] = useState(false);
  const [centerTrigger, setCenterTrigger] = useState<number>(0);

  // Evacuation & Shelters State
  const [nearbyShelters, setNearbyShelters] = useState<
    (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number })[]
  >([]);
  const [selectedShelter, setSelectedShelter] = useState<
    (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number }) | null
  >(null);
  const [evacuationSteps, setEvacuationSteps] = useState<EvacuationNavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isSosAlertActive, setIsSosAlertActive] = useState(false);
  const [sosBroadcastMessage, setSosBroadcastMessage] = useState<string | null>(null);

  // Temporal Playback Scrubber (-24h, -12h, -6h, -1h, "LIVE", +3h, +6h)
  const [timelineStep, setTimelineStep] = useState<number>(4); // 4 = LIVE NOW
  const timelineLabels = ["-24h", "-12h", "-6h", "-1h", "🔴 REAL-TIME NOW", "+3h Forecast", "+6h Forecast"];

  // Audio briefing
  const [mapAudioBriefing, setMapAudioBriefing] = useState<string>(
    "Real-Time Access Map active. Live clean-air transit corridors, zone accessibility statuses, and emergency evacuation havens mapped."
  );

  const [osmMap, setOsmMap] = useState<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const stationsGroupRef = useRef<L.LayerGroup | null>(null);
  const heatCirclesGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);
  const sheltersGroupRef = useRef<L.LayerGroup | null>(null);
  const evacCorridorGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.LayerGroup | null>(null);
  const hazardZonesGroupRef = useRef<L.LayerGroup | null>(null);
  const accessZonesGroupRef = useRef<L.LayerGroup | null>(null);
  const accessCorridorsGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const filterOptions = [
    "All",
    "Smoke",
    "Factory emission",
    "Crop burning",
    "Garbage burning",
    "Critical only",
  ];

  const cityShortcuts = [
    { name: "My Location", lat: userLocation.lat, lng: userLocation.lng, zoom: 14, isUser: true },
    { name: "Hyderabad", lat: 17.385, lng: 78.4867, zoom: 12 },
    { name: "Delhi NCR", lat: 28.7041, lng: 77.1025, zoom: 11 },
    { name: "Mumbai", lat: 19.076, lng: 72.8777, zoom: 12 },
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946, zoom: 12 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, zoom: 12 },
    { name: "São Paulo", lat: -23.5505, lng: -46.6333, zoom: 11 },
    { name: "Johannesburg", lat: -26.2041, lng: 28.0473, zoom: 11 },
    { name: "Beijing", lat: 39.9042, lng: 116.4074, zoom: 11 },
    { name: "Cairo", lat: 30.0444, lng: 31.2357, zoom: 12 },
    { name: "Dubai", lat: 25.2048, lng: 55.2708, zoom: 12 },
  ];

  const langInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  // 1. On first load, directly request browser's native geolocation permission
  useEffect(() => {
    let watchId: number | null = null;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setGpsAccuracyMeters(Math.round(pos.coords.accuracy || 15));
          setIsTrackingGps(true);
          setCenterTrigger((prev) => prev + 1);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
          }
        },
        (err) => {
          // Silently keep default location without displaying an error banner
          console.warn("Location permission not granted or unavailable on load:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setGpsAccuracyMeters(Math.round(pos.coords.accuracy || 15));
        },
        (err) => {
          console.warn("Location watch notice:", err.message);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchId !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // 2. Recalculate nearest safe shelters and access zones whenever userLocation changes
  useEffect(() => {
    if (!userLocation) return;
    const computedShelters = getNearestEvacuationShelters(userLocation.lat, userLocation.lng, 4);
    setNearbyShelters(computedShelters);

    if (!selectedShelter || !computedShelters.find((s) => s.id === selectedShelter.id)) {
      setSelectedShelter(computedShelters[0] || null);
    }

    const computedZones = getNearbyAccessZones(userLocation.lat, userLocation.lng, 6);
    setAccessZones(computedZones);
    if (!selectedAccessZone || !computedZones.find((z) => z.id === selectedAccessZone.id)) {
      setSelectedAccessZone(computedZones[0] || null);
    }
  }, [userLocation.lat, userLocation.lng]);

  // 3. Compute Evacuation Corridor & Steps whenever userLocation or selectedShelter changes
  useEffect(() => {
    if (!userLocation || !selectedShelter) return;

    const criticalHazards = incidents
      .filter((i) => i.severity === "Critical" || i.severity === "High")
      .map((i) => ({ lat: i.latitude, lng: i.longitude, radiusKm: 1.5 }));

    const { waypoints, steps } = generateEvacuationCorridor(
      userLocation.lat,
      userLocation.lng,
      selectedShelter.latitude,
      selectedShelter.longitude,
      criticalHazards
    );

    setEvacuationSteps(steps);
  }, [userLocation.lat, userLocation.lng, selectedShelter?.id, incidents]);

  // 4. Real-time telemetry ticker
  useEffect(() => {
    if (!isLiveTelemetryStreaming) return;

    const interval = setInterval(() => {
      setLiveStreamPings((p) => p + Math.floor(1 + Math.random() * 4));
      setLastTelemetryTimestamp(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );

      // Jitter sensor stations
      setSensorStations((prev) =>
        prev.map((st) => {
          const delta = (Math.random() - 0.5) * 3;
          return {
            ...st,
            aqi: Math.max(30, Math.min(450, Math.round(st.aqi + delta))),
            pm25: Number((st.pm25 + delta * 0.3).toFixed(1)),
            lastUpdated: "Just now",
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isLiveTelemetryStreaming]);

  // 5. Initialize / Cleanup Leaflet Map when mapEngine is "osm"
  useEffect(() => {
    if (mapEngine !== "osm") {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setOsmMap(null);
      }
      return;
    }

    if (!mapContainerRef.current) return;

    // Destroy any prior map instance attached to the DOM container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        console.warn("Leaflet previous instance cleanup:", err);
      }
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: true,
    });

    let url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    if (mapLayer === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (mapLayer === "dark") {
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }

    const tile = L.tileLayer(url, {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tile;
    markersGroupRef.current = L.layerGroup().addTo(map);
    stationsGroupRef.current = L.layerGroup().addTo(map);
    heatCirclesGroupRef.current = L.layerGroup().addTo(map);
    routesGroupRef.current = L.layerGroup().addTo(map);
    sheltersGroupRef.current = L.layerGroup().addTo(map);
    evacCorridorGroupRef.current = L.layerGroup().addTo(map);
    hazardZonesGroupRef.current = L.layerGroup().addTo(map);
    accessZonesGroupRef.current = L.layerGroup().addTo(map);
    accessCorridorsGroupRef.current = L.layerGroup().addTo(map);
    userMarkerRef.current = L.layerGroup().addTo(map);

    // Map click handler for "Pinpoint my location"
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (isPinpointModeActive) {
        setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        setIsPinpointModeActive(false);
      }
    });

    mapInstanceRef.current = map;
    setOsmMap(map);

    // Invalidate size after rendering to avoid blank/grey tiles
    requestAnimationFrame(() => {
      map.invalidateSize();
    });
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    // ResizeObserver for dynamic container resizes
    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn("Leaflet unmount cleanup:", err);
        }
        mapInstanceRef.current = null;
        setOsmMap(null);
      }
    };
  }, [mapEngine]);

  // Update Tile Layer
  useEffect(() => {
    if (!osmMap || !tileLayerRef.current) return;
    osmMap.removeLayer(tileLayerRef.current);

    let url = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    if (mapLayer === "satellite") {
      url = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (mapLayer === "dark") {
      url = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }

    tileLayerRef.current = L.tileLayer(url, {
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(osmMap);
  }, [osmMap, mapLayer]);

  // 6. Draw User Real-Time GPS Pin with High-Accuracy Radar Ring
  useEffect(() => {
    if (!osmMap || !userMarkerRef.current || !userLocation) return;
    userMarkerRef.current.clearLayers();

    // Radar pulse circle
    const userAccuracyCircle = L.circle([userLocation.lat, userLocation.lng], {
      radius: Math.max(300, gpsAccuracyMeters * 10),
      color: "#16866B",
      fillColor: "#35BFAE",
      fillOpacity: 0.16,
      weight: 2,
      dashArray: "4, 6",
    });

    const userPinIcon = L.divIcon({
      className: "user-realtime-gps-pin",
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translateY(-8px);">
          <div style="background: #123C35; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 6px; white-space: nowrap; border: 1.5px solid #35BFAE; box-shadow: 0 2px 10px rgba(0,0,0,0.35); display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
            <span style="width: 7px; height: 7px; border-radius: 9999px; background: #34D399; display: inline-block;"></span>
            <span>You are here</span>
          </div>
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: #10B981; opacity: 0.35;" class="marker-pulse"></div>
            <div style="width: 28px; height: 28px; border-radius: 9999px; background: linear-gradient(135deg, #123C35 0%, #16866B 100%); border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: #35BFAE; font-size: 12px; font-weight: 900;">
              ▲
            </div>
          </div>
        </div>
      `,
      iconSize: [110, 60],
      iconAnchor: [55, 48],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userPinIcon, zIndexOffset: 1000 });
    userMarker.bindPopup(`<b>You are here (GPS Live)</b><br>Coordinates: ${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E<br>Accuracy: ±${gpsAccuracyMeters}m`);

    userMarkerRef.current.addLayer(userAccuracyCircle);
    userMarkerRef.current.addLayer(userMarker);
  }, [osmMap, userLocation, gpsAccuracyMeters]);

  // 7. Draw Safe Haven / Evacuation Shelters Layer
  useEffect(() => {
    if (!osmMap || !sheltersGroupRef.current) return;
    sheltersGroupRef.current.clearLayers();

    if (showShelters && nearbyShelters.length > 0) {
      nearbyShelters.forEach((shelter) => {
        const isSelected = selectedShelter?.id === shelter.id;

        const shelterIcon = L.divIcon({
          className: "custom-shelter-pin",
          html: `
            <div style="
              background: ${isSelected ? "#065F46" : "#047857"};
              border: 2.5px solid ${isSelected ? "#34D399" : "#FFFFFF"};
              border-radius: 12px;
              padding: 4px 8px;
              color: #ffffff;
              font-family: system-ui, sans-serif;
              font-size: 11px;
              font-weight: 800;
              box-shadow: 0 4px 14px rgba(6,95,70,0.4);
              display: flex;
              align-items: center;
              gap: 4px;
              cursor: pointer;
              transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
              transition: all 0.2s ease;
            ">
              <span style="font-size: 13px;">🛡️</span>
              <div style="display: flex; flex-direction: column; line-height: 1;">
                <span style="font-size: 9px; opacity: 0.85;">CLEAN AIR HAVEN</span>
                <span style="font-size: 11px; color: #A7F3D0;">${shelter.indoorAqi} AQI · ${shelter.distanceKm}km</span>
              </div>
            </div>
          `,
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });

        const marker = L.marker([shelter.latitude, shelter.longitude], { icon: shelterIcon });
        marker.on("click", () => {
          setSelectedShelter(shelter);
          mapInstanceRef.current?.flyTo([shelter.latitude, shelter.longitude], 14, { duration: 1.2 });
        });

        sheltersGroupRef.current?.addLayer(marker);
      });
    }
  }, [osmMap, showShelters, nearbyShelters, selectedShelter]);

  // 8. Draw Dynamic Real-Time Evacuation Corridor Route from User to Selected Shelter
  useEffect(() => {
    if (!osmMap || !evacCorridorGroupRef.current || !userLocation || !selectedShelter) return;
    evacCorridorGroupRef.current.clearLayers();

    if (showEvacCorridor) {
      const criticalHazards = incidents
        .filter((i) => i.severity === "Critical" || i.severity === "High")
        .map((i) => ({ lat: i.latitude, lng: i.longitude, radiusKm: 1.5 }));

      const { waypoints, steps } = generateEvacuationCorridor(
        userLocation.lat,
        userLocation.lng,
        selectedShelter.latitude,
        selectedShelter.longitude,
        criticalHazards
      );

      // Background glowing shadow polyline
      const shadowLine = L.polyline(waypoints, {
        color: "#10B981",
        weight: 10,
        opacity: 0.3,
      });

      // Main active green corridor line
      const greenCorridor = L.polyline(waypoints, {
        color: "#047857",
        weight: 5,
        opacity: 0.95,
        dashArray: "8, 6",
      });

      evacCorridorGroupRef.current.addLayer(shadowLine);
      evacCorridorGroupRef.current.addLayer(greenCorridor);

      // Draw Step Waypoint Nodes
      steps.forEach((step, idx) => {
        const stepIcon = L.divIcon({
          className: "corridor-step-pin",
          html: `
            <div style="
              width: 22px;
              height: 22px;
              border-radius: 9999px;
              background: #065F46;
              border: 2px solid #34D399;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: 900;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">
              ${step.stepNumber}
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const stepMarker = L.marker([step.waypoint[0], step.waypoint[1]], { icon: stepIcon });
        stepMarker.bindPopup(`<b>Evacuation Step ${step.stepNumber}</b><br>${step.instruction}`);
        evacCorridorGroupRef.current?.addLayer(stepMarker);
      });
    }
  }, [osmMap, showEvacCorridor, userLocation, selectedShelter, incidents]);

  // 9. Draw Red Hazard Exclusion Zones around Critical Incidents
  useEffect(() => {
    if (!osmMap || !hazardZonesGroupRef.current) return;
    hazardZonesGroupRef.current.clearLayers();

    if (showHazardZones) {
      incidents
        .filter((inc) => inc.severity === "Critical" || inc.severity === "High")
        .forEach((inc) => {
          const zone = L.circle([inc.latitude, inc.longitude], {
            radius: inc.severity === "Critical" ? 1800 : 1100,
            color: "#DC2626",
            fillColor: "#EF4444",
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: "6, 6",
          });
          zone.bindPopup(`<b>⚠️ Toxic Exposure Hazard Zone</b><br>${inc.type} · ${inc.aqi} AQI<br>Evacuation bypass active.`);
          hazardZonesGroupRef.current?.addLayer(zone);
        });
    }
  }, [osmMap, showHazardZones, incidents]);

  // 10. Sensor Stations
  useEffect(() => {
    if (!osmMap || !stationsGroupRef.current) return;
    stationsGroupRef.current.clearLayers();

    if (showSensorStations) {
      sensorStations.forEach((st) => {
        const isAlert = st.aqi > 200;
        const stationIcon = L.divIcon({
          className: "custom-station-pin",
          html: `
            <div style="
              background: ${isAlert ? "#991B1B" : "#123C35"};
              border: 2px solid ${isAlert ? "#F87171" : "#35BFAE"};
              border-radius: 8px;
              padding: 2px 6px;
              color: #ffffff;
              font-family: monospace;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 3px 8px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              gap: 3px;
              cursor: pointer;
            ">
              <span style="display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: ${isAlert ? "#EF4444" : "#10B981"};"></span>
              <span>${st.aqi} AQI</span>
            </div>
          `,
          iconSize: [60, 24],
          iconAnchor: [30, 12],
        });

        const marker = L.marker([st.latitude, st.longitude], { icon: stationIcon });
        marker.on("click", () => {
          setSelectedStation(st);
          setSelectedIncident(null);
        });

        stationsGroupRef.current?.addLayer(marker);
      });
    }
  }, [osmMap, showSensorStations, sensorStations]);

  // 11. Incidents & Heatmap
  useEffect(() => {
    if (!osmMap || !markersGroupRef.current || !heatCirclesGroupRef.current) return;
    markersGroupRef.current.clearLayers();
    heatCirclesGroupRef.current.clearLayers();

    incidents.forEach((inc) => {
      const isSelected = selectedIncident?.id === inc.id;
      const color =
        inc.severity === "Critical"
          ? "#DC2626"
          : inc.severity === "High"
          ? "#EA580C"
          : "#EAB308";

      if (showHeatmap) {
        const circle = L.circle([inc.latitude, inc.longitude], {
          radius: Math.min(inc.aqi * 20, 6000),
          color: color,
          fillColor: color,
          fillOpacity: 0.12,
          weight: 1,
        });
        heatCirclesGroupRef.current?.addLayer(circle);
      }

      const customIcon = L.divIcon({
        className: "custom-incident-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${
              inc.severity === "Critical"
                ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: ${color}; opacity: 0.35;" class="marker-pulse"></div>`
                : ""
            }
            <div style="
              width: ${isSelected ? "32px" : "26px"};
              height: ${isSelected ? "32px" : "26px"};
              border-radius: 9999px;
              background-color: ${color};
              border: 2.5px solid #ffffff;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-weight: 800;
              font-size: 10px;
              cursor: pointer;
            ">
              🔥
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });
      marker.on("click", () => {
        setSelectedIncident(inc);
        setSelectedStation(null);
        onSelectIncident(inc);
      });

      markersGroupRef.current?.addLayer(marker);
    });
  }, [osmMap, incidents, selectedIncident, showHeatmap]);

  // 12. Draw Real-Time Access Zones Layer
  useEffect(() => {
    if (!osmMap || !accessZonesGroupRef.current) return;
    accessZonesGroupRef.current.clearLayers();

    if (showAccessZones && accessZones.length > 0) {
      accessZones.forEach((zone) => {
        const isSelected = selectedAccessZone?.id === zone.id;
        const color =
          zone.accessStatus === "Open Access"
            ? "#10B981"
            : zone.accessStatus === "Caution (Mask Required)"
            ? "#F59E0B"
            : "#EF4444";

        // Access boundary circle
        const zoneCircle = L.circle([zone.latitude, zone.longitude], {
          radius: zone.radiusMeters,
          color: color,
          fillColor: color,
          fillOpacity: isSelected ? 0.22 : 0.12,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: zone.accessStatus === "Open Access" ? undefined : "6, 6",
        });

        const zoneBadgeIcon = L.divIcon({
          className: "realtime-access-zone-pin",
          html: `
            <div style="
              background: ${color};
              border: 2px solid #ffffff;
              border-radius: 10px;
              padding: 3px 7px;
              color: #ffffff;
              font-family: system-ui, sans-serif;
              font-size: 10px;
              font-weight: 800;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              gap: 4px;
              cursor: pointer;
              transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
              transition: all 0.2s ease;
              white-space: nowrap;
            ">
              <span>${zone.accessStatus === "Open Access" ? "🟢" : zone.accessStatus === "Caution (Mask Required)" ? "🟡" : "🔴"}</span>
              <div style="display: flex; flex-direction: column; line-height: 1.1;">
                <span>${zone.name}</span>
                <span style="font-size: 9px; opacity: 0.9;">${zone.aqi} AQI · ${zone.accessStatus}</span>
              </div>
            </div>
          `,
          iconSize: [140, 28],
          iconAnchor: [70, 14],
        });

        const zoneMarker = L.marker([zone.latitude, zone.longitude], { icon: zoneBadgeIcon });
        zoneMarker.on("click", () => {
          setSelectedAccessZone(zone);
          mapInstanceRef.current?.flyTo([zone.latitude, zone.longitude], 14, { duration: 1.2 });
        });

        accessZonesGroupRef.current?.addLayer(zoneCircle);
        accessZonesGroupRef.current?.addLayer(zoneMarker);
      });
    }
  }, [osmMap, showAccessZones, accessZones, selectedAccessZone]);

  // 13. Draw Real-Time Clean Air Access Corridors Layer
  useEffect(() => {
    if (!osmMap || !accessCorridorsGroupRef.current) return;
    accessCorridorsGroupRef.current.clearLayers();

    if (showAccessCorridors && accessCorridors.length > 0) {
      accessCorridors.forEach((corr) => {
        const isSelected = selectedAccessCorridor?.id === corr.id;
        const color = corr.accessStatus === "Full Access" ? "#059669" : "#D97706";

        // Background wide glow line
        const glowLine = L.polyline(corr.waypoints, {
          color: color,
          weight: isSelected ? 12 : 8,
          opacity: isSelected ? 0.35 : 0.2,
        });

        // Main arterial line
        const mainLine = L.polyline(corr.waypoints, {
          color: color,
          weight: isSelected ? 5 : 3.5,
          opacity: 0.95,
          dashArray: isSelected ? undefined : "6, 6",
        });

        mainLine.on("click", () => {
          setSelectedAccessCorridor(corr);
          const midWp = corr.waypoints[Math.floor(corr.waypoints.length / 2)];
          if (midWp) {
            mapInstanceRef.current?.flyTo(midWp, 13, { duration: 1.2 });
          }
        });

        accessCorridorsGroupRef.current?.addLayer(glowLine);
        accessCorridorsGroupRef.current?.addLayer(mainLine);

        // Corridor Start & End Badges
        const startWp = corr.waypoints[0];
        const endWp = corr.waypoints[corr.waypoints.length - 1];

        if (startWp && isSelected) {
          const startIcon = L.divIcon({
            className: "access-corr-start-pin",
            html: `
              <div style="background: #123C35; color: #35BFAE; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1.5px solid #35BFAE; white-space: nowrap;">
                START: ${corr.fromLabel}
              </div>
            `,
            iconSize: [80, 20],
            iconAnchor: [40, 24],
          });
          const startMarker = L.marker(startWp, { icon: startIcon });
          accessCorridorsGroupRef.current?.addLayer(startMarker);
        }

        if (endWp && isSelected) {
          const endIcon = L.divIcon({
            className: "access-corr-end-pin",
            html: `
              <div style="background: #065F46; color: #A7F3D0; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1.5px solid #34D399; white-space: nowrap;">
                DEST: ${corr.toLabel} (${corr.avgAqi} AQI)
              </div>
            `,
            iconSize: [80, 20],
            iconAnchor: [40, 24],
          });
          const endMarker = L.marker(endWp, { icon: endIcon });
          accessCorridorsGroupRef.current?.addLayer(endMarker);
        }
      });
    }
  }, [osmMap, showAccessCorridors, accessCorridors, selectedAccessCorridor]);

  const handleCenterOnUser = () => {
    setIsTrackingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          setGpsAccuracyMeters(Math.round(pos.coords.accuracy || 15));
          setCenterTrigger((prev) => prev + 1);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([loc.lat, loc.lng], 14, { duration: 1.2 });
          }
        },
        (err) => {
          console.warn("Locate notice:", err.message);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.2 });
          }
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.2 });
      }
    }
  };

  const handleSelectCity = (city: { lat: number; lng: number; zoom: number; isUser?: boolean }) => {
    if (city.isUser) {
      handleCenterOnUser();
    } else {
      setUserLocation({ lat: city.lat, lng: city.lng });
      mapInstanceRef.current?.flyTo([city.lat, city.lng], city.zoom, { duration: 1.5 });
    }
  };

  const handleTriggerSos = () => {
    setIsSosAlertActive(!isSosAlertActive);
    if (!isSosAlertActive) {
      setSosBroadcastMessage(
        `🚨 SOS Broadcast sent to Regional Emergency Dispatch: Coordinates (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}). Heading to ${selectedShelter?.name}.`
      );
    } else {
      setSosBroadcastMessage(null);
    }
  };

  const handleSharePlan = () => {
    const text = `🚨 AirWatch Live Evacuation Route: I am currently navigating to ${selectedShelter?.name} (${selectedShelter?.address}). Distance: ${selectedShelter?.distanceKm}km. Shelter Indoor AQI: ${selectedShelter?.indoorAqi}. Emergency Hotline: ${selectedShelter?.emergencyPhone}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div id="realtime-live-map-page" className="w-full space-y-4 pb-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[#26332F] tracking-tight">
          Live Pollution Map
        </h1>
        <p className="text-xs sm:text-sm text-[#556963] max-w-2xl font-normal leading-relaxed">
          know what is happening around you. This prototype combines demo incidents with a map-ready response layer.
        </p>
      </div>

      {/* Interactive Map Canvas */}
      <div className="w-full h-[calc(100vh-12rem)] min-h-[580px] relative rounded-2xl overflow-hidden shadow-sm border border-[#D5DDD9] bg-white">
        {mapEngine === "google" ? (
          <GoogleLiveMapView
            userLocation={userLocation}
            gpsAccuracyMeters={gpsAccuracyMeters}
            isTrackingGps={isTrackingGps}
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => {
              setSelectedIncident(inc);
              onSelectIncident(inc);
            }}
            sensorStations={sensorStations}
            selectedStation={selectedStation}
            onSelectStation={(st) => setSelectedStation(st)}
            shelters={nearbyShelters}
            selectedShelter={selectedShelter}
            onSelectShelter={(sh) => setSelectedShelter(sh)}
            accessZones={accessZones}
            selectedAccessZone={selectedAccessZone}
            onSelectAccessZone={(z) => setSelectedAccessZone(z)}
            accessCorridors={accessCorridors}
            selectedAccessCorridor={selectedAccessCorridor}
            onSelectAccessCorridor={(c) => setSelectedAccessCorridor(c)}
            showSensorStations={showSensorStations}
            showShelters={showShelters}
            showHazardZones={showHazardZones}
            showAccessZones={showAccessZones}
            showAccessCorridors={showAccessCorridors}
            showEvacCorridor={showEvacCorridor}
            mapMode={mapMode}
            onUserPinpoint={(lat, lng) => {
              setUserLocation({ lat, lng });
              setIsPinpointModeActive(false);
            }}
            isPinpointModeActive={isPinpointModeActive}
            onSwitchToOsm={() => setMapEngine("osm")}
            centerTrigger={centerTrigger}
            onLocateGps={handleCenterOnUser}
          />
        ) : (
          <div className="w-full h-full relative min-h-[580px]">
            <div
              id="leaflet-interactive-map-stage"
              ref={mapContainerRef}
              className="w-full h-full min-h-[580px]"
              style={{ width: "100%", height: "100%", minHeight: "580px" }}
            />

            {/* Layer Toggles Floating in Top Left beside Zoom controls */}
            <div className="absolute top-3 left-14 z-20 flex items-center bg-white/95 border border-[#D5DDD9] rounded-xl shadow-md p-0.5">
              <button
                onClick={() => setMapLayer("standard")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  mapLayer === "standard" ? "bg-[#16866B] text-white" : "text-[#556963] hover:text-[#123C35]"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setMapLayer("satellite")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  mapLayer === "satellite" ? "bg-[#16866B] text-white" : "text-[#556963] hover:text-[#123C35]"
                }`}
              >
                Satellite
              </button>
              <button
                onClick={() => setMapLayer("dark")}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                  mapLayer === "dark" ? "bg-[#16866B] text-white" : "text-[#556963] hover:text-[#123C35]"
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        )}

        {/* Floating Quick Controls at Top Right (Map Engine & Pinpoint) */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {/* Map Engine Toggle */}
          <div className="flex items-center gap-1 bg-[#123C35]/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-[#123C35]">
            <button
              onClick={() => setMapEngine("google")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                mapEngine === "google"
                  ? "bg-[#35BFAE] text-[#123C35] shadow-xs"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapEngine("osm")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mapEngine === "osm"
                  ? "bg-white text-[#123C35] shadow-xs"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <span>OSM</span>
            </button>
          </div>

          {/* Locate Button */}
          <button
            onClick={handleCenterOnUser}
            className="px-3 py-1.5 rounded-xl bg-white/95 text-[#16866B] hover:bg-[#E9F7F1] border border-[#D5DDD9] shadow-md transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Locate My Position"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Locate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
