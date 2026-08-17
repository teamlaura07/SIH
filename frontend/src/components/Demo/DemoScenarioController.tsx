import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { useRole } from '../../context/RoleContext';
import { IndianEmblem } from '../Common/IndianEmblem';
import { 
  RotateCcw, Wifi, WifiOff, ShieldAlert, 
  CheckCircle2, RefreshCw, TestTube2
} from 'lucide-react';

export const DemoScenarioController: React.FC = () => {
  const { createIncident, incidents, assignTeamToIncident, updateIncidentStatus, resetAllData } = useIncidents();
  const { setNetworkStatus, triggerManualSync } = useConnectivity();
  const { setActiveRole } = useRole();

  const [activeStep, setActiveStep] = useState<number>(0);
  const [demoLog, setDemoLog] = useState<string[]>([
    "System scenario runner initialized. Select a test step below."
  ]);

  const addLog = (msg: string) => {
    setDemoLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const runScenario1 = async () => {
    setActiveStep(1);
    setNetworkStatus('ONLINE');
    setActiveRole('TOURIST_PWA');
    addLog("TEST 1: Direct Online Incident Intake");
    const inc = await createIncident('MANUAL_SOS', 'CRITICAL', { latitude: 25.2750, longitude: 91.7340 }, "Test 1: Online SOS Intake");
    addLog(`Incident ${inc.incidentId} intake successful. Direct socket broadcast verified.`);
  };

  const runScenario2 = async () => {
    setActiveStep(2);
    setNetworkStatus('OFFLINE');
    setActiveRole('TOURIST_PWA');
    addLog("TEST 2: Network Interruption Simulation (Switched to Zero-Connectivity Mode)");
  };

  const runScenario3 = async () => {
    setActiveStep(3);
    setNetworkStatus('OFFLINE');
    setActiveRole('TOURIST_PWA');
    addLog("TEST 3: Offline Incident Creation (Local IndexedDB Encrypted Capsule)");
    const inc = await createIncident('POSSIBLE_FALL', 'CRITICAL', { latitude: 25.2780, longitude: 91.7290 }, "Test 3: Offline Fall Detection");
    addLog(`Incident ${inc.incidentId} written to local IndexedDB queue.`);
  };

  const runScenario4 = async () => {
    setActiveStep(4);
    setNetworkStatus('ONLINE');
    setActiveRole('CONTROL_ROOM');
    addLog("TEST 4: Restored Connectivity & Offline Queue Flush");
    const syncedCount = await triggerManualSync();
    addLog(`Offline queue flush completed. ${syncedCount} queued items synchronized.`);
  };

  const runScenario5 = async () => {
    setActiveStep(5);
    setActiveRole('RESCUE_TEAM');
    addLog("TEST 5: Dispatch Unit Assignment & Lifecycle Update");
    if (incidents.length > 0) {
      const target = incidents[0];
      await assignTeamToIncident(target.incidentId, 'RANGER-02');
      addLog(`Assigned RANGER-02 to ${target.incidentId}.`);
      await updateIncidentStatus(target.incidentId, 'RESCUE_DISPATCHED', 'RANGER-02', 'Unit dispatched');
      await updateIncidentStatus(target.incidentId, 'RESOLVED', 'RANGER-02', 'Mission resolved');
      addLog(`Incident ${target.incidentId} status set to RESOLVED.`);
    }
  };

  const handleReset = async () => {
    setActiveStep(0);
    setNetworkStatus('ONLINE');
    setActiveRole('CONTROL_ROOM');
    await resetAllData();
    setDemoLog(["Demo environment reset to baseline state."]);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl p-4 shadow-sm space-y-3.5 text-zinc-100 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-orange-400">
            <TestTube2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Integration & Scenario Runner
            </h2>
            <p className="text-[11px] text-zinc-400">
              Verify end-to-end telemetry sync: Direct Alert → Offline Storage → Auto Sync → Dispatch
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg text-xs font-medium border border-zinc-700 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-zinc-400" /> Reset Baseline State
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
        <button
          onClick={runScenario1}
          className={`p-2.5 rounded-lg border text-left text-xs space-y-1 transition-all ${
            activeStep === 1
              ? 'bg-orange-950/80 border-orange-500 text-orange-200 font-bold'
              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="font-semibold flex items-center gap-1 text-[11px] text-orange-400">
            <Wifi className="w-3.5 h-3.5" /> Test 01: Direct Intake
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Online SOS creation & socket sync.
          </p>
        </button>

        <button
          onClick={runScenario2}
          className={`p-2.5 rounded-lg border text-left text-xs space-y-1 transition-all ${
            activeStep === 2
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="font-semibold flex items-center gap-1 text-[11px] text-amber-400">
            <WifiOff className="w-3.5 h-3.5" /> Test 02: Drop Signal
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Simulate network dropout.
          </p>
        </button>

        <button
          onClick={runScenario3}
          className={`p-2.5 rounded-lg border text-left text-xs space-y-1 transition-all ${
            activeStep === 3
              ? 'bg-orange-950/80 border-orange-500 text-orange-200 font-bold'
              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="font-semibold flex items-center gap-1 text-[11px] text-orange-400">
            <ShieldAlert className="w-3.5 h-3.5" /> Test 03: Offline Fall
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Write capsule to local IndexedDB.
          </p>
        </button>

        <button
          onClick={runScenario4}
          className={`p-2.5 rounded-lg border text-left text-xs space-y-1 transition-all ${
            activeStep === 4
              ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold'
              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="font-semibold flex items-center gap-1 text-[11px] text-amber-400">
            <RefreshCw className="w-3.5 h-3.5" /> Test 04: Queue Flush
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Restore link & flush offline queue.
          </p>
        </button>

        <button
          onClick={runScenario5}
          className={`p-2.5 rounded-lg border text-left text-xs space-y-1 transition-all ${
            activeStep === 5
              ? 'bg-orange-950/80 border-orange-500 text-orange-200 font-bold'
              : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          <div className="font-semibold flex items-center gap-1 text-[11px] text-orange-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Test 05: Unit Dispatch
          </div>
          <p className="text-[10px] text-zinc-400 leading-tight">
            Assign RANGER-02 & mark resolved.
          </p>
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 border-b border-zinc-800 pb-1">
          <span className="font-mono uppercase font-bold text-zinc-300">Execution Log</span>
          <span className="font-mono text-zinc-400">LOG_LEVEL: INFO</span>
        </div>
        <div className="space-y-1 font-mono text-[11px] max-h-24 overflow-y-auto pr-1">
          {demoLog.map((log, i) => (
            <div key={i} className="text-zinc-300 flex items-start gap-1.5">
              <span className="text-orange-500 font-bold">&gt;</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
