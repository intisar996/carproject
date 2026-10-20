import { Button, Container, Divider, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../store/configureStore";
import { homePathForRole, paths } from "../utils/paths";

export default function Unauthorized() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.account.user);
  return (
    <Container component={Paper} maxWidth="sm" sx={{ p: 4, mt: 8, textAlign: "center" }}>
      <Typography gutterBottom variant="h3">
        403
      </Typography>
      <Typography gutterBottom variant="h6">
        {t("errors.unauthorized")}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Button component={Link} to={user ? homePathForRole(user.role) : paths.login} variant="contained">
        {user ? t("nav.dashboard") : t("nav.login")}
      </Button>
    </Container>
  );
}
