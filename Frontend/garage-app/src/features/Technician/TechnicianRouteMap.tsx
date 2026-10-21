
import { useEffect, useState } from "react";
import {Alert,Box,CircularProgress,Stack,Typography,} from "@mui/material";
import {MapContainer,Marker,Polyline,Popup,TileLayer,useMap,} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  customerLatitude: number | null;
  customerLongitude: number | null;
  technicianLatitude: number | null;
  technicianLongitude: number | null;
};

type Coordinate = [number, number];

const customerIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#e85d04;
    color:white;
    width:34px;
    height:34px;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    display:flex;
    align-items:center;
    justify-content:center;
    border:3px solid white;
    box-shadow:0 2px 8px #0005;
    font-size:17px;
  "><span style="transform:rotate(45deg)">⌂</span></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

const technicianIcon = L.divIcon({
  className: "",
  html: `<div style="
    background:#1565c0;
    color:white;
    width:34px;
    height:34px;
    border-radius:50%;
    display:flex;
    align-items:center;
    justify-content:center;
    border:3px solid white;
    box-shadow:0 2px 8px #0005;
    font-size:17px;
  ">🚗</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

function FitMap({
  customer,
  technician,
}: {
  customer: Coordinate;
  technician: Coordinate | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points = technician
      ? [customer, technician]
      : [customer];

    if (points.length === 1) {
      map.setView(customer, 15);
    } else {
      map.fitBounds(L.latLngBounds(points), {
        padding: [35, 35],
        maxZoom: 15,
      });
    }
  }, [map, customer[0], customer[1], technician?.[0], technician?.[1]]);

  return null;
}

export default function TechnicianRouteMap({
  customerLatitude,
  customerLongitude,
  technicianLatitude,
  technicianLongitude,
}: Props) {
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(false);

  const hasCustomer =
    customerLatitude != null &&
    customerLongitude != null;

  const hasTechnician =
    technicianLatitude != null &&
    technicianLongitude != null;

  const customer: Coordinate = hasCustomer
    ? [customerLatitude!, customerLongitude!]
    : [0, 0];

  const technician: Coordinate | null = hasTechnician
    ? [technicianLatitude!, technicianLongitude!]
    : null;

  useEffect(() => {
    if (!customer || !hasCustomer || !technician) {
      setRoute([]);
      return;
    }

    let cancelled = false;

    async function loadRoute() {
      setLoadingRoute(true);
      setRouteError(false);

      try {
        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${technician![1]},${technician![0]};` +
          `${customer[1]},${customer[0]}` +
          "?overview=full&geometries=geojson";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Could not load route");
        }

        const data = await response.json();
        const coordinates = data.routes?.[0]?.geometry?.coordinates;

        if (!coordinates?.length) {
          throw new Error("No route found");
        }

        if (!cancelled) {
          setRoute(
            coordinates.map(
              ([longitude, latitude]: [number, number]) =>
                [latitude, longitude] as Coordinate
            )
          );
        }
      } catch {
        if (!cancelled) {
          setRoute([]);
          setRouteError(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingRoute(false);
        }
      }
    }

    void loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    hasCustomer,
    customerLatitude,
    customerLongitude,
    technicianLatitude,
    technicianLongitude,
  ]);

  if (!hasCustomer) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Customer location is not available for this task.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1 }}
      >
        <Typography sx={{fontWeight : 700 }}>
          Customer Location & Route
        </Typography>

        {loadingRoute && <CircularProgress size={18} />}
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
        <Typography variant="caption">
          🟠 Customer
        </Typography>
        <Typography variant="caption">
          🔵 Technician
        </Typography>
      </Stack>

      <Box
        sx={{
          height: 300,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <MapContainer
          center={customer}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={customer} icon={customerIcon}>
            <Popup>Customer location</Popup>
          </Marker>

          {technician && (
            <Marker position={technician} icon={technicianIcon}>
              <Popup>Technician's latest location</Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <Polyline
              positions={route}
              pathOptions={{
                color: "#1565c0",
                weight: 5,
                opacity: 0.8,
              }}
            />
          )}

          <FitMap
            customer={customer}
            technician={technician}
          />
        </MapContainer>
      </Box>

      {!technician && (
        <Alert severity="info" sx={{ mt: 1 }}>
          The technician's location will appear after GPS sharing starts.
        </Alert>
      )}

      {routeError && technician && (
        <Alert severity="info" sx={{ mt: 1 }}>
          The road route could not be loaded. Both locations are still shown on the map.
        </Alert>
      )}
    </Box>
  );
}
