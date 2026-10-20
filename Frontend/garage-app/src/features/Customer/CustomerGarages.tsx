
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";


import { useAppSelector } from "../../store/configureStore";

import CustomerServiceRequestForm from "../Customer/CustomerServiceRequestForm";

export default function CustomerGarages() {

  const { garages, status, error } = useAppSelector(
    (state) => state.customer
  );

  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");

  const [selectedGarageOptionId, setSelectedGarageOptionId] =
    useState<number | null>(null);

  const governorates = useMemo(() => {
    return [...new Set(garages.map((garage) => garage.governorate))];
  }, [garages]);

  const filteredGarages = useMemo(() => {
    return garages.filter((garage) => {
      const matchesGovernorate =
        selectedGovernorate === "" ||
        garage.governorate === selectedGovernorate;

      const matchesPrice =
        selectedPrice === "" ||
        (selectedPrice === "low" && garage.price <= 5) ||
        (selectedPrice === "medium" &&
          garage.price > 5 &&
          garage.price <= 10) ||
        (selectedPrice === "high" && garage.price > 10);

      return matchesGovernorate && matchesPrice;
    });
  }, [garages, selectedGovernorate, selectedPrice]);

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          py: 6,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography
        color="error"
        sx={{
          mt: 3,
          textAlign: "center",
        }}
      >
        {error}
      </Typography>
    );
  }

  if (garages.length === 0) {
    return (
      <Typography
        color="text.secondary"
        sx={{
          mt: 3,
          textAlign: "center",
        }}
      >
        No available garages found for this service.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Governorate</InputLabel>

          <Select
            value={selectedGovernorate}
            label="Governorate"
            onChange={(event) =>
              setSelectedGovernorate(event.target.value)
            }
          >
            <MenuItem value="">
              All Governorates
            </MenuItem>

            {governorates.map((governorate) => (
              <MenuItem
                key={governorate}
                value={governorate}
              >
                {governorate}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Price</InputLabel>

          <Select
            value={selectedPrice}
            label="Price"
            onChange={(event) =>
              setSelectedPrice(event.target.value)
            }
          >
            <MenuItem value="">
              All Prices
            </MenuItem>

            <MenuItem value="low">
              0 - 5 OMR
            </MenuItem>

            <MenuItem value="medium">
              5 - 10 OMR
            </MenuItem>

            <MenuItem value="high">
              More than 10 OMR
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredGarages.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{
            textAlign: "center",
            py: 4,
          }}
        >
          No garages match your filters.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredGarages.map((garage) => (
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              key={garage.garageOptionId}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid #e0e0e0",
                  transition: "0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 5,
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color: "#0b1f3a",
                      mb: 2,
                    }}
                  >
                    {garage.garageName}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <LocationOnIcon
                      sx={{ color: "#0b1f3a" }}
                    />

                    <Typography variant="body2">
                      {garage.governorate} - {garage.state}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <DirectionsCarIcon
                      sx={{ color: "#0b1f3a" }}
                    />

                    <Typography variant="body2">
                      {garage.optionType}
                    </Typography>
                  </Box>

                  {garage.optionSize && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      <strong>Size:</strong>{" "}
                      {garage.optionSize}
                    </Typography>
                  )}

                  {garage.optionBrand && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      <strong>Brand:</strong>{" "}
                      {garage.optionBrand}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mt: 2,
                      mb: 3,
                    }}
                  >
                    <AttachMoneyIcon
                      sx={{ color: "#0b1f3a" }}
                    />

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: "bold",
                        color: "#0b1f3a",
                      }}
                    >
                      {garage.price} OMR
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={() =>
                      setSelectedGarageOptionId(
                        garage.garageOptionId
                      )
                    }
                    sx={{
                      mt: "auto",
                      backgroundColor: "#0b1f3a",
                      borderRadius: 2,
                      py: 1.2,
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#07152a",
                      },
                    }}
                  >
                    Request Service
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedGarageOptionId !== null && (
        <CustomerServiceRequestForm
          garageOptionId={selectedGarageOptionId}
          onClose={() =>
            setSelectedGarageOptionId(null)
          }
        />
      )}
    </Box>
  );
}
