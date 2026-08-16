# SIH25002 - Hybrid Incident Response System Architecture

## Core Differentiator & Principle

> **"We are not building separate online and offline systems. We are building one connectivity-agnostic Incident Response system where the incident remains active and preserved regardless of network availability, while the communication path dynamically adapts to the environment."**

### Core Pipeline
```text
Detect → Assess → Localize → Communicate → Assign → Rescue → Resolve → Synchronize
```

---

## 1. Architecture Overview

The system consists of four primary decoupled modules operating over a unified data model:

```text
+-------------------------------------------------------------------------+
|                         TOURIST MOBILE / PWA CLIENT                     |
|  - GPS / Movement Telemetry  - Sensor Fall Detector (Confidence Score)  |
|  - 5s SOS Cancel Counter     - Local Emergency Capsule Engine           |
|  - Dexie.js IndexedDB Store  - Adaptive Comm Path Selector             |
+-------------------------------------------------------------------------+
                                    |
          +-------------------------+-------------------------+
          | (Online / Restored)                               | (Offline Zero-Net)
          v                                                   v
+-------------------------------+             +-------------------------------+
|      FASTAPI BACKEND SYSTEM   |             |   LOCAL INDEXEDDB SYNC QUEUE  |
|  - Idempotent Intake Engine   |             |  - Persistent Local Capsules  |
|  - Severity Engine (CRITICAL) |             |  - Deduplicated Queue Flusher |
|  - Location Estimation Engine |             |  - Background Retry Loop      |
|  - Rescue Team Optimizer      |             +-------------------------------+
|  - WebSockets Live Broadcast  |                             | (Auto Sync)
+-------------------------------+                             |
          |                                                   |
          +-------------------------+-------------------------+
                                    v
+-------------------------------------------------------------------------+
|                  CONTROL ROOM AUTHORITY DASHBOARD                       |
|  - Real-Time Live Incident Queue    - OpenStreetMap Leaflet Visualizer  |
|  - Translucent Search Zone Circles  - Team Distance & ETA Matcher       |
|  - Incident Timeline History        - One-Click Dispatch Interface      |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                      RESCUE TEAM RESPONDER TERMINAL                     |
|  - Tactical Field Mission Alert     - Status Pipeline (DISPATCHED...)   |
|  - Search Area & Target GPS         - Offline Field Report Transmit     |
+-------------------------------------------------------------------------+
```

---

## 2. Unified Incident Object Model

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
    { "latitude": 25.2860, "longitude": 91.7180, "timestamp": "...", "speedMs": 1.2 }
  ],
  "batteryLevel font-mono": 27,
  "networkStatus": "OFFLINE",
  "syncStatus": "PENDING",
  "status": "DETECTED",
  "assignedTeamId": "RANGER-02",
  "emergencyContacts": ["+91 98765 43210 (Mother)"],
  "timeline": [
    { "status": "DETECTED", "timestamp": "...", "actor": "Sensor", "note": "Impact 4.8g detected" }
  ]
}
```

---

## 3. Location Estimation Math

When GPS is lost or weakened in mountain forests (e.g. Nohkalikai / Cherrapunji ravines), the system extrapolates:

1. **Confirmed GPS Location**: Last confirmed cellular/GPS fix.
2. **Velocity Vector Extrapolation**: Calculates heading $\vec{v} = (d_{lat}, d_{lng})$ from last movement trail.
3. **Probable Search Area Radius**:
   $$R_{search} = \min(1500m, \max(150m, 200m + (\Delta t_{offline} \times 25m/min)))$$
4. **Confidence Level**:
   $$C_{\%} = \max(35\%, 95\% - (\Delta t_{offline} \times 1.5\%))$$

---

## 4. Hardware Extensions & Future Roadmap

The system defines an **Adaptive Communication Manager Interface** (`frontend/src/services/adaptiveCommManager.ts`) with future hardware stubs:
- **LoRa 868MHz Gateway**: Sub-GHz radio broadcast to ranger stations when cellular fails.
- **BLE Tourist Mesh Relay**: Peer-to-peer relay through passing tourists' mobile phones.
