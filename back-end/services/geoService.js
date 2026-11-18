// Delivery distance from Bordeaux, recomputed by the server (KAN-49 / KAN-51).
// - Geocoding: API Adresse (Géoplateforme IGN), free, no key, France only.
// - Road distance: OSRM public server; straight-line distance if unavailable.
const { HttpError } = require('../utils/httpError');

const GEOCODE_URL = 'https://data.geopf.fr/geocodage/search';
const ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving';
const BORDEAUX = { lon: -0.5792, lat: 44.8378 };
const BORDEAUX_CITYCODE = '33063';
const TIMEOUT_MS = 5000;

async function getJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function haversineKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

const round1 = (km) => Math.round(km * 10) / 10;

/**
 * Geocodes "address, postcode city" and returns the delivery distance.
 * @returns {Promise<{ inBordeaux: boolean, km: number, city: string, postcode: string }>}
 */
async function deliveryFor({ address, postcode, city }) {
  let feature;
  try {
    const q = encodeURIComponent(`${address} ${postcode} ${city}`);
    const data = await getJson(`${GEOCODE_URL}?index=address&limit=1&q=${q}&postcode=${encodeURIComponent(postcode)}`);
    feature = data.features?.[0];
  } catch {
    throw new HttpError(503, "Le service d'adresses est indisponible. Réessayez dans quelques instants.");
  }
  if (!feature || feature.properties.score < 0.4) {
    throw new HttpError(400, 'Adresse introuvable. Choisissez une adresse dans la liste proposée.', {
      address: 'Adresse introuvable.',
    });
  }

  const props = feature.properties;
  const point = { lon: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] };
  const place = { city: props.city, postcode: props.postcode };

  if (props.citycode === BORDEAUX_CITYCODE) return { inBordeaux: true, km: 0, ...place };

  try {
    const data = await getJson(`${ROUTE_URL}/${BORDEAUX.lon},${BORDEAUX.lat};${point.lon},${point.lat}?overview=false`);
    if (data.code === 'Ok' && data.routes.length) {
      return { inBordeaux: false, km: round1(data.routes[0].distance / 1000), ...place };
    }
  } catch {
    // routing server unavailable: straight-line distance below
  }
  return { inBordeaux: false, km: round1(haversineKm(BORDEAUX, point)), ...place };
}

module.exports = { deliveryFor };
