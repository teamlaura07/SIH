from sqlalchemy import Column, String, Float, Integer, Text, DateTime, JSON
from datetime import datetime
from app.database import Base

class IncidentModel(Base):
    __tablename__ = "incidents"

    incidentId = Column(String, primary_key=True, index=True)
    touristId = Column(String, index=True, nullable=False)
    incidentType = Column(String, nullable=False)  # MANUAL_SOS, POSSIBLE_FALL, PROLONGED_IMMOBILITY, ROUTE_DEVIATION
    severity = Column(String, nullable=False)      # CRITICAL, HIGH, MEDIUM, LOW
    timestamp = Column(String, nullable=False)
    
    # Confirmed GPS Location
    lastKnownLat = Column(Float, nullable=False)
    lastKnownLng = Column(Float, nullable=False)
    
    # Probable Search Area
    estimatedLat = Column(Float, nullable=False)
    estimatedLng = Column(Float, nullable=False)
    estimatedRadius = Column(Float, default=250.0)
    confidence = Column(Float, default=85.0)
    
    # Additional Context
    movementHistory = Column(JSON, default=list)
    batteryLevel = Column(Integer, default=100)
    networkStatus = Column(String, default="ONLINE") # ONLINE, WEAK, OFFLINE
    syncStatus = Column(String, default="SYNCED")    # PENDING, SYNCED, CONFLICT
    status = Column(String, default="DETECTED")      # DETECTED, ASSESSED, LOCATING, AWAITING_RESPONSE, TEAM_ASSIGNED, RESCUE_DISPATCHED, TEAM_ON_SITE, RESOLVED
    
    # Rescue Metadata
    assignedTeamId = Column(String, nullable=True)
    assignedTeamName = Column(String, nullable=True)
    etaMinutes = Column(Integer, nullable=True)
    emergencyContacts = Column(JSON, default=list)
    timeline = Column(JSON, default=list)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
