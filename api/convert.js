import axios from 'axios';

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

    const coords =
      jsonData?.props?.pageProps?.location?.coordinates ||
      jsonData?.props?.pageProps?.countryConfig?.coordinates;

    if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
      return res.status(500).json({ error: 'Coordinates not found.' });
    }

    return res.json({ latitude: coords.lat, longitude: coords.lng });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}