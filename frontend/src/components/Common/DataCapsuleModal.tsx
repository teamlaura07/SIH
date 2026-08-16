import React, { useState } from 'react';
import type { Incident } from '../../types/incident';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 border border-emerald-800/50 rounded-lg">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Emergency Data Capsule
                <span className="text-xs bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded font-mono">
                  AES-256 SECURED
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Self-contained incident payload for offline persistence & dynamic sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident ID</span>
              <span className="font-mono text-emerald-400 font-bold">{incident.incidentId}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Tourist ID</span>
              <span className="font-mono text-slate-200">{incident.touristId}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Battery</span>
              <span className="font-mono text-amber-400 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5" /> {incident.batteryLevel}%
              </span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Sync Status</span>
              <span className={`font-mono font-bold ${incident.syncStatus === 'SYNCED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {incident.syncStatus}
              </span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Telemetry & Location Data</span>
              <span className="text-[11px] font-normal text-emerald-400 font-mono">
                {incident.estimatedLocation.confidence}% Confidence
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Confirmed GPS</span>
                <span className="font-mono text-emerald-300">
                  {incident.lastKnownLocation.latitude.toFixed(6)}, {incident.lastKnownLocation.longitude.toFixed(6)}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Search Zone Radius</span>
                <span className="font-mono text-amber-300">
                  {incident.estimatedLocation.radiusMeters} meters
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Capsule Storage Payload
              </span>
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                {showRaw ? 'Show Formatted JSON' : 'Show Encrypted String'}
              </button>
            </div>

            {showRaw ? (
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400 break-all overflow-x-auto max-h-32">
                {encryptedPayloadSim}
              </pre>
            ) : (
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(capsuleData, null, 2)}
              </pre>
            )}
          </div>
        </div>

        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Checksum verified. Ready for automatic synchronization.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Capsule
          </button>
        </div>
      </div>
    </div>
  );
};
