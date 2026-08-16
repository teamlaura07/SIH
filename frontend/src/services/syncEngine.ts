import { localDB } from '../db/indexedDB';
import { apiClient } from './apiClient';
import type { Incident } from '../types/incident';

export interface SyncEngineListener {
  (status: { isSyncing: boolean; pendingCount: number; lastSyncedAt?: string }): void;
}

class OfflineSyncEngine {
  private isSyncing: boolean = false;
  private listeners: Set<SyncEngineListener> = new Set();
  private lastSyncedAt?: string;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncEngine] Browser back online. Triggering automatic sync...');
        this.triggerSync();
      });
    }
  }

  subscribe(listener: SyncEngineListener) {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.getPendingCount().then((pendingCount) => {
      this.listeners.forEach((listener) =>
        listener({
          isSyncing: this.isSyncing,
          pendingCount,
          lastSyncedAt: this.lastSyncedAt
        })
      );
    });
  }

  async getPendingCount(): Promise<number> {
    try {
      const pendingIncidents = await localDB.incidents
        .where('syncStatus')
        .equals('PENDING')
        .count();
      const queueCount = await localDB.syncQueue.count();
      return pendingIncidents + queueCount;
    } catch (e) {
      return 0;
    }
  }

  async queueOfflineIncident(incident: Incident): Promise<void> {
    const updatedIncident: Incident = {
      ...incident,
      syncStatus: 'PENDING'
    };
    await localDB.incidents.put(updatedIncident);

    const capsule = {
      id: `CAPSULE-${incident.incidentId}`,
      incidentId: incident.incidentId,
      touristId: incident.touristId,
      timestamp: incident.timestamp,
      lastKnownLocation: incident.lastKnownLocation,
      estimatedLocation: incident.estimatedLocation,
      movementHistory: incident.movementHistory,
      batteryLevel: incident.batteryLevel,
      networkStatus: incident.networkStatus,
      syncStatus: 'PENDING' as const,
      incidentType: incident.incidentType,
      severity: incident.severity,
      emergencyContacts: incident.emergencyContacts,
      checksum: `SHA256-${Date.now()}`,
      encryptedPayload: btoa(JSON.stringify(incident))
    };
    await localDB.emergencyCapsules.put(capsule);

    await localDB.syncQueue.add({
      incidentId: incident.incidentId,
      action: 'CREATE',
      payload: updatedIncident,
      timestamp: new Date().toISOString(),
      attempts: 0
    });

    this.notify();
  }

  async triggerSync(): Promise<number> {
    if (this.isSyncing) return 0;
    this.isSyncing = true;
    this.notify();

    let syncedCount = 0;
    try {
      const pendingIncidents = await localDB.incidents
        .where('syncStatus')
        .equals('PENDING')
        .toArray();

      if (pendingIncidents.length > 0) {
        try {
          const syncedIncidents = await apiClient.batchSyncIncidents(pendingIncidents);
          for (const inc of syncedIncidents) {
            inc.syncStatus = 'SYNCED';
            await localDB.incidents.put(inc);
            syncedCount++;
          }
        } catch (serverErr) {
          console.warn('[SyncEngine] Server batch sync failed:', serverErr);
        }
      }

      const queueItems = await localDB.syncQueue.toArray();
      for (const item of queueItems) {
        try {
          if (item.action === 'CREATE') {
            await apiClient.createOrUpsertIncident(item.payload);
          } else if (item.action === 'UPDATE_STATUS') {
            await apiClient.updateIncidentStatus(item.payload.incidentId, item.payload.status, item.payload.actor);
          } else if (item.action === 'ASSIGN_TEAM') {
            await apiClient.assignRescueTeam(item.payload.incidentId, item.payload.teamId);
          }
          if (item.id) await localDB.syncQueue.delete(item.id);
        } catch (e) {
          item.attempts += 1;
          if (item.id) await localDB.syncQueue.put(item);
        }
      }

      this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (err) {
      console.error('[SyncEngine] Error flushes sync queue:', err);
    } finally {
      this.isSyncing = false;
      this.notify();
    }
    return syncedCount;
  }
}

export const syncEngine = new OfflineSyncEngine();
