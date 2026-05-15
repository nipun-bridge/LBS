import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const port = Number(process.env.PORT || 5174);
const geoapifyApiKey = process.env.GEOAPIFY_API_KEY;

function requireGeoapifyKey() {
  if (!geoapifyApiKey) {
    const error = new Error("Missing GEOAPIFY_API_KEY");
    error.status = 500;
    throw error;
  }
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/geocode", async (req, res, next) => {
  try {
    requireGeoapifyKey();

    const address = typeof req.body?.address === "string" ? req.body.address : "";
    if (!address.trim()) {
      return res.status(400).json({ error: "address is required" });
    }

    const url = new URL("https://api.geoapify.com/v1/geocode/search");
    url.searchParams.set("text", address);
    url.searchParams.set("limit", "1");
    url.searchParams.set("apiKey", geoapifyApiKey);

    const resp = await fetch(url);
    if (!resp.ok) {
      const body = await resp.text();
      return res.status(502).json({ error: "geocode_failed", details: body });
    }

    const data = await resp.json();
    const feature = Array.isArray(data?.features) ? data.features[0] : undefined;
    const props = feature?.properties;
    if (!props || typeof props.lat !== "number" || typeof props.lon !== "number") {
      return res.status(404).json({ error: "no_results" });
    }

    res.json({
      query: address,
      normalizedAddress:
        props.formatted || props.address_line2 || props.address_line1 || null,
      lat: props.lat,
      lng: props.lon
    });
  } catch (err) {
    next(err);
  }
});

app.get("/api/nearby", async (req, res, next) => {
  try {
    requireGeoapifyKey();

    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusMeters = Number(req.query.radiusMeters || 5000);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
    const categories = String(req.query.categories || "healthcare.hospital");

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ error: "lat and lng are required numbers" });
    }

    const url = new URL("https://api.geoapify.com/v2/places");
    url.searchParams.set("categories", categories);
    url.searchParams.set("filter", `circle:${lng},${lat},${radiusMeters}`);
    url.searchParams.set("bias", `proximity:${lng},${lat}`);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("apiKey", geoapifyApiKey);

    const resp = await fetch(url);
    if (!resp.ok) {
      const body = await resp.text();
      return res.status(502).json({ error: "places_failed", details: body });
    }

    const data = await resp.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    const origin = { lat, lng };
    const results = features
      .map((f) => {
        const p = f?.properties || {};
        const itemLat = typeof p.lat === "number" ? p.lat : undefined;
        const itemLng = typeof p.lon === "number" ? p.lon : undefined;
        if (itemLat == null || itemLng == null) return null;
        const distanceMeters = haversineMeters(origin, { lat: itemLat, lng: itemLng });

        return {
          id: p.place_id || p.datasource?.raw?.id || null,
          name: p.name || p.address_line1 || "Unknown",
          formattedAddress: p.formatted || p.address_line2 || null,
          lat: itemLat,
          lng: itemLng,
          distanceMeters
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      origin,
      categories,
      radiusMeters,
      count: results.length,
      results
    });
  } catch (err) {
    next(err);
  }
});

app.use((err, _req, res, _next) => {
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({ error: err?.message || "server_error" });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

