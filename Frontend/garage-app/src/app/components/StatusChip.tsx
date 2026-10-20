import { Chip } from "@mui/material";
import { useTranslation } from "react-i18next";

type ChipColor = "default" | "success" | "warning" | "error" | "info";

const COLORS: Record<string, ChipColor> = {
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  REJECTED: "error",
  ACTIVE: "success",
  INACTIVE: "default",
};

interface Props {
  status: string;
}

export default function StatusChip({ status }: Props) {
  const { t } = useTranslation();
  return (
    <Chip
      size="small"
      color={COLORS[status] ?? "default"}
      label={t(`status.${status}`, status)}
      variant={COLORS[status] === "default" || !COLORS[status] ? "outlined" : "filled"}
    />
  );
}
