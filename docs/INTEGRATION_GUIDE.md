# Integration Guide - Smart Tourist Safety Monitoring & Hybrid Incident Response System

This guide documents how your teammates' **Smart Tourist Safety Monitoring module** integrates seamlessly with this **Hybrid Incident Response System (SIH25002)**.

---

## 1. Integration Boundary

```text
+------------------------------------------+        +------------------------------------------+
|  SMART TOURIST SAFETY MONITORING MODULE  |        |    HYBRID INCIDENT RESPONSE MODULE       |
|  - Tourist Registration & Identity       |  REST  |  - Incident Lifecycle Engine             |
|  - Geofence Warning Alerts               | ------>|  - Emergency Data Capsule Store          |
|  - Continuous Movement Telemetry         |  APIs  |  - IndexedDB Auto-Sync Queue             |
|  - Sensor Anomaly Pre-Filtering          |        |  - Severity Engine & Rescue Optimizer    |
+------------------------------------------+        +------------------------------------------+
```

---

## 2. API Contract for Triggering Incidents

### POST `/api/v1/incidents`
External monitoring systems trigger incidents by posting the common Incident object:

```json
{
  "incidentId": "INC-2047",
  "touristId": "T1028",
  "incidentType": "POSSIBLE_FALL",
  "severity": "CRITICAL",
  "timestamp": "2026-08-16T09:30:00Z",
  "lastKnownLocation": {
    "latitude": 25.2750,
    "longitude": 91.7340
  },
  "estimatedLocation": {
    "latitude": 25.2780,
    "longitude": 91.7290,
    "confidence": 87.0,
    "radiusMeters": 250.0
  },
  "movementHistory": [
    { "latitude": 25.2860, "longitude": 91.7180, "timestamp": "2026-08-16T09:20:00Z", "speedMs": 1.2 }
  ],
  "batteryLevel": 27,
  "networkStatus": "ONLINE",
  "syncStatus": "SYNCED",
  "status": "DETECTED"
}
```

---

## 3. Real-Time Event Subscription via WebSockets

Subscribe to live updates at `ws://localhost:8000/ws/incidents` to receive broadcast events:
- `INCIDENT_CREATED`
- `INCIDENT_UPDATED`
- `STATUS_UPDATED`
- `TEAM_ASSIGNED`
- `TEAM_LOCATION_UPDATED`

Example WebSocket listener in Python:

```python
import websockets
import asyncio
import json

async def subscribe_incidents():
    uri = "ws://localhost:8000/ws/incidents"
    async with websockets.connect(uri) as websocket:
        while True:
            msg = await websocket.recv()
            event = json.loads(msg)
            print(f"Received event {event['event']}:", event['data'])

asyncio.run(subscribe_incidents())
```
