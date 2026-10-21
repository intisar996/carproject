import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import BuildIcon from "@mui/icons-material/Build";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import agent from "../../app/api/agent";
import TechnicianRouteMap from "../Technician/TechnicianRouteMap";
import { toast } from "react-toastify";
import type { RatingResponse } from "../../app/models/Rating";

type Request = Awaited<
  ReturnType<typeof agent.ServiceRequests.getOwnerRequests>
>[number];

type Assignment = Awaited<
  ReturnType<typeof agent.OwnerAssignments.getAssignments>
>[number];

type RepairPhoto = Awaited<
  ReturnType<typeof agent.OwnerAssignments.getRepairPhotos>
>[number];

export default function OwnerServiceRequestDetails() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<Request | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [photos, setPhotos] = useState<RepairPhoto[]>([]);
  const [photoSources, setPhotoSources] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState<RatingResponse | null>(null);
  const [ratingLoading, setRatingLoading] = useState(true);
  const [ratingError, setRatingError] = useState(false);

  useEffect(() => {
    let active = true;
    const createdUrls: string[] = [];

    const loadDetails = async () => {
      if (!requestId || !Number.isInteger(Number(requestId))) {
        setError("Invalid service request ID.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const id = Number(requestId);

        const [requestsResponse, assignmentsResponse] = await Promise.all([
          agent.ServiceRequests.getOwnerRequests(),
          agent.OwnerAssignments.getAssignments(),
        ]);

        if (!active) return;

        const selectedRequest =
          requestsResponse.find((item) => item.requestId === id) ?? null;

        if (!selectedRequest) {
          setError("Service request not found.");
          setLoading(false);
          return;
        }

        const selectedAssignment =
          assignmentsResponse.find((item) => item.requestId === id) ?? null;

        setRequest(selectedRequest);
        setAssignment(selectedAssignment);

        setRatingLoading(true);
        setRatingError(false);

        try {
          const ratingResponse = await agent.Ratings.getRating(id);

          if (active) {
            setRating(ratingResponse ?? null);
          }
        } catch {
          if (active) {
            setRating(null);
            setRatingError(true);
          }
        } finally {
          if (active) {
            setRatingLoading(false);
          }
        }

        try {
          const photosResponse =
            await agent.OwnerAssignments.getRepairPhotos(id);

          if (!active) return;

          setPhotos(photosResponse);

          const sources: Record<number, string> = {};

          await Promise.all(
            photosResponse.map(async (photo) => {
              try {
                const imageResponse =
                  await agent.OwnerAssignments.getRepairPhotoImage(
                    id,
                    photo.photoId,
                  );

                if (!active) return;

                const url = URL.createObjectURL(imageResponse);
                createdUrls.push(url);
                sources[photo.photoId] = url;
              } catch {
                toast.error("");
              }
            }),
          );

          if (active) {
            setPhotoSources(sources);
          }
        } catch {
          if (active) {
            setPhotos([]);
          }
        }
      } catch {
        if (active) {
          setError("Unable to load service request details. Please try again.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadDetails();

    return () => {
      active = false;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [requestId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !request) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, textTransform: "none" }}>
          Back to Service Requests
        </Button>

        <Alert severity='error'>{error || "Service request not found."}</Alert>
      </Box>
    );
  }

  const statusColor = (
    status: string,
  ): "default" | "primary" | "success" | "warning" | "error" => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "PENDING":
      case "ACCEPTED":
        return "warning";
      case "REJECTED":
      case "CANCELLED":
      case "CLOSED":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "Not available"
      : parsedDate.toLocaleString();
  };

  const photosByType = {
    BEFORE: photos.filter((photo) => photo.photoType === "BEFORE"),
    DURING: photos.filter((photo) => photo.photoType === "DURING"),
    AFTER: photos.filter((photo) => photo.photoType === "AFTER"),
  };

  const photoSections = [
    { key: "BEFORE", label: "Before Repair" },
    { key: "DURING", label: "During Repair" },
    { key: "AFTER", label: "After Repair" },
  ] as const;

  return (
    <Box sx={{ pb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: "none" }}>
        Back to Service Requests
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent='space-between'
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}>
        <Box>
          <Typography
            variant='h4'
            sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
            Service Request #{request.requestId}
          </Typography>
          <Typography color='text.secondary'>
            Review customer information, technician tracking, and repair photos.
          </Typography>
        </Box>

        <Chip
          label={request.status.replaceAll("_", " ")}
          color={statusColor(request.status)}
          sx={{ fontWeight: 700 }}
        />
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                <PersonIcon color='primary' />
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Customer Information
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography color='text.secondary' variant='body2'>
                Customer Name
              </Typography>
              <Typography sx={{ mb: 2, fontWeight: 600 }}>
                {request.guestName || "Not available"}
              </Typography>

              <Stack direction='row' spacing={1} alignItems='center' mb={1}>
                <PhoneIcon fontSize='small' color='action' />
                <Typography>{request.guestPhone || "Not available"}</Typography>
              </Stack>

              <Typography color='text.secondary' variant='body2' sx={{ mt: 2 }}>
                Request Created
              </Typography>
              <Typography>{formatDate(request.createdAt)}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                <DirectionsCarIcon color='primary' />
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Vehicle & Garage
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              <Typography color='text.secondary' variant='body2'>
                Vehicle
              </Typography>
              <Typography sx={{ fontWeight: 700, mb: 2 }}>
                {request.carMakeModel || "Not available"}
              </Typography>

              <Typography color='text.secondary' variant='body2'>
                Plate Number
              </Typography>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>
                {request.carPlateNumber || "Not available"}
              </Typography>

              <Typography color='text.secondary' variant='body2'>
                Garage
              </Typography>
              <Typography sx={{ fontWeight: 600, mb: 2 }}>
                {request.garageName || "Not available"}
              </Typography>

              <Typography color='text.secondary' variant='body2'>
                Applied Price
              </Typography>
              <Typography sx={{ fontWeight: 700 }} color='primary.main'>
                {request.appliedPrice != null
                  ? `${request.appliedPrice} OMR`
                  : "Not available"}
              </Typography>

              {request.status === "REJECTED" && request.rejectionReason && (
                <Alert severity='error' sx={{ mt: 2 }}>
                  Rejection reason: {request.rejectionReason}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                <BuildIcon color='primary' />
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Technician Tracking
                </Typography>
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {assignment && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography color='text.secondary' variant='body2'>
                      Technician
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {assignment.technicianName || "Not available"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography color='text.secondary' variant='body2'>
                      Assignment Status
                    </Typography>
                    <Chip
                      label={assignment.status.replaceAll("_", " ")}
                      color={statusColor(assignment.status)}
                      size='small'
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography color='text.secondary' variant='body2'>
                      Assigned At
                    </Typography>
                    <Typography>{formatDate(assignment.assignedAt)}</Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography color='text.secondary' variant='body2'>
                      Last Location Update
                    </Typography>
                    <Typography>
                      {formatDate(assignment.lastLocationUpdate)}
                    </Typography>
                  </Grid>
                </Grid>
              )}

              {request.latitude != null && request.longitude != null ? (
                <TechnicianRouteMap
                  customerLatitude={request.latitude}
                  customerLongitude={request.longitude}
                  technicianLatitude={assignment?.latitude ?? null}
                  technicianLongitude={assignment?.longitude ?? null}
                />
              ) : (
                <Alert severity='warning' sx={{ mb: 2 }}>
                  Customer location is not available for this request.
                </Alert>
              )}

              {!assignment && (
                <Alert severity='info' sx={{ mt: 2 }}>
                  No technician assigned yet. The customer's location is
                  available for reviewing this request.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                <PhotoLibraryIcon color='primary' />
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Repair Photos
                </Typography>
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {photos.length === 0 ? (
                <Alert severity='info'>
                  No repair photos are available for this request.
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {photoSections.map((section) => {
                    const sectionPhotos =
                      photosByType[section.key as keyof typeof photosByType];

                    return (
                      <Grid key={section.key} size={{ xs: 12, md: 4 }}>
                        <Typography sx={{ mb: 2, fontWeight: 700 }}>
                          {section.label}
                        </Typography>

                        {sectionPhotos.length === 0 ? (
                          <Typography variant='body2' color='text.secondary'>
                            No photos available.
                          </Typography>
                        ) : (
                          <Stack spacing={2}>
                            {sectionPhotos.map((photo) => (
                              <Box key={photo.photoId}>
                                {photoSources[photo.photoId] ? (
                                  <Box
                                    component='img'
                                    src={photoSources[photo.photoId]}
                                    alt={section.label}
                                    sx={{
                                      width: "100%",
                                      height: 220,
                                      objectFit: "cover",
                                      borderRadius: 2,
                                      display: "block",
                                    }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      height: 160,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "grey.100",
                                      borderRadius: 2,
                                    }}>
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'>
                                      Image unavailable
                                    </Typography>
                                  </Box>
                                )}

                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  sx={{ display: "block", mt: 1 }}>
                                  {formatDate(photo.capturedAt)}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Rating */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
                Customer Rating & Review
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {ratingLoading ? (
                <CircularProgress size={24} />
              ) : ratingError ? (
                <Alert severity='error'>Unable to load customer rating.</Alert>
              ) : !rating ? (
                <Alert severity='info'>No rating submitted yet.</Alert>
              ) : (
                <Stack spacing={2}>
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Typography
                        key={star}
                        sx={{
                          fontSize: 28,
                          color: star <= rating.stars ? "#F5A623" : "#D1D5DB",
                        }}>
                        ★
                      </Typography>
                    ))}

                    <Typography sx={{ ml: 1, fontWeight: 700 }}>
                      {rating.stars}/5
                    </Typography>
                  </Stack>

                  <Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 0.5 }}>
                      Customer Comment
                    </Typography>

                    <Typography>
                      {rating.comment?.trim() || "No comment provided."}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Rating Date
                    </Typography>

                    <Typography>{formatDate(rating.createdAt)}</Typography>
                  </Box>
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
