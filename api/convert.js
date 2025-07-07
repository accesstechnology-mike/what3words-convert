import axios from 'axios';

// Helper: expand country codes to readable names
function expandCountryCode(countryCode, locationData = null) {
  const countryMap = {
    'GB': 'United Kingdom',
    'US': 'United States',
    'CA': 'Canada',
    'AU': 'Australia',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'IE': 'Ireland',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'PT': 'Portugal',
    'GR': 'Greece',
    'TR': 'Turkey',
    'RU': 'Russia',
    'CN': 'China',
    'JP': 'Japan',
    'KR': 'South Korea',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'AR': 'Argentina',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'IL': 'Israel',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'NZ': 'New Zealand'
  };

  // Special handling for UK - determine constituent country
  if (countryCode === 'GB' && locationData) {
    const locationText = (locationData.nearestPlace || '').toLowerCase();
    const region = (locationData.region || '').toLowerCase();
    
    // Check for Scotland
    if (region.includes('scotland') || 
        locationText.includes('scotland') ||
        region.includes('scottish') ||
        // Common Scottish regions
        ['highland', 'lowland', 'grampian', 'tayside', 'strathclyde', 'lothian', 'borders', 'fife', 'central', 'dumfries', 'galloway'].some(r => region.includes(r))) {
      return 'Scotland';
    }
    
    // Check for Wales
    if (region.includes('wales') || 
        locationText.includes('wales') ||
        region.includes('welsh') ||
        // Common Welsh regions
        ['powys', 'gwynedd', 'dyfed', 'clwyd', 'glamorgan', 'gwent', 'ceredigion', 'pembrokeshire', 'carmarthenshire', 'swansea', 'cardiff'].some(r => region.includes(r))) {
      return 'Wales';
    }
    
    // Check for Northern Ireland
    if (region.includes('northern ireland') || 
        locationText.includes('northern ireland') ||
        region.includes('ulster') ||
        // Common Northern Ireland regions
        ['antrim', 'armagh', 'down', 'fermanagh', 'londonderry', 'tyrone', 'belfast', 'derry'].some(r => region.includes(r))) {
      return 'Northern Ireland';
    }
    
    // Default to England for GB
    return 'England';
  }

  return countryMap[countryCode] || countryCode;
}

