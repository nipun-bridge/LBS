import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import AppShell from "./layout/AppShell.jsx";
import GeoDemoPage from "./pages/GeoDemoPage.jsx";
import LeadsPage from "./pages/LeadsPage.jsx";

export default function App() {
  const [route, setRoute] = useState("leads"); // "leads" | "demo"

  const title = useMemo(() => {
    if (route === "demo") return "Demo Search";
    return "Leads";
  }, [route]);

  return (
    <AppShell title={title} activeNav={route} onNavigate={setRoute}>
      <Box sx={{ maxWidth: 1280, mx: "auto" }}>
        {route === "demo" ? <GeoDemoPage /> : <LeadsPage />}
      </Box>
    </AppShell>
  );
}
