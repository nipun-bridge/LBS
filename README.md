# Location Based Service (React + Node + Geoapify)

This repo contains a small demo app that:

- Geocodes an address via Geoapify (server-side)
- Finds nearby places in a radius (server-side)
- Shows a simple Leads UI (list → details)
- Lets you search for nearby SNFs from a Lead and visualize results on a Leaflet map (Geoapify tiles)

## Setup

Prereqs:
- Node.js (npm workspaces)

### Environment variables

Server (`server/.env`):
- `GEOAPIFY_API_KEY` (required): Geoapify API key used by the backend for geocoding + nearby places
- `PORT` (optional, default `5174`)

Client (`client/.env`):
- `VITE_GEOAPIFY_API_KEY` (required for the map): Geoapify API key used by the browser to load map tiles

Note: `VITE_*` variables are bundled into the frontend and are visible in the browser. For production, restrict this Geoapify key by allowed domains / usage in Geoapify.

### Create env files

From repo root:

- `cp server/.env.example server/.env`
- `cp client/.env.example client/.env`

Then set your keys:

- `server/.env`: `GEOAPIFY_API_KEY=...`
- `client/.env`: `VITE_GEOAPIFY_API_KEY=...`

## Run (dev)

From repo root:

- `npm install`
- `npm run dev`

App:
- UI: `http://localhost:5173`
- API: `http://localhost:5174`

Routes:
- Leads list: `http://localhost:5173/leads`
- Lead details: `http://localhost:5173/leads/:leadId`
- Geo demo form: `http://localhost:5173/demo`

## Endpoints

- `POST /api/geocode` `{ "address": "..." }`
- `GET /api/nearby?lat=..&lng=..&radiusMeters=5000&limit=10&categories=healthcare.hospital`

Common nearby categories:
- Hospitals: `healthcare.hospital`
- SNFs / nursing homes (if supported in your Geoapify plan): `healthcare.nursing_home` (client falls back to `healthcare`)
