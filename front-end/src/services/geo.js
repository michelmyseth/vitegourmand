// Delivery distance from Bordeaux (KAN-49).
// - Geocoding: API Adresse (Géoplateforme IGN), free, no key, France only.
// - Road distance: OSRM public demo server; falls back to straight-line
//   distance (haversine) if OSRM is unavailable.
// The back-end must redo this calculation when the order is saved.

const GEOCODE_URL = 'https://data.geopf.fr/geocodage/search'
const ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving'

// Departure point: Bordeaux city centre (lon, lat)
export const BORDEAUX = { lon: -0.5792, lat: 44.8378 }
const BORDEAUX_CITYCODE = '33063' // INSEE code of Bordeaux

/** Address suggestions, e.g. for an autocomplete field. */
export async function searchAddress(query, limit = 5) {
  if (!query || query.trim().length < 3) return []
  const url = `${GEOCODE_URL}?index=address&limit=${limit}&q=${encodeURIComponent(query.trim())}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Service d’adresses indisponible')
  const data = await res.json()
  return data.features.map((f) => ({
    label: f.properties.label,
    street: f.properties.name,
    postcode: f.properties.postcode,
    city: f.properties.city,
    citycode: f.properties.citycode,
    lon: f.geometry.coordinates[0],
    lat: f.geometry.coordinates[1]
  }))
}

export function isInBordeaux(address) {
  return address?.citycode === BORDEAUX_CITYCODE
}

export function haversineKm(a, b) {
  const R = 6371
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLon = rad(b.lon - a.lon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Distance in km (1 decimal) between Bordeaux and a geocoded address.
 * @returns {Promise<{ km: number, inBordeaux: boolean, method: 'road' | 'straight' | 'none' }>}
 */
export async function deliveryDistance(address) {
  if (isInBordeaux(address)) return { km: 0, inBordeaux: true, method: 'none' }

  const round = (km) => Math.round(km * 10) / 10
  try {
    const url = `${ROUTE_URL}/${BORDEAUX.lon},${BORDEAUX.lat};${address.lon},${address.lat}?overview=false`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code === 'Ok' && data.routes.length) {
      return { km: round(data.routes[0].distance / 1000), inBordeaux: false, method: 'road' }
    }
  } catch {
    // network error: use the straight-line distance below
  }
  return { km: round(haversineKm(BORDEAUX, address)), inBordeaux: false, method: 'straight' }
}
