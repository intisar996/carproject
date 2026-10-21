
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { MapContainer,TileLayer, Marker, Popup, Polyline, useMap,} from "react-leaflet";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

import agent from "../../app/api/agent";

import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";

import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import GarageRoundedIcon from "@mui/icons-material/GarageRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

interface TrackingData {
  requestId: number;
  assignmentId: number;
  garageName: string;
  technicianName: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  customerLatitude: number | null;
  customerLongitude: number | null;
}

type Coordinate = [number, number];

const technicianIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const customerIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:42px;
      height:42px;
      background:#f97316;
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:0 4px 14px #0003;
      display:flex;
      align-items:center;
      justify-content:center;
    ">
      <span style="
        transform:rotate(45deg);
        font-size:20px;
      ">🏠</span>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

function FitTrackingMap({
  technician,
  customer,
}: {
  technician: Coordinate | null;
  customer: Coordinate | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (technician && customer) {
      map.fitBounds(
        L.latLngBounds(technician, customer),
        {
          padding: [70, 70],
          maxZoom: 15,
        }
      );
    } else if (technician) {
      map.setView(technician, 15);
    } else if (customer) {
      map.setView(customer, 15);
    }
  }, [
    map,
    technician?.[0],
    technician?.[1],
    customer?.[0],
    customer?.[1],
  ]);

  return null;
}

function statusLabel(status: string) {
  const normalized = status?.toUpperCase();

  const labels: Record<string, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    ASSIGNED: "Technician assigned",
    IN_PROGRESS: "In progress",
    ON_THE_WAY: "On the way",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  return labels[normalized] ?? status?.replaceAll("_", " ") ?? "Unknown";
}

function statusColor(
  status: string
): "success" | "warning" | "error" | "info" | "default" {
  const normalized = status?.toUpperCase();

  if (["COMPLETED"].includes(normalized)) return "success";
  if (["CANCELLED", "REJECTED"].includes(normalized)) return "error";
  if (["IN_PROGRESS", "ON_THE_WAY"].includes(normalized)) return "info";
  if (["PENDING"].includes(normalized)) return "warning";

  return "default";
}

