import React, { useState, useEffect } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { CURRENT_TOURIST } from '../../mockData/northeastData';
import { DataCapsuleModal } from '../Common/DataCapsuleModal';
import { IndianEmblem } from '../Common/IndianEmblem';
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
    await createIncident('POSSIBLE_FALL', 'CRITICAL', pos, "IMU Impact 4.8g detected (Possible Fall)");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[85vh]">
      <div className="relative w-full max-w-sm bg-zinc-950 border-[8px] border-zinc-800 rounded-[36px] shadow-2xl overflow-hidden text-zinc-100 flex flex-col h-[740px]">
        {/* Device Top Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-4 bg-zinc-800 rounded-b-lg z-30 flex items-center justify-center">
          <div className="w-10 h-1 bg-zinc-900 rounded-full" />
        </div>

        <div className="bg-zinc-900 px-5 pt-6 pb-2 flex items-center justify-between text-xs text-zinc-300 z-20 border-b border-zinc-800">
          <div className="flex items-center gap-1.5">
            <IndianEmblem className="w-4 h-5 text-zinc-200" />
            <span className="font-mono text-[10px] text-zinc-400">09:41 AM</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            {networkStatus === 'ONLINE' && <span className="flex items-center gap-1 text-orange-400 font-medium"><Wifi className="w-3 h-3" /> 4G</span>}
            {networkStatus === 'WEAK' && <span className="flex items-center gap-1 text-amber-400 font-medium"><Wifi className="w-3 h-3" /> 2G</span>}
            {networkStatus === 'OFFLINE' && <span className="flex items-center gap-1 text-zinc-400 font-medium"><WifiOff className="w-3 h-3" /> Offline</span>}
            <span className="flex items-center gap-1 text-zinc-300 font-mono"><Battery className="w-3 h-3" /> 27%</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold">Registered User</span>
              <h3 className="text-xs font-bold text-zinc-100">{CURRENT_TOURIST.name}</h3>
              <p className="text-[10px] text-zinc-400">{CURRENT_TOURIST.trekRouteName}</p>
            </div>
            <div className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-orange-400 text-[11px] font-mono font-bold">
              {CURRENT_TOURIST.id}
            </div>
          </div>

          <div className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              {networkStatus === 'OFFLINE' ? <WifiOff className="w-4 h-4 text-zinc-400" /> : <Wifi className="w-4 h-4 text-orange-400" />}
              <div>
                <div className="font-bold text-[11px]">
                  {networkStatus === 'ONLINE' && 'Network Connected'}
                  {networkStatus === 'WEAK' && 'Degraded Signal'}
                  {networkStatus === 'OFFLINE' && 'Offline Mode (IndexedDB Queue)'}
                </div>
              </div>
            </div>

            <select
              value={networkStatus}
              onChange={(e) => setNetworkStatus(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-700 text-[10px] rounded px-1.5 py-1 text-zinc-200 focus:outline-none"
            >
              <option value="ONLINE">Online</option>
              <option value="WEAK">Weak</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
              Emergency SOS Trigger
            </span>

            {sosCountdown !== null ? (
              <div className="py-3 space-y-2 bg-orange-950/80 border border-orange-600 rounded-xl">
                <div className="text-2xl font-bold text-orange-400 font-mono">
                  {sosCountdown}s
                </div>
                <div className="text-[10px] text-orange-200 font-semibold uppercase">
                  Dispatching in {sosCountdown} seconds...
                </div>
                <button
                  onClick={cancelSOS}
                  className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold border border-zinc-700"
                >
                  Cancel SOS
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSosCountdown(5)}
                className="w-full py-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 rounded-xl font-black text-lg tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-6 h-6" />
                <span>EMERGENCY SOS</span>
              </button>
            )}

            <p className="text-[10px] text-zinc-400">
              Instant priority emergency alert dispatch
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-orange-400" />
                Sensor Impact Simulation
              </span>
            </div>

            <button
              onClick={() => setShowFallSimPrompt(true)}
              className="w-full py-1.5 bg-zinc-950 hover:bg-zinc-800 text-orange-400 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
              Simulate Fall Impact Alert
            </button>
          </div>

          {activeIncident && (
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 font-mono">
                  {activeIncident.incidentId}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-zinc-950 text-zinc-300 border border-zinc-800">
                  {activeIncident.syncStatus}
                </span>
              </div>

              <div className="text-xs space-y-0.5 text-zinc-300">
                <div>Type: <strong className="text-white">{activeIncident.incidentType}</strong></div>
                <div>Status: <strong className="text-orange-400">{activeIncident.status}</strong></div>
              </div>

              <button
                onClick={() => setShowCapsuleModal(true)}
                className="w-full py-1 bg-zinc-800 text-zinc-200 rounded text-[11px] font-medium border border-zinc-700 flex items-center justify-center gap-1"
              >
                <Lock className="w-3 h-3 text-orange-400" />
                View Local Encrypted Data
              </button>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 p-2.5 border-t border-zinc-800 text-[10px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <RefreshCw className={`w-3 h-3 text-orange-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Local Queue: {pendingSyncCount}</span>
          </div>
          {pendingSyncCount > 0 && networkStatus === 'ONLINE' && (
            <button
              onClick={() => triggerManualSync()}
              className="text-orange-400 font-bold"
            >
              Sync Queue
            </button>
          )}
        </div>
      </div>

      {showFallSimPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl max-w-sm w-full p-5 text-center space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center mx-auto text-orange-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Fall Detection Triggered</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Deceleration impact recorded. Confirm emergency dispatch?
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowFallSimPrompt(false)}
                className="flex-1 py-2 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-bold border border-zinc-700"
              >
                False Alarm
              </button>
              <button
                onClick={triggerFallDetection}
                className="flex-1 py-2 bg-orange-500 text-zinc-950 rounded-lg text-xs font-bold"
              >
                Confirm SOS
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
