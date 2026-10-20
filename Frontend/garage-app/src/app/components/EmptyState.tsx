import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import type { ReactNode } from "react";

interface Props {
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ message, action }: Props) {
  return (
    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
      <InboxOutlinedIcon sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="body1" sx={{ mb: action ? 2 : 0 }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}
