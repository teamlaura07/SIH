export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentType = 
  | 'MANUAL_SOS'
  | 'POSSIBLE_FALL'
  | 'PROLONGED_IMMOBILITY'
  | 'ROUTE_DEVIATION'
  | 'GEOFENCE_BREACH';

export type NetworkStatus = 'ONLINE' | 'WEAK' | 'OFFLINE';

export type SyncStatus = 'PENDING' | 'SYNCED' | 'CONFLICT';

export type IncidentStatus = 
  | 'DETECTED'
  | 'ASSESSED'
  | 'LOCATING'
  | 'AWAITING_RESPONSE'
  | 'TEAM_ASSIGNED'
  | 'RESCUE_DISPATCHED'
  | 'TEAM_ON_SITE'
  | 'RESOLVED';

export interface GPSLocation {
  latitude: number;
  longitude: number;
}

export interface EstimatedLocation {
  latitude: number;
  longitude: number;
  confidence: number;
  radiusMeters: number;
}

export interface MovementPoint {
  latitude: number;
  longitude: number;
  timestamp: string;
  speedMs?: number;
}

export interface TimelineEntry {
  status: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface EmergencyCapsule {
  id: string;
  incidentId: string;
  touristId: string;
  timestamp: string;
  lastKnownLocation: GPSLocation;
  estimatedLocation: EstimatedLocation;
  movementHistory: MovementPoint[];
  batteryLevel: number;
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  incidentType: IncidentType;
  severity: Severity;
  emergencyContacts: string[];
  checksum: string;
  encryptedPayload: string;
}

export interface Incident {
  incidentId: string;
  touristId: string;
  incidentType: IncidentType;
  severity: Severity;
  timestamp: string;
  lastKnownLocation: GPSLocation;
  estimatedLocation: EstimatedLocation;
  movementHistory: MovementPoint[];
  batteryLevel: number;
  networkStatus: NetworkStatus;
  syncStatus: SyncStatus;
  status: IncidentStatus;
  assignedTeamId?: string;
  assignedTeamName?: string;
  etaMinutes?: number;
  emergencyContacts: string[];
  timeline: TimelineEntry[];
}

export interface RescueTeam {
  id: string;
  name: string;
  type: 'Forest Rescue' | 'Police' | 'Medical' | 'Disaster Response';
  latitude: number;
  longitude: number;
  available: boolean;
  equipment: string[];
  baseLocation: string;
  activeIncidentId?: string;
  estimatedResponseTime: number;
  distanceKm?: number;
  calculatedEtaMinutes?: number;
}

export type ViewRole = 'CONTROL_ROOM' | 'TOURIST_PWA' | 'RESCUE_TEAM' | 'DEMO_GUIDE';
