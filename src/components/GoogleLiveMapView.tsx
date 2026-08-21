// Source: Google Maps Platform Code Assist
import React, { useEffect, useState, useMemo } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useApiLoadingStatus,
  APILoadingStatus,
} from "@vis.gl/react-google-maps";
import {
  Incident,
  SensorStation,
  EvacuationShelter,
  RealTimeAccessZone,
  RealTimeAccessCorridor,
} from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Navigation,
  Sparkles,
  Layers,
  MapPin,
  Flame,
  Wind,
  CheckCircle2,
  ExternalLink,
  Key,
  AlertTriangle,
  RotateCcw,
  Compass,
} from "lucide-react";

interface GoogleLiveMapViewProps {
  userLocation: { lat: number; lng: number };
  gpsAccuracyMeters: number;
  isTrackingGps: boolean;
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  sensorStations: SensorStation[];
  selectedStation: SensorStation | null;
  onSelectStation: (station: SensorStation) => void;
  shelters: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number })[];
  selectedShelter: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number }) | null;
  onSelectShelter: (shelter: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number })) => void;
  accessZones: RealTimeAccessZone[];
  selectedAccessZone: RealTimeAccessZone | null;
  onSelectAccessZone: (zone: RealTimeAccessZone) => void;
  accessCorridors: RealTimeAccessCorridor[];
  selectedAccessCorridor: RealTimeAccessCorridor | null;
  onSelectAccessCorridor: (corridor: RealTimeAccessCorridor) => void;
  showSensorStations: boolean;
  showShelters: boolean;
  showHazardZones: boolean;
  showAccessZones: boolean;
  showAccessCorridors: boolean;
  showEvacCorridor: boolean;
  mapMode: "access" | "evacuation" | "monitoring";
  onUserPinpoint?: (lat: number, lng: number) => void;
  isPinpointModeActive?: boolean;
  onSwitchToOsm?: () => void;
  centerTrigger?: number;
  onLocateGps?: () => void;
  gpsStatus?: "locating" | "located" | "denied" | "unavailable" | "fallback";
}

// Inner helper component that uses useMap to draw declarative Google Maps Polylines & Circles
const GoogleMapOverlays: React.FC<{
  userLocation: { lat: number; lng: number };
  accessZones: RealTimeAccessZone[];
  selectedAccessZone: RealTimeAccessZone | null;
  onSelectAccessZone: (zone: RealTimeAccessZone) => void;
  accessCorridors: RealTimeAccessCorridor[];
  selectedAccessCorridor: RealTimeAccessCorridor | null;
  onSelectAccessCorridor: (corridor: RealTimeAccessCorridor) => void;
  incidents: Incident[];
  selectedIncident: Incident | null;
  selectedShelter: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number }) | null;
  showHazardZones: boolean;
  showAccessZones: boolean;
  showAccessCorridors: boolean;
  showEvacCorridor: boolean;
}> = ({
  userLocation,
  accessZones,
  selectedAccessZone,
  onSelectAccessZone,
  accessCorridors,
  selectedAccessCorridor,
  onSelectAccessCorridor,
  incidents,
  selectedIncident,
  selectedShelter,
  showHazardZones,
  showAccessZones,
  showAccessCorridors,
  showEvacCorridor,
}) => {
  const map = useMap();

  // Draw Access Zones (Circles)
  useEffect(() => {
    if (!map || typeof google === "undefined" || !google.maps) return;
    const circles: google.maps.Circle[] = [];

    if (showAccessZones) {
      accessZones.forEach((zone) => {
        const isSelected = selectedAccessZone?.id === zone.id;
        const color =
          zone.accessStatus === "Open Access"
            ? "#10B981"
            : zone.accessStatus === "Caution (Mask Required)"
            ? "#F59E0B"
            : "#EF4444";

        const circle = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: isSelected ? 0.9 : 0.6,
          strokeWeight: isSelected ? 3 : 1.5,
          fillColor: color,
          fillOpacity: isSelected ? 0.25 : 0.12,
          map,
          center: { lat: zone.latitude, lng: zone.longitude },
          radius: zone.radiusMeters,
          clickable: true,
        });

        circle.addListener("click", () => {
          onSelectAccessZone(zone);
        });

        circles.push(circle);
      });
    }

    return () => {
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, showAccessZones, accessZones, selectedAccessZone]);

  // Draw Hazard Plumes
  useEffect(() => {
    if (!map || typeof google === "undefined" || !google.maps) return;
    const circles: google.maps.Circle[] = [];

    if (showHazardZones) {
      incidents.forEach((inc) => {
        const isSelected = selectedIncident?.id === inc.id;
        const plumeRadius = inc.severity === "CRITICAL" ? 1400 : inc.severity === "HIGH" ? 950 : 600;

        const circle = new google.maps.Circle({
          strokeColor: inc.severity === "CRITICAL" ? "#DC2626" : "#EA580C",
          strokeOpacity: isSelected ? 0.9 : 0.5,
          strokeWeight: isSelected ? 3 : 1.5,
          fillColor: inc.severity === "CRITICAL" ? "#EF4444" : "#F97316",
          fillOpacity: isSelected ? 0.35 : 0.18,
          map,
          center: { lat: inc.latitude, lng: inc.longitude },
          radius: plumeRadius,
        });
        circles.push(circle);
      });
    }

    return () => {
      circles.forEach((c) => c.setMap(null));
    };
  }, [map, showHazardZones, incidents, selectedIncident]);

  // Draw Clean-Air Corridors (Polylines)
  useEffect(() => {
    if (!map || typeof google === "undefined" || !google.maps) return;
    const lines: google.maps.Polyline[] = [];

    if (showAccessCorridors) {
      accessCorridors.forEach((corr) => {
        const isSelected = selectedAccessCorridor?.id === corr.id;
        const color = corr.accessStatus === "Full Access" ? "#059669" : "#D97706";

        const path = corr.waypoints.map(([lat, lng]) => ({ lat, lng }));

        // Glow polyline
        const glowLine = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: isSelected ? 0.35 : 0.2,
          strokeWeight: isSelected ? 12 : 8,
          map,
        });

        // Main polyline
        const mainLine = new google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor: color,
          strokeOpacity: 0.95,
          strokeWeight: isSelected ? 5 : 3.5,
          map,
          clickable: true,
        });

        mainLine.addListener("click", () => {
          onSelectAccessCorridor(corr);
        });

        lines.push(glowLine, mainLine);
      });
    }

    return () => {
      lines.forEach((l) => l.setMap(null));
    };
  }, [map, showAccessCorridors, accessCorridors, selectedAccessCorridor]);

  // Draw Evacuation Bypass Line from user to chosen shelter
  useEffect(() => {
    if (!map || typeof google === "undefined" || !google.maps || !showEvacCorridor || !selectedShelter) return;

    // Build intermediate waypoint around hazard
    const midLat = (userLocation.lat + selectedShelter.latitude) / 2 + 0.004;
    const midLng = (userLocation.lng + selectedShelter.longitude) / 2 - 0.005;

    const path = [
      { lat: userLocation.lat, lng: userLocation.lng },
      { lat: midLat, lng: midLng },
      { lat: selectedShelter.latitude, lng: selectedShelter.longitude },
    ];

    const glowLine = new google.maps.Polyline({
      path,
      strokeColor: "#047857",
      strokeOpacity: 0.3,
      strokeWeight: 10,
      map,
    });

    const mainLine = new google.maps.Polyline({
      path,
      strokeColor: "#10B981",
      strokeOpacity: 0.95,
      strokeWeight: 4,
      map,
    });

    return () => {
      glowLine.setMap(null);
      mainLine.setMap(null);
    };
  }, [map, showEvacCorridor, selectedShelter, userLocation]);

  return null;
};

