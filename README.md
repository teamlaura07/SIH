# SIH25002 - Real-Life Hybrid Incident Response System

> **"We are not building separate online and offline systems. We are building one connectivity-agnostic Incident Response system where the incident remains active and preserved regardless of network availability, while the communication path dynamically adapts to the environment."**
> 
> *Tagline:* **"Network loss should change the communication path — not stop the rescue response."**

---

## 1. Project Folder Structure

```text
d:\SIH-IT/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI server & WebSocket manager
│   │   ├── config.py                   # App configuration & CORS settings
│   │   ├── database.py                 # SQLAlchemy engine & SQLite setup
│   │   ├── websocket_manager.py        # Real-time WebSocket connection manager
│   │   ├── models/                     # SQLAlchemy models (Incident, RescueTeam, Capsule)
│   │   ├── schemas/                    # Pydantic schemas (Unified Incident Model)
│   │   ├── services/                   # Severity classifier, location estimator, team optimizer
│   │   ├── routers/                    # Incidents, Rescue Teams, Simulation API endpoints
│   │   └── seed_data.py                # Pre-populates NE India rescue units & forest trails
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/                 # Navbar, ConnectivityBadge, SyncQueueBadge, DataCapsuleModal, CommPathVisualizer
│   │   │   ├── ControlRoom/            # Control Room Emergency Command Dashboard
│   │   │   ├── Tourist/                # Tourist Mobile PWA View (SOS countdown & fall detector)
│   │   │   ├── RescueTeam/             # Rescue Team Field Terminal
│   │   │   ├── Map/                    # Leaflet ForestMap (OSM tiles, search area, trails)
│   │   │   └── Demo/                   # 5-Scenario Interactive Demo Stepper
│   │   ├── context/                    # Connectivity, Incident, and Role Contexts
│   │   ├── db/                         # Dexie.js IndexedDB schema (local capsules & sync queue)
│   │   ├── services/                   # apiClient, syncEngine, locationEstimator, adaptiveCommManager, websocketClient
│   │   ├── types/                      # TypeScript definitions for Incident, Capsule, RescueTeam
│   │   └── mockData/                   # Northeast India trails & danger geofences
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docs/
│   ├── ARCHITECTURE.md                 # Detailed hybrid communication architecture
│   └── INTEGRATION_GUIDE.md            # Integration API spec for Tourist Safety Monitoring
└── README.md
```

---

## 2. Quick Installation & Setup

### Requirements
- Python 3.10+
- Node.js v18+ & npm

### Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend Swagger Docs**: `http://localhost:8000/docs`
- **Live WebSockets Stream**: `ws://localhost:8000/ws/incidents`

---

## 3. Database Setup

The backend uses **SQLAlchemy** with an automatic SQLite database (`incident_response.db`). 
Upon first launch, the database tables are auto-created and seeded with North-East India rescue teams (`RANGER-02`, `MED-01`, `POLICE-04`, `NDRF-01`) and Dzukou/Cherrapunji trail overlays.

To reset the database at any time during a live demo:
- Call `POST /api/v1/simulation/reset` or click **"Reset Demo State"** in the UI.

---

## 4. How to Test Offline Mode & Synchronization

1. Open `http://localhost:5173`.
2. In the top navbar, toggle the connectivity badge from **🟢 ONLINE** to **🔴 ZERO CONNECTIVITY (OFFLINE)**.
3. Switch to the **Tourist Mobile PWA** tab.
4. Press **"PRESS SOS"** (or let the 5-second countdown finish) or click **Simulate "Possible Fall – Confidence 87%"**.
5. Observe:
   - An incident is created instantly.
   - The status pill shows **PENDING SYNC**.
   - An **Emergency Data Capsule** is saved locally in browser **IndexedDB**.
   - The navbar displays **"1 QUEUED FOR SYNC"**.
   - The Control Room does *not* receive it yet because there is zero network.
6. Toggle connectivity back to **🟢 ONLINE**.
7. Observe:
   - The **OfflineSyncEngine** detects network restoration.
   - The queue flushes automatically with deduplication (`incidentId`).
   - The Control Room immediately receives the incident via WebSocket and displays the probable search area on the map.

---

## 5. Interactive 5-Scenario Demo Runner

Click **"Interactive Demo Suite"** in the top navbar to step through the exact real-life scenario:

- **Step 1: Online SOS**: Tourist is online; SOS triggers immediate control room dispatch.
- **Step 2: Signal Lost**: Tourist enters deep Dzukou valley mist zone; network toggles to OFFLINE.
- **Step 3: Offline Incident**: Tourist experiences fall while offline; emergency capsule stored locally.
- **Step 4: Restored & Sync**: Tourist reaches high ridge; network restored; auto-sync flushes queue to dashboard.
- **Step 5: Rescue & Resolve**: Control room classifies severity, recommends `RANGER-02`, team dispatches and marks `RESOLVED`.

---

## 6. Key REST API Endpoints

- `GET /api/v1/incidents` - List all incidents
- `POST /api/v1/incidents` - Intake / Upsert incident (Idempotent)
- `POST /api/v1/incidents/batch-sync` - Batch sync offline queue
- `PUT /api/v1/incidents/{id}/status` - Update lifecycle status
- `POST /api/v1/incidents/{id}/assign` - Dispatch rescue team
- `GET /api/v1/rescue-teams` - List rescue teams & calculated ETAs
- `GET /api/v1/rescue-teams/recommend/{id}` - Recommendation engine for best team match
- `POST /api/v1/simulation/reset` - Reset demo state

---

## 7. Teammate Integration API

Your teammates developing the **Smart Tourist Safety Monitoring** module can send telemetry or sensor trigger alerts directly to:

`POST http://localhost:8000/api/v1/incidents`

See `docs/INTEGRATION_GUIDE.md` for full details.

---

## 8. Known Limitations & Hardware Extensions

- **Hardware Extension Simulation**: Long-range hardware interfaces (LoRa 868MHz Gateway & BLE Mesh Relay) are provided as structured software abstractions in `adaptiveCommManager.ts`. In a production hardware deployment, these interface with physical Sub-GHz RF modules.
