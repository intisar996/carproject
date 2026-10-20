import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadingState from "../../app/components/LoadingState";
import type { Technician } from "../../app/models/Technician";

interface Props {
  open: boolean;
  technician: Technician | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

export default function TechnicianDetailsDialog({ open, technician, onClose }: Props) {
  const { t } = useTranslation();
  const yesNo = (value: boolean | null) => (value === null ? "—" : value ? t("common.yes") : t("common.no"));
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("technicians.details")}</DialogTitle>
      <DialogContent dividers>
        {!technician ? (
          <LoadingState minHeight={160} />
        ) : (
          <>
            <Field label={t("fields.fullName")} value={technician.fullName} />
            <Field label={t("fields.email")} value={technician.email} />
            <Field label={t("fields.phone")} value={technician.phone} />
            <Field label={t("fields.specialization")} value={technician.specialization ?? "—"} />
            <Field label={t("fields.salary")} value={technician.salary === null ? "—" : String(technician.salary)} />
            <Field label={t("technicians.available")} value={yesNo(technician.isAvailable)} />
            <Field label={t("technicians.accountActive")} value={yesNo(technician.isActive)} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
