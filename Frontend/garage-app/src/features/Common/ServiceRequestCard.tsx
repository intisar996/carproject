import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EngineeringIcon from "@mui/icons-material/Engineering";
import CancelIcon from "@mui/icons-material/Cancel";

export interface ServiceRequestCardData {
  requestId: number;
  status: string;
  guestName: string;
  guestPhone: string;
  garageName: string;
  garageId: number;
  carMakeModel: string;
  carPlateNumber: string;
  appliedPrice: number;
  latitude?: number | null;
  longitude?: number | null;
  rejectionReason?: string | null;
}

interface ServiceRequestCardProps {
  request: ServiceRequestCardData;
  actionLoading: boolean;
  techniciansLoading: boolean;
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onAssign: (requestId: number, garageId: number) => void;
}

const getStatusColor = (
  status: string,
): "warning" | "success" | "info" | "error" | "default" => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "ACCEPTED":
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "info";
    case "REJECTED":
      return "error";
    default:
      return "default";
  }
};

const formatStatus = (status: string) => status.replaceAll("_", " ");

export default function ServiceRequestCard({
  request,
  actionLoading,
  techniciansLoading,
  onAccept,
  onReject,
  onAssign,
}: ServiceRequestCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e2e8f0",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
            Request #{request.requestId}
          </Typography>
          <Chip
            label={formatStatus(request.status)}
            color={getStatusColor(request.status)}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
            Customer
          </Typography>
          <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
            {request.guestName}
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            {request.guestPhone}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
            Garage
          </Typography>
          <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
            {request.garageName}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
            Vehicle
          </Typography>
          <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
            {request.carMakeModel}
          </Typography>
          <Typography variant="body2" sx={{ color: "#475569" }}>
            Plate: {request.carPlateNumber}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
            Price
          </Typography>
          <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
            {request.appliedPrice} OMR
          </Typography>
        </Box>

        {request.latitude != null && request.longitude != null && (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LocationOnIcon />}
            sx={{ mb: 2, borderRadius: 2, textTransform: "none" }}
            onClick={() => {
              window.open(
                `https://www.google.com/maps?q=${request.latitude},${request.longitude}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            View Customer Location
          </Button>
        )}

        {request.status === "REJECTED" && (
          <Alert
            severity="error"
            icon={<CancelIcon />}
            sx={{ mb: 2, borderRadius: 2, alignItems: "flex-start" }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Request Rejected
            </Typography>
            <Typography variant="body2">
              {request.rejectionReason || "No rejection reason provided."}
            </Typography>
          </Alert>
        )}

        {request.status === "PENDING" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={actionLoading}
              onClick={() => onAccept(request.requestId)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Accept
            </Button>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              disabled={actionLoading}
              onClick={() => onReject(request.requestId)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Reject
            </Button>
          </Box>
        )}

        {request.status === "ACCEPTED" && (
          <Button
            fullWidth
            variant="contained"
            startIcon={<EngineeringIcon />}
            disabled={techniciansLoading}
            onClick={() => onAssign(request.requestId, request.garageId)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            {techniciansLoading ? "Loading Technicians..." : "Assign Technician"}
          </Button>
        )}

        {request.status === "IN_PROGRESS" && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Technician has been assigned and service is in progress.
          </Alert>
        )}

        {request.status === "COMPLETED" && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Service completed successfully.
          </Alert>
        )}

        {request.status === "CLOSED" && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            This service request is closed.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
