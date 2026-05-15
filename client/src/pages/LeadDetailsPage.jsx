import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMockLeadById } from "../data/mockLeads.js";
import NearbySnfMap from "../components/NearbySnfMap.jsx";

const TABS = [
  "General",
  "Insurance",
  "Authorization",
  "Referrals",
  "History/Physical",
  "Medications",
  "Diagnosis",
  "Other",
  "Emergency Contact",
  "Attachments"
];

function Field({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ mt: 0.25, fontSize: 13, fontWeight: 500 }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

function toTitleCase(str) {
  return String(str || "")
    .trim()
    .split(/\s+/g)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function relativeTimeFrom(iso) {
  const created = new Date(iso).getTime();
  const diffMs = Date.now() - created;
  if (!Number.isFinite(diffMs) || diffMs < 0) return "just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "";
  const km = meters / 1000;
  if (km < 1) return `${Math.round(meters)} m`;
  return `${km.toFixed(2)} km`;
}

function buildAddressFromGeneral(general) {
  const parts = [
    general?.address1,
    general?.address2,
    general?.city,
    general?.state,
    general?.zip
  ]
    .map((p) => String(p || "").trim())
    .filter(Boolean);

  return parts.join(", ");
}

export default function LeadDetailsPage() {
  const { leadId } = useParams();
  const lead = useMemo(() => getMockLeadById(leadId), [leadId]);
  const [tab, setTab] = useState(0);
  const [snfLoading, setSnfLoading] = useState(false);
  const [snfError, setSnfError] = useState(null);
  const [snfGeocode, setSnfGeocode] = useState(null);
  const [snfResults, setSnfResults] = useState([]);
  const [snfVisible, setSnfVisible] = useState(false);

  const fullName = useMemo(() => (lead?.name ? toTitleCase(lead.name) : leadId), [lead, leadId]);

  const general = useMemo(() => {
    // Mock fields for now; later comes from API.
    return {
      firstName: fullName?.split(" ")?.[0] || "",
      middleName: "P",
      lastName: fullName?.split(" ")?.slice(1).join(" ") || "",
      dob: "-",
      gender: "Male",
      ssn: "1234567",
      address1: "2972 Westheimer Rd.",
      address2: "Santa Ana, Illinois 85486",
      zip: "96756",
      city: "Koloa",
      state: "Hawaii",
      phone: "+6254223252",
      email: "robin.clement@gmail.com",
      height: "165cm",
      weight: "65lbs",
      primaryLanguage: "English",
      religion: "Christian",
      race: "Native"
    };
  }, [fullName]);

  const address = useMemo(() => buildAddressFromGeneral(general), [general]);
  const geoapifyTileKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  async function onFindNearbySnfs() {
    if (!address) return;
    setSnfVisible(true);
    setSnfError(null);
    setSnfResults([]);
    setSnfGeocode(null);

    setSnfLoading(true);
    try {
      const geocodeResp = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address })
      });
      const geocodeJson = await geocodeResp.json().catch(() => ({}));
      if (!geocodeResp.ok) {
        throw new Error(geocodeJson?.error || "Geocoding failed");
      }

      setSnfGeocode(geocodeJson);

      const nearbyUrl = new URL("/api/nearby", window.location.origin);
      nearbyUrl.searchParams.set("lat", String(geocodeJson.lat));
      nearbyUrl.searchParams.set("lng", String(geocodeJson.lng));
      nearbyUrl.searchParams.set("radiusMeters", String(5000));
      nearbyUrl.searchParams.set("limit", String(10));
      // Option A: try a more specific category for SNF / nursing home.
      nearbyUrl.searchParams.set("categories", "healthcare.nursing_home");

      let nearbyResp = await fetch(nearbyUrl);
      let nearbyJson = await nearbyResp.json().catch(() => ({}));

      // If category is too narrow or unsupported, fall back to broader healthcare.
      if (!nearbyResp.ok || !Array.isArray(nearbyJson.results) || nearbyJson.results.length === 0) {
        const fallbackUrl = new URL(nearbyUrl);
        fallbackUrl.searchParams.set("categories", "healthcare");
        nearbyResp = await fetch(fallbackUrl);
        nearbyJson = await nearbyResp.json().catch(() => ({}));
      }

      if (!nearbyResp.ok) {
        throw new Error(nearbyJson?.error || "Nearby search failed");
      }

      setSnfResults(Array.isArray(nearbyJson.results) ? nearbyJson.results : []);
    } catch (err) {
      setSnfError(err?.message || "Something went wrong");
    } finally {
      setSnfLoading(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          borderColor: "divider",
          overflow: "hidden"
        }}
      >
        <Box sx={{ px: 2, py: 1.75 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={800} noWrap>
                {fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lead?.id || leadId} • Created {relativeTimeFrom(lead?.createdAt)} by Sarah Chen
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="contained"
                size="small"
                onClick={onFindNearbySnfs}
                disabled={!address || snfLoading}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Find nearby SNFs
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon fontSize="small" />}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Edit
              </Button>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ px: 1, bgcolor: "#F3F6F9" }}>
          <Tabs
            value={tab}
            onChange={(_, next) => setTab(next)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              "& .MuiTab-root": { textTransform: "none", minHeight: 44, fontSize: 12 }
            }}
          >
            {TABS.map((t) => (
              <Tab key={t} label={t} />
            ))}
          </Tabs>
        </Box>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          borderColor: "divider",
          p: 2
        }}
      >
        {tab === 0 ? (
          <Stack spacing={1.5}>
            <Typography fontWeight={800}>General</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="First Name" value={general.firstName} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Middle Name" value={general.middleName} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Last Name" value={general.lastName} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Date of Birth" value={general.dob} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Field label="Gender" value={general.gender} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Social Security Number" value={general.ssn} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Address Line 1" value={general.address1} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Address Line 2" value={general.address2} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Field label="ZIP Code" value={general.zip} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="City" value={general.city} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="State Name" value={general.state} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Phone" value={general.phone} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Field label="Email" value={general.email} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Height" value={general.height} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Weight" value={general.weight} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Primary Language" value={general.primaryLanguage} />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Field label="Race" value={general.race} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Field label="Religion" value={general.religion} />
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <Box sx={{ py: 6 }}>
            <Typography color="text.secondary" align="center">
              Coming soon.
            </Typography>
          </Box>
        )}
      </Paper>

      {tab === 0 && snfVisible ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            borderColor: "divider",
            p: 2
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography fontWeight={800}>Nearby SNFs</Typography>
              <Box sx={{ flex: 1 }} />
              <Button
                size="small"
                variant="text"
                onClick={() => setSnfVisible(false)}
                sx={{ textTransform: "none" }}
              >
                Hide
              </Button>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  {!address ? (
                    <Alert severity="warning">No address found for this lead.</Alert>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Using address: <strong>{address}</strong>
                    </Typography>
                  )}

                  {snfError ? <Alert severity="error">{snfError}</Alert> : null}

                  {snfLoading ? (
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2">Searching nearby SNFs…</Typography>
                    </Stack>
                  ) : null}

                  {snfGeocode ? (
                    <Alert severity="info">
                      Resolved:{" "}
                      <strong>{snfGeocode.normalizedAddress || snfGeocode.query}</strong> (
                      {snfGeocode.lat}, {snfGeocode.lng})
                    </Alert>
                  ) : null}

                  {snfResults.length === 0 && !snfLoading && !snfError ? (
                    <Typography color="text.secondary">No results found.</Typography>
                  ) : (
                    <Stack spacing={1}>
                      {snfResults.map((r, idx) => (
                        <Paper
                          key={r.id || `${r.lat},${r.lng}-${idx}`}
                          variant="outlined"
                          sx={{ p: 1.25, borderRadius: 2, borderColor: "divider" }}
                        >
                          <Stack spacing={0.25}>
                            <Typography fontWeight={700} sx={{ fontSize: 13 }}>
                              {r.name || "Unnamed facility"}{" "}
                              <Typography
                                component="span"
                                color="text.secondary"
                                sx={{ fontSize: 12, fontWeight: 500 }}
                              >
                                {r.distanceMeters != null
                                  ? `— ${formatDistance(r.distanceMeters)}`
                                  : ""}
                              </Typography>
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {r.formattedAddress || `${r.lat}, ${r.lng}`}
                            </Typography>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ pr: { xs: 0, md: 1 } }}>
                  {!geoapifyTileKey ? (
                    <Alert severity="warning">
                      Missing <code>VITE_GEOAPIFY_API_KEY</code> for map tiles. Add it to your client
                      env and restart dev server.
                    </Alert>
                  ) : snfGeocode ? (
                    <NearbySnfMap
                      apiKey={geoapifyTileKey}
                      center={{ lat: snfGeocode.lat, lng: snfGeocode.lng }}
                      radiusMeters={5000}
                      snfs={snfResults}
                    />
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        height: 420,
                        borderRadius: 2,
                        borderColor: "divider",
                        bgcolor: "#F8FAFC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Typography color="text.secondary">
                        Map will appear after geocoding.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
