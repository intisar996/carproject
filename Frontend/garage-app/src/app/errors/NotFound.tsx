import { Button, Container, Divider, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { paths } from "../utils/paths";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Container component={Paper} maxWidth="sm" sx={{ p: 4, mt: 8, textAlign: "center" }}>
      <Typography gutterBottom variant="h3">
        404
      </Typography>
      <Typography gutterBottom variant="h6">
        {t("errors.notFound")}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Button component={Link} to={paths.home} variant="contained">
        {t("errors.goHome")}
      </Button>
    </Container>
  );
}
