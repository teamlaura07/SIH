import math
from typing import Dict, Any, List

def calculate_probable_search_area(
    last_lat: float,
    last_lng: float,
    movement_history: List[Dict[str, Any]],
    elapsed_minutes: float = 15.0
) -> Dict[str, Any]:
    """
    Calculates Confirmed GPS Location vs Probable Search Area (Center coordinate, Search Radius in meters, Confidence rating).
    Uses last movement velocity vector, heading, elapsed offline duration, and terrain diffusion index.
    """
    if not movement_history or len(movement_history) < 2:
        # Default fallback estimate
        return {
            "latitude": last_lat,
            "longitude": last_lng,
            "confidence": 85.0,
            "radiusMeters": max(150.0, elapsed_minutes * 15.0) # 15m expansion per minute
        }
    
    p1 = movement_history[-2]
    p2 = movement_history[-1]
    
    lat1, lng1 = p1.get("latitude", last_lat), p1.get("longitude", last_lng)
    lat2, lng2 = p2.get("latitude", last_lat), p2.get("longitude", last_lng)
    
    # Calculate displacement vector
    d_lat = lat2 - lat1
    d_lng = lng2 - lng1
    
    # Extrapolate position based on last heading and elapsed offline time
    scale = min(2.5, max(0.2, elapsed_minutes / 10.0))
    est_lat = last_lat + (d_lat * scale)
    est_lng = last_lng + (d_lng * scale)
    
    # Confidence degrades with elapsed time
    confidence = max(35.0, 95.0 - (elapsed_minutes * 1.5))
    radius = min(1500.0, max(150.0, 200.0 + (elapsed_minutes * 25.0)))
    
    return {
        "latitude": round(est_lat, 6),
        "longitude": round(est_lng, 6),
        "confidence": round(confidence, 1),
        "radiusMeters": round(radius, 1)
    }
