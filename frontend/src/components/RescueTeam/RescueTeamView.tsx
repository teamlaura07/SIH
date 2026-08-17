import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { IndianEmblem } from '../Common/IndianEmblem';
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
    <div className="max-w-2xl mx-auto p-4 lg:p-6 space-y-5 text-zinc-100">
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-700/80 p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-2 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-500/60 rounded-xl text-zinc-100 shadow-md">
            <IndianEmblem className="w-7 h-8 text-zinc-100" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              RANGER-02 Field Terminal
              <span className="text-[10px] bg-orange-500 text-zinc-950 border border-orange-300 px-2 py-0.5 rounded font-mono font-black">
                NDRF / RANGER
              </span>
            </h2>
            <p className="text-xs text-zinc-300">Cherrapunji Tactical Forest Rangers Unit 2</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Terminal Status</span>
          <span className="text-xs font-mono text-orange-400 font-bold flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-orange-500" /> ACTIVE DEPLOYMENT
          </span>
        </div>
      </div>

      {assignedInc ? (
        <div className="bg-zinc-900 border border-zinc-700/80 p-6 rounded-3xl space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-orange-950 text-orange-400 border border-orange-500/80 rounded-full text-xs font-extrabold font-mono tracking-wider animate-pulse">
                MISSION ASSIGNED: {assignedInc.incidentId}
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-400">
              Tourist: <strong className="text-zinc-200">{assignedInc.touristId}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block uppercase font-bold">Incident Type</span>
              <span className="font-bold text-orange-400 text-sm">{assignedInc.incidentType}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 text-[10px] block uppercase font-bold">Severity Level</span>
              <span className="font-bold text-amber-400 text-sm">{assignedInc.severity}</span>
            </div>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
              <span className="text-zinc-400 text-[10px] block uppercase font-bold">Probable Search Zone</span>
              <span className="font-bold text-orange-300 text-sm">{assignedInc.estimatedLocation.radiusMeters}m Radius</span>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1 font-bold">
                <MapPin className="w-4 h-4 text-orange-400" /> Confirmed Target Coordinates
              </span>
              <span className="font-mono text-orange-300 font-bold">
                {assignedInc.lastKnownLocation.latitude.toFixed(5)}, {assignedInc.lastKnownLocation.longitude.toFixed(5)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Nohkalikai Ridge Forest Trail, Sector 4. Search area confidence: <strong className="text-orange-400 font-mono">{assignedInc.estimatedLocation.confidence}%</strong>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Mission Status Pipeline Execution
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleProgress('RESCUE_DISPATCHED')}
                disabled={assignedInc.status === 'RESCUE_DISPATCHED' || assignedInc.status === 'TEAM_ON_SITE' || assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-black border transition-all ${
                  assignedInc.status === 'RESCUE_DISPATCHED'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 border-orange-300 shadow-lg'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                1. DISPATCHED
              </button>

              <button
                onClick={() => handleProgress('TEAM_ASSIGNED')}
                disabled={assignedInc.status === 'TEAM_ON_SITE' || assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-black border transition-all ${
                  assignedInc.status === 'TEAM_ASSIGNED'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 border-orange-300 shadow-lg'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                2. EN ROUTE
              </button>

              <button
                onClick={() => handleProgress('TEAM_ON_SITE')}
                disabled={assignedInc.status === 'TEAM_ON_SITE' || assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-black border transition-all ${
                  assignedInc.status === 'TEAM_ON_SITE'
                    ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                3. ON SITE
              </button>

              <button
                onClick={() => handleProgress('RESOLVED')}
                disabled={assignedInc.status === 'RESOLVED'}
                className={`py-3 rounded-xl text-xs font-black border transition-all ${
                  assignedInc.status === 'RESOLVED'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 border-orange-300 shadow-lg'
                    : 'bg-orange-950 text-orange-300 border-orange-800 hover:bg-orange-900'
                }`}
              >
                4. RESOLVED
              </button>
            </div>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-zinc-300 block">Transmit Field Situation Report</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Ranger team reached sector 4 ravine. Tourist safe, minor sprain."
                value={fieldNote}
                onChange={(e) => setFieldNote(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-700 text-xs rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 font-semibold"
              />
              <button
                onClick={() => handleProgress(assignedInc.status)}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1 shadow"
              >
                <Send className="w-4 h-4" />
                SEND
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-700/80 p-12 rounded-3xl text-center text-zinc-400 text-sm">
          No active mission assigned to RANGER-02.
        </div>
      )}
    </div>
  );
};
