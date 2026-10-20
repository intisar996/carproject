import { useEffect, useState } from "react";
import {Alert,Box,Button,CircularProgress,Dialog,DialogActions,DialogContent,DialogTitle,
  FormControl,Grid,InputLabel,MenuItem,Select,TextField,Typography,} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";

import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import StatusTabs, { type StatusTabOption } from "../Common/StatusTabs";
import ServiceRequestCard from "../Common/ServiceRequestCard";
import {acceptServiceRequestAsync,assignTechnicianAsync,fetchOwnerServiceRequestsAsync,fetchTechniciansAsync,rejectServiceRequestAsync,} from "./serviceRequestsSlice";

export default function OwnerServiceRequests() {
  const dispatch = useAppDispatch();

  const {requests,technicians,status,techniciansStatus,actionStatus,error,} = useAppSelector((state) => state.serviceRequests);

  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<number | "">("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  useEffect(() => {
    dispatch(fetchOwnerServiceRequestsAsync());
  }, [dispatch]);

  const selectedRequest = requests.find(
    (request) => request.requestId === selectedRequestId,
  );

  const statusOptions: StatusTabOption[] = [
    { value: "ALL", label: "All", count: requests.length },
    {
      value: "PENDING",
      label: "Pending",
      count: requests.filter((request) => request.status === "PENDING").length,
    },
    {
      value: "ACCEPTED",
      label: "Accepted",
      count: requests.filter((request) => request.status === "ACCEPTED").length,
    },
    {
      value: "IN_PROGRESS",
      label: "In Progress",
      count: requests.filter((request) => request.status === "IN_PROGRESS").length,
    },
    {
      value: "COMPLETED",
      label: "Completed",
      count: requests.filter((request) => request.status === "COMPLETED").length,
    },
    {
      value: "REJECTED",
      label: "Rejected",
      count: requests.filter((request) => request.status === "REJECTED").length,
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      count: requests.filter((request) => request.status === "CANCELLED").length,
    },
  ];

  const filteredRequests =
    selectedStatus === "ALL"
      ? requests
      : requests.filter((request) => request.status === selectedStatus);

  const handleAccept = async (requestId: number) => {
    const result = await dispatch(acceptServiceRequestAsync(requestId));
    if (acceptServiceRequestAsync.fulfilled.match(result)) {
      dispatch(fetchOwnerServiceRequestsAsync());
    }
  };

  const handleOpenReject = (requestId: number) => {
    setRejectRequestId(requestId);
    setRejectionReason("");
    setRejectError("");
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    const reason = rejectionReason.trim();

    if (!reason) {
      setRejectError("Please enter a reason for rejecting this request.");
      return;
    }
    if (rejectRequestId === null) return;

    const result = await dispatch(
      rejectServiceRequestAsync({
        requestId: rejectRequestId,
        rejectionReason: reason,
      }),
    );

    if (rejectServiceRequestAsync.fulfilled.match(result)) {
      setRejectDialogOpen(false);
      setRejectRequestId(null);
      setRejectionReason("");
      setRejectError("");
      dispatch(fetchOwnerServiceRequestsAsync());
    }
  };

  const handleOpenAssign = async (requestId: number, garageId: number) => {
    setSelectedRequestId(requestId);
    setSelectedTechnicianId("");
    await dispatch(fetchTechniciansAsync(garageId));
  };

  const handleAssign = async () => {
    if (!selectedRequest || selectedTechnicianId === "") return;

    const result = await dispatch(
      assignTechnicianAsync({
        requestId: selectedRequest.requestId,
        technicianId: selectedTechnicianId,
      }),
    );

    if (assignTechnicianAsync.fulfilled.match(result)) {
      setSelectedRequestId(null);
      setSelectedTechnicianId("");
      dispatch(fetchOwnerServiceRequestsAsync());
    }
  };

  if (status === "loading" && requests.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}
        >
          Service Requests
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          Manage customer requests and assign technicians.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {requests.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>No service requests</Typography>
          <Typography variant="body2">
            Customer requests will appear here.
          </Typography>
        </Alert>
      ) : (
        <>
          <StatusTabs
            value={selectedStatus}
            options={statusOptions}
            onChange={setSelectedStatus}
          />

          {filteredRequests.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No requests found in this category.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {filteredRequests.map((request) => (
                <Grid
                  key={request.requestId}
                  size={{ xs: 12, md: 6, lg: 4 }}
                >
                  <ServiceRequestCard
                    request={request}
                    actionLoading={actionStatus === "loading"}
                    techniciansLoading={techniciansStatus === "loading"}
                    onAccept={handleAccept}
                    onReject={handleOpenReject}
                    onAssign={handleOpenAssign}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog
        open={selectedRequestId !== null}
        onClose={() => {
          setSelectedRequestId(null);
          setSelectedTechnicianId("");
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Assign Technician</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
            Select an available technician for this service request.
          </Typography>

          {techniciansStatus === "loading" ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : technicians.filter((technician) => technician.isAvailable).length ===
            0 ? (
            <Alert severity="warning">
              No available technicians found for this garage.
            </Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Technician</InputLabel>
              <Select
                value={selectedTechnicianId}
                label="Technician"
                onChange={(event) =>
                  setSelectedTechnicianId(event.target.value as number)
                }
              >
                {technicians
                  .filter((technician) => technician.isAvailable)
                  .map((technician) => (
                    <MenuItem key={technician.id} value={technician.id}>
                      {technician.fullName}
                      {technician.specialization
                        ? ` - ${technician.specialization}`
                        : ""}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setSelectedRequestId(null);
              setSelectedTechnicianId("");
            }}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={
              selectedTechnicianId === "" ||
              actionStatus === "loading" ||
              techniciansStatus === "loading" ||
              technicians.filter((technician) => technician.isAvailable).length === 0
            }
            onClick={handleAssign}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {actionStatus === "loading" ? "Assigning..." : "Assign Technician"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          if (actionStatus !== "loading") {
            setRejectDialogOpen(false);
            setRejectError("");
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Service Request</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Please explain why you are rejecting this request. The customer will
            be able to see the reason.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Reason for rejection"
            placeholder="For example: This service is not available at our garage."
            value={rejectionReason}
            onChange={(event) => {
              setRejectionReason(event.target.value);
              if (event.target.value.trim()) setRejectError("");
            }}
            error={Boolean(rejectError)}
            helperText={rejectError || "A rejection reason is required."}
            sx={{ maxLength: 1000 }}
            disabled={actionStatus === "loading"}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectError("");
            }}
            disabled={actionStatus === "loading"}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            disabled={actionStatus === "loading" || !rejectionReason.trim()}
            onClick={handleReject}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            {actionStatus === "loading" ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
