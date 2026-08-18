import math
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in km."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def recommend_best_rescue_team_postgis(db: Session, incident_lat: float, incident_lng: float, incident_type: str, severity: str) -> Optional[Dict[str, Any]]:
    """
    Attempts PostGIS spatial query using ST_Distance to select optimal rescue unit.
    """
    try:
        query = text("""
            SELECT id, team_name, team_type, contact_number, equipment,
                   ST_Y(current_location::geometry) as lat,
                   ST_X(current_location::geometry) as lng,
                   (ST_Distance(current_location::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) / 1000.0) as distance_km
            FROM rescue_teams
            WHERE is_available = TRUE
            ORDER BY current_location::geography <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
            LIMIT 5;
        """)
        rows = db.execute(query, {"lat": incident_lat, "lng": incident_lng}).fetchall()
        if rows:
            candidates = []
            for r in rows:
                dist_km = float(r.distance_km)
                speed_kmh = 30.0 if r.team_type == "Forest Rescue" else (40.0 if r.team_type == "Police" else 25.0)
                eta_mins = max(3, int((dist_km / speed_kmh) * 60.0) + 2)
                suitability_bonus = -5 if incident_type in ["POSSIBLE_FALL", "PROLONGED_IMMOBILITY"] and r.team_type in ["Forest Rescue", "Medical"] else 0
                score = dist_km + (eta_mins * 0.5) + suitability_bonus
                
                candidates.append({
                    "id": str(r.id),
                    "teamName": r.team_name,
                    "type": r.team_type,
                    "contactNumber": r.contact_number,
                    "latitude": float(r.lat),
                    "longitude": float(r.lng),
                    "distanceKm": round(dist_km, 2),
                    "calculatedEtaMinutes": eta_mins,
                    "_score": score
                })
            candidates.sort(key=lambda x: x["_score"])
            best = candidates[0]
            best.pop("_score", None)
            return best
    except Exception as e:
        logger.debug(f"PostGIS query skipped (falling back to python math): {e}")
    return None

def recommend_best_rescue_team(
    incident_lat: float,
    incident_lng: float,
    incident_severity: str,
    incident_type: str,
    available_teams: List[Dict[str, Any]],
    db: Optional[Session] = None
) -> Optional[Dict[str, Any]]:
    """
    Selects best rescue team based on PostGIS spatial query, proximity, severity, team specialization, and terrain speed.
    """
    if db is not None:
        pg_recommendation = recommend_best_rescue_team_postgis(db, incident_lat, incident_lng, incident_type, incident_severity)
        if pg_recommendation:
            return pg_recommendation

    candidates = []
    for team in available_teams:
        if not team.get("available", True):
            continue
        
        dist = haversine_distance_km(
            incident_lat, incident_lng,
            team["latitude"], team["longitude"]
        )
        
        speed = 25.0
        if team["type"] == "Forest Rescue":
            speed = 30.0
        elif team["type"] == "Medical":
            speed = 35.0
        elif team["type"] == "Disaster Response":
            speed = 20.0
        elif team["type"] == "Police":
            speed = 40.0
            
        eta_mins = max(3, int((dist / speed) * 60.0) + 2)
        
        suitability_bonus = 0
        if incident_type in ["POSSIBLE_FALL", "PROLONGED_IMMOBILITY"] and team["type"] in ["Forest Rescue", "Medical"]:
            suitability_bonus = -5
        if incident_severity == "CRITICAL" and "Drone" in team.get("equipment", []):
            suitability_bonus -= 3
            
        score = dist + (eta_mins * 0.5) + suitability_bonus
        
        team_copy = dict(team)
        team_copy["distanceKm"] = round(dist, 2)
        team_copy["calculatedEtaMinutes"] = eta_mins
        team_copy["_score"] = score
        candidates.append(team_copy)
        
    if not candidates:
        return None
        
    candidates.sort(key=lambda x: x["_score"])
    best_team = candidates[0]
    best_team.pop("_score", None)
    return best_team
