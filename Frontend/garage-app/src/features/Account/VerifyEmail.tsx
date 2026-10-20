import { useEffect, useRef, useState } from "react";
import { Alert, Button } from "@mui/material";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import AuthCard from "../../app/components/AuthCard";
import LoadingState from "../../app/components/LoadingState";
import { toAppError } from "../../app/utils/error";
import { translateError } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";

type State = { kind: "loading" } | { kind: "success"; message: string } | { kind: "error"; message: string };

export default function VerifyEmail() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>(
    token ? { kind: "loading" } : { kind: "error", message: t("verifyEmail.missingToken") },
  );
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;
    agent.Account.verifyEmail(token)
      .then((response) => setState({ kind: "success", message: response.message }))
      .catch((error: unknown) => setState({ kind: "error", message: toAppError(error).message }));
  }, [token]);

  return (
    <AuthCard title={t("verifyEmail.title")} icon={<MarkEmailReadIcon />}>
      {state.kind === "loading" && <LoadingState minHeight={120} />}
      {state.kind === "success" && (
        <>
          <Alert severity="success" sx={{ width: "100%", mb: 2 }}>{state.message}</Alert>
          <Button component={Link} to={paths.login} variant="contained">
            {t("login.button")}
          </Button>
        </>
      )}
      {state.kind === "error" && (
        <>
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>{translateError(t, state.message)}</Alert>
          <Button component={Link} to={paths.resendVerification} variant="contained">
            {t("login.resendVerification")}
          </Button>
        </>
      )}
    </AuthCard>
  );
}
