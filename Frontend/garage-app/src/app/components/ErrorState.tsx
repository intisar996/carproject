import { Alert, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import { translateError } from "../utils/notify";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  const { t } = useTranslation();
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            {t("common.retry")}
          </Button>
        )
      }
    >
      {translateError(t, message)}
    </Alert>
  );
}
