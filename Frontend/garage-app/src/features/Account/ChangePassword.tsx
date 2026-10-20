import { Box, Container, Paper } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import AppTextInput from "../../app/components/AppTextInput";
import PageHeader from "../../app/components/PageHeader";
import { toAppError } from "../../app/utils/error";
import { notifyError, notifySuccess } from "../../app/utils/notify";
import { rules } from "../../app/utils/validation";

interface Form {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const { t } = useTranslation();
  const { handleSubmit, control, getValues, reset, formState: { isSubmitting } } = useForm<Form>({ mode: "onTouched" });
  const r = rules(t);

  async function submitForm({ currentPassword, newPassword }: Form) {
    try {
      const response = await agent.Account.changePassword({ currentPassword, newPassword });
      notifySuccess(response.message);
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      notifyError(t, toAppError(error).message);
    }
  }

  return (
    <>
      <PageHeader title={t("menu.changePassword")} />
      <Container component={Paper} maxWidth="sm" sx={{ p: 4, mx: 0 }}>
        <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate>
          <AppTextInput name="currentPassword" label={t("fields.currentPassword")} type="password" control={control} rules={r.required} autoComplete="current-password" />
          <AppTextInput name="newPassword" label={t("fields.newPassword")} type="password" control={control} rules={r.password} autoComplete="new-password" />
          <AppTextInput
            name="confirmPassword"
            label={t("fields.confirmPassword")}
            type="password"
            control={control}
            rules={r.matches(() => getValues("newPassword"))}
            autoComplete="new-password"
          />
          <LoadingButton loading={isSubmitting} type="submit" variant="contained" sx={{ mt: 2 }}>
            {t("common.save")}
          </LoadingButton>
        </Box>
      </Container>
    </>
  );
}
