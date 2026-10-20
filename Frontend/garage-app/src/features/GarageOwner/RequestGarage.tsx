import { Alert, Box, Container, Grid, Paper } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "../../store/configureStore";
import { requestGarageAsync } from "./garagesSlice";
import AppFileInput from "../../app/components/AppFileInput";
import AppTextInput from "../../app/components/AppTextInput";
import PageHeader from "../../app/components/PageHeader";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import { rules } from "../../app/utils/validation";

interface Form {
  garageName: string;
  commercialRegisterNumber: string;
  governorate: string;
  state: string;
  latitude: string;
  longitude: string;
  certificateFile: File | null;
}

export default function RequestGarage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { handleSubmit, control, formState: { isSubmitting } } = useForm<Form>({ mode: "onTouched" });
  const r = rules(t);

  async function submitForm(data: Form) {
    const formData = new FormData();
    (Object.keys(data) as (keyof Form)[]).forEach((key) => {
      const value = data[key];
      if (value instanceof File) formData.append(key, value);
      else if (typeof value === "string") formData.append(key, value.trim());
    });
    try {
      const response = await dispatch(requestGarageAsync(formData)).unwrap();
      notifySuccess(response.message);
      navigate(paths.ownerGarages);
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  }

  return (
    <>
      <PageHeader title={t("menu.requestGarage")} subtitle={t("requestGarage.subtitle")} />
      <Container component={Paper} maxWidth="md" sx={{ p: 4, mx: 0 }}>
        <Alert severity="info" sx={{ mb: 2 }}>{t("requestGarage.approvalNotice")}</Alert>
        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AppTextInput name="garageName" label={t("fields.garageName")} control={control} rules={r.required} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <AppTextInput name="commercialRegisterNumber" label={t("fields.commercialRegisterNumber")} control={control} rules={r.required} />
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
              <AppFileInput
                name="certificateFile"
                control={control}
                label={`${t("fields.certificateFile")} *`}
                buttonLabel={t("common.chooseFile")}
                rules={{ required: t("validation.required") }}
              />
            </Grid>
          </Grid>
          <LoadingButton loading={isSubmitting} type="submit" variant="contained" sx={{ mt: 3 }}>
            {t("requestGarage.button")}
          </LoadingButton>
        </Box>
      </Container>
    </>
  );
}
