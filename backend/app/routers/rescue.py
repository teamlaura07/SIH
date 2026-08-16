from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.rescue_team import RescueTeamModel
from app.models.incident import IncidentModel
from app.schemas.rescue_team import RescueTeamResponse, RescueTeamLocationUpdate
from app.services.rescue_optimizer import recommend_best_rescue_team, haversine_distance_km
from app.websocket_manager import manager

router = APIRouter(prefix="/rescue-teams", tags=["Rescue Teams"])

@router.get("", response_model=List[RescueTeamResponse])
def get_all_rescue_teams(
    incidentId: Optional[str] = None,
    db: Session = Depends(get_db)
):
    teams = db.query(RescueTeamModel).all()
    
    target_inc = None
    if incidentId:
        target_inc = db.query(IncidentModel).filter(IncidentModel.incidentId == incidentId).first()
        
    result = []
    for team in teams:
        dist = None
        eta = team.estimatedResponseTime
        if target_inc:
            dist = round(haversine_distance_km(
                target_inc.lastKnownLat, target_inc.lastKnownLng,
                team.latitude, team.longitude
            ), 2)
            # Adjust ETA based on distance
            speed = 25.0
            eta = max(3, int((dist / speed) * 60.0) + 2)
            
        result.append(RescueTeamResponse(
            id=team.id,
            name=team.name,
            type=team.type,
            latitude=team.latitude,
            longitude=team.longitude,
            available=team.available,
            equipment=team.equipment or [],
            baseLocation=team.baseLocation,
            activeIncidentId=team.activeIncidentId,
            estimatedResponseTime=eta,
            distanceKm=dist,
            calculatedEtaMinutes=eta
        ))
    return result

@router.get("/recommend/{incident_id}", response_model=Optional[RescueTeamResponse])
def get_recommended_rescue_team(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(IncidentModel).filter(IncidentModel.incidentId == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    teams = db.query(RescueTeamModel).all()
    team_dicts = [
        {
            "id": t.id,
            "name": t.name,
            "type": t.type,
            "latitude": t.latitude,
            "longitude": t.longitude,
            "available": t.available,
            "equipment": t.equipment or [],
            "baseLocation": t.baseLocation,
            "activeIncidentId": t.activeIncidentId,
            "estimatedResponseTime": t.estimatedResponseTime
        }
        for t in teams
    ]
    
    recommended = recommend_best_rescue_team(
        inc.lastKnownLat, inc.lastKnownLng,
        inc.severity, inc.incidentType,
        team_dicts
    )
    
    if not recommended:
        return None
        
    return RescueTeamResponse(**recommended)

@router.put("/{team_id}/location", response_model=RescueTeamResponse)
async def update_team_location(
    team_id: str,
    payload: RescueTeamLocationUpdate,
    db: Session = Depends(get_db)
):
    team = db.query(RescueTeamModel).filter(RescueTeamModel.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Rescue team not found")
        
    team.latitude = payload.latitude
    team.longitude = payload.longitude
    db.commit()
    db.refresh(team)
    
    res = RescueTeamResponse.from_orm(team)
    await manager.broadcast("TEAM_LOCATION_UPDATED", res.dict())
    return res
