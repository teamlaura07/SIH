from pydantic import BaseModel
from typing import Optional

class EmergencyCapsule(BaseModel):
    id: str
    incidentId: str
    touristId: str
    encryptedPayload: str
    checksum: str

class EmergencyCapsuleResponse(EmergencyCapsule):
    createdAt: str

    class Config:
        from_attributes = True
