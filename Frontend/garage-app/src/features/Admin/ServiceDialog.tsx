import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppTextInput from "../../app/components/AppTextInput";
import type { ServiceItem, ServiceRequest } from "../../app/models/Service";
import { rules } from "../../app/utils/validation";

interface Props {
  open: boolean;
  service: ServiceItem | null; // null = create
  saving: boolean;
  onSubmit: (values: ServiceRequest) => void;
  onClose: () => void;
}

export default function ServiceDialog({ open, service, saving, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ServiceRequest>({ mode: "onTouched", defaultValues: { name: "" } });

  useEffect(() => {
    if (open) reset({ name: service?.name ?? "" });
  }, [open, service, reset]);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit((values) => onSubmit({ name: values.name.trim() }))} noValidate>
        <DialogTitle>{service ? t("services.edit") : t("services.create")}</DialogTitle>
        <DialogContent>
          <AppTextInput name="name" control={control} label={t("fields.serviceName")} rules={rules(t).required} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
          <LoadingButton type="submit" variant="contained" loading={saving}>{t("common.save")}</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
