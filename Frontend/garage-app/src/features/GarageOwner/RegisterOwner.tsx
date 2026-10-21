
import { useEffect, useState } from "react";
import {Alert,Box,Button,Container,Grid,Paper,TextField,Typography,CircularProgress,} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {PersonAddOutlined,MyLocation,Search,} from "@mui/icons-material";
import { MapContainer,TileLayer,Marker,Popup,useMap,useMapEvents,} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerOwnerAsync } from "./ownerSlice";
import { useAppDispatch } from "../../store/configureStore";
import AppFileInput from "../../app/components/AppFileInput";
import AppTextInput from "../../app/components/AppTextInput";
import { notifyError, notifySuccess } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface Form {
  fullName: string;
  garageName: string;
  email: string;
  phone: string;
  password: string;
  commercialRegisterNumber: string;
  governorate: string;
  state: string;
  latitude: string;
  longitude: string;
  mapAddress: string;
  certificateFile: File | null;
}

interface LocationMapPickerProps {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
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
      map.flyTo(position, 16, { animate: true });
    }
  }, [position, map]);

  return null;
}

function LocationMapPicker({
  position,
  onSelect,
}: LocationMapPickerProps) {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const defaultPosition: [number, number] = [23.5859, 58.4059];

  async function searchPlace() {
    if (!search.trim()) {
      setError("Please enter a city or area name.");
      return;
    }

    setSearching(true);
    setError("");

    try {
      const params = new URLSearchParams({
        q: search.trim(),
        format: "json",
        limit: "1",
        countrycodes: "om",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const results = await response.json();

      if (!results.length) {
        setError("Location not found. Please try another search.");
        return;
      }

      onSelect(Number(results[0].lat), Number(results[0].lon));
    } catch {
      setError("Unable to search for this location. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function useCurrentLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        onSelect(result.coords.latitude, result.coords.longitude);
        setLocating(false);
      },
      () => {
        setError(
          "Unable to get your location. Allow location access or select a point on the map."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Garage Location
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search for a city or area, then click on the map to select your
        garage location. You do not need to be physically at the garage.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void searchPlace();
            }
          }}
          placeholder="Search for a city or area in Oman"
          sx={{ flex: "1 1 220px" }}
        />

        <Button
          variant="contained"
          onClick={() => void searchPlace()}
          disabled={searching}
          aria-label="Search location"
        >
          {searching ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            <Search />
          )}
        </Button>

        <Button
          variant="outlined"
          onClick={useCurrentLocation}
          disabled={locating}
          aria-label="Use current location"
        >
          {locating ? (
            <CircularProgress size={22} />
          ) : (
            <MyLocation />
          )}
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          height: 350,
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          "& .leaflet-container": {
            height: "100%",
            width: "100%",
            zIndex: 0,
          },
        }}
      >
        <MapContainer
          center={position ?? defaultPosition}
          zoom={position ? 16 : 7}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onSelect={onSelect} />
          <MapCenterUpdater position={position} />

          {position && (
            <Marker position={position}>
              <Popup>Selected garage location</Popup>
            </Marker>
          )}
        </MapContainer>
      </Box>

      {position ? (
        <Alert severity="success" sx={{ mt: 2 }}>
          Garage location selected successfully. Click on the map to change it.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mt: 2 }}>
          Please select the garage location on the map before registering.
        </Alert>
      )}
    </Box>
  );
}

export default function RegisterOwner() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const r = rules(t);

  const {
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<Form>({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      garageName: "",
      email: "",
      phone: "",
      password: "",
      commercialRegisterNumber: "",
      governorate: "",
      state: "",
      latitude: "",
      longitude: "",
      mapAddress: "",
      certificateFile: null,
    },
  });

  const latitude = watch("latitude");
  const longitude = watch("longitude");

  const position: [number, number] | null =
    latitude !== "" &&
    longitude !== "" &&
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
      shouldDirty: true,
      shouldValidate: true,
    });

    setValue("longitude", lng.toFixed(6), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function submitForm(data: Form) {
    if (!data.latitude || !data.longitude) {
      notifyError(t, "Please select the garage location on the map.");
      return;
    }

    const formData = new FormData();

    (Object.keys(data) as (keyof Form)[]).forEach((key) => {
      const value = data[key];

      if (key === "certificateFile") {
        if (value instanceof File) {
          formData.append("certificateFile", value);
        }
      } else if (typeof value === "string" && value.trim() !== "") {
        formData.append(key, value.trim());
      }
    });

    try {
      const response = await dispatch(
        registerOwnerAsync(formData)
      ).unwrap();

      notifySuccess(response.message);
      navigate(paths.login);
    } catch (error) {
      notifyError(t, typeof error === "string" ? error : "");
    }
  }

  return (
    <Container
      component={Paper}
      maxWidth="md"
      sx={{ p: 4, mt: 2, mb: 4 }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
        }}
      >
        <PersonAddOutlined
          sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
        />

        <Typography component="h1" variant="h5">
          {t("registerOwner.title")}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          {t("registerOwner.description")}
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(submitForm)}
        noValidate
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput
              name="fullName"
              label={t("fields.fullName")}
              control={control}
              rules={r.required}
            />
          </Grid>

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
              name="email"
              label={t("fields.email")}
              control={control}
              rules={r.email}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput
              name="phone"
              label={t("fields.phone")}
              control={control}
              rules={r.phone}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput
              name="password"
              label={t("fields.password")}
              type="password"
              control={control}
              rules={r.password}
              autoComplete="new-password"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput
              name="commercialRegisterNumber"
              label={t("fields.commercialRegisterNumber")}
              control={control}
              rules={{
                ...r.required,
                maxLength: {
                  value: 50,
                  message: t("validation.maxLength", { count: 50 }),
                },
              }}
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
            <AppTextInput
              name="mapAddress"
              label={`${t("fields.mapAddress")} (${t("common.optional")})`}
              control={control}
            />
          </Grid>

          <Grid size={12}>
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
              rules={{ required: t("validation.required") }}
            />
          </Grid>
        </Grid>

        <LoadingButton
          loading={isSubmitting}
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          {t("registerOwner.button")}
        </LoadingButton>

        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
        >
          {t("signup.haveAccount")}{" "}
          <Link to={paths.login}>{t("nav.login")}</Link>
        </Typography>
      </Box>
    </Container>
  );
}
