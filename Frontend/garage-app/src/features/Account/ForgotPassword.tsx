import LockResetIcon from "@mui/icons-material/LockReset";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import EmailRequestForm from "./EmailRequestForm";

export default function ForgotPassword() {
  const { t } = useTranslation();
  return (
    <EmailRequestForm
      title={t("forgotPassword.title")}
      description={t("forgotPassword.description")}
      buttonLabel={t("forgotPassword.button")}
      icon={<LockResetIcon />}
      submit={agent.Account.forgotPassword}
    />
  );
}
