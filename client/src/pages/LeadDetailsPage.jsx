import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
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

export default function LeadDetailsPage() {
  const { leadId } = useParams();
  const lead = useMemo(() => getMockLeadById(leadId), [leadId]);
  const [tab, setTab] = useState(0);

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
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon fontSize="small" />}
              sx={{ textTransform: "none", borderRadius: 2 }}
            >
              Edit
            </Button>
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
    </Stack>
  );
}

