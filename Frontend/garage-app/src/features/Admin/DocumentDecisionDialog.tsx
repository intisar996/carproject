import { useEffect } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import AppSelect from "../../app/components/AppSelect";
import AppTextInput from "../../app/components/AppTextInput";
import { RequestStatus } from "../../app/models/enums";
import type { DecisionRequest, RegistrationDocument } from "../../app/models/RegistrationDocument";

interface Props {
  document: RegistrationDocument | null;
  saving: boolean;
  onSubmit: (values: DecisionRequest) => void;
  onClose: () => void;
}

interface Form {
  status: string;
  reason: string;
}

export default function DocumentDecisionDialog({ document, saving, onSubmit, onClose }: Props) {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<Form>({
    mode: "onTouched",
    defaultValues: { status: RequestStatus.APPROVED, reason: "" },
  });
  const status = useWatch({ control, name: "status" });

  useEffect(() => {
    if (document) reset({ status: RequestStatus.APPROVED, reason: "" });
  }, [document, reset]);

  const submit = (values: Form) =>
    onSubmit({
      status: values.status as DecisionRequest["status"],
      reason: values.status === RequestStatus.REJECTED ? values.reason.trim() : undefined,
    });

  return (
    <Dialog open={Boolean(document)} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(submit)} noValidate>
        <DialogTitle>{t("documents.decisionTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {document && t("documents.decisionFor", { garage: document.garageName, owner: document.ownerName })}
          </DialogContentText>
          <AppSelect
            name="status"
            control={control}
            label={t("fields.decision")}
            options={[
              { value: RequestStatus.APPROVED, label: t("status.APPROVED") },
              { value: RequestStatus.REJECTED, label: t("status.REJECTED") },
            ]}
          />
          {status === RequestStatus.REJECTED && (
            <AppTextInput
              name="reason"
              control={control}
              label={t("fields.rejectionReason")}
              multiline
              rows={3}
              rules={{ required: t("validation.required") }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
          <LoadingButton type="submit" variant="contained" loading={saving} color={status === RequestStatus.REJECTED ? "error" : "success"}>
            {t("common.confirm")}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
