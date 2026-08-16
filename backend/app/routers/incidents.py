from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.incident import IncidentModel
from app.models.rescue_team import RescueTeamModel
from app.models.capsule import DataCapsuleModel
from app.schemas.incident import (
    IncidentCreate, IncidentResponse, IncidentStatusUpdate, TeamAssignmentRequest
)
from app.schemas.capsule import EmergencyCapsule
from app.services.severity_engine import classify_incident_severity
from app.services.location_estimator import calculate_probable_search_area
from app.services.rescue_optimizer import recommend_best_rescue_team
from app.websocket_manager import manager

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_all_incidents(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(IncidentModel)
    if severity:
        query = query.filter(IncidentModel.severity == severity)
    if status:
        query = query.filter(IncidentModel.status == status)
    
    incidents = query.order_by(IncidentModel.createdAt.desc()).all()
    
    result = []
    for inc in incidents:
        result.append(IncidentResponse(
            incidentId=inc.incidentId,
            touristId=inc.touristId,
            incidentType=inc.incidentType,
            severity=inc.severity,
            timestamp=inc.timestamp,
            lastKnownLocation={"latitude": inc.lastKnownLat, "longitude": inc.lastKnownLng},
            estimatedLocation={
                "latitude": inc.estimatedLat,
                "longitude": inc.estimatedLng,
                "confidence": inc.confidence,
                "radiusMeters": inc.estimatedRadius
            },
            movementHistory=inc.movementHistory or [],
            batteryLevel=inc.batteryLevel,
            networkStatus=inc.networkStatus,
            syncStatus=inc.syncStatus,
            status=inc.status,
            assignedTeamId=inc.assignedTeamId,
            assignedTeamName=inc.assignedTeamName,
            etaMinutes=inc.etaMinutes,
            emergencyContacts=inc.emergencyContacts or [],
            timeline=inc.timeline or []
        ))
    return result

@router.post("", response_model=IncidentResponse)
async def create_or_upsert_incident(
    payload: IncidentCreate,
    db: Session = Depends(get_db)
):
    """
    Idempotent single incident intake/sync endpoint.
    If incident already exists (matching incidentId), merges updates safely.
    """
    existing = db.query(IncidentModel).filter(IncidentModel.incidentId == payload.incidentId).first()
    
    # Classify severity dynamically if needed
    calculated_severity = payload.severity or classify_incident_severity(payload.incidentType, payload.batteryLevel)
    
    # Calculate estimated search area
    est = calculate_probable_search_area(
        payload.lastKnownLocation.latitude,
        payload.lastKnownLocation.longitude,
        payload.movementHistory or []
    )
    
    now_str = datetime.utcnow().isoformat() + "Z"
    
    if existing:
        # Merge update without overwriting resolved/dispatched states if syncing late
        existing.networkStatus = payload.networkStatus
        existing.syncStatus = "SYNCED"
        existing.batteryLevel = payload.batteryLevel
        if payload.movementHistory:
            existing.movementHistory = payload.movementHistory
        db.commit()
        db.refresh(existing)
        target = existing
        event_type = "INCIDENT_UPDATED"
    else:
        # Initial timeline entry
        timeline = payload.timeline or [
            {
                "status": payload.status,
                "timestamp": payload.timestamp or now_str,
                "actor": "System Sensor / PWA",
                "note": f"Incident created via {payload.incidentType}"
            }
        ]
        
        target = IncidentModel(
            incidentId=payload.incidentId,
            touristId=payload.touristId,
            incidentType=payload.incidentType,
            severity=calculated_severity,
            timestamp=payload.timestamp or now_str,
            lastKnownLat=payload.lastKnownLocation.latitude,
            lastKnownLng=payload.lastKnownLocation.longitude,
            estimatedLat=est["latitude"],
            estimatedLng=est["longitude"],
            estimatedRadius=est["radiusMeters"],
            confidence=est["confidence"],
            movementHistory=payload.movementHistory or [],
            batteryLevel=payload.batteryLevel,
            networkStatus=payload.networkStatus,
            syncStatus="SYNCED",
            status=payload.status,
            assignedTeamId=payload.assignedTeamId,
            assignedTeamName=payload.assignedTeamName,
            emergencyContacts=payload.emergencyContacts or ["+91 98765 43210 (Family)", "+91 364 2222100 (Sohra Tourist Police)"],
            timeline=timeline
        )
        db.add(target)
        db.commit()
        db.refresh(target)
        event_type = "INCIDENT_CREATED"

    inc_response = IncidentResponse(
        incidentId=target.incidentId,
        touristId=target.touristId,
        incidentType=target.incidentType,
        severity=target.severity,
        timestamp=target.timestamp,
        lastKnownLocation={"latitude": target.lastKnownLat, "longitude": target.lastKnownLng},
        estimatedLocation={
            "latitude": target.estimatedLat,
            "longitude": target.estimatedLng,
            "confidence": target.confidence,
            "radiusMeters": target.estimatedRadius
        },
        movementHistory=target.movementHistory or [],
        batteryLevel=target.batteryLevel,
        networkStatus=target.networkStatus,
        syncStatus=target.syncStatus,
        status=target.status,
        assignedTeamId=target.assignedTeamId,
        assignedTeamName=target.assignedTeamName,
        etaMinutes=target.etaMinutes,
        emergencyContacts=target.emergencyContacts or [],
        timeline=target.timeline or []
    )
    
    # Broadcast to WebSocket clients (Control Room & Rescue Teams)
    await manager.broadcast(event_type, inc_response.dict())
    return inc_response

@router.post("/batch-sync", response_model=List[IncidentResponse])
async def batch_sync_incidents(
    payloads: List[IncidentCreate],
    db: Session = Depends(get_db)
):
    """
    Idempotent batch synchronization endpoint for offline-to-online sync queue.
    """
    results = []
    for payload in payloads:
        res = await create_or_upsert_incident(payload, db)
        results.append(res)
    return results

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_by_id(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.incidentId == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse(
        incidentId=inc.incidentId,
        touristId=inc.touristId,
        incidentType=inc.incidentType,
        severity=inc.severity,
        timestamp=inc.timestamp,
        lastKnownLocation={"latitude": inc.lastKnownLat, "longitude": inc.lastKnownLng},
        estimatedLocation={
            "latitude": inc.estimatedLat,
            "longitude": inc.estimatedLng,
            "confidence": inc.confidence,
            "radiusMeters": inc.estimatedRadius
        },
        movementHistory=inc.movementHistory or [],
        batteryLevel=inc.batteryLevel,
        networkStatus=inc.networkStatus,
        syncStatus=inc.syncStatus,
        status=inc.status,
        assignedTeamId=inc.assignedTeamId,
        assignedTeamName=inc.assignedTeamName,
        etaMinutes=inc.etaMinutes,
        emergencyContacts=inc.emergencyContacts or [],
        timeline=inc.timeline or []
    )

@router.put("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: Session = Depends(get_db)
):
    inc = db.query(IncidentModel).filter(IncidentModel.incidentId == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    now_str = datetime.utcnow().isoformat() + "Z"
    timeline = list(inc.timeline or [])
    timeline.append({
        "status": payload.status,
        "timestamp": now_str,
        "actor": payload.actor,
        "note": payload.note or f"Status changed to {payload.status}"
    })
    
    inc.status = payload.status
    inc.timeline = timeline
    db.commit()
    db.refresh(inc)
    
    inc_response = IncidentResponse(
        incidentId=inc.incidentId,
        touristId=inc.touristId,
        incidentType=inc.incidentType,
        severity=inc.severity,
        timestamp=inc.timestamp,
        lastKnownLocation={"latitude": inc.lastKnownLat, "longitude": inc.lastKnownLng},
        estimatedLocation={
            "latitude": inc.estimatedLat,
            "longitude": inc.estimatedLng,
            "confidence": inc.confidence,
            "radiusMeters": inc.estimatedRadius
        },
        movementHistory=inc.movementHistory or [],
        batteryLevel=inc.batteryLevel,
        networkStatus=inc.networkStatus,
        syncStatus=inc.syncStatus,
        status=inc.status,
        assignedTeamId=inc.assignedTeamId,
        assignedTeamName=inc.assignedTeamName,
        etaMinutes=inc.etaMinutes,
        emergencyContacts=inc.emergencyContacts or [],
        timeline=inc.timeline or []
    )
    
    await manager.broadcast("STATUS_UPDATED", inc_response.dict())
    return inc_response

@router.post("/{incident_id}/assign", response_model=IncidentResponse)
async def assign_rescue_team(
    incident_id: str,
    payload: TeamAssignmentRequest,
    db: Session = Depends(get_db)
):
    inc = db.query(IncidentModel).filter(IncidentModel.incidentId == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    team = db.query(RescueTeamModel).filter(RescueTeamModel.id == payload.teamId).first()
    if not team:
        raise HTTPException(status_code=404, detail="Rescue team not found")
        
    now_str = datetime.utcnow().isoformat() + "Z"
    
    # Update team assignment
    inc.assignedTeamId = team.id
    inc.assignedTeamName = team.name
    inc.status = "TEAM_ASSIGNED"
    inc.etaMinutes = team.estimatedResponseTime
    
    timeline = list(inc.timeline or [])
    timeline.append({
        "status": "TEAM_ASSIGNED",
        "timestamp": now_str,
        "actor": payload.actor,
        "note": f"Assigned rescue team {team.name} ({team.type}). ETA: {team.estimatedResponseTime} mins."
    })
    inc.timeline = timeline
    
    # Mark team active
    team.available = False
    team.activeIncidentId = incident_id
    
    db.commit()
    db.refresh(inc)
    db.refresh(team)
    
    inc_response = IncidentResponse(
        incidentId=inc.incidentId,
        touristId=inc.touristId,
        incidentType=inc.incidentType,
        severity=inc.severity,
        timestamp=inc.timestamp,
        lastKnownLocation={"latitude": inc.lastKnownLat, "longitude": inc.lastKnownLng},
        estimatedLocation={
            "latitude": inc.estimatedLat,
            "longitude": inc.estimatedLng,
            "confidence": inc.confidence,
            "radiusMeters": inc.estimatedRadius
        },
        movementHistory=inc.movementHistory or [],
        batteryLevel=inc.batteryLevel,
        networkStatus=inc.networkStatus,
        syncStatus=inc.syncStatus,
        status=inc.status,
        assignedTeamId=inc.assignedTeamId,
        assignedTeamName=inc.assignedTeamName,
        etaMinutes=inc.etaMinutes,
        emergencyContacts=inc.emergencyContacts or [],
        timeline=inc.timeline or []
    )
    
    await manager.broadcast("TEAM_ASSIGNED", inc_response.dict())
    return inc_response
