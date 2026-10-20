import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link as MuiLink,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import LoadingState from "../../app/components/LoadingState";
import StatusChip from "../../app/components/StatusChip";
import type { RegistrationDocument } from "../../app/models/RegistrationDocument";

interface Props {
  open: boolean;
  loading: boolean;
  document: RegistrationDocument | null;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body1" component="div">{children || "—"}</Typography>
    </Box>
  );
}

export default function DocumentDetailsDialog({ open, loading, document, onClose }: Props) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("documents.details")}</DialogTitle>
      <DialogContent dividers>
        {loading || !document ? (
          <LoadingState minHeight={160} />
        ) : (
          <>
            <Field label={t("fields.status")}><StatusChip status={document.status} /></Field>
            <Field label={t("fields.garageName")}>{document.garageName}</Field>
            <Field label={t("fields.ownerName")}>{document.ownerName}</Field>
            <Field label={t("fields.email")}>{document.ownerEmail}</Field>
            <Field label={t("fields.phone")}>{document.ownerPhone}</Field>
            <Field label={t("fields.commercialRegisterNumber")}>{document.commercialRegisterNumber}</Field>
            <Field label={t("fields.governorate")}>{document.governorate}</Field>
            <Field label={t("fields.state")}>{document.state}</Field>
            <Field label={t("fields.location")}>
              {document.googleMapsUrl && (
                <MuiLink href={document.googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  {t("documents.openInMaps")}
                </MuiLink>
              )}
            </Field>
            <Field label={t("fields.certificateFile")}>{document.registerCertificateFile}</Field>
            <Alert severity="info" sx={{ mt: 1 }}>{t("documents.noDownload")}</Alert>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
