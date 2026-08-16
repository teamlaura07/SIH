import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Incident, RescueTeam, GPSLocation } from '../../types/incident';
import { MOUNTAIN_TRAILS, DANGER_GEOFENCES } from '../../mockData/northeastData';
import 'leaflet/dist/leaflet.css';

const MapRecenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const createCustomMarker = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); display: flex; items-center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
        ${label}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const touristIcon = createCustomMarker('#3b82f6', 'T');
const emergencyIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `
    <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #ef4444; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 13px; animation: pulse 1.5s infinite;">
      SOS
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});
const rescueIcon = createCustomMarker('#10b981', 'R');

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
  const mapCenter: [number, number] = selectedIncident
    ? [selectedIncident.lastKnownLocation.latitude, selectedIncident.lastKnownLocation.longitude]
    : [currentTouristPos.latitude, currentTouristPos.longitude];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      <MapContainer
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '380px', background: '#090d16' }}
      >
        <MapRecenter center={mapCenter} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {MOUNTAIN_TRAILS.map((trail, idx) => (
          <Polyline
            key={idx}
            positions={trail.coordinates}
            pathOptions={{ color: '#06b6d4', weight: 4, dashArray: '6, 8', opacity: 0.8 }}
          >
            <Popup>
              <div className="text-xs font-bold text-slate-800">{trail.name}</div>
            </Popup>
          </Polyline>
        ))}

        {DANGER_GEOFENCES.map((geo) => (
          <Circle
            key={geo.id}
            center={[geo.center.latitude, geo.center.longitude]}
            radius={geo.radiusMeters}
            pathOptions={{
              color: '#dc2626',
              fillColor: '#ef4444',
              fillOpacity: 0.15,
              weight: 2,
              dashArray: '4, 6'
            }}
          >
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-rose-600 block">{geo.name}</span>
                <span className="text-[10px] text-slate-600">Risk: {geo.riskLevel}</span>
              </div>
            </Popup>
          </Circle>
        ))}

        <Marker position={[currentTouristPos.latitude, currentTouristPos.longitude]} icon={touristIcon}>
          <Popup>
            <div className="text-xs">
              <span className="font-bold text-blue-600 block">Tourist T1028 (Rahul Sharma)</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {currentTouristPos.latitude.toFixed(5)}, {currentTouristPos.longitude.toFixed(5)}
              </span>
            </div>
          </Popup>
        </Marker>

        {incidents.map((inc) => {
          const isSelected = selectedIncident?.incidentId === inc.incidentId;

          return (
            <React.Fragment key={inc.incidentId}>
              <Marker
                position={[inc.lastKnownLocation.latitude, inc.lastKnownLocation.longitude]}
                icon={emergencyIcon}
                eventHandlers={{
                  click: () => onSelectIncident && onSelectIncident(inc)
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <div className="font-bold text-rose-600 flex items-center gap-1">
                      <span>{inc.incidentId}</span>
                      <span className="text-[9px] bg-rose-100 text-rose-800 px-1 rounded">
                        {inc.severity}
                      </span>
                    </div>
                    <div className="text-slate-700">{inc.incidentType}</div>
                    <div className="text-[10px] font-mono text-slate-500">
                      GPS: {inc.lastKnownLocation.latitude.toFixed(4)}, {inc.lastKnownLocation.longitude.toFixed(4)}
                    </div>
                    <div className="text-[10px] font-bold text-slate-800">
                      Sync: {inc.syncStatus} | Status: {inc.status}
                    </div>
                  </div>
                </Popup>
              </Marker>

              <Circle
                center={[inc.estimatedLocation.latitude, inc.estimatedLocation.longitude]}
                radius={inc.estimatedLocation.radiusMeters}
                pathOptions={{
                  color: isSelected ? '#f59e0b' : '#3b82f6',
                  fillColor: isSelected ? '#fbbf24' : '#60a5fa',
                  fillOpacity: 0.25,
                  weight: isSelected ? 3 : 1.5,
                  dashArray: '5, 5'
                }}
              />
            </React.Fragment>
          );
        })}

        {rescueTeams.map((team) => (
          <Marker key={team.id} position={[team.latitude, team.longitude]} icon={rescueIcon}>
            <Popup>
              <div className="text-xs">
                <span className="font-bold text-emerald-600 block">{team.name}</span>
                <span className="text-[10px] text-slate-600 block">Type: {team.type}</span>
                <span className="text-[10px] font-mono text-emerald-700">
                  ETA: ~{team.estimatedResponseTime} mins
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 border border-slate-800 backdrop-blur-md p-2.5 rounded-lg text-[10px] text-slate-300 space-y-1 shadow-lg pointer-events-auto">
        <div className="font-bold text-slate-200 uppercase tracking-wider mb-1">
          Northeast Forest Layer
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white" />
          <span>Confirmed Tourist Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-pulse" />
          <span>Active Incident (Confirmed SOS)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40 border border-amber-400 border-dashed" />
          <span>Probable Search Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
          <span>Rescue Team Base</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-cyan-400 border-dashed" />
          <span>Mountain Trail / Trek Route</span>
        </div>
      </div>
    </div>
  );
};
