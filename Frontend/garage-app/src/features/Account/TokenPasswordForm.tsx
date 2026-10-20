import { useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppTextInput from "../../app/components/AppTextInput";
import AuthCard from "../../app/components/AuthCard";
import type { MessageResponse } from "../../app/models/Common";
import type { ResetPasswordRequest } from "../../app/models/User";
import { toAppError } from "../../app/utils/error";
import { notifyError } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface Props {
  title: string;
  submit: (values: ResetPasswordRequest) => Promise<MessageResponse>;
}

interface Form {
  newPassword: string;
  confirmPassword: string;
}

export default function TokenPasswordForm({ title, submit }: Props) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [done, setDone] = useState<string | null>(null);
  const { handleSubmit, control, getValues, formState: { isSubmitting } } = useForm<Form>({ mode: "onTouched" });
  const r = rules(t);

  async function submitForm({ newPassword }: Form) {
    if (!token) return;
    try {
      const response = await submit({ token, newPassword });
      setDone(response.message);
    } catch (error) {
      notifyError(t, toAppError(error).message);
    }
  }

  return (
    <AuthCard title={title} icon={<LockResetIcon />}>
      {!token ? (
        <>
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{t("tokenPassword.missingToken")}</Alert>
          <Button component={Link} to={paths.forgotPassword} variant="contained">
            {t("forgotPassword.title")}
          </Button>
        </>
      ) : done ? (
        <>
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>{done}</Alert>
          <Button component={Link} to={paths.login} variant="contained">
            {t("login.button")}
          </Button>
        </>
      ) : (
        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 1, width: "100%" }}>
          <AppTextInput name="newPassword" label={t("fields.newPassword")} type="password" control={control} rules={r.password} autoComplete="new-password" />
          <AppTextInput
            name="confirmPassword"
            label={t("fields.confirmPassword")}
            type="password"
            control={control}
            rules={r.matches(() => getValues("newPassword"))}
            autoComplete="new-password"
          />
          <LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }}>
            {t("tokenPassword.button")}
          </LoadingButton>
          <Typography variant="body2" align="center">
            <Link to={paths.login}>{t("common.backToLogin")}</Link>
          </Typography>
        </Box>
      )}
    </AuthCard>
  );
}
