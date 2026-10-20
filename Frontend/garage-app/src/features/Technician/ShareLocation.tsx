
import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Container,
  Typography,
} from "@mui/material";

import { useTranslation } from "react-i18next";

import agent from "../../app/api/agent";
import PageHeader from "../../app/components/PageHeader";
import { toAppError } from "../../app/utils/error";
import {
  notifyError,
  notifySuccess,
} from "../../app/utils/notify";

import type { TechnicianAssignment } from "../../app/models/TechnicianAssignment";
import TechnicianTaskCard from "./TechnicianTaskCard";

export default function ShareLocation() {
  const { t } = useTranslation();

  const [assignments, setAssignments] = useState<
    TechnicianAssignment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [locatingAssignmentId, setLocatingAssignmentId] =
    useState<number | null>(null);

  const [sendingAssignmentId, setSendingAssignmentId] =
    useState<number | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      const response = await agent.Assignments.getMyAssignments();
      setAssignments(response);
    } catch (error) {
      notifyError(t, toAppError(error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAssignments();
  }, [loadAssignments]);

  const shareLocation = async (
    assignment: TechnicianAssignment
  ) => {
    if (!navigator.geolocation) {
      notifyError(
        t,
        "Location is not supported by your browser."
      );
      return;
    }

    setLocatingAssignmentId(assignment.assignmentId);

    navigator.geolocation.watchPosition(
      async (position) => {

        setLocatingAssignmentId(null);
        setSendingAssignmentId(assignment.assignmentId);

        try {
          const response =
            await agent.Assignments.updateLocation(
              assignment.assignmentId,
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            );

          notifySuccess(response.message);
          await loadAssignments();
        } catch (error) {
          notifyError(t, toAppError(error).message);
        } finally {
          setSendingAssignmentId(null);
        }
      },
      () => {
        setLocatingAssignmentId(null);

        notifyError(
          t,
          "Unable to get your location. Please allow location permission."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Container maxWidth="lg">
      <PageHeader
        title="Share Location"
        subtitle="View your assigned tasks and share your location for each task."
      />

      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 700 }}
        >
          My Tasks
        </Typography>

{!loading && assignments.length === 0 ? (
  <Alert severity="info">
    You currently have no assigned tasks.
  </Alert>
) : (
  !loading && (
    <TechnicianTaskCard
      assignments={assignments}
      locatingAssignmentId={locatingAssignmentId}
      sendingAssignmentId={sendingAssignmentId}
      onShareLocation={shareLocation}
    />
  )
)}

      
      </Box>
    </Container>
  );
}
