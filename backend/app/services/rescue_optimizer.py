import math
from typing import List, Dict, Any, Optional

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

def recommend_best_rescue_team(
    incident_lat: float,
    incident_lng: float,
    incident_severity: str,
    incident_type: str,
    available_teams: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    Selects best rescue team based on proximity, severity, team specialization, availability, and terrain speed.
    Returns team dictionary with distanceKm and calculatedEtaMinutes attached.
    """
    candidates = []
    
    for team in available_teams:
        if not team.get("available", True):
            continue
        
        dist = haversine_distance_km(
            incident_lat, incident_lng,
            team["latitude"], team["longitude"]
        )
        
        # Terrain speed multiplier (km/h) based on team type
        speed = 25.0 # default 25 km/h in mountain terrain
        if team["type"] == "Forest Rescue":
            speed = 30.0
        elif team["type"] == "Medical":
            speed = 35.0
        elif team["type"] == "Disaster Response":
            speed = 20.0
        elif team["type"] == "Police":
            speed = 40.0
            
        eta_mins = max(3, int((dist / speed) * 60.0) + 2) # +2 min dispatch prep
        
        # Score suitability (lower score = better)
        suitability_bonus = 0
        if incident_type in ["POSSIBLE_FALL", "PROLONGED_IMMOBILITY"] and team["type"] in ["Forest Rescue", "Medical"]:
            suitability_bonus = -5 # Priority bonus
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
