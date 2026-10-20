import { Box, CircularProgress } from "@mui/material";

interface Props {
  minHeight?: number | string;
}

export default function LoadingState({ minHeight = 240 }: Props) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight }}>
      <CircularProgress />
    </Box>
  );
}
