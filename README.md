# Location Based Service Demo (React + Node + Geoapify)

Minimal demo for: enter an address → backend geocodes via Geoapify → backend fetches nearby hospitals → UI lists closest results.

## Setup

1. Create Geoapify API key.
2. Copy env file:
   - `cp server/.env.example server/.env`
3. Put your key in `server/.env`:
   - `GEOAPIFY_API_KEY=...`

## Run (dev)

From repo root:

- `npm install`
- `npm run dev`

App:
- UI: `http://localhost:5173`
- API: `http://localhost:5174`

## Endpoints

- `POST /api/geocode` `{ "address": "..." }`
- `GET /api/nearby?lat=..&lng=..&radiusMeters=5000&limit=10&categories=healthcare.hospital`

