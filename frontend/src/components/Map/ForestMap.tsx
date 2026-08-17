import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ScaleControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Incident, RescueTeam, GPSLocation } from '../../types/incident';
import { MOUNTAIN_TRAILS, DANGER_GEOFENCES } from '../../mockData/northeastData';
import { Layers, ShieldAlert } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Component to handle dynamic map recentering
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);
  return null;
};

// Map Tile Providers Definition
type MapTileProvider = 'SATELLITE' | 'TOPO' | 'DARK' | 'STREET';

const TILE_PROVIDERS: Record<MapTileProvider, { name: string; url: string; attribution: string; maxZoom: number }> = {
  SATELLITE: {
    name: "🛰️ High-Res Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18
  },
  TOPO: {
    name: "⛰️ Topo / Contour",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17
  },
  DARK: {
    name: "🌙 Tactical Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19
  },
  STREET: {
    name: "🗺️ OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }
};

// Custom Marker Generators
const createCustomMarker = (color: string, label: string, badge?: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: #09090b; font-weight: 900; font-size: 12px;">
          ${label}
        </div>
        ${badge ? `<div style="position: absolute; top: -6px; right: -6px; background-color: #18181b; color: #f97316; border: 1px solid #f97316; border-radius: 4px; padding: 1px 4px; font-size: 8px; font-weight: bold; font-family: monospace;">${badge}</div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Sonar Pulsing SOS Marker
const createPulsingEmergencyMarker = (label: string) => {
  return L.divIcon({
    className: 'custom-emergency-icon',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 64px; height: 64px; border-radius: 50%; background-color: rgba(255, 103, 31, 0.4); border: 2px solid #FF671F; animation: sonar-ripple 2s infinite ease-out;"></div>
        <div style="background: linear-gradient(135deg, #ff7824 0%, #e65100 100%); width: 40px; height: 40px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 20px rgba(255,103,31,0.9); display: flex; align-items: center; justify-content: center; color: #09090b; font-weight: 900; font-size: 13px;">
          ${label}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

// Evacuation Helipad Marker
const helipadIcon = L.divIcon({
  className: 'custom-helipad-icon',
  html: `
    <div style="background-color: #18181b; border: 2px solid #e4e4e7; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f4f4f5; font-weight: 900; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
      🚁 H
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Waypoint Checkpoint Icon
const waypointIcon = L.divIcon({
  className: 'custom-waypoint-icon',
  html: `
    <div style="background-color: #27272a; border: 1.5px solid #a1a1aa; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #f4f4f5; font-weight: bold; font-size: 10px;">
      📍
    </div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Mock Trail Checkpoints & Waypoints
const TRAIL_WAYPOINTS = [
  { id: 'WP-01', name: 'Sohra Ridge Crest (Elev 1,460m)', lat: 25.2850, lng: 91.7200 },
  { id: 'WP-02', name: 'Mist Corridor Stream Crossing', lat: 25.2780, lng: 91.7290 },
  { id: 'WP-03', name: 'Nohkalikai Ravine Overlook', lat: 25.2750, lng: 91.7340 },
  { id: 'WP-04', name: 'Cherrapunji Forest Trailhead', lat: 25.2670, lng: 91.7450 }
];

// Emergency Airlift Helipads
const HELIPADS = [
  { id: 'LZ-ALPHA', name: 'Evacuation Helipad LZ-Alpha (Sohra Ridge)', lat: 25.2830, lng: 91.7300, elevation: '1,460m' },
  { id: 'LZ-BETA', name: 'Rescue LZ-Beta (Nohkalikai Base Camp)', lat: 25.2680, lng: 91.7400, elevation: '1,320m' }
];

// Tourist Movement History Polyline (Breadcrumbs)
const TOURIST_HISTORY_PATH: [number, number][] = [
  [25.2850, 91.7200],
  [25.2820, 91.7240],
  [25.2780, 91.7290],
  [25.2750, 91.7340]
];

interface ForestMapProps {
  incidents: Incident[];
  rescueTeams: RescueTeam[];
  selectedIncident?: Incident | null;
  currentTouristPos?: GPSLocation;
  onSelectIncident?: (inc: Incident) => void;
}

export const ForestMap: React.FC<ForestMapProps> = ({
  incidents,
  rescueTeams,
  selectedIncident,
  currentTouristPos = { latitude: 25.2750, longitude: 91.7340 },
  onSelectIncident
}) => {
  const [tileProvider, setTileProvider] = useState<MapTileProvider>('SATELLITE');
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showWaypoints, setShowWaypoints] = useState<boolean>(true);
  const [showHelipads, setShowHelipads] = useState<boolean>(true);
  const [showSearchRadius, setShowSearchRadius] = useState<boolean>(true);

  const mapCenter: [number, number] = selectedIncident
    ? [selectedIncident.lastKnownLocation.latitude, selectedIncident.lastKnownLocation.longitude]
    : [currentTouristPos.latitude, currentTouristPos.longitude];

  const currentProviderConfig = TILE_PROVIDERS[tileProvider];

  const touristMarkerIcon = createCustomMarker('#e4e4e7', 'T', 'T1028');
  const rescueMarkerIcon = (name: string) => createCustomMarker('#ea580c', 'R', name.split(' ')[0]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-950 flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-md p-2 rounded-xl text-xs text-zinc-100 shadow-xl pointer-events-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-400 mr-1 font-mono">
            <Layers className="w-3.5 h-3.5" /> BASEMAP:
          </div>
          {(['SATELLITE', 'TOPO', 'DARK', 'STREET'] as MapTileProvider[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setTileProvider(mode)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all ${
                tileProvider === mode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 shadow border border-orange-300'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700'
              }`}
            >
              {TILE_PROVIDERS[mode].name.split(' ')[0]} {TILE_PROVIDERS[mode].name.split(' ')[1]}
            </button>
          ))}
        </div>

        {/* Overlay Filters & Quick Snap */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <button
            onClick={() => setShowTrails(!showTrails)}
            className={`px-2 py-1 rounded border font-semibold transition-all ${showTrails ? 'bg-zinc-800 border-zinc-500 text-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
            title="Toggle Mountain Trek Routes"
          >
            🛤️ Trails
          </button>
          <button
            onClick={() => setShowGeofences(!showGeofences)}
            className={`px-2 py-1 rounded border font-semibold transition-all ${showGeofences ? 'bg-zinc-800 border-rose-500/60 text-rose-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
            title="Toggle Danger Geofences"
          >
            ⚠️ Danger
          </button>
          <button
            onClick={() => setShowWaypoints(!showWaypoints)}
            className={`px-2 py-1 rounded border font-semibold transition-all ${showWaypoints ? 'bg-zinc-800 border-zinc-500 text-zinc-200' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
            title="Toggle Trail Checkpoint Waypoints"
          >
            📍 Checkpoints
          </button>
          <button
            onClick={() => setShowHelipads(!showHelipads)}
            className={`px-2 py-1 rounded border font-semibold transition-all ${showHelipads ? 'bg-zinc-800 border-amber-500/60 text-amber-300' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
            title="Toggle Evacuation Helipads"
          >
            🚁 Helipads
          </button>
        </div>
      </div>

      {/* Main Leaflet Map View */}
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '400px', background: '#09090b' }}
      >
        <MapRecenter center={mapCenter} />

        <ScaleControl position="bottomleft" imperial={false} />

        {/* Dynamic Basemap Tile Layer */}
        <TileLayer
          key={tileProvider}
          url={currentProviderConfig.url}
          attribution={currentProviderConfig.attribution}
          maxZoom={currentProviderConfig.maxZoom}
        />

        {/* Tourist Historical GPS Movement Polyline (Breadcrumb Trail) */}
        <Polyline
          positions={TOURIST_HISTORY_PATH}
          pathOptions={{
            color: '#e4e4e7',
            weight: 3,
            dashArray: '4, 6',
            opacity: 0.9
          }}
        />

        {/* Mountain Trek Routes */}
        {showTrails && MOUNTAIN_TRAILS.map((trail, idx) => (
          <Polyline
            key={idx}
            positions={trail.coordinates}
            pathOptions={{ color: '#f97316', weight: 4, opacity: 0.85 }}
          >
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <span className="font-bold text-orange-400 block uppercase tracking-wider">{trail.name}</span>
                <span className="text-[10px] text-zinc-300 block">Northeast High-Elevation Trail Circuit</span>
                <span className="text-[10px] font-mono text-orange-300 font-bold block">Status: Open / Monitored</span>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* High-Risk Danger Geofences */}
        {showGeofences && DANGER_GEOFENCES.map((geo) => (
          <Circle
            key={geo.id}
            center={[geo.center.latitude, geo.center.longitude]}
            radius={geo.radiusMeters}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#dc2626',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '6, 6'
            }}
          >
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <div className="font-extrabold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>{geo.name}</span>
                </div>
                <div className="text-[10px] font-mono text-rose-300 font-bold">
                  HAZARD: {geo.riskLevel}
                </div>
                <div className="text-[10px] text-zinc-300">
                  Radius: {geo.radiusMeters} meters radius geofence
                </div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Trail Checkpoint Waypoints */}
        {showWaypoints && TRAIL_WAYPOINTS.map((wp) => (
          <Marker key={wp.id} position={[wp.lat, wp.lng]} icon={waypointIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <span className="font-bold text-zinc-200 block">{wp.id}: {wp.name}</span>
                <span className="text-[10px] font-mono text-zinc-400 block">
                  GPS: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Emergency Evacuation Helipads */}
        {showHelipads && HELIPADS.map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={helipadIcon}>
            <Popup>
              <div className="p-1 text-xs space-y-1">
                <span className="font-extrabold text-amber-400 block">{h.name}</span>
                <span className="text-[10px] text-zinc-300 block">Altitude: {h.elevation}</span>
                <span className="text-[10px] font-mono text-orange-400 font-bold block">Status: READY FOR EVAC AIRLIFT</span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current Tourist Location Marker */}
        <Marker position={[currentTouristPos.latitude, currentTouristPos.longitude]} icon={touristMarkerIcon}>
          <Popup>
            <div className="p-1 text-xs space-y-1">
              <span className="font-bold text-zinc-100 block">Tourist T1028 (Rahul Sharma)</span>
              <span className="text-[10px] text-zinc-300 block">Route: Nohkalikai Circuit</span>
              <span className="text-[10px] font-mono text-orange-400 font-bold block">
                Last GPS: {currentTouristPos.latitude.toFixed(5)}, {currentTouristPos.longitude.toFixed(5)}
              </span>
            </div>
          </Popup>
        </Marker>

        {/* Active Emergency Incidents & Search Zones */}
        {incidents.map((inc) => {
          const isSelected = selectedIncident?.incidentId === inc.incidentId;

          return (
            <React.Fragment key={inc.incidentId}>
              {/* Pulsing Sonar SOS Marker */}
              <Marker
                position={[inc.lastKnownLocation.latitude, inc.lastKnownLocation.longitude]}
                icon={createPulsingEmergencyMarker('SOS')}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(inc)
                }}
              >
                <Popup>
                  <div className="p-1.5 space-y-1 text-xs">
                    <div className="font-black text-orange-400 flex items-center justify-between">
                      <span>{inc.incidentId}</span>
                      <span className="text-[9px] bg-orange-950 text-orange-400 border border-orange-600 px-1.5 py-0.5 rounded font-mono font-bold">
                        {inc.severity}
                      </span>
                    </div>
                    <div className="text-zinc-200 font-bold">{inc.incidentType}</div>
                    <div className="text-[10px] font-mono text-zinc-400">
                      GPS: {inc.lastKnownLocation.latitude.toFixed(5)}, {inc.lastKnownLocation.longitude.toFixed(5)}
                    </div>
                    <div className="text-[10px] font-mono text-orange-300 font-bold pt-1 border-t border-zinc-700">
                      Sync: {inc.syncStatus} | Status: {inc.status}
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Estimated Search Zone Circle with Pulsing Border */}
              {showSearchRadius && (
                <Circle
                  center={[inc.estimatedLocation.latitude, inc.estimatedLocation.longitude]}
                  radius={inc.estimatedLocation.radiusMeters}
                  pathOptions={{
                    color: isSelected ? '#ff7824' : '#f59e0b',
                    fillColor: isSelected ? '#ff7824' : '#fbbf24',
                    fillOpacity: isSelected ? 0.3 : 0.15,
                    weight: isSelected ? 3 : 2,
                    dashArray: '5, 5'
                  }}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <span className="font-bold text-orange-400 block">Probable Search Area ({inc.estimatedLocation.radiusMeters}m)</span>
                      <span className="text-[10px] font-mono text-amber-300 block">
                        Estimated Confidence: {inc.estimatedLocation.confidence}%
                      </span>
                    </div>
                  </Popup>
                </Circle>
              )}
            </React.Fragment>
          );
        })}

        {/* Deployed Rescue Teams */}
        {rescueTeams.map((team) => (
          <Marker key={team.id} position={[team.latitude, team.longitude]} icon={rescueMarkerIcon(team.id)}>
            <Popup>
              <div className="p-1.5 text-xs space-y-1">
                <span className="font-extrabold text-orange-400 block">{team.name}</span>
                <span className="text-[10px] text-zinc-300 block">Unit Type: {team.type}</span>
                <span className="text-[10px] text-zinc-400 block">Base: {team.baseLocation}</span>
                <div className="text-[10px] font-mono text-orange-300 font-bold pt-1 border-t border-zinc-700">
                  ETA to Incident: ~{team.estimatedResponseTime} mins
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Bottom Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-zinc-900/95 border border-zinc-700/80 backdrop-blur-md p-3 rounded-xl text-[10px] text-zinc-200 space-y-1.5 shadow-xl pointer-events-auto max-w-[260px]">
        <div className="font-extrabold text-zinc-100 uppercase tracking-wider border-b border-zinc-700 pb-1 flex items-center justify-between">
          <span>Tactical Map Legend</span>
          <span className="text-[9px] font-mono text-orange-400 font-bold">SECTOR 4</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-white animate-pulse" />
            <span>Active SOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-200 border border-zinc-950" />
            <span>Tourist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
            <span>Rescue Unit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-rose-500/40 border border-rose-500" />
            <span>Danger Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-orange-500" />
            <span>Trek Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded bg-zinc-800 border border-amber-400 flex items-center justify-center text-[7px]">🚁</div>
            <span>Helipad LZ</span>
          </div>
        </div>
      </div>
    </div>
  );
};
