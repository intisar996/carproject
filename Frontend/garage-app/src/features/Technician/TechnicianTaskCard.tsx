
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";

import type { TechnicianAssignment } from "../../app/models/TechnicianAssignment";

type Props = {
  assignments: TechnicianAssignment[];
  onViewDetails: (assignment: TechnicianAssignment) => void;
};

const statusFilters = [
  { value: "ALL", label: "All Tasks" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "ON_THE_WAY", label: "On the Way" },
  { value: "ARRIVED", label: "Arrived" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusConfig: Record<
  string,
  {
    label: string;
    color: "default" | "primary" | "secondary" | "success" | "error" | "warning";
  }
> = {
  ASSIGNED: { label: "Assigned", color: "primary" },
  ON_THE_WAY: { label: "On the Way", color: "info" as "primary" },
  ARRIVED: { label: "Arrived", color: "warning" },
  IN_PROGRESS: { label: "In Progress", color: "warning" },
  COMPLETED: { label: "Completed", color: "success" },
  CANCELLED: { label: "Cancelled", color: "error" },
};

export default function TechnicianTaskCard({
  assignments,
  onViewDetails,
}: Props) {
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const filteredAssignments =
    selectedFilter === "ALL"
      ? assignments
      : assignments.filter(
          (assignment) => assignment.status === selectedFilter,
        );

  const getStatus = (status: string) =>
    statusConfig[status] ?? { label: status, color: "default" as const };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 2,
          mb: 1,
          "&::-webkit-scrollbar": { height: 5 },
        }}
      >
        {statusFilters.map((filter) => {
          const count =
            filter.value === "ALL"
              ? assignments.length
              : assignments.filter(
                  (assignment) => assignment.status === filter.value,
                ).length;

          const selected = selectedFilter === filter.value;

          return (
            <Button
              key={filter.value}
              variant={selected ? "contained" : "outlined"}
              onClick={() => setSelectedFilter(filter.value)}
              sx={{
                flexShrink: 0,
                px: 2,
                py: 1,
                borderRadius: 2.5,
                border: "1.5px solid var(--dark-oringe)",
                color: selected ? "var(--navy-color)" : "text.primary",
                bgcolor: selected ? "var(--dark-oringe)" : "transparent",
                fontWeight: 700,
                textTransform: "none",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: selected
                    ? "var(--dark-oringe)"
                    : "action.hover",
                },
              }}
            >
              {filter.label} ({count})
            </Button>
          );
        })}
      </Box>

      {filteredAssignments.length === 0 ? (
        <Alert severity="info">
          No tasks found in this status.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.5 },
            alignItems: "stretch",
          }}
        >
          {filteredAssignments.map((assignment) => {
            const status = getStatus(assignment.status);

            return (
              <Card
                key={assignment.assignmentId}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    p: { xs: 2, md: 2.5 },
                    "&:last-child": { pb: { xs: 2, md: 2.5 } },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 2,
                          bgcolor: "action.hover",
                          color: "var(--navy-color)",
                        }}
                      >
                        <AssignmentOutlinedIcon />
                      </Box>

                      <Box sx= {{flex:"display", justifyContent: "space-between",}}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Service Request
                        </Typography>

                        <Typography variant="h6" sx={{fontWeight :800 }}>
                          #{assignment.requestId}
                        </Typography>
                      </Box>
                    </Stack>

                    <Chip
                      size="small"
                      label={status.label}
                      color={status.color}
                      sx={{ fontWeight: 700, maxWidth: "48%" }}
                    />
                  </Stack>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      CUSTOMER
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{ overflowWrap: "anywhere", mt: 0.3,fontWeight :700 }}
                    >
                      {assignment.guestName || "Customer"}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 1 }}
                    >
                      <PhoneIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {assignment.guestPhone || "No phone provided"}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      p: 1.5,
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: "action.hover",
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <DirectionsCarIcon
                        sx={{ color: "text.secondary" }}
                      />

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ overflowWrap: "anywhere",fontWeight: 700 }}
                        >
                          {assignment.carMakeModel || "Vehicle"}
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Plate: {assignment.carPlateNumber || "—"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => onViewDetails(assignment)}
                    sx={{
                      mt: "auto",
                      minHeight: 46,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      textTransform: "none",
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
