import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import TokenPasswordForm from "./TokenPasswordForm";

export default function SetPassword() {
  const { t } = useTranslation();
  return <TokenPasswordForm title={t("setPassword.title")} submit={agent.Account.setPassword} />;
}
