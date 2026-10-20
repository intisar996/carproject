
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import BuildIcon from "@mui/icons-material/Build";
import NavigationIcon from "@mui/icons-material/Navigation";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

import type { TechnicianAssignment } from "../../app/models/TechnicianAssignment";
import agent from "../../app/api/agent";
import RepairPhotos from "./RepairPhotos";
import { CheckBox } from "@mui/icons-material";

type Props = {
  assignments: TechnicianAssignment[];
  locatingAssignmentId: number | null;
  sendingAssignmentId: number | null;
  onShareLocation: (assignment: TechnicianAssignment) => void;
};

const statusFilters = [
  { value: "ALL", label: "All Tasks" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ON_THE_WAY", label: "On the Way" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const nextActions: Record<
  string,
  { nextStatus: string; label: string; icon: React.ReactNode }
> = {
  ASSIGNED: {
    nextStatus: "ON_THE_WAY",
    label: "Start Trip",
    icon: <NavigationIcon />,
  },
  ON_THE_WAY: {
    nextStatus: "ARRIVED",
    label: "I've Arrived",
    icon: <CheckBox />,
  },
  ARRIVED: {
    nextStatus: "IN_PROGRESS",
    label: "Start Service",
    icon: <BuildIcon />,
  },
  IN_PROGRESS: {
    nextStatus: "COMPLETED",
    label: "Complete Service",
    icon: <CheckBox />,
  },
};

export default function TechnicianTaskCard({
  assignments,
  locatingAssignmentId,
  sendingAssignmentId,
  onShareLocation,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [savedStatuses, setSavedStatuses] = useState<
    Record<number, string>
  >({});
  const [expandedPhotos, setExpandedPhotos] = useState<
    Record<number, boolean>
  >({});

  const getStatus = (assignment: TechnicianAssignment) =>
    savedStatuses[assignment.assignmentId] ?? assignment.status;

  const filteredAssignments =
    selectedFilter === "ALL"
      ? assignments
      : assignments.filter(
          (assignment) => getStatus(assignment) === selectedFilter
        );

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ASSIGNED: "Assigned",
      ON_THE_WAY: "On the Way",
      ARRIVED: "Arrived",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
      CANCELLED: "Cancelled",
    };

    return labels[status] ?? status;
  };

  const getStatusColor = (
    status: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning" => {
    switch (status) {
      case "ASSIGNED":
        return "primary";
      case "ON_THE_WAY":
        return "secondary";
      case "ARRIVED":
        return "warning";
      case "IN_PROGRESS":
        return "warning";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const handleNextAction = async (
    assignment: TechnicianAssignment
  ) => {
    const assignmentId = assignment.assignmentId;
    const currentStatus = getStatus(assignment);
    const action = nextActions[currentStatus];

    if (!action || updatingId !== null) return;

    setUpdatingId(assignmentId);

    try {
      await agent.Assignments.updateStatus(
        assignmentId,
        action.nextStatus
      );

      setSavedStatuses((previous) => ({
        ...previous,
        [assignmentId]: action.nextStatus,
      }));
    } catch (error) {
      console.error("Failed to update task status:", error);
      window.alert(
        "Could not update the task status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
  
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 2,
          mb: 1,
          "&::-webkit-scrollbar": { height: 5 },
        }}
      >
        {statusFilters.map((filter) => {
          const count =
            filter.value === "ALL"
              ? assignments.length
              : assignments.filter(
                  (assignment) => getStatus(assignment) === filter.value
                ).length;

          return (
            <Button
              key={filter.value}
              variant={
                selectedFilter === filter.value ? "contained" : "outlined"
              }
              onClick={() => setSelectedFilter(filter.value)}
              sx={{
                flexShrink: 0,
                borderRadius: 2,
                border: "2px solid var(--dark-oringe)",
                textTransform: "none",
                 color:"var(--navy-color)",
                whiteSpace: "nowrap",
              }}
            >
              {filter.label} ({count})
            </Button>
          );
        })}
      </Box>

      {filteredAssignments.length === 0 ? (
        <Alert severity="info">
          No tasks found in this status.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "start",
          }}
        >
          {filteredAssignments.map((assignment) => {
            const status = getStatus(assignment);
            const locating =
              locatingAssignmentId === assignment.assignmentId;
            const sending =
              sendingAssignmentId === assignment.assignmentId;
            const updating = updatingId === assignment.assignmentId;
            const isBusy = locating || sending;
            const isFinished =
              status === "COMPLETED" || status === "CANCELLED";
            const nextAction = nextActions[status];

            return (
              <Card
                key={assignment.assignmentId}
                sx={{
                  minWidth: 0,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    "&:last-child": {
                      pb: { xs: 2, md: 2.5 },
                    },
                  }}
                >
                 
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "1rem", md: "1.1rem" },
                          overflowWrap: "anywhere",
                        }}
                      >
                        Task #{assignment.requestId}
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{ mt: 0.5, fontWeight: 500 }}
                      >
                        {assignment.guestName}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={getStatusLabel(status)}
                      color={getStatusColor(status)}
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <PhoneIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                        {assignment.guestPhone}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <DirectionsCarIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                        {assignment.carMakeModel}
                      </Typography>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Plate: {assignment.carPlateNumber}
                    </Typography>
                  </Stack>

                
                  {nextAction && (
                    <Box
                      sx={{
                        mt: 2.5,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1.5 }}
                      >
                        {status === "ASSIGNED"
                          ? "Ready to head to the customer?"
                          : status === "ON_THE_WAY"
                            ? "Have you reached the customer?"
                            : status === "ARRIVED"
                              ? "Ready to begin the repair?"
                              : "Have you finished the repair?"}
                      </Typography>

                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={
                          updating ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            nextAction.icon
                          )
                        }
                        disabled={updating || isFinished}
                        onClick={() => handleNextAction(assignment)}
                        sx={{
                          minHeight: 46,
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        {updating ? "Updating..." : nextAction.label}
                      </Button>
                    </Box>
                  )}

                 
                  {status === "COMPLETED" && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Service completed successfully.
                    </Alert>
                  )}

                  {status === "CANCELLED" && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      This task has been cancelled.
                    </Alert>
                  )}

               
                  {assignment.currentLatitude != null &&
                    assignment.currentLongitude != null && (
                      <Alert
                        severity="success"
                        icon={<LocationOnIcon />}
                        sx={{ mt: 2, py: 0 }}
                      >
                        Location is currently shared.
                      </Alert>
                    )}

                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={
                      isBusy ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <MyLocationIcon />
                      )
                    }
                    onClick={() => onShareLocation(assignment)}
                    disabled={isBusy || isFinished}
                    sx={{
                      mt: 2,
                      minHeight: 42,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    {locating
                      ? "Getting Location..."
                      : sending
                        ? "Sharing Location..."
                        : status === "ON_THE_WAY"
                          ? "Update Location"
                          : "Share Location"}
                  </Button>

                  <Box
                    sx={{
                      mt: 2,
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Button
                      fullWidth
                      variant="text"
                      startIcon={<PhotoCameraIcon />}
                      onClick={() =>
                        setExpandedPhotos((previous) => ({
                          ...previous,
                          [assignment.assignmentId]:
                            !previous[assignment.assignmentId],
                        }))
                      }
                      sx={{
                        justifyContent: "space-between",
                        textTransform: "none",
                      }}
                    >
                      {expandedPhotos[assignment.assignmentId]
                        ? "Hide Repair Photos"
                        : "Repair Photos"}
                    </Button>

                    {expandedPhotos[assignment.assignmentId] && (
                      <Box sx={{ mt: 1 }}>
                        <RepairPhotos requestId={assignment.requestId} />
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
