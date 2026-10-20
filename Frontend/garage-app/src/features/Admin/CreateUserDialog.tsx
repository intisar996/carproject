import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppSelect from "../../app/components/AppSelect";
import AppTextInput from "../../app/components/AppTextInput";
import { Role } from "../../app/models/enums";
import type { UserRequest } from "../../app/models/User";
import { rules } from "../../app/utils/validation";

interface Props {
  open: boolean;
  saving: boolean;
  onSubmit: (values: UserRequest) => void;
  onClose: () => void;
}

interface Form {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export default function CreateUserDialog({ open, saving, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<Form>({
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", phone: "", password: "", role: Role.GARAGE_OWNER },
  });
  const r = rules(t);

  const submit = (values: Form) =>
    onSubmit({ ...values, email: values.email.trim(), role: values.role as UserRequest["role"] });

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onExited: () => reset() } }}
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle>{t("users.create")}</DialogTitle>
        <DialogContent>
          <AppTextInput name="fullName" control={control} label={t("fields.fullName")} rules={r.required} />
          <AppTextInput name="email" control={control} label={t("fields.email")} rules={r.email} />
          <AppTextInput name="phone" control={control} label={t("fields.phone")} rules={r.phone} />
          <AppTextInput name="password" control={control} label={t("fields.password")} type="password" rules={r.password} autoComplete="new-password" />
          <AppSelect
            name="role"
            control={control}
            label={t("fields.role")}
            rules={r.required}
            options={Object.values(Role).map((role) => ({ value: role, label: t(`role.${role}`) }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
          <LoadingButton type="submit" variant="contained" loading={saving}>{t("common.create")}</LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
