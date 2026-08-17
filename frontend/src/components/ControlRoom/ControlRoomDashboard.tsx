import React, { useState } from 'react';
import { useIncidents } from '../../context/IncidentContext';
import { useConnectivity } from '../../context/ConnectivityContext';
import { ForestMap } from '../Map/ForestMap';
import { DataCapsuleModal } from '../Common/DataCapsuleModal';
import { CommPathVisualizer } from '../Common/CommPathVisualizer';
import { 
  AlertTriangle, Shield, Clock, MapPin, Lock, 
  Send, CheckCircle2, Activity, RefreshCw, Radio, Users, HardDrive
} from 'lucide-react';

export const ControlRoomDashboard: React.FC = () => {
  const { incidents, rescueTeams, activeIncident, setActiveIncident, assignTeamToIncident, refreshIncidents } = useIncidents();
  const { isSyncing, pendingSyncCount } = useConnectivity();

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
  const assignedUnitsCount = rescueTeams.filter(t => !t.available || incidents.some(i => i.assignedTeamId === t.id)).length;

  const getPriorityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-orange-950/80 text-orange-400 border-orange-600/70 font-mono font-bold';
      case 'HIGH':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/60 font-mono font-bold';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700 font-mono';
    }
  };

  const handleAssignTeam = async (incId: string) => {
    if (!selectedTeamId) return;
    await assignTeamToIncident(incId, selectedTeamId);
    setSelectedTeamId('');
  };

  return (
    <div className="space-y-4 p-4 lg:p-6 max-w-7xl mx-auto text-zinc-100 font-sans">
      {/* Executive Key Operational Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-zinc-900 border border-zinc-700/80 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Active Incidents</span>
            <span className="text-xl font-bold text-zinc-100 font-mono">{incidents.length}</span>
          </div>
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-orange-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700/80 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Deployed Rescue Units</span>
            <span className="text-xl font-bold text-zinc-100 font-mono">{assignedUnitsCount} / {rescueTeams.length}</span>
          </div>
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-amber-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700/80 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">IndexedDB Sync Queue</span>
            <span className="text-xl font-bold text-zinc-100 font-mono">{pendingSyncCount}</span>
          </div>
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300">
            <HardDrive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700/80 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Avg Response ETA</span>
            <span className="text-xl font-bold text-orange-400 font-mono">9.4m</span>
          </div>
          <div className="p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-orange-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <CommPathVisualizer />

      {/* Command Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incident Queue Column */}
        <div className="lg:col-span-4 bg-zinc-900 border border-zinc-700/80 rounded-xl p-4 flex flex-col h-[680px] shadow-sm">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Emergency Queue ({filteredIncidents.length})
              </h3>
            </div>
            <button
              onClick={() => refreshIncidents()}
              className="p-1 text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>

          <div className="flex gap-1 py-2.5 overflow-x-auto text-[10px]">
            {(['ALL', 'CRITICAL', 'OFFLINE', 'UNASSIGNED'] as const).map(flt => (
              <button
                key={flt}
                onClick={() => setSelectedFilter(flt)}
                className={`px-2.5 py-1 rounded font-medium border transition-all ${
                  selectedFilter === flt
                    ? 'bg-orange-500 text-zinc-950 font-bold border-orange-400'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {flt}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredIncidents.length === 0 ? (
              <div className="text-center py-16 text-zinc-500 text-xs space-y-2">
                <CheckCircle2 className="w-7 h-7 mx-auto text-zinc-600" />
                <p>No active incidents matching selected filter</p>
              </div>
            ) : (
              filteredIncidents.map(inc => {
                const isSelected = activeInc?.incidentId === inc.incidentId;

                return (
                  <div
                    key={inc.incidentId}
                    onClick={() => setActiveIncident(inc)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-800 border-orange-500/80 ring-1 ring-orange-500/30'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-zinc-100">{inc.incidentId}</span>
                        <span className="text-[10px] text-zinc-400">({inc.touristId})</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getPriorityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-zinc-200 font-medium">{inc.incidentType}</span>
                      <span className="font-mono text-[9px] text-zinc-400">
                        {inc.syncStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 border-t border-zinc-800 pt-1.5">
                      <span className="font-mono">
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-orange-400 font-medium">Status: {inc.status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map & Telemetry Details Column */}
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
            <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-100 font-mono">
                      {activeInc.incidentId}
                    </h3>
                    <span className="text-xs text-zinc-400 font-mono">({activeInc.touristId})</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getPriorityBadge(activeInc.severity)}`}>
                      {activeInc.severity}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Trigger: <strong className="text-zinc-200">{activeInc.incidentType}</strong> | Registered: {new Date(activeInc.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <button
                  onClick={() => setShowCapsuleModal(true)}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-orange-400 border border-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  View Emergency Payload
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">GPS Fix</span>
                  <div className="font-mono text-zinc-200 font-bold mt-0.5">
                    {activeInc.lastKnownLocation.latitude.toFixed(5)}, {activeInc.lastKnownLocation.longitude.toFixed(5)}
                  </div>
                  <span className="text-[10px] text-zinc-500 block">GNSS Accuracy ~3m</span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Search Radius</span>
                  <div className="font-mono text-amber-300 font-bold mt-0.5">
                    {activeInc.estimatedLocation.radiusMeters}m Zone
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono block">
                    Model Confidence: {activeInc.estimatedLocation.confidence}%
                  </span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold block">Assigned Responder</span>
                  <div className="font-bold text-orange-400 truncate mt-0.5">
                    {activeInc.assignedTeamName || 'Unassigned'}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    {activeInc.etaMinutes ? `ETA: ${activeInc.etaMinutes} min` : 'Select unit below'}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Dispatch Rescue Unit
                </span>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="flex-1 min-w-[200px] bg-zinc-900 border border-zinc-700 text-xs rounded-lg p-2 text-zinc-100 focus:outline-none focus:border-orange-500 font-mono"
                  >
                    <option value="">-- Select Response Unit --</option>
                    {rescueTeams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.type}) - ETA ~{t.estimatedResponseTime}m
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleAssignTeam(activeInc.incidentId)}
                    disabled={!selectedTeamId}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-zinc-950 rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Unit
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Incident Timeline
                </span>

                <div className="space-y-1 max-h-28 overflow-y-auto text-xs pr-1 font-mono text-[11px]">
                  {activeInc.timeline?.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span className="font-bold text-zinc-200">{entry.status}</span>
                        <span className="text-[10px] text-zinc-400 font-sans">- {entry.note}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500 text-xs">
              Select an incident from the queue to view telemetry and dispatch response teams.
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
