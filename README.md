# What3Words → Maps Converter 🗺️

A minimal, mobile-first web app that converts any **what3words** address to its corresponding latitude & longitude, and provides quick links / an embedded map for easy viewing.

---

## Features

• Accepts what3words addresses in **any common format** (dots, spaces, commas, leading slashes)

• Normalises input before querying the official what3words API

• Public REST endpoint `POST /convert` returns JSON coordinates – CORS-enabled for reuse in other projects

• Clean, responsive UI that works great on mobile

• Copies and opens Google Maps & Apple Maps links, plus an embedded Google Map

---

## Demo

```bash
# Install dependencies
npm install

# Copy environment variables template then add your W3W API key
cp .env.example .env
# Edit .env and set W3W_API_KEY

# Start the server (frontend is served automatically)
npm start

# Visit http://localhost:3000 in your browser
```

### Example `curl`

```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"w3w": "///index home raft"}'

# → { "latitude": 51.520847, "longitude": -0.195521 }
```

---

## Project Structure

```
public/          # Static frontend (HTML, CSS, JS)
src/server.js    # Express backend & API endpoint
.env.example     # Environment variable template
package.json     # Dependencies & scripts
```

---

## Environment Variables

| Variable        | Description                     |
| --------------- | ------------------------------- |
| `W3W_API_KEY`   | Your what3words API key         |
| `PORT` _(opt)_  | Port to run the server (default `3000`) |

Sign up for a free API key at [what3words.com](https://developer.what3words.com/public-api) and paste it in `.env`.

---

## API

### `POST /convert`

Converts a what3words address to coordinates.

Request body:

```json
{
  "w3w": "///index home raft"
}
```

Response body:

```json
{
  "latitude": 51.520847,
  "longitude": -0.195521
}
```

Errors return JSON like:

```json
{ "error": "Invalid what3words address format." }
```

---

## Deployment

The app is completely self-contained — any Node.js host (Heroku, Render, Fly.io, etc.) can run:

```bash
npm ci
npm start
```

Make sure to set `W3W_API_KEY` in the host's environment.