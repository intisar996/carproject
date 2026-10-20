import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  onLocationSelect: (
    latitude: number,
    longitude: number
  ) => void;
}

interface PositionProps {
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ position, onSelect }: PositionProps) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? (
    <Marker position={position} icon={markerIcon} />
  ) : null;
}

function MapCenter({ position }: { position: [number, number] | null }) {
  const map = useMap();

  if (position) {
    map.setView(position, 16);
  }

  return null;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export default function LocationPicker({
  onLocationSelect,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLocationSelect = (lat: number, lng: number) => {

    setPosition([lat, lng]);
    setResults([]);
    setError("");

    onLocationSelect(lat, lng);
  };

  const searchPlaces = async () => {
    if (!search.trim()) {
      setError("Please enter a place name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(search)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: SearchResult[] = await response.json();

      setResults(data);

      if (data.length === 0) {
        setError("No places found. Try another search.");
      }
    } catch {
      setError("Unable to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser does not support location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        handleLocationSelect(
          coords.latitude,
          coords.longitude
        );
      },
      () => {
        setError("Please allow location access in your browser.");
      }
    );
  };

  const chooseSearchResult = (result: SearchResult) => {
    handleLocationSelect(Number(result.lat), Number(result.lon));
    setSearch(result.display_name);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography sx={{fontWeight:"bold"}}>
        Select Location
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search city, area, or address"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void searchPlaces();
            }
          }}
        />

        <Button
          variant="contained"
          onClick={() => void searchPlaces()}
          disabled={loading}
          aria-label="Search places"
        >
          <SearchIcon />
        </Button>
      </Box>

      {results.map((result, index) => (
        <Button
          key={`${result.lat}-${result.lon}-${index}`}
          variant="outlined"
          color="inherit"
          sx={{ justifyContent: "flex-start", textAlign: "left" }}
          onClick={() => chooseSearchResult(result)}
        >
          {result.display_name}
        </Button>
      ))}

      <Button
        variant="outlined"
        startIcon={<LocationOnIcon />}
        onClick={handleCurrentLocation}
      >
        Use My Current Location
      </Button>

      <Box
        sx={{
          height: 350,
          width: "100%",
          overflow: "hidden",
          borderRadius: 2,
          "& .leaflet-container": {
            height: "100%",
            width: "100%",
          },
        }}
      >
        <MapContainer
          center={[23.588, 58.3829]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler
            position={position}
            onSelect={handleLocationSelect}
          />

          <MapCenter position={position} />
        </MapContainer>
      </Box>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      {position && (
        <Typography variant="body2" color="success.main">
          Location selected successfully.
          <br />
          Latitude: {position[0]}
          <br />
          Longitude: {position[1]}
        </Typography>
      )}
    </Box>
  );
}