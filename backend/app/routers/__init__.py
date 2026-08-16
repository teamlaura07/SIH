from app.routers.incidents import router as incidents_router
from app.routers.rescue import router as rescue_router
from app.routers.simulation import router as simulation_router

__all__ = ["incidents_router", "rescue_router", "simulation_router"]
