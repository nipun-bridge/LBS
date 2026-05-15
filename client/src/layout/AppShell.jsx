import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import {
  AppBar,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import SideNav from "./SideNav.jsx";

const DRAWER_WIDTH = 72;

export default function AppShell({ children, title = "Leads", activeNav, onNavigate }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerSx = useMemo(
    () => ({
      width: DRAWER_WIDTH,
      flexShrink: 0,
      "& .MuiDrawer-paper": {
        width: DRAWER_WIDTH,
        boxSizing: "border-box",
        borderRight: "none"
      }
    }),
    []
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F5F7FA" }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="inherit"
        sx={{
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid",
          borderColor: "divider",
          zIndex: (t) => t.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: 2 }}>
          {isMobile ? (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="open navigation"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}

          <Stack spacing={0.5} sx={{ minWidth: 240 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ color: "text.secondary" }}>
              <Typography variant="body2" color="text.secondary">
                Home
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {title}
              </Typography>
            </Breadcrumbs>
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Quick Add
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Add New
            </Button>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <IconButton aria-label="settings" size="small">
              <SettingsOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="messages" size="small">
              <ChatBubbleOutlineOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="notifications" size="small">
              <NotificationsNoneOutlinedIcon fontSize="small" />
            </IconButton>

            <Avatar
              alt="Profile"
              sx={{ width: 28, height: 28, bgcolor: "#F5D0A9", color: "#4E342E" }}
            >
              R
            </Avatar>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" aria-label="sidebar navigation" sx={{ flexShrink: 0 }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={drawerSx}
          >
            <SideNav
              active={activeNav}
              onNavigate={(next) => {
                onNavigate?.(next);
                setMobileOpen(false);
              }}
            />
          </Drawer>
        ) : (
          <Drawer variant="permanent" open sx={drawerSx}>
            <SideNav active={activeNav} onNavigate={onNavigate} />
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: 2,
          pt: "80px",
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          width: isMobile ? "100%" : `calc(100% - ${DRAWER_WIDTH}px)`
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
