
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import agent from "../../app/api/agent";
import {
  clearOwnerPhotos,
  fetchOwnerAssignmentsAsync,
  fetchOwnerRepairPhotosAsync,
} from "./ownerAssignmentsSlice";

import type { OwnerTechnicianAssignment } from "../../app/models/OwnerTechnicianAssignment";
import type { OwnerRepairPhoto } from "../../app/models/OwnerRepairPhoto";

const statusLabels: Record<string, string> = {
  ASSIGNED: "Assigned",
  ON_THE_WAY: "On the way",
  ARRIVED: "Arrived",
  IN_PROGRESS: "Repair in progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function getStatusColor(
  status: string
): "default" | "primary" | "info" | "warning" | "success" | "error" {
  switch (status) {
    case "ON_THE_WAY":
      return "info";
    case "ARRIVED":
      return "primary";
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

function formatDate(value: string | null) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={2}
      sx={{ py: 0.75 }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={600}
        textAlign="right"
        sx={{ overflowWrap: "anywhere" }}
      >
        {value === null || value === "" ? "—" : value}
      </Typography>
    </Stack>
  );
}

export default function OwnerTechnicianTasks() {
  const dispatch = useAppDispatch();

  const {
    assignments,
    photos,
    status,
    photosStatus,
    error,
  } = useAppSelector((state) => state.ownerAssignments);

  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(
    null
  );
  const [photoImages, setPhotoImages] = useState<Record<number, string>>({});
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    void dispatch(fetchOwnerAssignmentsAsync());
  }, [dispatch]);

  useEffect(() => {
    if (selectedRequestId === null || photos.length === 0) {
      setPhotoImages({});
      return;
    }

    const requestPhotos = photos.filter(
      (photo) => photo.requestId === selectedRequestId
    );

    if (requestPhotos.length === 0) {
      setPhotoImages({});
      return;
    }

    let cancelled = false;
    const objectUrls: string[] = [];

    setPhotoImages({});
    setImageError(null);

    async function loadImages() {
      try {
        const entries = await Promise.all(
          requestPhotos.map(async (photo) => {
            const response = await agent.OwnerAssignments.getRepairPhotoImage(
              photo.requestId,
              photo.photoId
            );

            const url = URL.createObjectURL(response);
            objectUrls.push(url);

            return [photo.photoId, url] as const;
          })
        );

        if (!cancelled) {
          setPhotoImages(Object.fromEntries(entries));
        }
      } catch {
        if (!cancelled) {
          setImageError("Some repair photos could not be loaded.");
        }
      }
    }

    void loadImages();

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedRequestId, photos]);

  const handleViewPhotos = (requestId: number) => {
    setSelectedRequestId(requestId);
    setImageError(null);
    dispatch(clearOwnerPhotos());
    void dispatch(fetchOwnerRepairPhotosAsync(requestId));
  };

  const handleRefresh = () => {
    void dispatch(fetchOwnerAssignmentsAsync());
  };

  const selectedPhotos = photos.filter(
    (photo) => photo.requestId === selectedRequestId
  );

  const photoTypes: OwnerRepairPhoto["photoType"][] = [
    "BEFORE",
    "DURING",
    "AFTER",
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Technician Tasks
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor assigned jobs, repair progress, technician locations and photos.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={status === "loading"}
        >
          Refresh
        </Button>
      </Stack>

      {status === "error" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Failed to load technician tasks."}
        </Alert>
      )}

      {status === "loading" && assignments.length === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {status !== "loading" && assignments.length === 0 && status !== "error" && (
        <Alert severity="info">
          No technician tasks have been assigned yet.
        </Alert>
      )}

      <Grid container spacing={2}>
        {assignments.map((task: OwnerTechnicianAssignment) => (
          <Grid key={task.assignmentId} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": {
                  boxShadow: 4,
                  borderColor: "primary.main",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssignmentIcon color="primary" />

                    <Typography variant="h6" fontWeight={700}>
                      Task #{task.assignmentId}
                    </Typography>
                  </Stack>

                  <Chip
                    size="small"
                    label={statusLabels[task.status] ?? task.status}
                    color={getStatusColor(task.status)}
                  />
                </Stack>

                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  sx={{ mb: 1 }}
                >
                  Customer and vehicle
                </Typography>

                <InfoRow label="Customer" value={task.customerName} />
                <InfoRow label="Phone" value={task.customerPhone} />
                <InfoRow label="Car" value={task.carMakeModel} />
                <InfoRow label="Plate number" value={task.carPlateNumber} />
                <InfoRow
                  label="Service price"
                  value={
                    task.appliedPrice === null
                      ? null
                      : `${task.appliedPrice} OMR`
                  }
                />

                <Box
                  sx={{
                    borderTop: 1,
                    borderColor: "divider",
                    my: 2,
                  }}
                />

                <Typography
                  variant="subtitle2"
                  color="primary.main"
                  sx={{ mb: 1 }}
                >
                  Technician progress
                </Typography>

                <InfoRow label="Technician" value={task.technicianName} />
                <InfoRow label="Assigned" value={formatDate(task.assignedAt)} />
                <InfoRow label="Started" value={formatDate(task.startedAt)} />
                <InfoRow label="Arrived" value={formatDate(task.arrivedAt)} />
                <InfoRow
                  label="Completed"
                  value={formatDate(task.completedAt)}
                />
                <InfoRow
                  label="Last location update"
                  value={formatDate(task.lastLocationUpdate)}
                />

                {task.latitude !== null && task.longitude !== null && (
                  <Button
                    component="a"
                    href={`https://www.google.com/maps?q=${task.latitude},${task.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<LocationOnIcon />}
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    View technician location
                  </Button>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PhotoLibraryIcon />}
                  sx={{ mt: 1.5 }}
                  onClick={() => handleViewPhotos(task.requestId)}
                  disabled={
                    photosStatus === "loading" &&
                    selectedRequestId === task.requestId
                  }
                >
                  {selectedRequestId === task.requestId
                    ? "Refresh repair photos"
                    : "View repair photos"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedRequestId !== null && (
        <Box
          sx={{
            mt: 4,
            p: { xs: 2, sm: 3 },
            border: 1,
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
            Repair Photos — Request #{selectedRequestId}
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Photos uploaded by the technician during the repair process.
          </Typography>

          {photosStatus === "loading" && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {photosStatus === "error" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || "Failed to load repair photos."}
            </Alert>
          )}

          {imageError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {imageError}
            </Alert>
          )}

          {photosStatus !== "loading" &&
            photosStatus !== "error" &&
            selectedPhotos.length === 0 && (
              <Alert severity="info">
                No repair photos have been uploaded for this request yet.
              </Alert>
            )}

          <Grid container spacing={2}>
            {photoTypes.map((type) => {
              const typePhotos = selectedPhotos.filter(
                (photo) => photo.photoType === type
              );

              return (
                <Grid key={type} size={{ xs: 12, md: 4 }}>
                  <Typography variant="h6" sx={{ mb: 1.5 }}>
                    {type === "BEFORE"
                      ? "Before repair"
                      : type === "DURING"
                        ? "During repair"
                        : "After repair"}
                  </Typography>

                  {typePhotos.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No photos available.
                    </Typography>
                  ) : (
                    <Stack spacing={2}>
                      {typePhotos.map((photo) => (
                        <Card key={photo.photoId} variant="outlined">
                          {photoImages[photo.photoId] ? (
                            <Box
                              component="img"
                              src={photoImages[photo.photoId]}
                              alt={`${type} repair`}
                              sx={{
                                display: "block",
                                width: "100%",
                                maxHeight: 300,
                                objectFit: "contain",
                                bgcolor: "grey.100",
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                minHeight: 140,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CircularProgress size={24} />
                            </Box>
                          )}

                          <CardContent>
                            <Typography variant="body2" fontWeight={600}>
                              {type} photo
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(photo.capturedAt)}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
