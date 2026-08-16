import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { CURRENT_TOURIST } from '../../mockData/northeastData';
import { DataCapsuleModal } from '../Common/DataCapsuleModal';
import { 
  AlertOctagon, ShieldAlert, Battery, Compass, 
  Wifi, WifiOff, Lock, CheckCircle2, RefreshCw
} from 'lucide-react';

export const TouristMobileView: React.FC = () => {
  const { createIncident, activeIncident } = useIncidents();
  const { networkStatus, setNetworkStatus, pendingSyncCount, isSyncing, triggerManualSync } = useConnectivity();

  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [showCapsuleModal, setShowCapsuleModal] = useState<boolean>(false);
  const [showFallSimPrompt, setShowFallSimPrompt] = useState<boolean>(false);
  const [pos] = useState({ latitude: 25.2750, longitude: 91.7340 });

  useEffect(() => {
    let timer: any = null;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(sosCountdown - 1);
      }, 1000);
    } else if (sosCountdown === 0) {
      triggerConfirmedSOS();
      setSosCountdown(null);
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const triggerConfirmedSOS = async () => {
    await createIncident('MANUAL_SOS', 'CRITICAL', pos, "Tourist manually pressed Emergency SOS button");
  };

  const cancelSOS = () => {
    setSosCountdown(null);
  };

  const triggerFallDetection = async () => {
    setShowFallSimPrompt(false);
    await createIncident('POSSIBLE_FALL', 'CRITICAL', pos, "Impact acceleration 4.8g detected (Possible Fall - Confidence 87%)");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[85vh]">
      <div className="relative w-full max-w-sm bg-slate-950 border-[10px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden text-slate-100 flex flex-col h-[750px]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-5 bg-slate-800 rounded-b-xl z-30 flex items-center justify-center">
          <div className="w-12 h-1 bg-slate-900 rounded-full" />
        </div>

        <div className="bg-slate-900 px-6 pt-7 pb-2 flex items-center justify-between text-xs text-slate-400 z-20 border-b border-slate-800/60">
          <span className="font-mono font-bold text-slate-200">09:41 AM</span>
          <div className="flex items-center gap-2 text-[11px]">
            {networkStatus === 'ONLINE' && <span className="flex items-center gap-1 text-emerald-400 font-medium"><Wifi className="w-3.5 h-3.5" /> 4G</span>}
            {networkStatus === 'WEAK' && <span className="flex items-center gap-1 text-amber-400 font-medium"><Wifi className="w-3.5 h-3.5" /> E</span>}
            {networkStatus === 'OFFLINE' && <span className="flex items-center gap-1 text-rose-400 font-medium"><WifiOff className="w-3.5 h-3.5" /> NO NET</span>}
            <span className="flex items-center gap-1 text-amber-300 font-mono"><Battery className="w-3.5 h-3.5" /> 27%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Tourist</span>
              <h3 className="text-sm font-bold text-slate-100">{CURRENT_TOURIST.name}</h3>
              <p className="text-[11px] text-slate-400">{CURRENT_TOURIST.trekRouteName}</p>
            </div>
            <div className="p-2 bg-blue-950/80 border border-blue-800/50 rounded-xl text-blue-400 text-xs font-mono">
              {CURRENT_TOURIST.id}
            </div>
          </div>

          <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
            networkStatus === 'ONLINE'
              ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300'
              : networkStatus === 'WEAK'
              ? 'bg-amber-950/50 border-amber-800/50 text-amber-300'
              : 'bg-rose-950/50 border-rose-800/50 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              {networkStatus === 'OFFLINE' ? <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <div>
                <div className="font-bold text-[11px]">
                  {networkStatus === 'ONLINE' && 'Connected to Central Network'}
                  {networkStatus === 'WEAK' && 'Weak Connectivity Detected'}
                  {networkStatus === 'OFFLINE' && 'Zero-Network Offline Mode'}
                </div>
                <div className="text-[10px] opacity-80">
                  {networkStatus === 'OFFLINE' ? 'Storing incident capsules in local IndexedDB' : 'Direct sync active'}
                </div>
              </div>
            </div>

            <select
              value={networkStatus}
              onChange={(e) => setNetworkStatus(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-[10px] rounded-lg px-2 py-1 text-slate-200 focus:outline-none"
            >
              <option value="ONLINE">🟢 Online</option>
              <option value="WEAK">🟡 Weak</option>
              <option value="OFFLINE">🔴 Offline</option>
            </select>
          </div>

          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl text-center space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Emergency Response Trigger
            </h4>

            {sosCountdown !== null ? (
              <div className="py-4 space-y-3 bg-rose-950/80 border border-rose-600/60 rounded-2xl animate-pulse">
                <div className="text-3xl font-extrabold text-rose-400 font-mono">
                  {sosCountdown}s
                </div>
                <div className="text-xs text-rose-200 font-semibold uppercase tracking-wider">
                  CANCEL INCIDENT CREATION?
                </div>
                <button
                  onClick={cancelSOS}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 shadow-lg"
                >
                  CANCEL (FALSE ALARM)
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSosCountdown(5)}
                className="w-full py-7 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white rounded-2xl font-black text-xl tracking-wider shadow-lg shadow-rose-900/40 active:scale-95 transition-all flex items-center justify-center gap-2 border border-rose-500/40"
              >
                <AlertOctagon className="w-7 h-7" />
                <span>PRESS SOS</span>
              </button>
            )}

            <p className="text-[10px] text-slate-400">
              {sosCountdown !== null ? 'Emergency alert will dispatch automatically after countdown' : 'Initiates instant emergency capsule creation'}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Sensor Auto-Detection Simulator
              </span>
              <span className="text-[10px] text-slate-500 font-mono">IMU 6-Axis</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Simulates impact accelerometers detecting sudden posture changes or terrain drop.
            </p>

            <button
              onClick={() => setShowFallSimPrompt(true)}
              className="w-full py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/50 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Simulate "Possible Fall – Confidence 87%"
            </button>
          </div>

          {activeIncident && (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeIncident.incidentId}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  activeIncident.syncStatus === 'SYNCED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}>
                  {activeIncident.syncStatus}
                </span>
              </div>

              <div className="text-xs space-y-1 text-slate-300">
                <div>Type: <strong className="text-white">{activeIncident.incidentType}</strong></div>
                <div>Status: <strong className="text-cyan-400">{activeIncident.status}</strong></div>
                <div className="text-[10px] text-slate-400 font-mono">
                  GPS: {activeIncident.lastKnownLocation.latitude.toFixed(5)}, {activeIncident.lastKnownLocation.longitude.toFixed(5)}
                </div>
              </div>

              <button
                onClick={() => setShowCapsuleModal(true)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                View Local Emergency Capsule
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-900 p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Queue: {pendingSyncCount} items</span>
          </div>
          {pendingSyncCount > 0 && networkStatus === 'ONLINE' && (
            <button
              onClick={() => triggerManualSync()}
              className="text-emerald-400 hover:underline text-[10px] font-bold"
            >
              Sync Now
            </button>
          )}
        </div>
      </div>

      {showFallSimPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-amber-600/60 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-amber-950 border border-amber-600/60 flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Possible Fall Detected</h3>
              <p className="text-xs text-amber-300 font-mono mt-1">Sensor Confidence: 87%</p>
              <p className="text-xs text-slate-400 mt-2">
                Sudden downward deceleration detected on Nohkalikai Ridge Trail. Are you safe?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFallSimPrompt(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700"
              >
                I AM SAFE (CANCEL)
              </button>
              <button
                onClick={triggerFallDetection}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30"
              >
                CONFIRM INCIDENT
              </button>
            </div>
          </div>
        </div>
      )}

      {showCapsuleModal && activeIncident && (
        <DataCapsuleModal
          incident={activeIncident}
          onClose={() => setShowCapsuleModal(false)}
        />
      )}
    </div>
  );
};