// Helper: normalise input to word1.word2.word3
function normaliseW3W(input) {
  if (!input || typeof input !== 'string') return null;
  let words = input
    .trim()
    .toLowerCase()
    .replace(/^\/+/g, '') // Remove leading slashes
    .replace(/^\.+/g, '') // Remove leading dots
    .replace(/[\s,]+/g, '.') // Replace commas/spaces with dots
    .replace(/\.+/g, '.'); // Collapse multiple dots

  words = words.replace(/\.$/, ''); // Remove trailing dot
  const parts = words.split('.');
  if (parts.length !== 3 || parts.some(p => p.length === 0)) return null;
  return parts.join('.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { w3w } = req.body || {};
    if (!w3w) {
      return res.status(400).json({ error: 'Missing "w3w" field in request body.' });
    }

    const normalised = normaliseW3W(w3w);
    if (!normalised) {
      return res.status(400).json({ error: 'Invalid what3words address format.' });
    }

    const pageUrl = `https://what3words.com/${encodeURIComponent(normalised)}`;
    const htmlResp = await axios.get(pageUrl);
    const html = htmlResp.data;

    // Extract location description from HTML content
    let locationDescription = null;
    
    // Try to extract "near [location]" patterns from HTML attributes (meta tags, etc.)
    const nearPatterns = [
      // Look for "near" in any HTML attribute
      /near\s+([^"]+?)(?:\."|"|\/>)/gi,
      // Look for "near" in meta content
      /content="[^"]*near\s+([^"]+?)(?:\."|")/gi,
      // Look for "near" in title or alt attributes
      /(?:title|alt)="[^"]*near\s+([^"]+?)(?:\."|")/gi,
      // Look for "near" in any quoted attribute
      /"[^"]*near\s+([^"]+?)(?:\."|")/gi
    ];

    for (const pattern of nearPatterns) {
      const matches = [...html.matchAll(pattern)];
      if (matches && matches.length > 0) {
        for (const match of matches) {
          if (match[1]) {
            const cleanMatch = match[1].trim().replace(/\.$/, ''); // Remove trailing period
            if (cleanMatch.length > 3 && cleanMatch.length < 100) {
              locationDescription = cleanMatch;
              break;
            }
          }
        }
        if (locationDescription) break;
      }
    }

    // Also try to extract from meta tags more generally
    if (!locationDescription) {
      const metaDescPattern = /<meta[^>]*(?:name="description"|property="og:description")[^>]*content="([^"]*)"[^>]*>/gi;
      const metaMatches = [...html.matchAll(metaDescPattern)];
      
      for (const metaMatch of metaMatches) {
        if (metaMatch[1]) {
          const metaContent = metaMatch[1];
          // Extract location part from meta description
          const nearMatch = metaContent.match(/near\s+([^.]+)/i);
          if (nearMatch) {
            locationDescription = nearMatch[1].trim();
            break;
          }
        }
      }
    }

    const scriptMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
    if (!scriptMatch || scriptMatch.length < 2) {
      return res.status(500).json({ error: 'Failed to parse what3words page.' });
    }

    let jsonData;
    try {
      jsonData = JSON.parse(scriptMatch[1]);
    } catch (e) {
      console.error('JSON parse error', e);
      return res.status(500).json({ error: 'Failed to parse what3words data.' });
    }

    const location = jsonData?.props?.pageProps?.location;
    const coords = location?.coordinates || jsonData?.props?.pageProps?.countryConfig?.coordinates;

    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return res.status(404).json({ error: 'No address found. Please check your what3words address and try again.' });
    }

    // Check if we have a valid what3words address in the response
    if (!location?.threeWordAddress) {
      return res.status(404).json({ 
        error: 'No address found. Please check your what3words address and try again.' 
      });
    }

    // Extract additional location information
    const locationInfo = {
      latitude: coords.lat,
      longitude: coords.lng
    };

    // Add country information
    if (location?.country) {
      locationInfo.country = location.country;
    }

    // Add language information
    if (location?.language) {
      locationInfo.language = location.language;
    }

    // Validate that the returned address matches what the user requested
    // If what3words corrected/changed the address, we should reject it
    const returnedAddress = location.threeWordAddress.toLowerCase();
    if (returnedAddress !== normalised.toLowerCase()) {
      console.log(`Address mismatch: requested "${normalised}" but got "${returnedAddress}"`);
      return res.status(404).json({ 
        error: 'No address found. Please check your what3words address and try again.' 
      });
    }

    // Add words information (we know it exists and matches the request)
    locationInfo.words = location.threeWordAddress;

    // Use scraped location description from HTML if available
    if (locationDescription) {
      locationInfo.nearestPlace = locationDescription;
      console.log('Extracted location description from HTML:', locationDescription);
    } else {
      console.log('No location description found in HTML');
    }

    // Extract better location description from what3words data as fallback
    // Priority order: nearestPlace, displayName, place, locality, etc.
    if (!locationInfo.nearestPlace) {
      if (location?.nearestPlace) {
        locationInfo.nearestPlace = location.nearestPlace;
      } else if (location?.displayName) {
        locationInfo.nearestPlace = location.displayName;
      } else if (location?.place) {
        locationInfo.nearestPlace = location.place;
      } else if (location?.locality) {
        locationInfo.nearestPlace = location.locality;
      } else if (location?.address) {
        locationInfo.nearestPlace = location.address;
      } else if (location?.locationDescription) {
        locationInfo.nearestPlace = location.locationDescription;
      }
    }

    // Add region/state from what3words data first
    if (location?.region) {
      locationInfo.region = location.region;
    } else if (location?.state) {
      locationInfo.region = location.state;
    } else if (location?.administrativeArea) {
      locationInfo.region = location.administrativeArea;
    }

    // Only fall back to reverse geocoding if we don't have good location info from what3words
    // If we have a good location description from HTML scraping, skip reverse geocoding
    if ((!locationInfo.nearestPlace || !locationInfo.region) && !locationDescription) {
      console.log('Calling reverse geocoding API for additional location info');
      try {
        const reverseGeoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.lat}&longitude=${coords.lng}&localityLanguage=en`;
        const geoResponse = await axios.get(reverseGeoUrl);
        const geoData = geoResponse.data;
        
        // Only use reverse geocoding if we don't have better data from what3words
        if (!locationInfo.nearestPlace) {
          if (geoData.city) {
            locationInfo.nearestPlace = geoData.city;
          } else if (geoData.locality) {
            locationInfo.nearestPlace = geoData.locality;
          } else if (geoData.principalSubdivision) {
            locationInfo.nearestPlace = geoData.principalSubdivision;
          }
        }
        
        // Add region/state info from reverse geocoding if not available from what3words
        if (!locationInfo.region && geoData.principalSubdivision) {
          locationInfo.region = geoData.principalSubdivision;
          console.log('Added region from reverse geocoding:', geoData.principalSubdivision);
        }
        
        // Log full reverse geocoding data to see what country info is available
        console.log('Reverse geocoding data:', JSON.stringify(geoData, null, 2));
        
      } catch (geoError) {
        console.log('Reverse geocoding failed:', geoError.message);
        // Continue without geocoding data
      }
    } else {
      console.log('Skipping reverse geocoding - we have good location data from what3words HTML');
    }

    // Expand country code to readable name
    if (locationInfo.country) {
      const expandedCountry = expandCountryCode(locationInfo.country, locationInfo);
      locationInfo.country = expandedCountry;
      console.log(`Expanded country: ${location?.country} -> ${expandedCountry}`);
    }

    // Log the full location object for debugging (remove in production)
    console.log('Full location data:', JSON.stringify(location, null, 2));
    console.log('Final response data:', JSON.stringify(locationInfo, null, 2));

    return res.json(locationInfo);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}