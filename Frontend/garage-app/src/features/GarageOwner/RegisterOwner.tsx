import { Box, Container, Grid, Paper, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { PersonAddOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { registerOwnerAsync } from "./ownerSlice";
import { useAppDispatch } from "../../store/configureStore";
import AppFileInput from "../../app/components/AppFileInput";
import AppTextInput from "../../app/components/AppTextInput";
import { notifyError, notifySuccess } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface Form {
  fullName: string;
  garageName: string;
  email: string;
  phone: string;
  password: string;
  commercialRegisterNumber: string;
  governorate: string;
  state: string;
  latitude: string;
  longitude: string;
  mapAddress: string;
  certificateFile: File | null;
}

export default function RegisterOwner() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<Form>({ mode: "onTouched" });
  const r = rules(t);

  async function submitForm(data: Form) {
    const formData = new FormData();
    (Object.keys(data) as (keyof Form)[]).forEach((key) => {
      const value = data[key];
      if (key === "certificateFile") {
        if (value instanceof File) formData.append("certificateFile", value);
      } else if (typeof value === "string" && value.trim() !== "") {
        formData.append(key, value.trim());
      }
    });

    try {
      const response = await dispatch(registerOwnerAsync(formData)).unwrap();
      notifySuccess(response.message);
      navigate(paths.login);
    } catch (error) {
      notifyError(t, typeof error === "string" ? error : "");
    }
  }

  return (
    <Container component={Paper} maxWidth="md" sx={{ p: 4, mt: 2, mb: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <PersonAddOutlined sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
        <Typography component="h1" variant="h5">{t("registerOwner.title")}</Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
          {t("registerOwner.description")}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="fullName" label={t("fields.fullName")} control={control} rules={r.required} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="garageName" label={t("fields.garageName")} control={control} rules={r.required} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="email" label={t("fields.email")} control={control} rules={r.email} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="phone" label={t("fields.phone")} control={control} rules={r.phone} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="password" label={t("fields.password")} type="password" control={control} rules={r.password} autoComplete="new-password" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="commercialRegisterNumber" label={t("fields.commercialRegisterNumber")} control={control} rules={{ ...r.required, maxLength: { value: 50, message: t("validation.maxLength", { count: 50 }) } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="governorate" label={t("fields.governorate")} control={control} rules={r.required} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="state" label={t("fields.state")} control={control} rules={r.required} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="latitude" label={t("fields.latitude")} type="number" control={control} rules={r.latitude} slotProps={{ htmlInput: { step: "any" } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <AppTextInput name="longitude" label={t("fields.longitude")} type="number" control={control} rules={r.longitude} slotProps={{ htmlInput: { step: "any" } }} />
          </Grid>
          <Grid size={12}>
            <AppTextInput name="mapAddress" label={`${t("fields.mapAddress")} (${t("common.optional")})`} control={control} />
          </Grid>
          <Grid size={12}>
            <AppFileInput
              name="certificateFile"
              control={control}
              label={`${t("fields.certificateFile")} *`}
              buttonLabel={t("common.chooseFile")}
              rules={{ required: t("validation.required") }}
            />
          </Grid>
        </Grid>

        <LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
          {t("registerOwner.button")}
        </LoadingButton>

        <Typography variant="body2" color="text.secondary" align="center">
          {t("signup.haveAccount")} <Link to={paths.login}>{t("nav.login")}</Link>
        </Typography>
      </Box>
    </Container>
  );
}
