import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
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
        Payment Successful
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4,
        }}
      >
        Your garage subscription has been activated successfully.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/owner/garages")}
      >
        Go to My Garages
      </Button>
    </Box>
  );
}
