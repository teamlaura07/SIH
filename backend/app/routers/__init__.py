from app.routers.incidents import router as incidents_router
from app.routers.rescue import router as rescue_router
from app.routers.simulation import router as simulation_router
from app.routers.auth import router as auth_router
from app.routers.digital_id import router as digital_id_router

__all__ = ["incidents_router", "rescue_router", "simulation_router", "auth_router", "digital_id_router"]

