import { useEffect } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";

import {
  useAppDispatch,
  useAppSelector,
} from "../../store/configureStore";

import {
  fetchCustomerServicesAsync,
  fetchGaragesByServiceAsync,
} from "./customerSlice";

import CustomerGarages from "./CustomerGarages";

export default function CustomerGaragesPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { services } = useAppSelector(
    (state) => state.customer
  );

  const selectedServiceId = Number(serviceId);

  const selectedService = services.find(
    (service) => service.serviceId === selectedServiceId
  );

  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchCustomerServicesAsync());
    }
  }, [dispatch, services.length]);

  useEffect(() => {
    if (selectedServiceId) {
      dispatch(fetchGaragesByServiceAsync(selectedServiceId));
    }
  }, [dispatch, selectedServiceId]);

  return (
    <Container>
    <Box sx={{ py: 3}}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/")}
        sx={{
          mb: 3,
          color: "#0b1f3a",
          fontWeight: "bold",
        }}
      >
        Back to Services
      </Button>

      <Typography
        variant="h4"
        sx={{
          fontWeight: "bold",
          color: "#0b1f3a",
          mb: 1,
        }}
      >
        {selectedService
          ? `Garages for ${selectedService.name}`
          : "Available Garages"}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Choose a garage that provides this service.
      </Typography>

      <CustomerGarages />
    </Box>
    </Container>
  );
}

