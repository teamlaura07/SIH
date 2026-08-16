from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum

class IncidentTypeEnum(str, Enum):
    MANUAL_SOS = "MANUAL_SOS"
    POSSIBLE_FALL = "POSSIBLE_FALL"
    PROLONGED_IMMOBILITY = "PROLONGED_IMMOBILITY"
    ROUTE_DEVIATION = "ROUTE_DEVIATION"
    GEOFENCE_BREACH = "GEOFENCE_BREACH"

class SeverityEnum(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class NetworkStatusEnum(str, Enum):
    ONLINE = "ONLINE"
    WEAK = "WEAK"
    OFFLINE = "OFFLINE"

class SyncStatusEnum(str, Enum):
    PENDING = "PENDING"
    SYNCED = "SYNCED"
    CONFLICT = "CONFLICT"

class StatusEnum(str, Enum):
    DETECTED = "DETECTED"
    ASSESSED = "ASSESSED"
    LOCATING = "LOCATING"
    AWAITING_RESPONSE = "AWAITING_RESPONSE"
    TEAM_ASSIGNED = "TEAM_ASSIGNED"
    RESCUE_DISPATCHED = "RESCUE_DISPATCHED"
    TEAM_ON_SITE = "TEAM_ON_SITE"
    RESOLVED = "RESOLVED"

class GPSLocation(BaseModel):
    latitude: float
    longitude: float

class EstimatedLocation(BaseModel):
    latitude: float
    longitude: float
    confidence: float = 85.0
    radiusMeters: float = 250.0

class MovementPoint(BaseModel):
    latitude: float
    longitude: float
    timestamp: str
    speedMs: Optional[float] = 0.0

class TimelineEntry(BaseModel):
    status: str
    timestamp: str
    actor: str
    note: Optional[str] = None

class IncidentCreate(BaseModel):
    incidentId: str
    touristId: str
    incidentType: str
    severity: str
    timestamp: str
    lastKnownLocation: GPSLocation
    estimatedLocation: EstimatedLocation
    movementHistory: Optional[List[dict]] = []
    batteryLevel: int = 100
    networkStatus: str = "ONLINE"
    syncStatus: str = "PENDING"
    status: str = "DETECTED"
    assignedTeamId: Optional[str] = None
    assignedTeamName: Optional[str] = None
    emergencyContacts: Optional[List[str]] = []
    timeline: Optional[List[dict]] = []

class IncidentStatusUpdate(BaseModel):
    status: str
    actor: str = "Control Room"
    note: Optional[str] = None

class TeamAssignmentRequest(BaseModel):
    teamId: str
    actor: str = "Control Room Admin"

class IncidentResponse(BaseModel):
    incidentId: str
    touristId: str
    incidentType: str
    severity: str
    timestamp: str
    lastKnownLocation: GPSLocation
    estimatedLocation: EstimatedLocation
    movementHistory: List[dict] = []
    batteryLevel: int
    networkStatus: str
    syncStatus: str
    status: str
    assignedTeamId: Optional[str] = None
    assignedTeamName: Optional[str] = None
    etaMinutes: Optional[int] = None
    emergencyContacts: List[str] = []
    timeline: List[dict] = []

    class Config:
        from_attributes = True
