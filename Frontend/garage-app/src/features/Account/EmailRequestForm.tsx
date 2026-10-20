import { useState, type ReactNode } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AppTextInput from "../../app/components/AppTextInput";
import AuthCard from "../../app/components/AuthCard";
import type { MessageResponse } from "../../app/models/Common";
import { toAppError } from "../../app/utils/error";
import { notifyError } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface Props {
  title: string;
  description: string;
  buttonLabel: string;
  icon: ReactNode;
  submit: (email: string) => Promise<MessageResponse>;
}

export default function EmailRequestForm({ title, description, buttonLabel, icon, submit }: Props) {
  const { t } = useTranslation();
  const [message, setMessage] = useState<string | null>(null);
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<{ email: string }>({
    mode: "onTouched",
  });

  async function submitForm({ email }: { email: string }) {
    try {
      const response = await submit(email.trim());
      setMessage(response.message);
    } catch (error) {
      notifyError(t, toAppError(error).message);
    }
  }

  return (
    <AuthCard title={title} icon={icon}>
      <Typography variant="body2" color="text.secondary" align="center">
        {description}
      </Typography>
      <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 1, width: "100%" }}>
        {message && <Alert severity="success" sx={{ mt: 1 }}>{message}</Alert>}
        <AppTextInput name="email" label={t("fields.email")} control={control} rules={rules(t).email} autoComplete="email" />
        <LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" sx={{ mt: 2, mb: 2 }}>
          {buttonLabel}
        </LoadingButton>
        <Typography variant="body2" align="center">
          <Link to={paths.login}>{t("common.backToLogin")}</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
