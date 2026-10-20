
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";

import agent from "../../app/api/agent";
import type { RepairPhoto } from "../../app/models/RepairPhoto";
import { toAppError } from "../../app/utils/error";
import { notifyError, notifySuccess } from "../../app/utils/notify";

type PhotoType = "BEFORE" | "DURING" | "AFTER";

type DisplayPhoto = RepairPhoto & {
  imageSrc: string;
};

type Props = {
  requestId: number;
};

export default function RepairPhotos({ requestId }: Props) {
  const { t } = useTranslation();

  const [photoType, setPhotoType] = useState<PhotoType>("BEFORE");
  const [file, setFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<DisplayPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadPhotos = useCallback(async () => {
    setLoading(true);

    let loadedPhotos: DisplayPhoto[] = [];

    try {
      const response =
        await agent.Assignments.getRepairPhotos(requestId);

      loadedPhotos = await Promise.all(
        response.map(async (photo) => {
          const image =
            await agent.Assignments.getRepairPhotoImage(
              requestId,
              photo.photoId
            );

          // getRepairPhotoImage must return a Blob.
          if (!(image instanceof Blob)) {
            throw new Error(
              "The image response is not a Blob. Check responseType in agent.ts."
            );
          }

          const imageSrc = URL.createObjectURL(image);

          return {
            ...photo,
            imageSrc,
          };
        })
      );

      setPhotos((previous) => {
        previous.forEach((photo) => {
          URL.revokeObjectURL(photo.imageSrc);
        });

        return loadedPhotos;
      });
    } catch (error) {
      loadedPhotos.forEach((photo) => {
        URL.revokeObjectURL(photo.imageSrc);
      });

      notifyError(t, toAppError(error).message);
    } finally {
      setLoading(false);
    }
  }, [requestId, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadPhotos();

    return () => {
      setPhotos((previous) => {
        previous.forEach((photo) => {
          URL.revokeObjectURL(photo.imageSrc);
        });

        return [];
      });
    };
  }, [loadPhotos]);

  const handleTypeChange = (
    event: SelectChangeEvent<PhotoType>
  ) => {
    setPhotoType(event.target.value as PhotoType);
  };

  const handleUpload = async () => {
    if (!file) {
      notifyError(t, "Please select an image first.");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      notifyError(t, "Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notifyError(t, "Image size must not exceed 5 MB.");
      return;
    }

    setUploading(true);

    try {
      await agent.Assignments.uploadRepairPhoto(
        requestId,
        photoType,
        file
      );

      setFile(null);
      notifySuccess("Photo uploaded successfully.");

      await loadPhotos();
    } catch (error) {
      notifyError(t, toAppError(error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700,color:"var(--navy-color) !important" }}>
        Repair Photos
      </Typography>

      <Stack spacing={2}>
        <FormControl fullWidth size="small">
          <InputLabel id={`photo-type-${requestId}`}>
            Photo stage
          </InputLabel>

          <Select
            labelId={`photo-type-${requestId}`}
            value={photoType}
            label="Photo stage"
            onChange={handleTypeChange}
          >
            <MenuItem value="BEFORE">Before repair</MenuItem>
            <MenuItem value="DURING">During repair</MenuItem>
            <MenuItem value="AFTER">After repair</MenuItem>
          </Select>
        </FormControl>

        <Button variant="outlined" component="label">
          {file ? file.name : "Choose image"}

          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
            }}
          />
        </Button>

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload photo"}
        </Button>
      </Stack>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 3,
          }}
        >
          <CircularProgress size={28} />
        </Box>
      )}

      {!loading && photos.length > 0 && (
        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {photos.map((photo) => (
            <Card key={photo.photoId} sx={{ overflow: "hidden" }}>
              <CardMedia
                component="img"
                image={photo.imageSrc}
                alt={`${photo.photoType} repair`}
                sx={{
                  height: 180,
                  objectFit: "cover",
                }}
                onError={() => {
                  console.error(
                    "Failed to display repair photo:",
                    photo.photoId
                  );
                }}
              />

              <Box sx={{ p: 1.5 }}>
                <Typography sx={{ fontWeight: 700 }}>
                  {photo.photoType}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {new Date(photo.capturedAt).toLocaleString()}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {!loading && photos.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No repair photos uploaded yet.
        </Alert>
      )}
    </Box>
  );
}
