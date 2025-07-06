import axios from 'axios';

// Helper: normalise input to word1.word2.word3
function normaliseW3W(input) {
  if (!input || typeof input !== 'string') return null;
  let words = input
    .trim()
    .toLowerCase()
    // Remove leading slashes (one or more)
    .replace(/^\/+/g, '')
    // Remove leading dots
    .replace(/^\.+/g, '')
    // Replace commas and spaces with dots
    .replace(/[\s,]+/g, '.')
    // Replace multiple consecutive dots with single
    .replace(/\.+/g, '.');

  // Remove trailing dot
  words = words.replace(/\.$/, '');

  // Ensure we now have exactly 2 dots (3 words)
  const parts = words.split('.');
  if (parts.length !== 3 || parts.some(p => p.length === 0)) {
    return null;
  }
  return parts.join('.');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { w3w } = req.body;
    if (!w3w) {
      return res.status(400).json({ error: 'Missing "w3w" field in request body.' });
    }

    const normalised = normaliseW3W(w3w);
    if (!normalised) {
      return res.status(400).json({ error: 'Invalid what3words address format.' });
    }

    const apiKey = process.env.W3W_API_KEY;
    if (!apiKey) {
      console.error('Missing W3W_API_KEY env variable');
      return res.status(500).json({ error: 'Server configuration error.' });
    }

    const url = `https://api.what3words.com/v3/convert-to-coordinates?words=${encodeURIComponent(normalised)}&key=${apiKey}`;

    const response = await axios.get(url);
    const { coordinates } = response.data;
    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(500).json({ error: 'Failed to retrieve coordinates.' });
    }

    return res.json({ latitude: coordinates.lat, longitude: coordinates.lng });
  } catch (err) {
    console.error(err.response?.data || err.message);
    if (err.response && err.response.data && err.response.data.error) {
      return res.status(400).json({ error: err.response.data.error.message || 'Error from what3words API' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
}