import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { 
  MapPin, CheckCircle2, 
  Send, Radio
} from 'lucide-react';

export const RescueTeamView: React.FC = () => {
  const { incidents, updateIncidentStatus } = useIncidents();

  const assignedInc = incidents.find(inc => inc.assignedTeamId === 'RANGER-02' || inc.status !== 'RESOLVED');

  const [fieldNote, setFieldNote] = useState('');

  const handleProgress = async (nextStatus: string) => {
    if (!assignedInc) return;
    await updateIncidentStatus(assignedInc.incidentId, nextStatus, 'RANGER-02 Team Leader', fieldNote || `Status updated to ${nextStatus}`);
    setFieldNote('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-5 text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">RANGER-02 Field Terminal</h2>
            <p className="text-xs text-slate-400">Cherrapunji Forest Rangers Unit 2</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Terminal Status</span>
          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE FIELD DEPLOYMENT
          </span>
        </div>
      </div>

      {assignedInc ? (
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-rose-600/50 p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-rose-950 text-rose-400 border border-rose-600/60 rounded-full text-xs font-extrabold font-mono tracking-wider animate-pulse">
                MISSION ASSIGNED: {assignedInc.incidentId}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Tourist: <strong className="text-slate-200">{assignedInc.touristId}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Incident Type</span>
              <span className="font-bold text-rose-400 text-sm">{assignedInc.incidentType}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Severity Level</span>
              <span className="font-bold text-amber-400 text-sm">{assignedInc.severity}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Probable Search Zone</span>
              <span className="font-bold text-cyan-400 text-sm">{assignedInc.estimatedLocation.radiusMeters}m Radius</span>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1 font-bold">
                <MapPin className="w-4 h-4 text-emerald-400" /> Confirmed Target Coordinates
              </span>
              <span className="font-mono text-emerald-300">
                {assignedInc.lastKnownLocation.latitude.toFixed(5)}, {assignedInc.lastKnownLocation.longitude.toFixed(5)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Nohkalikai Ridge Forest Trail, Sector 4. Search area confidence: <strong className="text-amber-400 font-mono">{assignedInc.estimatedLocation.confidence}%</strong>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Mission Status Pipeline Execution
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleProgress('RESCUE_DISPATCHED')}
                disabled={assignedInc.status === 'RESCUE_DISPATCHED' || assignedInc.status === 'TEAM_ON_SITE' || assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  assignedInc.status === 'RESCUE_DISPATCHED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                1. DISPATCHED
              </button>

              <button
                onClick={() => handleProgress('TEAM_ASSIGNED')}
                disabled={assignedInc.status === 'TEAM_ON_SITE' || assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  assignedInc.status === 'TEAM_ASSIGNED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                2. EN ROUTE
              </button>

              <button
                onClick={() => handleProgress('TEAM_ON_SITE')}
                disabled={assignedInc.status === 'TEAM_ON_SITE' || assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  assignedInc.status === 'TEAM_ON_SITE'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-lg'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                3. ON SITE
              </button>

              <button
                onClick={() => handleProgress('RESOLVED')}
                disabled={assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                  assignedInc.status === 'RESOLVED'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                }`}
              >
                4. RESOLVED
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">Transmit Field Situation Report</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Ranger team reached sector 4 ravine. Tourist safe, minor sprain."
                value={fieldNote}
                onChange={(e) => setFieldNote(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleProgress(assignedInc.status)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Transmit
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Note: Field reports are saved to local IndexedDB capsule if offline and auto-synced upon reconnect.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-3xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-100">No Active Mission Assigned</h3>
          <p className="text-xs text-slate-400">
            RANGER-02 unit is on standby at Sohra Forest Station. Awaiting emergency dispatch from Central Control Room.
          </p>
        </div>
      )}
    </div>
  );
};
