/**
 * Calcula a distância entre duas coordenadas GPS usando a fórmula de Haversine
 * @param lat1 Latitude do ponto 1
 * @param lon1 Longitude do ponto 1
 * @param lat2 Latitude do ponto 2
 * @param lon2 Longitude do ponto 2
 * @returns Distância em metros
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distância em metros
}

/**
 * Verifica se um ponto está dentro de um círculo (geofence)
 * @param pointLat Latitude do ponto
 * @param pointLon Longitude do ponto
 * @param centerLat Latitude do centro
 * @param centerLon Longitude do centro
 * @param radius Raio em metros
 * @returns true se o ponto está dentro do círculo
 */
export function isPointInsideCircle(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radius: number
): boolean {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radius;
}
