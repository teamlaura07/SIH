from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.digital_id import append_digital_id_block

router = APIRouter(prefix="/digital-id", tags=["Digital ID Ledger"])

class DigitalIdRequest(BaseModel):
    touristId: str = Field(..., example="T1028")
    kycDocumentId: str = Field(..., example="AADHAAR-8839-2047")
    payload: Dict[str, Any] = Field(default_factory=dict, example={"permitId": "DZUKOU-992", "medicalInfo": "None"})

@router.post("/register")
def register_digital_id_block(body: DigitalIdRequest, db: Session = Depends(get_db)):
    """
    Appends a new SHA-256 immutable block hash to the tourist cryptographic audit log.
    """
    block = append_digital_id_block(db, body.touristId, body.kycDocumentId, body.payload)
    return {
        "status": "SUCCESS",
        "block": block
    }
