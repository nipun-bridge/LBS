import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Link,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMockLeads } from "../data/mockLeads.js";

function formatCreatedAt(iso) {
  const date = new Date(iso);
  // Match screenshot: "Feb 21, 2021 03:05 pm"
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric"
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  return `${datePart} ${timePart.toLowerCase()}`;
}

const PAGE_SIZE = 10;

export default function LeadsPage() {
  const navigate = useNavigate();
  const allLeads = useMemo(() => getMockLeads(30), []);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allLeads;
    return allLeads.filter((l) => {
      return (
        l.id.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.altPhone.toLowerCase().includes(q)
      );
    });
  }, [allLeads, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h6" fontWeight={700}>
          Leads
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          borderColor: "divider",
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, phone, email"
              sx={{ width: { xs: "100%", md: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />

            <Box sx={{ flex: 1 }} />

            <IconButton aria-label="filters" size="small">
              <TuneOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>

        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#FFFFFF" }}>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>ID</TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>Name</TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>
                  Phone
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>
                  Phone
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>
                  Route
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>
                  Created Date
                </TableCell>
                <TableCell sx={{ color: "text.secondary", fontSize: 12, py: 1.25 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pageRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  onClick={() => navigate(`/leads/${encodeURIComponent(row.id)}`)}
                  sx={{
                    "& td": { py: 1.5 },
                    cursor: "pointer"
                  }}
                >
                  <TableCell sx={{ color: "text.secondary", fontSize: 12 }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{row.phone}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{row.altPhone}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.route}
                      variant="outlined"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        borderRadius: 999,
                        color: "primary.main",
                        borderColor: "primary.light"
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {formatCreatedAt(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Link
                      component="button"
                      underline="none"
                      sx={{ fontSize: 12, fontWeight: 600 }}
                      onClick={(e) => {
                        // Clicking action should not navigate to details.
                        e.stopPropagation();
                      }}
                    >
                      {row.action}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {pageRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6 }}>
                    <Typography color="text.secondary" align="center">
                      No leads found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Box>

        <Box
          sx={{
            px: 2,
            py: 1.25,
            bgcolor: "#FFFFFF",
            borderTop: "1px solid",
            borderColor: "divider"
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                size="small"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <Typography variant="caption" sx={{ minWidth: 64 }}>
                Previous
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <Pagination
                size="small"
                count={pageCount}
                page={safePage}
                onChange={(_, next) => setPage(next)}
                siblingCount={1}
                boundaryCount={1}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" sx={{ minWidth: 32, textAlign: "right" }}>
                Next
              </Typography>
              <IconButton
                size="small"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Stack>
  );
}
