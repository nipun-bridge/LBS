import { Box } from "@mui/material";
import { useMemo } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import AppShell from "./layout/AppShell.jsx";
import GeoDemoPage from "./pages/GeoDemoPage.jsx";
import LeadDetailsPage from "./pages/LeadDetailsPage.jsx";
import LeadsPage from "./pages/LeadsPage.jsx";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const { activeNav, title } = useMemo(() => {
    const path = location.pathname || "/";
    if (path.startsWith("/demo")) return { activeNav: "demo", title: "Geo Demo" };
    return { activeNav: "leads", title: "Leads" };
  }, [location.pathname]);

  return (
    <AppShell
      title={title}
      activeNav={activeNav}
      onNavigate={(next) => {
        if (next === "demo") navigate("/demo");
        else navigate("/leads");
      }}
    >
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
        <Routes>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:leadId" element={<LeadDetailsPage />} />
          <Route path="/demo" element={<GeoDemoPage />} />
          <Route path="*" element={<Navigate to="/leads" replace />} />
        </Routes>
      </Box>
    </AppShell>
  );
}
