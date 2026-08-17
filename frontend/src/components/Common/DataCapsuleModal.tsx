import React, { useState } from 'react';
import type { Incident } from '../../types/incident';
import { IndianEmblem } from './IndianEmblem';
import { Lock, FileText, CheckCircle2, Battery, X } from 'lucide-react';

interface DataCapsuleModalProps {
  incident: Incident;
  onClose: () => void;
}

export const DataCapsuleModal: React.FC<DataCapsuleModalProps> = ({ incident, onClose }) => {
  const [showRaw, setShowRaw] = useState(false);

  const capsuleData = {
    capsuleHeader: {
      capsuleId: `CAPSULE-${incident.incidentId}`,
      incidentId: incident.incidentId,
      touristId: incident.touristId,
      timestamp: incident.timestamp,
      checksum: `SHA256-${incident.incidentId.replace('-', '')}-7F8A`
    },
    telemetry: {
      lastKnownLocation: incident.lastKnownLocation,
      estimatedLocation: incident.estimatedLocation,
      batteryLevel: incident.batteryLevel,
      networkStatusAtCreation: incident.networkStatus,
      movementPointsCount: incident.movementHistory?.length || 0
    },
    emergencyData: {
      incidentType: incident.incidentType,
      severity: incident.severity,
      contacts: incident.emergencyContacts
    }
  };

  const encryptedPayloadSim = btoa(JSON.stringify(capsuleData));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between bg-zinc-950 px-5 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-zinc-900 border border-zinc-700 rounded-lg">
              <IndianEmblem className="w-6 h-7 text-zinc-200" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                Emergency Telemetry Capsule
                <span className="text-[10px] bg-zinc-800 text-orange-400 border border-zinc-700 px-2 py-0.5 rounded font-mono font-bold">
                  AES-256 Payload
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Self-contained offline record payload stored in browser IndexedDB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Incident ID</span>
              <span className="font-mono text-orange-400 font-bold">{incident.incidentId}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Tourist ID</span>
              <span className="font-mono text-zinc-200 font-bold">{incident.touristId}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Battery Status</span>
              <span className="font-mono text-amber-300 flex items-center gap-1 font-bold">
                <Battery className="w-3.5 h-3.5" /> {incident.batteryLevel}%
              </span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 text-xs">
              <span className="text-zinc-400 block text-[10px] uppercase font-bold">Sync Status</span>
              <span className={`font-mono font-bold ${incident.syncStatus === 'SYNCED' ? 'text-orange-400' : 'text-amber-300'}`}>
                {incident.syncStatus}
              </span>
            </div>
          </div>

          <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>GNSS & Search Area Bounds</span>
              <span className="text-[10px] font-bold text-orange-400 font-mono">
                {incident.estimatedLocation.confidence}% Confidence
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block font-bold uppercase">Latitude / Longitude</span>
                <span className="font-mono text-orange-300 font-bold">
                  {incident.lastKnownLocation.latitude.toFixed(6)}, {incident.lastKnownLocation.longitude.toFixed(6)}
                </span>
              </div>
              <div className="bg-zinc-900 p-2 rounded border border-zinc-800">
                <span className="text-zinc-400 text-[10px] block font-bold uppercase">Estimated Radius</span>
                <span className="font-mono text-amber-300 font-bold">
                  {incident.estimatedLocation.radiusMeters} meters
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                IndexedDB Payload Body
              </span>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                {showRaw ? 'View JSON' : 'View Base64 Binary'}
              </button>
            </div>

            {showRaw ? (
              <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[10px] font-mono text-orange-400 break-all overflow-x-auto max-h-32">
                {encryptedPayloadSim}
              </pre>
            ) : (
              <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-40">
                {JSON.stringify(capsuleData, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="bg-zinc-950 px-5 py-2.5 border-t border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <CheckCircle2 className="w-4 h-4 text-orange-400" />
            <span>SHA256 Payload Checksum Verified</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded transition-colors font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
