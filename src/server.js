import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend from /dist (built React app)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'dist')));

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

// POST /convert
app.post('/convert', async (req, res) => {
  try {
    const { w3w } = req.body;
    if (!w3w) {
      return res.status(400).json({ error: 'Missing \"w3w\" field in request body.' });
    }

    const normalised = normaliseW3W(w3w);
    if (!normalised) {
      return res.status(400).json({ error: 'Invalid what3words address format.' });
    }

    // Attempt to get coordinates by scraping what3words page (no API key required)
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
    if (err.response && err.response.data && err.response.data.error) {
      return res.status(400).json({ error: err.response.data.error.message || 'Error from what3words API' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Global error-handling middleware to ensure JSON responses
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Fallback: serve index.html for any other route (useful for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});