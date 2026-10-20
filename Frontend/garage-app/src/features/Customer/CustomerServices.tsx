import {
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "../../store/configureStore";

export default function CustomerServices() {
  const navigate = useNavigate();

  const { services, status, error } = useAppSelector(
    (state) => state.customer
  );

  if (status === "loading" && services.length === 0) {
    return <CircularProgress />;
  }

  if (error && services.length === 0) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {services.map((service) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={service.serviceId}>
          <Card
            onClick={() => navigate(`/garages/${service.serviceId}`)}
            sx={{
              cursor: "pointer",
              height: "100%",
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              transition: "0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 4,
              },
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <BuildIcon
                sx={{
                  fontSize: 42,
                  color: "#0b1f3a",
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                sx={{ fontWeight: "bold" }}
              >
                {service.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Find garages offering this service
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