export default function CustomerTracking() {
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [status, setStatus] = useState("Loading tracking information...");
  const [route, setRoute] = useState<Coordinate[]>([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // تحميل بيانات التتبع الأولية
  useEffect(() => {
    const token = window.location.pathname.split("/track/")[1];

    if (!token) {
      setStatus("Invalid tracking link");
      return;
    }

    let cancelled = false;

    const loadTracking = async () => {
      try {
        const data = await agent.Tracking.getTracking(token);

        if (cancelled) return;

        setTracking(data);
        setStatus("Connected");
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setStatus("Unable to load tracking information");
        }
      }
    };

    loadTracking();

    return () => {
      cancelled = true;
    };
  }, []);

  // تحديثات الموقع المباشرة
  useEffect(() => {
    if (!tracking?.assignmentId) return;

    const client = new Client({
      webSocketFactory: () =>
        new SockJS("http://localhost:8080/ws-tracking"),

      reconnectDelay: 5000,

      onConnect: () => {
        setStatus("Live tracking connected");

        client.subscribe(
          `/topic/location/${tracking.assignmentId}`,
          (message) => {
            try {
              const data = JSON.parse(message.body);

              setTracking((previous) => {
                if (!previous) return previous;

                return {
                  ...previous,
                  latitude:
                    data.latitude ??
                    data.currentLatitude ??
                    previous.latitude,
                  longitude:
                    data.longitude ??
                    data.currentLongitude ??
                    previous.longitude,
                  status: data.status ?? previous.status,
                };
              });
            } catch (error) {
              console.error("Invalid tracking update", error);
            }
          }
        );
      },

      onStompError: () => {
        setStatus("WebSocket connection error");
      },

      onWebSocketError: () => {
        setStatus("Unable to connect to the server");
      },
    });

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [tracking?.assignmentId]);

  const technician: Coordinate | null =
    tracking?.latitude != null &&
    tracking?.longitude != null
      ? [tracking.latitude, tracking.longitude]
      : null;

  const customer: Coordinate | null =
    tracking?.customerLatitude != null &&
    tracking?.customerLongitude != null
      ? [
          tracking.customerLatitude,
          tracking.customerLongitude,
        ]
      : null;

  // حساب الطريق بين الفني والعميل
  useEffect(() => {
    if (!technician || !customer) {
      setRoute([]);
      setRouteError(false);
      setRouteLoading(false);
      return;
    }

    let cancelled = false;

    const loadRoute = async () => {
      setRouteLoading(true);
      setRouteError(false);

      try {
        const url =
          "https://router.project-osrm.org/route/v1/driving/" +
          `${technician[1]},${technician[0]};` +
          `${customer[1]},${customer[0]}` +
          "?overview=full&geometries=geojson";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Unable to retrieve route");
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
      } catch (error) {
        console.error("Route error:", error);

        if (!cancelled) {
          setRoute([]);
          setRouteError(true);
        }
      } finally {
        if (!cancelled) {
          setRouteLoading(false);
        }
      }
    };

    loadRoute();

    return () => {
      cancelled = true;
    };
  }, [
    tracking?.latitude,
    tracking?.longitude,
    tracking?.customerLatitude,
    tracking?.customerLongitude,
  ]);

  const defaultPosition: Coordinate =
    technician ?? customer ?? [23.588, 58.3829];

  const connected = status === "Live tracking connected";

  const centerOnTechnician = () => {
    if (!technician) return;
    setMapReady(true);
    window.dispatchEvent(
      new CustomEvent("tracking-center", {
        detail: technician,
      })
    );
  };

  if (!tracking) {
    const invalid = status === "Invalid tracking link";
    const failed = status === "Unable to load tracking information";

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f4f7fb",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid #e5eaf1",
          }}
        >
          <Avatar
            sx={{
              width: 68,
              height: 68,
              mx: "auto",
              mb: 2,
              bgcolor: "#fff0e5",
              color: "#ea580c",
            }}
          >
            <DirectionsCarRoundedIcon sx={{ fontSize: 34 }} />
          </Avatar>

          <Typography variant="h5" fontWeight={800} color="#172033">
            Track your service
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {status}
          </Typography>

          {!invalid && !failed && (
            <CircularProgress
              size={26}
              sx={{ mt: 3, color: "#f97316" }}
            />
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f4f7fb",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#111c30",
          color: "white",
          px: { xs: 2, md: 4 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          boxShadow: "0 4px 20px #0f172a18",
          zIndex: 1000,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              bgcolor: "#f97316",
              color: "white",
              width: 46,
              height: 46,
              borderRadius: 2.5,
            }}
          >
            <DirectionsCarRoundedIcon fontSize="large" />
          </Avatar>

          <Box>
            <Typography fontWeight={800} fontSize={19}>
              Car Services
            </Typography>

            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              sx={{ mt: 0.3 }}
            >
              <GarageRoundedIcon sx={{ fontSize: 15, color: "#aab8ce" }} />
              <Typography
                fontSize={12}
                color="#cbd5e1"
                sx={{ maxWidth: 220 }}
                noWrap
              >
                {tracking.garageName}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Chip
          icon={
            connected ? (
              <WifiRoundedIcon />
            ) : (
              <WifiOffRoundedIcon />
            )
          }
          label={connected ? "Live tracking" : "Connecting..."}
          size="small"
          sx={{
            bgcolor: connected
              ? "rgba(34,197,94,0.13)"
              : "rgba(255,255,255,0.08)",
            color: connected ? "#86efac" : "#e2e8f0",
            border: `1px solid ${
              connected ? "#166534" : "#475569"
            }`,
            fontWeight: 700,
            "& .MuiChip-icon": {
              color: "inherit",
            },
          }}
        />
      </Box>

      {/* Service status */}
      <Box
        sx={{
          bgcolor: "white",
          px: { xs: 2, md: 4 },
          py: 1.7,
          borderBottom: "1px solid #e6ebf2",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={800}
              color="#172033"
            >
              Track your technician
            </Typography>

            <Typography fontSize={13} color="text.secondary">
              Follow your technician's location in real time.
            </Typography>
          </Box>

          <Chip
            label={statusLabel(tracking.status)}
            color={statusColor(tracking.status)}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          />
        </Stack>
      </Box>

      {/* Map area */}
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          p: { xs: 1, md: 2 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            height: "100%",
            overflow: "hidden",
            borderRadius: { xs: 3, md: 4 },
            border: "1px solid #e0e7ef",
            boxShadow: "0 8px 30px #0f172a0a",
          }}
        >
          <MapContainer
            center={defaultPosition}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {customer && (
              <Marker position={customer} icon={customerIcon}>
                <Popup>
                  <strong>Home location</strong>
                  <br />
                  Your service location
                </Popup>
              </Marker>
            )}

            {technician && (
              <Marker position={technician} icon={technicianIcon}>
                <Popup>
                  <strong>{tracking.technicianName}</strong>
                  <br />
                  Technician location
                </Popup>
              </Marker>
            )}

            {route.length > 0 && (
              <Polyline
                positions={route}
                pathOptions={{
                  color: "#f97316",
                  weight: 5,
                  opacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}

            <FitTrackingMap
              technician={technician}
              customer={customer}
            />
            <MapControls technician={technician} />
          </MapContainer>

          {/* Map legend */}
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 500,
              p: 1.5,
              borderRadius: 2.5,
              bgcolor: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(8px)",
              border: "1px solid #e5eaf0",
            }}
          >
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    bgcolor: "#2563eb",
                  }}
                />
                <Typography fontSize={12} fontWeight={700}>
                  Technician
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    bgcolor: "#f97316",
                  }}
                />
                <Typography fontSize={12} fontWeight={700}>
                  Your location
                </Typography>
              </Stack>

              {route.length > 0 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 4,
                      borderRadius: 1,
                      bgcolor: "#f97316",
                    }}
                  />
                  <Typography fontSize={12} fontWeight={700}>
                    Suggested route
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Paper>

          {/* Recenter button */}
          <Tooltip title="Show technician on map">
            <span>
              <IconButton
                onClick={centerOnTechnician}
                disabled={!technician}
                sx={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  zIndex: 500,
                  width: 44,
                  height: 44,
                  bgcolor: "white",
                  color: "#172033",
                  boxShadow: "0 3px 14px #0002",
                  "&:hover": { bgcolor: "#fff7ed", color: "#ea580c" },
                  "&.Mui-disabled": { bgcolor: "#f1f5f9" },
                }}
                aria-label="Center map on technician"
              >
                <MyLocationRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>

          {/* Floating technician card */}
          <Paper
            elevation={0}
            sx={{
              position: "absolute",
              zIndex: 500,
              bottom: { xs: 12, md: 20 },
              left: { xs: 12, md: 20 },
              right: { xs: 12, md: "auto" },
              width: { xs: "auto", md: 360 },
              maxWidth: { md: "calc(100% - 40px)" },
              p: { xs: 2, md: 2.5 },
              borderRadius: 3.5,
              bgcolor: "rgba(255,255,255,0.97)",
              backdropFilter: "blur(12px)",
              border: "1px solid #e5eaf0",
              boxShadow: "0 8px 30px #0f172a1a",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 54,
                  height: 54,
                  bgcolor: "#fff0e5",
                  color: "#ea580c",
                }}
              >
                <PersonRoundedIcon sx={{ fontSize: 30 }} />
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontSize={11} color="text.secondary">
                  YOUR TECHNICIAN
                </Typography>

                <Typography
                  fontWeight={800}
                  color="#172033"
                  fontSize={16}
                  noWrap
                >
                  {tracking.technicianName || "Assigned technician"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.7}
                  alignItems="center"
                  sx={{ mt: 0.5 }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: connected ? "#22c55e" : "#94a3b8",
                    }}
                  />
                  <Typography fontSize={12} color="text.secondary">
                    {technician
                      ? connected
                        ? "Location updating live"
                        : "Location available"
                      : "Waiting for location"}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Divider sx={{ my: 1.8 }} />

            <Stack direction="row" spacing={1.2} alignItems="flex-start">
              <Avatar
                variant="rounded"
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#fff7ed",
                  color: "#ea580c",
                  borderRadius: 2,
                }}
              >
                <RouteRoundedIcon />
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography fontWeight={800} fontSize={13} color="#172033">
                  Route to your location
                </Typography>

                <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.4 }}>
                  {routeLoading
                    ? "Calculating the route..."
                    : route.length > 0
                      ? "The driving route is displayed on the map."
                      : routeError
                        ? "Unable to calculate the route right now."
                        : !customer
                          ? "Your location is not available."
                          : !technician
                            ? "Waiting for the technician's GPS location."
                            : "Route not available."}
                </Typography>
              </Box>

              {routeLoading && (
                <CircularProgress size={19} sx={{ color: "#f97316" }} />
              )}
            </Stack>

            {!technician && (
              <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }}>
                The map will show the technician once their location is shared.
              </Alert>
            )}

            {!connected && (
              <Typography
                fontSize={11}
                color="text.secondary"
                sx={{ mt: 1.5 }}
              >
                Connection: {status}
              </Typography>
            )}
          </Paper>
        </Paper>
      </Box>
    </Box>
  );
}

function MapControls({
  technician,
}: {
  technician: Coordinate | null;
}) {
  const map = useMap();

  useEffect(() => {
    const handleCenter = (event: Event) => {
      const customEvent = event as CustomEvent<Coordinate>;
      const position = customEvent.detail;

      if (position) {
        map.flyTo(position, 16, { duration: 0.8 });
      }
    };

    window.addEventListener("tracking-center", handleCenter);

    return () => {
      window.removeEventListener("tracking-center", handleCenter);
    };
  }, [map]);

  useEffect(() => {
    if (technician) {
      // The FitTrackingMap component manages automatic bounds.
    }
  }, [technician]);

  return null;
}
