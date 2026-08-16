import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useRole } from '../../context/RoleContext';
import { 
  RotateCcw, Wifi, WifiOff, ShieldAlert, 
  CheckCircle2, RefreshCw, Zap
} from 'lucide-react';

export const DemoScenarioController: React.FC = () => {
  const { createIncident, incidents, assignTeamToIncident, updateIncidentStatus, resetAllData } = useIncidents();
  const { setNetworkStatus, triggerManualSync } = useConnectivity();
  const { setActiveRole } = useRole();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoLog, setDemoLog] = useState<string[]>([
    "Demo environment ready. Select a scenario step below to simulate real-world North-East India rescue operations."
  ]);

  const addLog = (msg: string) => {
    setDemoLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const runScenario1 = async () => {
    setActiveStep(1);
    setNetworkStatus('ONLINE');
    setActiveRole('TOURIST_PWA');
    addLog("SCENARIO 1: Tourist is ONLINE. Pressing SOS...");
    const inc = await createIncident('MANUAL_SOS', 'CRITICAL', { latitude: 25.2750, longitude: 91.7340 }, "Scenario 1: Online SOS");
    addLog(`Incident ${inc.incidentId} created & synchronized with Control Room immediately!`);
  };

  const runScenario2 = async () => {
    setActiveStep(2);
    setNetworkStatus('OFFLINE');
    setActiveRole('TOURIST_PWA');
    addLog("SCENARIO 2: Tourist enters deep Dzukou valley mist zone. NETWORK LOST -> Switched to OFFLINE.");
  };

  const runScenario3 = async () => {
    setActiveStep(3);
    setNetworkStatus('OFFLINE');
    setActiveRole('TOURIST_PWA');
    addLog("SCENARIO 3: Tourist experiences a fall while OFFLINE. Creating Emergency Capsule locally...");
    const inc = await createIncident('POSSIBLE_FALL', 'CRITICAL', { latitude: 25.2780, longitude: 91.7290 }, "Scenario 3: Offline Fall Detection");
    addLog(`Incident ${inc.incidentId} stored in local IndexedDB! Capsule created. Control room cannot see it yet.`);
  };

  const runScenario4 = async () => {
    setActiveStep(4);
    setNetworkStatus('ONLINE');
    setActiveRole('CONTROL_ROOM');
    addLog("SCENARIO 4: Network connectivity RESTORED. Triggering automatic synchronization queue...");
    const syncedCount = await triggerManualSync();
    addLog(`AUTOMATIC SYNC COMPLETE! Flushed ${syncedCount} queued incidents to Control Room Dashboard.`);
  };

  const runScenario5 = async () => {
    setActiveStep(5);
    setActiveRole('RESCUE_TEAM');
    addLog("SCENARIO 5: Control Room classifies incident severity & recommends RANGER-02 team.");
    if (incidents.length > 0) {
      const target = incidents[0];
      await assignTeamToIncident(target.incidentId, 'RANGER-02');
      addLog(`Assigned RANGER-02 team to ${target.incidentId}. Team accepts mission & dispatches.`);
      await updateIncidentStatus(target.incidentId, 'RESCUE_DISPATCHED', 'RANGER-02', 'Rescue dispatched to Nohkalikai sector');
      await updateIncidentStatus(target.incidentId, 'RESOLVED', 'RANGER-02', 'Tourist located, safe & airlifted');
      addLog(`INCIDENT ${target.incidentId} SUCCESSFULLY RESOLVED! Complete timeline recorded.`);
    }
  };

  const handleReset = async () => {
    setActiveStep(0);
    setNetworkStatus('ONLINE');
    setActiveRole('CONTROL_ROOM');
    await resetAllData();
    setDemoLog(["System reset to initial clean state."]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-2xl space-y-4 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950 border border-indigo-800 rounded-xl text-indigo-400">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
              Real-World North-East India Simulation Suite
            </h2>
            <p className="text-xs text-slate-400">
              Simulate: Connected Area → Weak Network → Zero Connectivity → Signal Restored → Rescue Dispatch
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset Demo State
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        <button
          onClick={runScenario1}
          className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
            activeStep === 1
              ? 'bg-blue-950 border-blue-500 text-blue-200 ring-2 ring-blue-500/40 shadow-lg'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-bold flex items-center gap-1 text-[11px] text-blue-400">
            <Wifi className="w-3.5 h-3.5" /> 1. Online SOS
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Normal online incident creation & direct sync.
          </p>
        </button>

        <button
          onClick={runScenario2}
          className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
            activeStep === 2
              ? 'bg-amber-950 border-amber-500 text-amber-200 ring-2 ring-amber-500/40 shadow-lg'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-bold flex items-center gap-1 text-[11px] text-amber-400">
            <WifiOff className="w-3.5 h-3.5" /> 2. Signal Lost
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Tourist enters zero-network mountain ravine.
          </p>
        </button>

        <button
          onClick={runScenario3}
          className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
            activeStep === 3
              ? 'bg-rose-950 border-rose-500 text-rose-200 ring-2 ring-rose-500/40 shadow-lg'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-bold flex items-center gap-1 text-[11px] text-rose-400">
            <ShieldAlert className="w-3.5 h-3.5" /> 3. Offline Incident
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Fall occurs offline. Encrypted capsule stored locally.
          </p>
        </button>

        <button
          onClick={runScenario4}
          className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
            activeStep === 4
              ? 'bg-emerald-950 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-bold flex items-center gap-1 text-[11px] text-emerald-400">
            <RefreshCw className="w-3.5 h-3.5" /> 4. Restored & Sync
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Signal returns. Queue auto-flushes to control room.
          </p>
        </button>

        <button
          onClick={runScenario5}
          className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
            activeStep === 5
              ? 'bg-purple-950 border-purple-500 text-purple-200 ring-2 ring-purple-500/40 shadow-lg'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="font-bold flex items-center gap-1 text-[11px] text-purple-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> 5. Rescue & Resolve
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            RANGER-02 dispatches & completes rescue timeline.
          </p>
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
          <span className="font-mono uppercase font-bold text-slate-300">Live Simulation Activity Log</span>
          <span className="font-mono text-emerald-400">STATUS: ACTIVE PROTOCOL</span>
        </div>
        <div className="space-y-1 font-mono text-[11px] max-h-28 overflow-y-auto pr-1">
          {demoLog.map((log, i) => (
            <div key={i} className="text-slate-300 flex items-start gap-2">
              <span className="text-emerald-500 font-bold">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
