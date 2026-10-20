import { useState } from "react";
import {Box, Button,Paper,TextField,Typography,} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import agent from "../../app/api/agent";
import LocationPicker from "../Common/LocationPicker";
import { toast } from "react-toastify";

interface Props {
  garageOptionId: number;
  onClose: () => void;
}

export default function CustomerServiceRequestForm({
  garageOptionId,
  onClose,
}: Props) {
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [carMakeModel, setCarMakeModel] = useState("");
  const [carPlateNumber, setCarPlateNumber] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (
      !guestName.trim() ||
      !guestEmail.trim() ||
      !guestPhone.trim() ||
      !carMakeModel.trim() ||
      !carPlateNumber.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (latitude === null || longitude === null) {
      setError("Please select your location on the map.");
      return;
    }

    try {
      setLoading(true);

      await agent.Customer.createServiceRequest({
        garageOptionId,
        guestName,
        guestEmail,
        guestPhone,
        carMakeModel,
        carPlateNumber,
        latitude,
        longitude,
      });

       toast.success("Service request submitted successfully. You will receive a tracking link by email.")

      onClose();
    } catch {
      setError("Failed to submit service request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1300,
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 550,
          p: { xs: 3, md: 4 },
          borderRadius: 3,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#0b1f3a" }}
          >
            Request Service
          </Typography>

          <Button
            onClick={onClose}
            sx={{ minWidth: "auto", color: "#0b1f3a" }}
          >
            <CloseIcon />
          </Button>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Email Address"
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Phone Number"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Car Make & Model"
            placeholder="Toyota Camry"
            value={carMakeModel}
            onChange={(e) => setCarMakeModel(e.target.value)}
            fullWidth
            required
          />

          <TextField
            label="Car Plate Number"
            value={carPlateNumber}
            onChange={(e) => setCarPlateNumber(e.target.value)}
            fullWidth
            required
          />

          <LocationPicker
            onLocationSelect={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              backgroundColor: "#0b1f3a",
              py: 1.3,
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#07152a",
              },
            }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
