import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// simple in-memory token cache (valid for 1hr)
const tokenCache = {
  token: null,
  expiresAt: 0
};

// configuration values pulled from environment
const tboConfig = {
  clientId: process.env.TBO_CLIENT_ID || 'ApiIntegrationNew',
  userName: process.env.TBO_USERNAME,
  password: process.env.TBO_PASSWORD,
  endUserIp: process.env.TBO_IP,
  authUrl: process.env.TBO_AUTH_URL || 'http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate',
  searchUrl: process.env.TBO_SEARCH_URL || 'http://airBE.tektravels.com/InternalAirService.svc/rest/Search'
};

/**
 * LOGIN (Authenticate)
 */
async function login() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  console.log("🔐 Authenticating with TBO...");
  const payload = {
    ClientId: tboConfig.clientId,
    UserName: tboConfig.userName,
    Password: tboConfig.password,
    EndUserIp: tboConfig.endUserIp
  };

  try {
    const resp = await axios.post(tboConfig.authUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (resp.data && resp.data.Status === 1 && resp.data.TokenId) {
      tokenCache.token = resp.data.TokenId;
      tokenCache.expiresAt = Date.now() + 60 * 60 * 1000;
      console.log("✅ TBO Auth Success! Token:", tokenCache.token.substring(0, 15) + "...");
      return tokenCache.token;
    } else {
      console.error("❌ TBO Auth Failed:", resp.data?.Error?.ErrorMessage || resp.data);
      throw new Error('TBO login failed');
    }
  } catch (error) {
    console.error("❌ API Error (Auth):", error.message);
    throw new Error('TBO login failed');
  }
}

/**
 * Normalize TBO flight search response to {airline,price,stops,time,duration}
 */
function normalizeFlights(raw) {
  const results = [];
  const rawFlights = raw?.Response?.Results?.[0] || [];

  rawFlights.forEach(f => {
    const seg = f.Segments?.[0]?.[0] || {};
    const dep = seg.Origin?.DepTime || '';
    const timeOnly = dep.split('T')[1]?.substring(0,5) || ''; // HH:mm

    results.push({
      airline: seg.Airline?.AirlineName || '',
      price: f.Fare?.PublishedFare || 0,
      stops: (f.Segments?.[0]?.length || 1) - 1,
      time: timeOnly,
      duration: seg.Duration ? `${seg.Duration} mins` : ''
    });
  });

  return results;
}

/**
 * SEARCH FLIGHTS
 */
async function searchFlights(intent) {
  console.log('🔎 searchFlights called with intent', intent);
  const token = await login();
  if (!token) throw new Error('no auth token');

  // require origin and date
  if (!intent.origin || !intent.departure_date) {
    console.error('searchFlights: missing intent.origin or intent.departure_date', intent);
    return [];
  }

  const payload = {
    AdultCount: '1',
    ChildCount: '0',
    InfantCount: '0',
    IsDomestic: 'true',
    BookingMode: '5',
    DirectFlight: 'false',
    OneStopFlight: 'false',
    JourneyType: '1',
    EndUserIp: tboConfig.endUserIp,
    TokenId: token,
    // no preferred airlines/sources by default; ensure wide search
    Segments: [
      {
        Origin: intent.origin,         // string code
        Destination: intent.destination,
        FlightCabinClass: 1,
        // try sending just the date (no time component)
        PreferredDepartureTime: intent.departure_date // 'YYYY-MM-DD' only

      }
    ],
    ResultFareType: 0,
    PreferredCurrency: 'INR'
  };

  console.log('📤 TBO search payload:', JSON.stringify(payload, null, 2));

  try {
    const resp = await axios.post(tboConfig.searchUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (resp.data && resp.data.Response && resp.data.Response.ResponseStatus === 1) {
      const normalized = normalizeFlights(resp.data);
      console.log(`✅ ${normalized.length} flights fetched from TBO`, normalized);
      return normalized;
    } else {
      console.error('Search response error', resp.data);
      return [];
    }
  } catch (err) {
    console.error('❌ API Error (Search):', err.message);
    if (err.response) {
      console.error('   status:', err.response.status);
      console.error('   data:', JSON.stringify(err.response.data));
    }
    return [];
  }
}

export { searchFlights, login };