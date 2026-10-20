import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppTextInput from "../../app/components/AppTextInput";
import type { TechnicianRequest } from "../../app/models/Technician";
import { rules } from "../../app/utils/validation";

interface Props {
  open: boolean;
  saving: boolean;
  onSubmit: (values: TechnicianRequest) => void;
  onClose: () => void;
}

interface Form {
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  salary: string;
}

export default function AddTechnicianDialog({ open, saving, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<Form>({
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", phone: "", specialization: "", salary: "" },
  });
  const r = rules(t);

  const submit = (values: Form) =>
    onSubmit({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      specialization: values.specialization.trim() || undefined,
      salary: Number(values.salary),
    });

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onExited: () => reset() } }}
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle>{t("technicians.add")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("technicians.addNotice")}</DialogContentText>
          <AppTextInput name="fullName" control={control} label={t("fields.fullName")} rules={r.required} />
          <AppTextInput name="email" control={control} label={t("fields.email")} rules={r.email} />
          <AppTextInput name="phone" control={control} label={t("fields.phone")} rules={r.phone} />
          <AppTextInput name="specialization" control={control} label={`${t("fields.specialization")} (${t("common.optional")})`} />
          <AppTextInput name="salary" control={control} label={t("fields.salary")} type="number" rules={r.positiveNumber} slotProps={{ htmlInput: { step: "any", min: 0 } }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
          <LoadingButton type="submit" variant="contained" loading={saving}>{t("common.create")}</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
