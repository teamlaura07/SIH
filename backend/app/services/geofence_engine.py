import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)

# Mock geofence danger zones in North-East India (Dzukou Valley & Nohkalikai Cherrapunji)
DEFAULT_DANGER_ZONES = [
    {
        "name": "Nohkalikai Ravine Mist Zone",
        "risk_level": "CRITICAL",
        "zone_type": "DANGER",
        "lat": 25.2750,
        "lng": 91.7340,
        "radius_m": 500.0
    },
    {
        "name": "Dzukou Cliff Drop Edge",
        "risk_level": "HIGH",
        "zone_type": "RESTRICTED",
        "lat": 25.5600,
        "lng": 94.0700,
        "radius_m": 800.0
    }
]

def check_geofence_breach(db: Session, lat: float, lng: float) -> Dict[str, Any]:
    """
    Checks if coordinates breach a danger zone using PostGIS ST_Contains / ST_DWithin
    with fallback to Haversine radius math for SQLite compatibility.
    """
    # 1. Attempt PostGIS Spatial Query
    try:
        query = text("""
            SELECT name, risk_level, zone_type 
            FROM geofence_zones 
            WHERE ST_Contains(boundary, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326))
               OR ST_DWithin(boundary::geography, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, 50)
            ORDER BY CASE risk_level 
                WHEN 'CRITICAL' THEN 1 
                WHEN 'HIGH' THEN 2 
                WHEN 'MODERATE' THEN 3 
                ELSE 4 END
            LIMIT 1;
        """)
        row = db.execute(query, {"lat": lat, "lng": lng}).fetchone()
        if row:
            return {
                "in_danger_zone": True,
                "zone_name": row[0],
                "risk_level": row[1],
                "zone_type": row[2]
            }
    except Exception:
        # Fallback to in-memory proximity checking
        pass

    # 2. Python Haversine Proximity Fallback
    import math
    for zone in DEFAULT_DANGER_ZONES:
        R = 6371000.0 # Earth radius in meters
        dlat = math.radians(lat - zone["lat"])
        dlng = math.radians(lng - zone["lng"])
        a = (math.sin(dlat / 2.0) ** 2 +
             math.cos(math.radians(zone["lat"])) * math.cos(math.radians(lat)) *
             math.sin(dlng / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        distance_m = R * c

        if distance_m <= zone["radius_m"]:
            return {
                "in_danger_zone": True,
                "zone_name": zone["name"],
                "risk_level": zone["risk_level"],
                "zone_type": zone["zone_type"]
            }

    return {
        "in_danger_zone": False,
        "zone_name": None,
        "risk_level": "LOW",
        "zone_type": "SAFE"
    }
