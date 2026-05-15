import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RoomIcon from "@mui/icons-material/Room";

// Fix default marker icons for bundlers like Vite.
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createMuiPinIcon(color, sizePx = 38) {
  const html = renderToStaticMarkup(
    // Use inline styles (not `sx`) since this is SSR markup for Leaflet.
    <div style={{ lineHeight: 0 }}>
      <RoomIcon
        htmlColor={color}
        style={{
          fontSize: sizePx,
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))"
        }}
      />
    </div>
  );

  const width = sizePx;
  const height = sizePx;
  return L.divIcon({
    className: "",
    html,
    iconSize: [width, height],
    // Anchor at the bottom center "tip" of the pin.
    iconAnchor: [width / 2, height - 2],
    popupAnchor: [0, -height + 8]
  });
}

export default function NearbySnfMap({
  apiKey,
  center,
  radiusMeters = 5000,
  snfs = []
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({
    circle: null,
    centerMarker: null,
    snfLayer: null
  });

  const tileUrl = useMemo(() => {
    if (!apiKey) return null;
    return `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`;
  }, [apiKey]);

  // Initialize map once.
  useEffect(() => {
    if (!containerRef.current) return undefined;
    if (!tileUrl) return undefined;
    if (mapRef.current) return undefined;
    if (!center?.lat || !center?.lng) return undefined;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: true
    }).setView([center.lat, center.lng], 12);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(tileUrl, { attribution: "Geoapify", maxZoom: 20 }).addTo(map);

    const patientIcon = createMuiPinIcon("#f59e0b", 40); // yellow
    layersRef.current.centerMarker = L.marker([center.lat, center.lng], { icon: patientIcon })
      .addTo(map)
      .bindPopup("Patient Address")
      .openPopup();

    layersRef.current.circle = L.circle([center.lat, center.lng], {
      radius: radiusMeters,
      color: "#3b82f6",
      fillColor: "#93c5fd",
      fillOpacity: 0.2,
      weight: 2
    }).addTo(map);

    layersRef.current.snfLayer = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center?.lat, center?.lng, radiusMeters, tileUrl]);

  // Update overlays when center/radius/snfs change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!center?.lat || !center?.lng) return;

    // Center marker + circle
    layersRef.current.centerMarker?.setLatLng([center.lat, center.lng]);
    layersRef.current.circle?.setLatLng([center.lat, center.lng]);
    layersRef.current.circle?.setRadius(radiusMeters);

    // SNF markers
    const snfLayer = layersRef.current.snfLayer;
    if (snfLayer) {
      snfLayer.clearLayers();
      const facilityIcon = createMuiPinIcon("#ef4444", 38); // red
      snfs.forEach((snf) => {
        const lat = Number(snf.lat);
        const lng = Number(snf.lon ?? snf.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const title = escapeHtml(snf.name || "Unnamed facility");
        const addr = escapeHtml(snf.formattedAddress || "");
        L.marker([lat, lng], { icon: facilityIcon })
          .addTo(snfLayer)
          .bindPopup(`<b>${title}</b>${addr ? `<br/>${addr}` : ""}`);
      });
    }

    // Fit bounds to show the full radius circle (and any SNFs) without over-zooming.
    const circleBounds = layersRef.current.circle?.getBounds();
    const markerBounds = L.latLngBounds(
      [
        [center.lat, center.lng],
        ...snfs
          .map((s) => {
            const lat = Number(s.lat);
            const lng = Number(s.lon ?? s.lng);
            return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
          })
          .filter(Boolean)
      ].filter(Boolean)
    );

    const combinedBounds = circleBounds ? markerBounds.extend(circleBounds) : markerBounds;
    if (combinedBounds.isValid()) {
      map.fitBounds(combinedBounds, { padding: [28, 28], maxZoom: 13 });
    } else {
      map.setView([center.lat, center.lng], 12);
    }
  }, [center?.lat, center?.lng, radiusMeters, snfs]);

  return <div ref={containerRef} style={{ height: 420, width: "100%", borderRadius: 12 }} />;
}
