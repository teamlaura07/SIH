from pydantic import BaseModel
from typing import List, Optional

class RescueTeamBase(BaseModel):
    id: str
    name: str
    type: str
    latitude: float
    longitude: float
    available: bool = True
    equipment: List[str] = []
    baseLocation: str
    activeIncidentId: Optional[str] = None
    estimatedResponseTime: int = 15

class RescueTeamResponse(RescueTeamBase):
    distanceKm: Optional[float] = None
    calculatedEtaMinutes: Optional[int] = None

    class Config:
        from_attributes = True

class RescueTeamLocationUpdate(BaseModel):
    latitude: float
    longitude: float
