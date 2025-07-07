# What3Words → Maps Converter 🗺️

A modern, mobile-first React web app that converts any **what3words** address to precise coordinates and provides instant access to interactive maps.

Built with **React + Vite** for lightning-fast development and **Vercel serverless functions** for seamless deployment.

---

## ✨ Features

• **Smart Input Processing** - Accepts what3words addresses in any format (dots, spaces, commas, leading slashes)
• **Real-time Conversion** - Instant conversion to latitude/longitude coordinates  
• **Multiple Map Integrations** - Direct links to Google Maps and Apple Maps
• **Responsive Design** - Beautiful UI with Material Tailwind components
• **Copy to Clipboard** - One-click copying of coordinates and map links
• **Embedded Preview** - Live Google Maps preview (desktop)
• **No API Key Required** - Uses intelligent web scraping approach

---

## 🚀 Quick Start

### Frontend Development (Hot Reloading)
```bash
# Install dependencies
pnpm install

# Start frontend with hot reloading
pnpm run dev
# → http://localhost:5173 (API calls will fail, but great for UI work)
```

### Full Development (Frontend + API)
```bash
# Run both frontend and backend
pnpm run dev:full
# → Frontend: http://localhost:5173 (with hot reloading)
# → API: http://localhost:3000 (serverless functions)
```

### API Only
```bash
# Just the serverless functions
pnpm run dev:api
# → http://localhost:3000
```

---

## 🏗️ Project Structure

```
src/
├── main.jsx           # React entry point
├── App.jsx            # Main React component
├── index.css          # Tailwind styles
api/
├── convert.js         # Serverless function for w3w conversion
public/
├── index.html         # HTML template
├── vite.config.js     # Vite configuration
├── vercel.json        # Vercel deployment config
└── package.json       # Dependencies & scripts
```

---

## 🔧 Tech Stack

**Frontend:**
- ⚛️ React 18
- ⚡ Vite (Fast development & building)
- 🎨 Material Tailwind UI
- 🌊 Tailwind CSS

**Backend:**
- 🔧 Vercel Serverless Functions
- 📡 Axios for HTTP requests
- 🕷️ Web scraping (no API key needed)

**Deployment:**
- 🚀 Vercel (Frontend CDN + Serverless functions)

---

## 🔌 API Usage

### `POST /convert`

Convert a what3words address to coordinates.

**Request:**
```bash
curl -X POST http://localhost:3000/convert \
  -H "Content-Type: application/json" \
  -d '{"w3w": "index.home.raft"}'
```

**Response:**
```json
{
  "latitude": 51.520847,
  "longitude": -0.195521
}
```

**Supported Formats:**
- `index.home.raft`
- `///index.home.raft`  
- `index home raft`
- `index, home, raft`

---

## 🛠️ Development

### Hot Reloading Setup

This project uses **two servers** for optimal development experience:

1. **Vite Dev Server** (port 5173) - Frontend with hot reloading
2. **Vercel Dev Server** (port 3000) - Serverless functions

**Why two servers?**
- Vite provides excellent hot module replacement for React
- Vercel dev simulates serverless functions locally
- Vite proxies API calls to the Vercel dev server

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Frontend only (hot reloading) |
| `pnpm run dev:full` | Frontend + API (recommended) |
| `pnpm run dev:api` | API only |
| `pnpm run build` | Production build |

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
vercel --prod
```

The app automatically deploys:
- **Frontend** → Static files on Vercel's global CDN
- **API** → Serverless functions

### Other Platforms

Build the static frontend:
```bash
pnpm run build
# Files in dist/ folder
```

Deploy the `api/` folder as serverless functions on your platform of choice.

---

## 🎯 Why This Architecture?

**React + Vite:** Lightning-fast development with instant hot reloading
**Serverless Functions:** Scalable backend without server management  
**Web Scraping:** No API keys or rate limits
**Vercel:** Seamless deployment with global CDN

This **JAMstack** approach provides excellent performance, developer experience, and scalability.

---

## 📝 License

MIT License - feel free to use this project for your own what3words conversion needs!

## Favicons

The project includes a custom favicon set based on the map pin icon:

- `public/favicon.svg` - Vector favicon (main)
- `public/favicon-16x16.png` - 16x16 PNG
- `public/favicon-32x32.png` - 32x32 PNG  
- `public/apple-touch-icon.png` - 180x180 Apple touch icon
- `public/android-chrome-192x192.png` - 192x192 Android icon
- `public/site.webmanifest` - Web app manifest
