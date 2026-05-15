import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  root: {
    height: "100%",
    background: "linear-gradient(180deg, #3D5768 0%, #314B5E 100%)",
    color: "#FFFFFF"
  }
}));

function NavIcon({ title, children, selected = false, onClick }) {
  return (
    <Tooltip title={title} placement="right">
      <IconButton
        size="large"
        onClick={onClick}
        sx={{
          color: selected ? "#FFFFFF" : "rgba(255,255,255,0.85)",
          borderRadius: 2,
          bgcolor: selected ? "rgba(255,255,255,0.12)" : "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.12)" }
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

export default function SideNav({ active = "leads", onNavigate }) {
  const { classes } = useStyles();

  return (
    <Box className={classes.root}>
      <Stack alignItems="center" spacing={1} sx={{ pt: 1, height: "100%" }}>
        <NavIcon title="Home">
          <HomeOutlinedIcon />
        </NavIcon>
        <Divider sx={{ width: "60%", bgcolor: "rgba(255,255,255,0.16)", my: 0.5 }} />
        <NavIcon title="Leads" selected={active === "leads"} onClick={() => onNavigate?.("leads")}>
          <PeopleAltOutlinedIcon />
        </NavIcon>
        <NavIcon title="Geo Demo" selected={active === "demo"} onClick={() => onNavigate?.("demo")}>
          <PlaceOutlinedIcon />
        </NavIcon>
        <NavIcon title="Dashboard">
          <GridViewOutlinedIcon />
        </NavIcon>
        <NavIcon title="Reports">
          <ReceiptLongOutlinedIcon />
        </NavIcon>

        <Box sx={{ flex: 1 }} />

        <Stack spacing={0.5} sx={{ pb: 1 }}>
          <NavIcon title="Notifications">
            <NotificationsNoneOutlinedIcon />
          </NavIcon>
          <NavIcon title="Settings">
            <SettingsOutlinedIcon />
          </NavIcon>
        </Stack>
      </Stack>
    </Box>
  );
}
