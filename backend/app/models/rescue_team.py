from sqlalchemy import Column, String, Float, Boolean, Integer, JSON
from app.database import Base

class RescueTeamModel(Base):
    __tablename__ = "rescue_teams"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # Forest Rescue, Police, Medical, Disaster Response
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    available = Column(Boolean, default=True)
    equipment = Column(JSON, default=list) # e.g. ["First Aid", "Rope Gear", "Drone", "Satellite Radio"]
    baseLocation = Column(String, nullable=False)
    activeIncidentId = Column(String, nullable=True)
    estimatedResponseTime = Column(Integer, default=15) # minutes
