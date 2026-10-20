import { useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { PersonAddOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import AppTextInput from "../../app/components/AppTextInput";
import AuthCard from "../../app/components/AuthCard";
import { notifyError, notifySuccess } from "../../app/utils/notify";
import { toAppError } from "../../app/utils/error";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface SignupForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const { t } = useTranslation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { handleSubmit, control, getValues, formState: { isSubmitting } } = useForm<SignupForm>({
    mode: "onTouched",
  });
  const r = rules(t);

  async function submitForm(values: SignupForm) {
    try {
      const response = await agent.Account.signup({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      });
      notifySuccess(response.message);
      setSuccessMessage(response.message);
    } catch (error) {
      notifyError(t, toAppError(error).message);
    }
  }

  if (successMessage) {
    return (
      <AuthCard title={t("signup.successTitle")} icon={<PersonAddOutlined />}>
        <Alert severity="success" sx={{ width: "100%", mb: 2 }}>{successMessage}</Alert>
        <Button component={Link} to={paths.resendVerification} sx={{ mb: 1 }}>
          {t("login.resendVerification")}
        </Button>
        <Button component={Link} to={paths.login} variant="contained">
          {t("login.button")}
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("signup.title")} icon={<PersonAddOutlined />}>
      <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 1, width: "100%" }}>
        <AppTextInput name="fullName" label={t("fields.fullName")} control={control} rules={r.required} autoComplete="name" />
        <AppTextInput name="email" label={t("fields.email")} control={control} rules={r.email} autoComplete="email" />
        <AppTextInput name="phone" label={t("fields.phone")} control={control} rules={r.phone} autoComplete="tel" />
        <AppTextInput name="password" label={t("fields.password")} type="password" control={control} rules={r.password} autoComplete="new-password" />
        <AppTextInput
          name="confirmPassword"
          label={t("fields.confirmPassword")}
          type="password"
          control={control}
          rules={r.matches(() => getValues("password"))}
          autoComplete="new-password"
        />
        <LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("signup.button")}
        </LoadingButton>
        <Typography variant="body2" color="text.secondary" align="center">
          {t("signup.haveAccount")} <Link to={paths.login}>{t("nav.login")}</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
