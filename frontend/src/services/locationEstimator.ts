import type { GPSLocation, EstimatedLocation, MovementPoint } from '../types/incident';

export function calculateSearchArea(
  lastLocation: GPSLocation,
  movementHistory: MovementPoint[],
  elapsedMinutes: number = 15
): EstimatedLocation {
  if (!movementHistory || movementHistory.length < 2) {
    return {
      latitude: lastLocation.latitude,
      longitude: lastLocation.longitude,
      confidence: 85.0,
      radiusMeters: Math.max(150, Math.round(elapsedMinutes * 15))
    };
  }

  const p1 = movementHistory[movementHistory.length - 2];
  const p2 = movementHistory[movementHistory.length - 1];

  const dLat = p2.latitude - p1.latitude;
  const dLng = p2.longitude - p1.longitude;

  const scale = Math.min(2.0, Math.max(0.2, elapsedMinutes / 10));
  const estLat = lastLocation.latitude + (dLat * scale);
  const estLng = lastLocation.longitude + (dLng * scale);

  const confidence = Math.max(35, Math.round((95 - (elapsedMinutes * 1.5)) * 10) / 10);
  const radius = Math.min(1500, Math.max(150, Math.round(200 + (elapsedMinutes * 25))));

  return {
    latitude: Number(estLat.toFixed(6)),
    longitude: Number(estLng.toFixed(6)),
    confidence,
    radiusMeters: radius
  };
}
