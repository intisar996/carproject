import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import EmailRequestForm from "./EmailRequestForm";

export default function ResendVerification() {
  const { t } = useTranslation();
  return (
    <EmailRequestForm
      title={t("resendVerification.title")}
      description={t("resendVerification.description")}
      buttonLabel={t("resendVerification.button")}
      icon={<MarkEmailUnreadIcon />}
      submit={agent.Account.resendVerification}
    />
  );
}
