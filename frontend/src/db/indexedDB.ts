import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Incident, EmergencyCapsule } from '../types/incident';

export interface SyncQueueItem {
  id?: number;
  incidentId: string;
  action: 'CREATE' | 'UPDATE_STATUS' | 'ASSIGN_TEAM';
  payload: any;
  timestamp: string;
  attempts: number;
}

export class SIHIncidentResponseDatabase extends Dexie {
  incidents!: Table<Incident, string>;
  emergencyCapsules!: Table<EmergencyCapsule, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('SIH25002_IncidentResponseDB');
    this.version(1).stores({
      incidents: 'incidentId, touristId, severity, status, syncStatus, networkStatus, timestamp',
      emergencyCapsules: 'id, incidentId, touristId, timestamp',
      syncQueue: '++id, incidentId, action, timestamp'
    });
  }
}

export const localDB = new SIHIncidentResponseDatabase();
