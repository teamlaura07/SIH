from app.schemas.incident import SeverityEnum, IncidentTypeEnum

def classify_incident_severity(incident_type: str, battery_level: int, in_danger_zone: bool = False, immobility_mins: int = 0) -> str:
    """
    Evaluates incident telemetry and assigns severity level:
    - CRITICAL: SOS confirmed, suspected serious fall, prolonged immobility in dangerous area
    - HIGH: Route deviation in remote area, prolonged immobility, low battery + offline
    - MEDIUM: Fall warning pending response, minor geofence breach
    - LOW: Informational incident / routine ping alert
    """
    if incident_type in [IncidentTypeEnum.MANUAL_SOS, "MANUAL_SOS"]:
        return SeverityEnum.CRITICAL.value
    
    if incident_type in [IncidentTypeEnum.POSSIBLE_FALL, "POSSIBLE_FALL"]:
        if in_danger_zone or battery_level < 20 or immobility_mins > 15:
            return SeverityEnum.CRITICAL.value
        return SeverityEnum.HIGH.value

    if incident_type in [IncidentTypeEnum.PROLONGED_IMMOBILITY, "PROLONGED_IMMOBILITY"]:
        if in_danger_zone or immobility_mins > 30:
            return SeverityEnum.CRITICAL.value
        return SeverityEnum.HIGH.value

    if incident_type in [IncidentTypeEnum.ROUTE_DEVIATION, "ROUTE_DEVIATION"]:
        if in_danger_zone or battery_level < 15:
            return SeverityEnum.HIGH.value
        return SeverityEnum.MEDIUM.value

    if incident_type in [IncidentTypeEnum.GEOFENCE_BREACH, "GEOFENCE_BREACH"]:
        return SeverityEnum.HIGH.value

    return SeverityEnum.LOW.value
