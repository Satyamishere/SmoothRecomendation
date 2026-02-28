import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const duffelConfig = {
  apiKey: process.env.DUFFEL_API_KEY,
  baseUrl: process.env.DUFFEL_BASE_URL || "https://api.duffel.com",
  version: process.env.DUFFEL_VERSION || "v2" // updated default version
};

/**
 * Duffel does NOT require login step like TBO.
 * But we keep this function to match your structure.
 */
async function login() {
  if (!duffelConfig.apiKey) {
    throw new Error("Missing DUFFEL_API_KEY in .env");
  }
  return duffelConfig.apiKey;
}

/**
 * Normalize Duffel flight response
 */
function normalizeFlights(rawOffers) {
  const results = [];

  rawOffers.forEach(offer => {
    const slice = offer?.slices?.[0];
    const segment = slice?.segments?.[0];

    if (!segment) return;

    const departureTime = segment.departing_at || '';
    const timeOnly = departureTime.split('T')[1]?.substring(0,5) || '';
    results.push({
      airline: offer.owner?.name || '',
      price: offer.total_amount || 0,
      currency: offer.total_currency || '',
      stops: slice.segments.length - 1,
      departure: departureTime,
      arrival: segment.arriving_at,
      duration: slice.duration,
      time: timeOnly
    });
  });

  return results;
}

/**
 * SEARCH FLIGHTS (Duffel Version)
 */
async function searchFlights(intent) {
  console.log('🔎 searchFlights called with intent', intent);

  if (!intent?.origin || !intent?.destination) {
    console.error('❌ Missing origin or destination');
    return [];
  }

  if (!intent.departure_date) {
    const today = new Date();
    intent.departure_date = today.toISOString().split('T')[0];
    console.log(`📅 No date provided. Using today: ${intent.departure_date}`);
  }

  const apiKey = await login();

  const payload = {
    data: {
      slices: [
        {
          origin: intent.origin,
          destination: intent.destination,
          departure_date: intent.departure_date
        }
      ],
      passengers: [{ type: "adult" }],
      cabin_class: "economy"
    }
  };

  console.log('📤 Duffel search payload:', JSON.stringify(payload, null, 2));

  try {
    const resp = await axios.post(
      `${duffelConfig.baseUrl}/air/offer_requests`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Duffel-Version": duffelConfig.version,
          "Content-Type": "application/json"
        }
      }
    );

    const offers = resp.data?.data?.offers || [];

    // debug: log summary of raw offers (airline, price, departure)
    console.log('📥 raw Duffel offers summary:');
    offers.forEach((o, idx) => {
      const slice = o?.slices?.[0];
      const seg = slice?.segments?.[0] || {};
      console.log(`  [${idx}] airline:${o.owner?.name || ''} price:${o.total_amount} depart:${seg.departing_at || ''}`);
    });

    const normalized = normalizeFlights(offers);

    console.log('📤 normalized Duffel flights:');
    normalized.forEach((f, idx) => {
      console.log(`  [${idx}] airline:${f.airline} price:${f.price} time:${f.time} stops:${f.stops}`);
    });
    console.log(`✅ ${normalized.length} flights fetched from Duffel`);
    return normalized;

  } catch (err) {
    console.error("❌ Duffel Search Failed:", err.response?.data || err.message);
    return [];
  }
}

export { searchFlights, login };