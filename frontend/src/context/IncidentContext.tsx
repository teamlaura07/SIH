import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Incident, IncidentType, Severity, GPSLocation, RescueTeam } from '../types/incident';
import { useConnectivity } from './ConnectivityContext';
import { localDB } from '../db/indexedDB';
import { apiClient } from '../services/apiClient';
import { syncEngine } from '../services/syncEngine';
import { wsClient } from '../services/websocketClient';
import { calculateSearchArea } from '../services/locationEstimator';

interface IncidentContextType {
  incidents: Incident[];
  activeIncident: Incident | null;
  setActiveIncident: (incident: Incident | null) => void;
  rescueTeams: RescueTeam[];
  createIncident: (
    type: IncidentType,
    severity: Severity,
    location: GPSLocation,
    note?: string
  ) => Promise<Incident>;
  updateIncidentStatus: (incidentId: string, status: string, actor?: string, note?: string) => Promise<void>;
  assignTeamToIncident: (incidentId: string, teamId: string) => Promise<void>;
  refreshIncidents: () => Promise<void>;
  resetAllData: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [rescueTeams, setRescueTeams] = useState<RescueTeam[]>([]);
  const { networkStatus } = useConnectivity();

  const loadIncidents = async () => {
    try {
      const localItems = await localDB.incidents.toArray();
      
      if (networkStatus === 'ONLINE') {
        try {
          const remoteItems = await apiClient.getIncidents();
          const teams = await apiClient.getRescueTeams();
          setRescueTeams(teams);

          const map = new Map<string, Incident>();
          localItems.forEach(item => map.set(item.incidentId, item));
          remoteItems.forEach(item => map.set(item.incidentId, item));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setIncidents(merged);
          return;
        } catch (e) {
          console.warn('[IncidentContext] Backend unreachable, falling back to IndexedDB:', e);
        }
      }
      
      setIncidents(localItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err) {
      console.error('[IncidentContext] Error loading incidents:', err);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, [networkStatus]);

  useEffect(() => {
    if (networkStatus === 'ONLINE') {
      wsClient.connect();
      const unsubscribe = wsClient.subscribe((event, data) => {
        console.log(`[IncidentContext] WebSocket event: ${event}`, data);
        loadIncidents();
      });
      return () => {
        unsubscribe();
      };
    }
  }, [networkStatus]);

  const createIncident = async (
    type: IncidentType,
    severity: Severity,
    location: GPSLocation,
    note: string = "Triggered via Tourist Interface"
  ): Promise<Incident> => {
    const incId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString();

    const sampleMovement = [
      { latitude: location.latitude + 0.0012, longitude: location.longitude - 0.0015, timestamp: new Date(Date.now() - 600000).toISOString(), speedMs: 1.2 },
      { latitude: location.latitude + 0.0006, longitude: location.longitude - 0.0008, timestamp: new Date(Date.now() - 300000).toISOString(), speedMs: 0.9 },
      { latitude: location.latitude, longitude: location.longitude, timestamp: nowStr, speedMs: 0.0 }
    ];

    const estimatedArea = calculateSearchArea(location, sampleMovement, 15);

    const newIncident: Incident = {
      incidentId: incId,
      touristId: "T1028",
      incidentType: type,
      severity,
      timestamp: nowStr,
      lastKnownLocation: location,
      estimatedLocation: estimatedArea,
      movementHistory: sampleMovement,
      batteryLevel: 27,
      networkStatus,
      syncStatus: networkStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
      status: 'DETECTED',
      emergencyContacts: [
        "+91 98765 43210 (Mother: Sunita Sharma)",
        "+91 364 2222100 (Sohra Tourist Police Outpost)"
      ],
      timeline: [
        {
          status: 'DETECTED',
          timestamp: nowStr,
          actor: 'PWA Telemetry Sensor',
          note: note || `Incident created: ${type}`
        }
      ]
    };

    if (networkStatus === 'ONLINE') {
      try {
        const saved = await apiClient.createOrUpsertIncident(newIncident);
        await localDB.incidents.put(saved);
        setActiveIncident(saved);
        await loadIncidents();
        return saved;
      } catch (e) {
        console.warn('[IncidentContext] Online save failed, queuing locally:', e);
      }
    }

    await syncEngine.queueOfflineIncident(newIncident);
    setActiveIncident(newIncident);
    await loadIncidents();
    return newIncident;
  };

  const updateIncidentStatus = async (
    incidentId: string,
    status: string,
    actor: string = "Control Room",
    note?: string
  ) => {
    if (networkStatus === 'ONLINE') {
      try {
        const updated = await apiClient.updateIncidentStatus(incidentId, status, actor, note);
        await localDB.incidents.put(updated);
        await loadIncidents();
        return;
      } catch (e) {
        console.warn('[IncidentContext] Server update failed, saving locally:', e);
      }
    }

    const target = await localDB.incidents.get(incidentId);
    if (target) {
      target.status = status as any;
      target.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        actor,
        note: note || `Status updated to ${status}`
      });
      target.syncStatus = 'PENDING';
      await localDB.incidents.put(target);
      await localDB.syncQueue.add({
        incidentId,
        action: 'UPDATE_STATUS',
        payload: { incidentId, status, actor, note },
        timestamp: new Date().toISOString(),
        attempts: 0
      });
      await loadIncidents();
    }
  };

  const assignTeamToIncident = async (incidentId: string, teamId: string) => {
    if (networkStatus === 'ONLINE') {
      try {
        const updated = await apiClient.assignRescueTeam(incidentId, teamId);
        await localDB.incidents.put(updated);
        await loadIncidents();
        return;
      } catch (e) {
        console.warn('[IncidentContext] Assign team failed on server, saving locally:', e);
      }
    }

    const target = await localDB.incidents.get(incidentId);
    if (target) {
      target.assignedTeamId = teamId;
      target.status = 'TEAM_ASSIGNED';
      target.timeline.push({
        status: 'TEAM_ASSIGNED',
        timestamp: new Date().toISOString(),
        actor: 'Control Room',
        note: `Assigned team ${teamId}`
      });
      target.syncStatus = 'PENDING';
      await localDB.incidents.put(target);
      await loadIncidents();
    }
  };

  const resetAllData = async () => {
    await localDB.incidents.clear();
    await localDB.emergencyCapsules.clear();
    await localDB.syncQueue.clear();
    if (networkStatus === 'ONLINE') {
      try {
        await apiClient.resetSimulation();
      } catch (e) {}
    }
    await loadIncidents();
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        activeIncident,
        setActiveIncident,
        rescueTeams,
        createIncident,
        updateIncidentStatus,
        assignTeamToIncident,
        refreshIncidents: loadIncidents,
        resetAllData
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) throw new Error('useIncidents must be used within IncidentProvider');
  return context;
};
