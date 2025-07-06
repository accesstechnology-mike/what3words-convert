# What3Words → Map Converter

A beautiful, modern web application that converts What3Words addresses to coordinates and displays them on interactive maps. Built with React, HeroUI, and Tailwind CSS.

## Features

- ✨ **Beautiful UI**: Modern design with HeroUI components and smooth animations
- 🗺️ **Multiple Map Options**: Open locations in Google Maps or Apple Maps
- 📋 **Copy Links**: Easy one-click copying of map links
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🌙 **Dark Mode Support**: Automatic dark mode detection
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development

## Tech Stack

- **Frontend**: React 18, HeroUI, Tailwind CSS
- **Backend**: Node.js, Express
- **Build Tool**: Vite
- **Package Manager**: Bun
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js
- What3Words API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd what3words-convert
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the root directory:
```env
W3W_API_KEY=your_what3words_api_key_here
```

4. Start the development server:
```bash
# Terminal 1: Start the backend server
bun run server

# Terminal 2: Start the frontend development server
bun run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter a What3Words address (e.g., `index.home.raft`)
2. Click "Convert to Coordinates" to get the location
3. Use the buttons to open the location in Google Maps or Apple Maps
4. Copy the map links to share with others
5. View the embedded map preview

## Development

### Available Scripts

- `bun run dev` - Start the Vite development server
- `bun run build` - Build the application for production
- `bun run preview` - Preview the production build
- `bun run server` - Start the Express backend server

### Project Structure

```
what3words-convert/
├── src/
│   ├── App.jsx          # Main React component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── src/server.js        # Express backend server
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## API Endpoints

- `POST /convert` - Convert What3Words address to coordinates
  - Body: `{ "w3w": "index.home.raft" }`
  - Response: `{ "latitude": 51.5074, "longitude": -0.1278 }`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- [What3Words](https://what3words.com/) for the location API
- [HeroUI](https://heroui.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework