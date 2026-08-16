from sqlalchemy.orm import Session
from app.models.rescue_team import RescueTeamModel
from app.models.incident import IncidentModel

def seed_database(db: Session):
    # Check if teams exist
    if db.query(RescueTeamModel).count() > 0:
        return
        
    teams = [
        RescueTeamModel(
            id="RANGER-02",
            name="Cherrapunji Forest Rangers Unit 2",
            type="Forest Rescue",
            latitude=25.2750,
            longitude=91.7320,
            available=True,
            equipment=["Thermal Drone", "Mountain Rope Gear", "Satellite Comms", "First Aid Kit"],
            baseLocation="Sohra Forest Station",
            estimatedResponseTime=7
        ),
        RescueTeamModel(
            id="MED-01",
            name="Shillong Emergency Medical Response",
            type="Medical",
            latitude=25.2820,
            longitude=91.7250,
            available=True,
            equipment=["Trauma Kit", "Portable Oxygen", "4x4 Ambulance", "Defibrillator"],
            baseLocation="Nohkalikai Field Camp",
            estimatedResponseTime=12
        ),
        RescueTeamModel(
            id="POLICE-04",
            name="Dawki Tourist Protection Force",
            type="Police",
            latitude=25.2600,
            longitude=91.7450,
            available=True,
            equipment=["VHF Radios", "GPS Trackers", "All-Terrain Vehicle", "Night Vision"],
            baseLocation="Tourist Security Outpost 4",
            estimatedResponseTime=15
        ),
        RescueTeamModel(
            id="NDRF-01",
            name="Northeast Disaster Response Team Alpha",
            type="Disaster Response",
            latitude=25.2900,
            longitude=91.7100,
            available=True,
            equipment=["Heavy Rescue Gear", "Search Dogs", "Satellite Phone", "Stretchers"],
            baseLocation="Regional Rescue Hub",
            estimatedResponseTime=20
        )
    ]
    
    for team in teams:
        db.add(team)
        
    db.commit()
    print("Database successfully seeded with North-East India rescue teams!")
