from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import IncidentModel
from app.models.rescue_team import RescueTeamModel
from app.seed_data import seed_database
from app.websocket_manager import manager

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])

@router.post("/reset")
async def reset_simulation(db: Session = Depends(get_db)):
    """Resets database to clean initial state with seeded rescue teams and sample trails."""
    db.query(IncidentModel).delete()
    db.query(RescueTeamModel).delete()
    db.commit()
    
    seed_database(db)
    await manager.broadcast("SIMULATION_RESET", {"message": "Simulation reset successfully"})
    return {"status": "success", "message": "Database reset to initial demo state"}
