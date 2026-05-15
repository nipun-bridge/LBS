import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "";
  const km = meters / 1000;
  if (km < 1) return `${Math.round(meters)} m`;
  return `${km.toFixed(2)} km`;
}

export default function App() {
  const [address, setAddress] = useState("");
  const [radiusKm, setRadiusKm] = useState(5);
  const [limit, setLimit] = useState(10);
  const [categories, setCategories] = useState("healthcare");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [geocode, setGeocode] = useState(null);
  const [results, setResults] = useState([]);

  const radiusMeters = useMemo(() => Math.round(Number(radiusKm) * 1000), [radiusKm]);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setResults([]);
    setGeocode(null);

    const trimmed = address.trim();
    if (!trimmed) {
      setError("Please enter an address.");
      return;
    }

    setLoading(true);
    try {
      const geocodeResp = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: trimmed })
      });
      const geocodeJson = await geocodeResp.json().catch(() => ({}));
      if (!geocodeResp.ok) {
        throw new Error(geocodeJson?.error || "Geocoding failed");
      }

      setGeocode(geocodeJson);

      const nearbyUrl = new URL("/api/nearby", window.location.origin);
      nearbyUrl.searchParams.set("lat", String(geocodeJson.lat));
      nearbyUrl.searchParams.set("lng", String(geocodeJson.lng));
      nearbyUrl.searchParams.set("radiusMeters", String(radiusMeters));
      nearbyUrl.searchParams.set("limit", String(limit));
      nearbyUrl.searchParams.set("categories", categories.trim() || "healthcare");

      const nearbyResp = await fetch(nearbyUrl);
      const nearbyJson = await nearbyResp.json().catch(() => ({}));
      if (!nearbyResp.ok) {
        throw new Error(nearbyJson?.error || "Nearby search failed");
      }

      setResults(Array.isArray(nearbyJson.results) ? nearbyJson.results : []);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Location Based Service Demo
          </Typography>
          <Typography color="text.secondary">
            Enter a patient address and get the closest hospitals (Geoapify, no DB).
          </Typography>
        </Box>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Patient address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA"
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Radius (km)"
                type="number"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                inputProps={{ min: 1, max: 100, step: 1 }}
                sx={{ width: { xs: "100%", sm: 200 } }}
              />
              <TextField
                label="Max results"
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                inputProps={{ min: 1, max: 50, step: 1 }}
                sx={{ width: { xs: "100%", sm: 200 } }}
              />
              <TextField
                label="Categories"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
                placeholder="healthcare"
                helperText='Geoapify categories, e.g. "healthcare" or "healthcare.hospital"'
                sx={{ width: { xs: "100%", sm: 320 } }}
              />
              <Box sx={{ flex: 1 }} />
              <Button type="submit" variant="contained" disabled={loading}>
                Find nearest
              </Button>
            </Stack>
          </Stack>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        {loading ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={22} />
            <Typography>Searching…</Typography>
          </Stack>
        ) : null}

        {geocode ? (
          <Alert severity="info">
            Resolved:{" "}
            <strong>{geocode.normalizedAddress || geocode.query}</strong> (
            {geocode.lat}, {geocode.lng})
          </Alert>
        ) : null}

        <Divider />

        <Box>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Closest places
          </Typography>
          {results.length === 0 ? (
            <Typography color="text.secondary">No results yet.</Typography>
          ) : (
            <List dense>
              {results.map((r, idx) => (
                <ListItem key={r.id || `${r.lat},${r.lng}-${idx}`} divider>
                  <ListItemText
                    primary={`${r.name} — ${formatDistance(r.distanceMeters)}`}
                    secondary={r.formattedAddress || `${r.lat}, ${r.lng}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
