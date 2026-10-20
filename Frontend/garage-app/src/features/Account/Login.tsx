import { useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { LockOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signInAsync } from "./accountSlice";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import AppTextInput from "../../app/components/AppTextInput";
import AuthCard from "../../app/components/AuthCard";
import type { LoginRequest } from "../../app/models/User";
import { translateError } from "../../app/utils/notify";
import { homePathForRole, paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface LocationState {
  from?: { pathname?: string };
}

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.account.user);
  const [serverError, setServerError] = useState<string | null>(null);

  const { handleSubmit, control, formState: { isSubmitting } } = useForm<LoginRequest>({
    mode: "onTouched",
  });
  const r = rules(t);

  if (user) return <Navigate to={homePathForRole(user.role)} replace />;

  const from = (location.state as LocationState | null)?.from?.pathname;

  async function submitForm(values: LoginRequest) {
    setServerError(null);
    try {
      const signedIn = await dispatch(signInAsync(values)).unwrap();
      const home = homePathForRole(signedIn.role);
      const area = home.split("/")[1];
      const target = from && (from.startsWith(`/${area}/`) || from === paths.changePassword) ? from : home;
      navigate(target, { replace: true });
    } catch (error) {
      setServerError(translateError(t, typeof error === "string" ? error : ""));
    }
  }

  return (
    <AuthCard title={t("login.title")} icon={<LockOutlined />}>
      <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 1, width: "100%" }}>
        {serverError && <Alert severity="error" sx={{ mb: 1 }}>{serverError}</Alert>}

        <AppTextInput name="email" label={t("fields.email")} control={control} rules={r.email} autoComplete="email" />
        <AppTextInput
          name="password"
          label={t("fields.password")}
          type="password"
          control={control}
          rules={r.required}
          autoComplete="current-password"
        />

        <LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("login.button")}
        </LoadingButton>

        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="body2">
            <Link to={paths.forgotPassword}>{t("login.forgotPassword")}</Link>
          </Typography>
          <Typography variant="body2">
            <Link to={paths.resendVerification}>{t("login.resendVerification")}</Link>
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          {t("login.noAccount")} <Link to={paths.signup}>{t("nav.signup")}</Link>
          {" · "}
          <Link to={paths.registerOwner}>{t("nav.registerGarage")}</Link>
        </Typography>
      </Box>
    </AuthCard>
  );
}
