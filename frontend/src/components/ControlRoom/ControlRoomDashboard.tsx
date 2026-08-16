import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { ForestMap } from '../Map/ForestMap';
import { DataCapsuleModal } from '../Common/DataCapsuleModal';
import { CommPathVisualizer } from '../Common/CommPathVisualizer';
import { 
  AlertOctagon, Shield, Clock, MapPin, Lock, 
  Send, CheckCircle2, Activity, RefreshCw
} from 'lucide-react';

export const ControlRoomDashboard: React.FC = () => {
  const { incidents, rescueTeams, activeIncident, setActiveIncident, assignTeamToIncident, refreshIncidents } = useIncidents();
  const { isSyncing } = useConnectivity();

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'OFFLINE' | 'UNASSIGNED'>('ALL');
  const [showCapsuleModal, setShowCapsuleModal] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const filteredIncidents = incidents.filter(inc => {
    if (selectedFilter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (selectedFilter === 'OFFLINE') return inc.networkStatus === 'OFFLINE' || inc.syncStatus === 'PENDING';
    if (selectedFilter === 'UNASSIGNED') return !inc.assignedTeamId && inc.status !== 'RESOLVED';
    return true;
  });

  const activeInc = activeIncident || (incidents.length > 0 ? incidents[0] : null);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-950/80 text-rose-400 border-rose-600/50 shadow-rose-950/50 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-400 border-amber-600/50';
      case 'MEDIUM':
        return 'bg-blue-950/80 text-blue-400 border-blue-600/50';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  const handleAssignTeam = async (incId: string) => {
    if (!selectedTeamId) return;
    await assignTeamToIncident(incId, selectedTeamId);
    setSelectedTeamId('');
  };

  return (
    <div className="space-y-4 p-4 lg:p-6 max-w-7xl mx-auto text-slate-100">
      <CommPathVisualizer />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col h-[700px] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                Live Incident Queue ({filteredIncidents.length})
              </h2>
            </div>
            <button
              onClick={() => refreshIncidents()}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex gap-1.5 py-3 overflow-x-auto text-[11px]">
            {(['ALL', 'CRITICAL', 'OFFLINE', 'UNASSIGNED'] as const).map(flt => (
              <button
                key={flt}
                onClick={() => setSelectedFilter(flt)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  selectedFilter === flt
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500/50" />
                <p>No active incidents matching selected filter</p>
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = activeInc?.incidentId === inc.incidentId;

                return (
                  <div
                    key={inc.incidentId}
                    onClick={() => setActiveIncident(inc)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-850 border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-100">{inc.incidentId}</span>
                        <span className="text-[10px] text-slate-400">({inc.touristId})</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="text-slate-300 font-medium">{inc.incidentType}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                        inc.syncStatus === 'SYNCED' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {inc.syncStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/60 pt-2">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-emerald-400 font-medium">Status: {inc.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div className="h-[380px] w-full">
            <ForestMap
              incidents={incidents}
              rescueTeams={rescueTeams}
              selectedIncident={activeInc}
              onSelectIncident={(inc) => setActiveIncident(inc)}
            />
          </div>

          {activeInc ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-950 border border-rose-800/60 rounded-xl text-rose-400">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                      <span>{activeInc.incidentId}</span>
                      <span className="text-xs text-slate-400 font-mono">({activeInc.touristId})</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-bold border ${getSeverityBadge(activeInc.severity)}`}>
                        {activeInc.severity}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Type: <strong className="text-slate-200">{activeInc.incidentType}</strong> | Last active: {new Date(activeInc.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCapsuleModal(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Inspect Emergency Capsule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> Confirmed GPS
                  </span>
                  <div className="font-mono text-blue-300 font-bold">
                    {activeInc.lastKnownLocation.latitude.toFixed(5)}, {activeInc.lastKnownLocation.longitude.toFixed(5)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">Cell Tower / GPS Fix</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Estimated Search Area
                  </span>
                  <div className="font-mono text-amber-300 font-bold">
                    {activeInc.estimatedLocation.radiusMeters}m Radius
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">
                    Confidence: {activeInc.estimatedLocation.confidence}%
                  </span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Rescue Unit</span>
                  <div className="font-bold text-emerald-400 truncate">
                    {activeInc.assignedTeamName || 'Unassigned'}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {activeInc.etaMinutes ? `ETA: ${activeInc.etaMinutes} mins` : 'Select unit below'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Rescue Team Recommendation Engine
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="flex-1 min-w-[220px] bg-slate-900 border border-slate-700 text-xs rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Rescue Team --</option>
                    {rescueTeams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.type}) - ETA ~{t.estimatedResponseTime}m
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleAssignTeam(activeInc.incidentId)}
                    disabled={!selectedTeamId}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    DISPATCH RESCUE TEAM
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Incident Timeline History
                </h4>

                <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs pr-1">
                  {activeInc.timeline?.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-slate-200">{entry.status}</span>
                        <span className="text-[11px] text-slate-400">- {entry.note}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
              Select an incident from the queue to view telemetry and dispatch rescue teams.
            </div>
          )}
        </div>
      </div>

      {showCapsuleModal && activeInc && (
        <DataCapsuleModal
          incident={activeInc}
          onClose={() => setShowCapsuleModal(false)}
        />
      )}
    </div>
  );
};
