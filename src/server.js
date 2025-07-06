import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file if present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend from /public
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

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
});

// Fallback: serve index.html for any other route (useful for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});