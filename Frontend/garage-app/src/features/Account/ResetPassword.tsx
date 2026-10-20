import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import TokenPasswordForm from "./TokenPasswordForm";

export default function ResetPassword() {
  const { t } = useTranslation();
  return <TokenPasswordForm title={t("resetPassword.title")} submit={agent.Account.resetPassword} />;
}
