import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          mb: 2,
        }}
      >
        Payment Cancelled
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4,
        }}
      >
        Your payment was cancelled. No subscription was activated.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/owner/subscriptions")}
      >
        Back to Subscription Plans
      </Button>
    </Box>
  );
}
