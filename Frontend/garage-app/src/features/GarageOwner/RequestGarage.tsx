
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "../../store/configureStore";
import { requestGarageAsync } from "./garagesSlice";
import AppFileInput from "../../app/components/AppFileInput";
import AppTextInput from "../../app/components/AppTextInput";
import PageHeader from "../../app/components/PageHeader";
import {
  notifyError,
  notifySuccess,
  rejectionMessage,
} from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface Form {
  garageName: string;
  commercialRegisterNumber: string;
  governorate: string;
  state: string;
  latitude: string;
  longitude: string;
  certificateFile: File | null;
}

type LocationMapPickerProps = {
  position: [number, number] | null;
  onSelect: (latitude: number, longitude: number) => void;
};

type SearchPlace = {
  label: string;
  lat: number;
  lon: number;
};

function MapClickHandler({
  onSelect,
}: {
  onSelect: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function MapCenterUpdater({
  position,
}: {
  position: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 15), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [position, map]);

  return null;
}

function LocationMapPicker({
  position,
  onSelect,
}: LocationMapPickerProps) {
  const initialCenter: [number, number] = [23.5859, 58.4059];

  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locating, setLocating] = useState(false);

  async function searchPlaces() {
    const query = searchText.trim();

    if (!query) {
      setSearchError("Please enter a place name.");
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      const params = new URLSearchParams({
        q: query,
        format: "jsonv2",
        limit: "5",
        countrycodes: "om",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Search service unavailable");
      }

      const results = (await response.json()) as {
        display_name: string;
        lat: string;
        lon: string;
      }[];

      const places = results.map((item) => ({
        label: item.display_name,
        lat: Number(item.lat),
        lon: Number(item.lon),
      }));

      setSearchResults(places);

      if (places.length === 0) {
        setSearchError(
          "No places found. Try another name or select directly on the map."
        );
      }
    } catch {
      setSearchError(
        "Unable to search right now. You can still select a location on the map."
      );
    } finally {
      setSearching(false);
    }
  }

  function locateCurrentPosition() {
    setSearchError("");

    if (!navigator.geolocation) {
      setSearchError("Your browser does not support location detection.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        onSelect(
          result.coords.latitude,
          result.coords.longitude
        );
        setLocating(false);
      },
      () => {
        setLocating(false);
        setSearchError(
          "Could not access your location. Allow location permission or select the place manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <Paper
        variant="outlined"
        sx={{ p: 2, mb: 2, borderRadius: 2 }}
      >
        <Typography fontWeight={600} sx={{ mb: 1 }}>
          Search for the garage location
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Area, city or place"
            placeholder="Example: Sohar, Al Khuwair, Muscat"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setSearchError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void searchPlaces();
              }
            }}
          />

          <Button
            variant="contained"
            startIcon={
              searching ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SearchIcon />
              )
            }
            onClick={() => void searchPlaces()}
            disabled={searching || !searchText.trim()}
            sx={{ minWidth: { sm: 120 } }}
          >
            Search
          </Button>
        </Box>

        {searchResults.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {searchResults.map((place, index) => (
              <Button
                key={`${place.lat}-${place.lon}-${index}`}
                fullWidth
                color="inherit"
                onClick={() => {
                  onSelect(place.lat, place.lon);
                  setSearchResults([]);
                  setSearchText(place.label);
                  setSearchError("");
                }}
                sx={{
                  justifyContent: "flex-start",
                  textAlign: "left",
                  textTransform: "none",
                  py: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  borderRadius: 0,
                }}
              >
                {place.label}
              </Button>
            ))}
          </Box>
        )}

        {searchError && (
          <Alert severity="info" sx={{ mt: 1 }}>
            {searchError}
          </Alert>
        )}

        <Button
          variant="outlined"
          startIcon={
            locating ? (
              <CircularProgress size={18} />
            ) : (
              <MyLocationIcon />
            )
          }
          onClick={locateCurrentPosition}
          disabled={locating}
          sx={{ mt: 2 }}
        >
          {locating ? "Finding location..." : "Use my current location"}
        </Button>

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          You do not need to be at the garage. Search for its address
          or select its location directly on the map.
        </Typography>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ overflow: "hidden", borderRadius: 2 }}
      >
        <MapContainer
          center={position ?? initialCenter}
          zoom={position ? 16 : 7}
          style={{ height: 380, width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={onSelect} />

          <MapCenterUpdater position={position} />

          {position && (
            <CircleMarker
              center={position}
              radius={10}
              pathOptions={{
                color: "#FFFFFF",
                weight: 3,
                fillColor: "#1677FF",
                fillOpacity: 1,
              }}
            >
              <Popup>Selected Garage Location</Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </Paper>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Click anywhere on the map to choose the garage location.
        You can zoom in to select a more accurate position.
      </Typography>

      {position && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Garage location selected
          </Typography>
          <Typography variant="body2">
            Latitude: {position[0].toFixed(6)}
          </Typography>
          <Typography variant="body2">
            Longitude: {position[1].toFixed(6)}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

export default function RequestGarage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Form>({
    mode: "onTouched",
    defaultValues: {
      garageName: "",
      commercialRegisterNumber: "",
      governorate: "",
      state: "",
      latitude: "",
      longitude: "",
      certificateFile: null,
    },
  });

  const r = rules(t);

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const position: [number, number] | null =
    latitude?.trim() !== "" &&
    latitude !== undefined &&
    longitude?.trim() !== "" &&
    longitude !== undefined &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude)) &&
    Number(latitude) >= -90 &&
    Number(latitude) <= 90 &&
    Number(longitude) >= -180 &&
    Number(longitude) <= 180
      ? [Number(latitude), Number(longitude)]
      : null;

  function handleLocationSelect(lat: number, lng: number) {
    setValue("latitude", lat.toFixed(6), {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("longitude", lng.toFixed(6), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  async function submitForm(data: Form) {
    const formData = new FormData();

    (Object.keys(data) as (keyof Form)[]).forEach((key) => {
      const value = data[key];

      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "string") {
        formData.append(key, value.trim());
      }
    });

    try {
      const response = await dispatch(
        requestGarageAsync(formData)
      ).unwrap();

      notifySuccess(response.message);
      navigate(paths.ownerGarages);
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  }

  return (
    <>
      <PageHeader
        title={t("menu.requestGarage")}
        subtitle={t("requestGarage.subtitle")}
      />

      <Container
        component={Paper}
        maxWidth="md"
        sx={{ p: { xs: 2, sm: 4 }, mx: 0 }}
      >
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("requestGarage.approvalNotice")}
        </Alert>

        <Box
          component="form"
          onSubmit={handleSubmit(submitForm)}
          noValidate
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AppTextInput
                name="garageName"
                label={t("fields.garageName")}
                control={control}
                rules={r.required}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <AppTextInput
                name="commercialRegisterNumber"
                label={t("fields.commercialRegisterNumber")}
                control={control}
                rules={r.required}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <AppTextInput
                name="governorate"
                label={t("fields.governorate")}
                control={control}
                rules={r.required}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <AppTextInput
                name="state"
                label={t("fields.state")}
                control={control}
                rules={r.required}
              />
            </Grid>

            <Grid size={12}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                sx={{ mb: 1 }}
              >
                Select Garage Location
              </Typography>

              <LocationMapPicker
                position={position}
                onSelect={handleLocationSelect}
              />
            </Grid>

            <Grid size={12}>
              <AppFileInput
                name="certificateFile"
                control={control}
                label={`${t("fields.certificateFile")} *`}
                buttonLabel={t("common.chooseFile")}
                rules={{
                  required: t("validation.required"),
                }}
              />
            </Grid>
          </Grid>

          <LoadingButton
            loading={isSubmitting}
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
          >
            {t("requestGarage.button")}
          </LoadingButton>
        </Box>
      </Container>
    </>
  );
}
