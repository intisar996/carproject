
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {Alert,Box,Button,Card,CardContent,Chip,CircularProgress,Divider,Stack,Typography,} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BuildIcon from "@mui/icons-material/Build";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import NavigationIcon from "@mui/icons-material/Navigation";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import agent from "../../app/api/agent";
import type { TechnicianAssignment } from "../../app/models/TechnicianAssignment";
import RepairPhotos from "./RepairPhotos";
import TechnicianRouteMap from "./TechnicianRouteMap";

const nextActions: Record<
  string,
  { nextStatus: string; label: string }
> = {
  ASSIGNED: {
    nextStatus: "ON_THE_WAY",
    label: "Start Trip",
  },
  ON_THE_WAY: {
    nextStatus: "ARRIVED",
    label: "I've Arrived",
  },
  ARRIVED: {
    nextStatus: "IN_PROGRESS",
    label: "Start Service",
  },
  IN_PROGRESS: {
    nextStatus: "COMPLETED",
    label: "Complete Service",
  },
};

const statusLabels: Record<string, string> = {
  ASSIGNED: "Assigned",
  ON_THE_WAY: "On the Way",
  ARRIVED: "Arrived",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function statusColor(
  status: string,
): "default" | "primary" | "secondary" | "success" | "error" | "warning" {
  switch (status) {
    case "ASSIGNED":
      return "primary";
    case "ON_THE_WAY":
      return "secondary";
    case "ARRIVED":
    case "IN_PROGRESS":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    default:
      return "default";
  }
}

export default function TechnicianTaskDetails() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();

  const [assignment, setAssignment] =
    useState<TechnicianAssignment | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAssignment() {
      if (!assignmentId || !/^\d+$/.test(assignmentId)) {
        setError("Invalid task ID.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const assignments =
          await agent.Assignments.getMyAssignments();

        if (!active) return;

        const selected = assignments.find(
          (item) => item.assignmentId === Number(assignmentId),
        );

        if (!selected) {
          setError("Task not found or you do not have access to it.");
          return;
        }

        setAssignment(selected);
      } catch {
        if (active) {
          setError("Unable to load task details. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAssignment();

    return () => {
      active = false;
    };
  }, [assignmentId]);

  const handleNextAction = async () => {
    if (!assignment || updatingStatus) return;

    const action = nextActions[assignment.status];
    if (!action) return;

    setUpdatingStatus(true);
    setError("");
    setSuccess("");

    try {
      await agent.Assignments.updateStatus(
        assignment.assignmentId,
        action.nextStatus,
      );

      setAssignment((previous) =>
        previous
          ? { ...previous, status: action.nextStatus }
          : previous,
      );

      setSuccess(`Task status updated to ${statusLabels[action.nextStatus]}.`);
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Could not update the task status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShareLocation = () => {
    if (!assignment || sharingLocation) return;

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setSharingLocation(true);
    setError("");
    setSuccess("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          await agent.Assignments.updateLocation(
            assignment.assignmentId,
            { latitude, longitude },
          );

          setAssignment((previous) =>
            previous
              ? {
                  ...previous,
                  currentLatitude: latitude,
                  currentLongitude: longitude,
                }
              : previous,
          );

          setSuccess("Your location has been shared successfully.");
        } catch (err) {
          console.error("Failed to share location:", err);
          setError("Could not share your location. Please try again.");
        } finally {
          setSharingLocation(false);
        }
      },
      (geoError) => {
        setSharingLocation(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError("Location permission was denied. Allow location access and try again.");
        } else if (geoError.code === geoError.TIMEOUT) {
          setError("Getting your location timed out. Please try again.");
        } else {
          setError("Unable to get your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: 350, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
        <CircularProgress />
        <Typography color="text.secondary">
          Loading task details...
        </Typography>
      </Box>
    );
  }

  if (error && !assignment) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 3, textTransform: "none" }}>
          Back to Tasks
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!assignment) return null;

  const action = nextActions[assignment.status];
  const isFinished =
    assignment.status === "COMPLETED" ||
    assignment.status === "CANCELLED";

  const customerLocationAvailable =
    assignment.latitude != null && assignment.longitude != null;

  const technicianLocationAvailable =
    assignment.currentLatitude != null &&
    assignment.currentLongitude != null;

  return (
    <Box sx={{ width: "100%", maxWidth: 1100, mx: "auto", p: { xs: 2, md: 4 }, pb: 6 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, textTransform: "none", fontWeight: 700 }}
      >
        Back to Tasks
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4"  sx={{ fontSize: { xs: 28, md: 34 },fontWeight :800 }}>
            Task Details
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Request #{assignment.requestId}
          </Typography>
        </Box>

        <Chip
          label={statusLabels[assignment.status] ?? assignment.status}
          color={statusColor(assignment.status)}
          sx={{ fontWeight: 700, px: 1 }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader
            icon={<AssignmentOutlinedIcon />}
            title="Request Information"
            description="Customer and vehicle details for this task."
          />
          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 3 }}>
            <InfoRow icon={<PersonIcon />} label="Customer Name" value={assignment.guestName} />
            <InfoRow icon={<PhoneIcon />} label="Phone Number" value={assignment.guestPhone} />
            <InfoRow icon={<DirectionsCarIcon />} label="Vehicle" value={assignment.carMakeModel} />
            <InfoRow icon={<DirectionsCarIcon />} label="Plate Number" value={assignment.carPlateNumber} />
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader
            icon={<LocationOnIcon />}
            title="Location & Tracking"
            description="Customer destination and your latest shared location."
          />
          <Divider sx={{ my: 3 }} />

          <Stack spacing={2}>
            <LocationStatus
              title="Customer Location"
              available={customerLocationAvailable}
              description={
                customerLocationAvailable
                  ? `${assignment.latitude}, ${assignment.longitude}`
                  : "The customer's location is not available."
              }
            />
            <LocationStatus
              title="Technician Location"
              available={technicianLocationAvailable}
              description={
                technicianLocationAvailable
                  ? `${assignment.currentLatitude}, ${assignment.currentLongitude}`
                  : "No technician location has been shared yet."
              }
            />
          </Stack>

          {customerLocationAvailable ? (
            <Box sx={{ mt: 3 }}>
              <TechnicianRouteMap
                customerLatitude={assignment.latitude}
                customerLongitude={assignment.longitude}
                technicianLatitude={assignment.currentLatitude}
                technicianLongitude={assignment.currentLongitude}
              />
            </Box>
          ) : (
            <Alert severity="info" sx={{ mt: 3 }}>
              The customer's coordinates are not available, so the route cannot be displayed.
            </Alert>
          )}

          {technicianLocationAvailable && (
            <Alert severity="success" icon={<LocationOnIcon />} sx={{ mt: 2 }}>
              Your latest location has been shared.
            </Alert>
          )}

          <Button
            fullWidth
            variant="outlined"
            startIcon={
              sharingLocation
                ? <CircularProgress size={18} color="inherit" />
                : <MyLocationIcon />
            }
            onClick={handleShareLocation}
            disabled={sharingLocation || isFinished}
            sx={{ mt: 3, minHeight: 46, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            {sharingLocation ? "Getting and sharing location..." : "Share / Update My Location"}
          </Button>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <SectionHeader
            icon={<BuildIcon />}
            title="Task Actions"
            description="Update the service progress."
          />
          <Divider sx={{ my: 3 }} />

          {action ? (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
              <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
                {assignment.status === "ASSIGNED"
                  ? "Ready to head to the customer?"
                  : assignment.status === "ON_THE_WAY"
                    ? "Have you reached the customer?"
                    : assignment.status === "ARRIVED"
                      ? "Ready to begin the repair?"
                      : "Have you finished the repair?"}
              </Typography>

              <Button
                fullWidth
                variant="contained"
                startIcon={
                  updatingStatus
                    ? <CircularProgress size={18} color="inherit" />
                    : assignment.status === "ASSIGNED"
                      ? <NavigationIcon />
                      : assignment.status === "IN_PROGRESS"
                        ? <CheckCircleIcon  />
                        : <BuildIcon />
                }
                disabled={updatingStatus}
                onClick={handleNextAction}
                sx={{ minHeight: 48, borderRadius: 2, fontWeight: 700, textTransform: "none" }}
              >
                {updatingStatus ? "Updating status..." : action.label}
              </Button>
            </Box>
          ) : (
            <Alert severity={assignment.status === "COMPLETED" ? "success" : "warning"}>
              {assignment.status === "COMPLETED"
                ? "Service completed successfully."
                : "This task has been cancelled. No further actions are available."}
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <SectionHeader
              icon={<PhotoCameraIcon />}
              title="Repair Photos"
              description="View or manage photos for this service request."
            />
            <Button
              variant="outlined"
              onClick={() => setShowPhotos((previous) => !previous)}
              sx={{ flexShrink: 0, textTransform: "none" }}
            >
              {showPhotos ? "Hide" : "Show"}
            </Button>
          </Stack>

          {showPhotos && (
            <>
              <Divider sx={{ my: 3 }} />
              <RepairPhotos requestId={assignment.requestId} />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

function SectionHeader({ icon, title, description }: SectionHeaderProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", color: "primary.main", bgcolor: "action.hover", borderRadius: 2, width: 44, height: 44, flexShrink: 0 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" sx={{fontWeight :800 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

type InfoRowProps = {
  icon: ReactNode;
  label: string;
  value: string | null | undefined;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box sx={{ display: "flex", color: "text.secondary", mt: 0.25 }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography  sx={{ overflowWrap: "anywhere", mt: 0.25,fontWeight :700 }}>
          {value || "Not provided"}
        </Typography>
      </Box>
    </Stack>
  );
}

type LocationStatusProps = {
  title: string;
  available: boolean;
  description: string;
};

function LocationStatus({ title, available, description }: LocationStatusProps) {
  return (
    <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1 }}>
        <Typography sx={{fontWeight :700 }}>{title}</Typography>
        <Chip
          size="small"
          label={available ? "Location Available" : "Location Unavailable"}
          color={available ? "success" : "default"}
          variant="outlined"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">{description}</Typography>
    </Box>
  );
}
