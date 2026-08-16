from sqlalchemy import Column, String, Text, DateTime, JSON
from datetime import datetime
from app.database import Base

class DataCapsuleModel(Base):
    __tablename__ = "data_capsules"

    id = Column(String, primary_key=True, index=True)
    incidentId = Column(String, index=True, nullable=False)
    touristId = Column(String, index=True, nullable=False)
    encryptedPayload = Column(Text, nullable=False)
    checksum = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
