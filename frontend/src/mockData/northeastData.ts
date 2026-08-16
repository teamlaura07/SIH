import type { RescueTeam } from '../types/incident';

export interface TouristProfile {
  id: string;
  name: string;
  age: number;
  nationality: string;
  bloodGroup: string;
  emergencyContact: string;
  medicalConditions: string;
  trekRouteName: string;
}

export const CURRENT_TOURIST: TouristProfile = {
  id: "T1028",
  name: "Rahul Sharma",
  age: 29,
  nationality: "Indian",
  bloodGroup: "O+",
  emergencyContact: "+91 98765 43210 (Mother: Sunita Sharma)",
  medicalConditions: "None. Asthmatic inhaler in backpack.",
  trekRouteName: "Dzukou Valley & Sohra Waterfall Circuit"
};

export const MOUNTAIN_TRAILS: { name: string; coordinates: [number, number][] }[] = [
  {
    name: "Nohkalikai Ridge Trek",
    coordinates: [
      [25.2850, 91.7200],
      [25.2820, 91.7240],
      [25.2780, 91.7290],
      [25.2750, 91.7340],
      [25.2710, 91.7390],
      [25.2670, 91.7450]
    ]
  },
  {
    name: "Dzukou Forest Connector Trail",
    coordinates: [
      [25.2900, 91.7100],
      [25.2860, 91.7180],
      [25.2800, 91.7280],
      [25.2730, 91.7350]
    ]
  }
];

export const DANGER_GEOFENCES = [
  {
    id: "ZONE-RED-01",
    name: "Nohkalikai Ravine Edge (Unstable Cliff)",
    center: { latitude: 25.2745, longitude: 91.7350 },
    radiusMeters: 300,
    riskLevel: "CRITICAL_FALL_RISK"
  },
  {
    id: "ZONE-YELLOW-02",
    name: "Dense Valley Mist Corridor (Zero Visibility)",
    center: { latitude: 25.2800, longitude: 91.7280 },
    radiusMeters: 450,
    riskLevel: "HIGH_DISORIENTATION_RISK"
  }
];

export const INITIAL_RESCUE_TEAMS: RescueTeam[] = [
  {
    id: "RANGER-02",
    name: "Cherrapunji Forest Rangers Unit 2",
    type: "Forest Rescue",
    latitude: 25.2750,
    longitude: 91.7320,
    available: true,
    equipment: ["Thermal Drone", "Mountain Rope Gear", "Satellite Comms", "First Aid Kit"],
    baseLocation: "Sohra Forest Station",
    estimatedResponseTime: 7
  },
  {
    id: "MED-01",
    name: "Shillong Emergency Medical Response",
    type: "Medical",
    latitude: 25.2820,
    longitude: 91.7250,
    available: true,
    equipment: ["Trauma Kit", "Portable Oxygen", "4x4 Ambulance", "Defibrillator"],
    baseLocation: "Nohkalikai Field Camp",
    estimatedResponseTime: 12
  },
  {
    id: "POLICE-04",
    name: "Dawki Tourist Protection Force",
    type: "Police",
    latitude: 25.2600,
    longitude: 91.7450,
    available: true,
    equipment: ["VHF Radios", "GPS Trackers", "All-Terrain Vehicle", "Night Vision"],
    baseLocation: "Tourist Security Outpost 4",
    estimatedResponseTime: 15
  },
  {
    id: "NDRF-01",
    name: "Northeast Disaster Response Team Alpha",
    type: "Disaster Response",
    latitude: 25.2900,
    longitude: 91.7100,
    available: true,
    equipment: ["Heavy Rescue Gear", "Search Dogs", "Satellite Phone", "Stretchers"],
    baseLocation: "Regional Rescue Hub",
    estimatedResponseTime: 20
  }
];