// Helper component to smoothly sync camera center when userLocation updates or locate button is clicked
const GoogleMapCameraSync: React.FC<{
  userLocation: { lat: number; lng: number };
  centerTrigger?: number;
}> = ({ userLocation, centerTrigger }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || typeof google === "undefined" || !google.maps) return;
    map.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    // Smoothly focus at zoom level 14
    if (map.getZoom() && (map.getZoom() || 0) < 13) {
      map.setZoom(14);
    }
  }, [map, userLocation.lat, userLocation.lng, centerTrigger]);

  return null;
};

// Helper component to check SDK loading status and render map content safely
const GoogleMapContentWithStatus: React.FC<{
  initialCenter: { lat: number; lng: number };
  mapTypeId: google.maps.MapTypeId | string;
  isPinpointModeActive?: boolean;
  onUserPinpoint?: (lat: number, lng: number) => void;
  userLocation: { lat: number; lng: number };
  gpsAccuracyMeters: number;
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  sensorStations: SensorStation[];
  selectedStation: SensorStation | null;
  onSelectStation: (station: SensorStation) => void;
  shelters: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number })[];
  selectedShelter: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number }) | null;
  onSelectShelter: (shelter: (EvacuationShelter & { distanceKm: number; etaWalkingMinutes: number; etaDrivingMinutes: number })) => void;
  accessZones: RealTimeAccessZone[];
  selectedAccessZone: RealTimeAccessZone | null;
  onSelectAccessZone: (zone: RealTimeAccessZone) => void;
  accessCorridors: RealTimeAccessCorridor[];
  selectedAccessCorridor: RealTimeAccessCorridor | null;
  onSelectAccessCorridor: (corridor: RealTimeAccessCorridor) => void;
  showSensorStations: boolean;
  showShelters: boolean;
  showHazardZones: boolean;
  showAccessZones: boolean;
  showAccessCorridors: boolean;
  showEvacCorridor: boolean;
  centerTrigger?: number;
  infoWindowTarget: {
    type: "user" | "incident" | "shelter" | "station" | "zone";
    position: { lat: number; lng: number };
    title: string;
    description: string;
    tag?: string;
  } | null;
  setInfoWindowTarget: React.Dispatch<React.SetStateAction<{
    type: "user" | "incident" | "shelter" | "station" | "zone";
    position: { lat: number; lng: number };
    title: string;
    description: string;
    tag?: string;
  } | null>>;
  onSwitchToOsm?: () => void;
}> = ({
  initialCenter,
  mapTypeId,
  isPinpointModeActive,
  onUserPinpoint,
  userLocation,
  gpsAccuracyMeters,
  incidents,
  selectedIncident,
  onSelectIncident,
  sensorStations,
  selectedStation,
  onSelectStation,
  shelters,
  selectedShelter,
  onSelectShelter,
  accessZones,
  selectedAccessZone,
  onSelectAccessZone,
  accessCorridors,
  selectedAccessCorridor,
  onSelectAccessCorridor,
  showSensorStations,
  showShelters,
  showHazardZones,
  showAccessZones,
  showAccessCorridors,
  showEvacCorridor,
  centerTrigger,
  infoWindowTarget,
  setInfoWindowTarget,
  onSwitchToOsm,
}) => {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.LOADING || status === APILoadingStatus.NOT_LOADED) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#F0F4F2] text-[#26332F] p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#16866B] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="font-bold text-base text-[#123C35] mb-1">Loading Google Maps Platform Tiles...</h3>
        <p className="text-xs text-[#556963]">Initializing vector terrain, environmental markers & corridors</p>
      </div>
    );
  }

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDF8F6] text-[#26332F] p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-base text-[#123C35] mb-1">Google Maps Authentication Notice</h3>
        <p className="text-xs text-[#556963] max-w-md mb-4 leading-relaxed">
          The provided Google Maps API key could not authenticate or needs authorization. You can switch to the fully-functional OpenStreetMap engine or update your key.
        </p>
        {onSwitchToOsm && (
          <button
            onClick={onSwitchToOsm}
            className="px-4 py-2 bg-[#123C35] hover:bg-[#16866B] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Compass className="w-4 h-4 text-[#35BFAE]" />
            <span>Switch to OpenStreetMap (Active)</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <Map
      id="google-live-air-map"
      mapId="DEMO_MAP_ID"
      defaultCenter={initialCenter}
      defaultZoom={13}
      mapTypeId={mapTypeId as google.maps.MapTypeId}
      gestureHandling="greedy"
      disableDefaultUI={false}
      className="w-full h-full"
      internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
      onClick={(e) => {
        if (isPinpointModeActive && onUserPinpoint && e.detail.latLng) {
          onUserPinpoint(e.detail.latLng.lat, e.detail.latLng.lng);
        }
      }}
    >
      {/* Live camera sync on GPS location resolution */}
      <GoogleMapCameraSync userLocation={userLocation} centerTrigger={centerTrigger} />

      {/* Declarative Vector Overlays (Corridors, Plumes, Zones) */}
      <GoogleMapOverlays
        userLocation={userLocation}
        accessZones={accessZones}
        selectedAccessZone={selectedAccessZone}
        onSelectAccessZone={onSelectAccessZone}
        accessCorridors={accessCorridors}
        selectedAccessCorridor={selectedAccessCorridor}
        onSelectAccessCorridor={onSelectAccessCorridor}
        incidents={incidents}
        selectedIncident={selectedIncident}
        selectedShelter={selectedShelter}
        showHazardZones={showHazardZones}
        showAccessZones={showAccessZones}
        showAccessCorridors={showAccessCorridors}
        showEvacCorridor={showEvacCorridor}
      />

      {/* User Location Marker - Clearly Visible "You are here" pin */}
      <AdvancedMarker
        position={{ lat: userLocation.lat, lng: userLocation.lng }}
        zIndex={100}
        onClick={() => {
          setInfoWindowTarget({
            type: "user",
            position: { lat: userLocation.lat, lng: userLocation.lng },
            title: "Your GPS Location",
            description: `Live position (${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E) with ±${gpsAccuracyMeters}m accuracy. Real-time escape corridors and air quality mapped from here.`,
            tag: "YOU ARE HERE",
          });
        }}
      >
        <div className="relative flex flex-col items-center justify-center -translate-y-4 cursor-pointer group select-none">
          {/* Prominent Floating "You are here" label */}
          <div className="bg-[#123C35] text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-lg border border-[#35BFAE] flex items-center gap-1.5 mb-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
            <span>You are here</span>
          </div>
          {/* Pulsing Radar Ring & High-Contrast Navigation Dot */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-10 h-10 rounded-full bg-emerald-500 opacity-40 animate-ping" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#123C35] to-[#16866B] border-2 border-white shadow-xl flex items-center justify-center text-white">
              <Navigation className="w-3.5 h-3.5 fill-[#35BFAE] text-[#35BFAE]" />
            </div>
          </div>
        </div>
      </AdvancedMarker>

      {/* Incident Markers */}
      {incidents.map((inc) => {
        const isSelected = selectedIncident?.id === inc.id;
        return (
          <AdvancedMarker
            key={inc.id}
            position={{ lat: inc.latitude, lng: inc.longitude }}
            onClick={() => {
              onSelectIncident(inc);
              setInfoWindowTarget({
                type: "incident",
                position: { lat: inc.latitude, lng: inc.longitude },
                title: inc.title,
                description: `${inc.gasType} release · ${inc.concentration} PPM · Status: ${inc.status}`,
                tag: inc.severity,
              });
            }}
          >
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-xl shadow-lg border text-[11px] font-black cursor-pointer transition-transform ${
                inc.severity === "CRITICAL"
                  ? "bg-red-600 text-white border-red-200"
                  : inc.severity === "HIGH"
                  ? "bg-amber-600 text-white border-amber-200"
                  : "bg-yellow-500 text-[#26332F] border-yellow-200"
              } ${isSelected ? "scale-125 ring-3 ring-red-400" : "hover:scale-110"}`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>{inc.gasType}</span>
            </div>
          </AdvancedMarker>
        );
      })}

      {/* Clean-Air Evacuation Shelters */}
      {showShelters &&
        shelters.map((shelter) => {
          const isSelected = selectedShelter?.id === shelter.id;
          return (
            <AdvancedMarker
              key={shelter.id}
              position={{ lat: shelter.latitude, lng: shelter.longitude }}
              onClick={() => {
                onSelectShelter(shelter);
                setInfoWindowTarget({
                  type: "shelter",
                  position: { lat: shelter.latitude, lng: shelter.longitude },
                  title: shelter.name,
                  description: `Indoor Filtered Haven (${shelter.airFiltrationGrade}) · Indoor AQI: ${shelter.indoorAqi} · Capacity: ${shelter.currentOccupancy}/${shelter.capacity}`,
                  tag: `${shelter.distanceKm} km · ${shelter.etaWalkingMinutes}m walk`,
                });
              }}
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl shadow-lg border text-[10px] font-black cursor-pointer transition-all ${
                  isSelected
                    ? "bg-emerald-800 text-white border-emerald-300 scale-120 ring-3 ring-emerald-400"
                    : "bg-emerald-600 text-white border-emerald-200 hover:scale-110"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#35BFAE]" />
                <div className="flex flex-col text-left leading-tight">
                  <span className="font-extrabold">{shelter.name}</span>
                  <span className="text-[8.5px] text-emerald-200 font-medium">{shelter.indoorAqi} AQI · {shelter.distanceKm}km</span>
                </div>
              </div>
            </AdvancedMarker>
          );
        })}

      {/* IoT Sensor Stations */}
      {showSensorStations &&
        sensorStations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const aqiBg =
            st.currentAqi > 200
              ? "bg-purple-600 text-white"
              : st.currentAqi > 100
              ? "bg-red-500 text-white"
              : st.currentAqi > 50
              ? "bg-amber-500 text-[#26332F]"
              : "bg-emerald-600 text-white";

          return (
            <AdvancedMarker
              key={st.id}
              position={{ lat: st.latitude, lng: st.longitude }}
              onClick={() => {
                onSelectStation(st);
                setInfoWindowTarget({
                  type: "station",
                  position: { lat: st.latitude, lng: st.longitude },
                  title: st.name,
                  description: `Telemetry Node · AQI: ${st.currentAqi} (${st.status}) · PM2.5: ${st.pm25} µg/m³ · PM10: ${st.pm10} µg/m³`,
                  tag: `AQI ${st.currentAqi}`,
                });
              }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg shadow-md border border-white text-[9.5px] font-black cursor-pointer transition-transform ${aqiBg} ${
                  isSelected ? "scale-120 ring-2 ring-white" : "hover:scale-110"
                }`}
              >
                <Radio className="w-3 h-3 opacity-80" />
                <span>{st.currentAqi}</span>
              </div>
            </AdvancedMarker>
          );
        })}

      {/* Real-Time Access Zone Pins */}
      {showAccessZones &&
        accessZones.map((zone) => {
          const isSelected = selectedAccessZone?.id === zone.id;
          const badgeColor =
            zone.accessStatus === "Open Access"
              ? "bg-emerald-600 text-white"
              : zone.accessStatus === "Caution (Mask Required)"
              ? "bg-amber-500 text-[#26332F]"
              : "bg-red-600 text-white";

          return (
            <AdvancedMarker
              key={zone.id}
              position={{ lat: zone.latitude, lng: zone.longitude }}
              onClick={() => {
                onSelectAccessZone(zone);
                setInfoWindowTarget({
                  type: "zone",
                  position: { lat: zone.latitude, lng: zone.longitude },
                  title: zone.name,
                  description: `${zone.accessStatus} · ${zone.aqi} AQI (${zone.aqiCategory}) · ${zone.activeTransitModes.join(", ")} · ${zone.recommendation}`,
                  tag: `${zone.aqi} AQI`,
                });
              }}
            >
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg shadow-md border border-white text-[9px] font-bold cursor-pointer transition-all ${badgeColor} ${
                  isSelected ? "scale-115 ring-2 ring-[#123C35]" : "hover:scale-105"
                }`}
              >
                <span>{zone.accessStatus === "Open Access" ? "🟢" : zone.accessStatus === "Caution (Mask Required)" ? "🟡" : "🔴"}</span>
                <span>{zone.name}</span>
              </div>
            </AdvancedMarker>
          );
        })}

      {/* Interactive InfoWindow */}
      {infoWindowTarget && (
        <InfoWindow
          position={infoWindowTarget.position}
          onCloseClick={() => setInfoWindowTarget(null)}
        >
          <div className="p-1 max-w-xs text-[#26332F]">
            {infoWindowTarget.tag && (
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-sm mb-1">
                {infoWindowTarget.tag}
              </span>
            )}
            <h4 className="text-sm font-bold leading-tight mb-1">{infoWindowTarget.title}</h4>
            <p className="text-xs text-[#556963] leading-relaxed">{infoWindowTarget.description}</p>
          </div>
        </InfoWindow>
      )}
    </Map>
  );
};

export const GoogleLiveMapView: React.FC<GoogleLiveMapViewProps> = ({
  userLocation,
  gpsAccuracyMeters,
  isTrackingGps,
  incidents,
  selectedIncident,
  onSelectIncident,
  sensorStations,
  selectedStation,
  onSelectStation,
  shelters,
  selectedShelter,
  onSelectShelter,
  accessZones,
  selectedAccessZone,
  onSelectAccessZone,
  accessCorridors,
  selectedAccessCorridor,
  onSelectAccessCorridor,
  showSensorStations,
  showShelters,
  showHazardZones,
  showAccessZones,
  showAccessCorridors,
  showEvacCorridor,
  mapMode,
  onUserPinpoint,
  isPinpointModeActive,
  onSwitchToOsm,
  centerTrigger,
  onLocateGps,
  gpsStatus = "located",
}) => {
  const apiKey =
    ((import.meta as unknown as { env: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY as string) || "";
  const [mapTypeId, setMapTypeId] = useState<google.maps.MapTypeId | string>("roadmap");
  const [infoWindowTarget, setInfoWindowTarget] = useState<{
    type: "user" | "incident" | "shelter" | "station" | "zone";
    position: { lat: number; lng: number };
    title: string;
    description: string;
    tag?: string;
  } | null>(null);

  const initialCenter = useMemo(
    () => ({ lat: userLocation.lat, lng: userLocation.lng }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // If no API key is provided, show setup card without loading script to prevent ApiProjectMapError
  if (!apiKey) {
    return (
      <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden shadow-inner border border-[#D5DDD9] bg-[#F8F9F8] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-6 rounded-2xl shadow-sm border border-[#D5DDD9] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#16866B] flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6 text-[#16866B]" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-[#123C35]">Google Maps Platform Mode</h3>
            <p className="text-xs text-[#556963] leading-relaxed">
              Google Maps integration is ready. To display Google vector tiles, configure your Google Maps API key or free Maps Demo Key in <code className="bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-mono text-[11px]">VITE_GOOGLE_MAPS_API_KEY</code>.
            </p>
          </div>

          <div className="bg-[#F0F4F2] p-3 rounded-xl text-left space-y-1.5 text-[11px] text-[#26332F]">
            <div className="font-bold text-[#123C35] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#16866B]" />
              <span>Get a free Maps Demo Key (Prototyping):</span>
            </div>
            <ol className="list-decimal list-inside text-[#556963] space-y-0.5 pl-1">
              <li>Visit Google Maps Platform Demo Key page</li>
              <li>Sign in with Google and accept Demo Project terms</li>
              <li>Add key to settings or env file</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            {onSwitchToOsm && (
              <button
                onClick={onSwitchToOsm}
                className="w-full sm:w-auto px-4 py-2.5 bg-[#123C35] hover:bg-[#16866B] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4 text-[#35BFAE]" />
                <span>Use OpenStreetMap (Live & Free)</span>
              </button>
            )}
            <a
              href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-[#F0F4F2] text-[#123C35] border border-[#D5DDD9] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Get Demo Key</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#74817C]" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden shadow-inner border border-[#D5DDD9] bg-[#E9EFE9]">
      <APIProvider apiKey={apiKey} solutionChannel="GMP_aistudio">
        <GoogleMapContentWithStatus
          initialCenter={initialCenter}
          mapTypeId={mapTypeId}
          isPinpointModeActive={isPinpointModeActive}
          onUserPinpoint={onUserPinpoint}
          userLocation={userLocation}
          gpsAccuracyMeters={gpsAccuracyMeters}
          incidents={incidents}
          selectedIncident={selectedIncident}
          onSelectIncident={onSelectIncident}
          sensorStations={sensorStations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          shelters={shelters}
          selectedShelter={selectedShelter}
          onSelectShelter={onSelectShelter}
          accessZones={accessZones}
          selectedAccessZone={selectedAccessZone}
          onSelectAccessZone={onSelectAccessZone}
          accessCorridors={accessCorridors}
          selectedAccessCorridor={selectedAccessCorridor}
          onSelectAccessCorridor={onSelectAccessCorridor}
          showSensorStations={showSensorStations}
          showShelters={showShelters}
          showHazardZones={showHazardZones}
          showAccessZones={showAccessZones}
          showAccessCorridors={showAccessCorridors}
          showEvacCorridor={showEvacCorridor}
          centerTrigger={centerTrigger}
          infoWindowTarget={infoWindowTarget}
          setInfoWindowTarget={setInfoWindowTarget}
          onSwitchToOsm={onSwitchToOsm}
        />
      </APIProvider>

      {/* Floating Google Maps Control Bar in Top Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#D5DDD9] shadow-md">
        <div className="flex items-center gap-1.5 text-xs font-black text-[#123C35] pr-2 border-r border-[#D5DDD9]">
          <span className="text-emerald-700">📍</span>
          <span>Google Maps</span>
          <span className="bg-emerald-100 text-emerald-800 text-[9.5px] px-1.5 py-0.5 rounded-sm font-extrabold">
            LIVE
          </span>
        </div>

        {/* Map Type Switcher */}
        <div className="flex items-center gap-1 text-[11px] font-bold">
          <button
            onClick={() => setMapTypeId("roadmap")}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              mapTypeId === "roadmap"
                ? "bg-[#123C35] text-white"
                : "text-[#556963] hover:bg-[#F0F4F2]"
            }`}
          >
            Vector
          </button>
          <button
            onClick={() => setMapTypeId("satellite")}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              mapTypeId === "satellite"
                ? "bg-[#123C35] text-white"
                : "text-[#556963] hover:bg-[#F0F4F2]"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTypeId("hybrid")}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              mapTypeId === "hybrid"
                ? "bg-[#123C35] text-white"
                : "text-[#556963] hover:bg-[#F0F4F2]"
            }`}
          >
            Hybrid
          </button>
          <button
            onClick={() => setMapTypeId("terrain")}
            className={`px-2 py-1 rounded-md transition cursor-pointer ${
              mapTypeId === "terrain"
                ? "bg-[#123C35] text-white"
                : "text-[#556963] hover:bg-[#F0F4F2]"
            }`}
          >
            Terrain
          </button>
        </div>
      </div>
    </div>
  );
};
