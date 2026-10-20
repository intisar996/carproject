import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppTextInput from "../../app/components/AppTextInput";
import type { ServiceOption, ServiceOptionRequest } from "../../app/models/Service";
import { rules } from "../../app/utils/validation";

interface Props {
  open: boolean;
  option: ServiceOption | null; 
  saving: boolean;
  onSubmit: (values: ServiceOptionRequest) => void;
  onClose: () => void;
}

export default function OptionDialog({ open, option, saving, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<ServiceOptionRequest>({
    mode: "onTouched",
    defaultValues: { type: "", size: "", brand: "" },
  });

  useEffect(() => {
    if (open) reset({ type: option?.type ?? "", size: option?.size ?? "", brand: option?.brand ?? "" });
  }, [open, option, reset]);

  const submit = (values: ServiceOptionRequest) =>
    onSubmit({ type: values.type.trim(), size: values.size?.trim() ?? "", brand: values.brand?.trim() ?? "" });

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle>{option ? t("options.edit") : t("options.create")}</DialogTitle>
        <DialogContent>
          <AppTextInput name="type" control={control} label={t("fields.type")} rules={rules(t).required} />
          <AppTextInput name="size" control={control} label={`${t("fields.size")} (${t("common.optional")})`} />
          <AppTextInput name="brand" control={control} label={`${t("fields.brand")} (${t("common.optional")})`} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
          <LoadingButton type="submit" variant="contained" loading={saving}>{t("common.save")}</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
