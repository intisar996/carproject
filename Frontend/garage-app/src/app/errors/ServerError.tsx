import { Button, Container, Divider, Paper, Typography } from "@mui/material";
import { Link, useRouteError } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { paths } from "../utils/paths";

export default function ServerError() {
  const { t } = useTranslation();
  const error = useRouteError();
  const detail = error instanceof Error ? error.message : undefined;

  return (
    <Container component={Paper} maxWidth="sm" sx={{ p: 4, mt: 8, textAlign: "center" }}>
      <Typography gutterBottom variant="h5" color="secondary">
        {t("errors.serverError")}
      </Typography>
      <Divider sx={{ my: 2 }} />
      {detail && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {detail}
        </Typography>
      )}
      <Button component={Link} to={paths.home} variant="contained">
        {t("errors.goHome")}
      </Button>
    </Container>
  );
}
