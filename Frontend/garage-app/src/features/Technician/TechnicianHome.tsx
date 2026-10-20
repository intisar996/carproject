import { Alert, Button, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PageHeader from "../../app/components/PageHeader";
import { useAppSelector } from "../../store/configureStore";
import { paths } from "../../app/utils/paths";

export default function TechnicianHome() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.account.user);

  return (
    <>
      <PageHeader title={t("technicianHome.welcome", { name: user?.fullName })} subtitle={t("technicianHome.subtitle")} />
      <Card sx={{ mb: 3, maxWidth: 520 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">{t("fields.email")}</Typography>
          <Typography sx={{ mb: 2 }}>{user?.email}</Typography>
          <Button variant="contained" component={Link} to={paths.technicianLocation}>
            {t("menu.shareLocation")}
          </Button>
        </CardContent>
      </Card>
      <Alert severity="info" sx={{ maxWidth: 720 }}>{t("technicianHome.limitedApi")}</Alert>
    </>
  );
}
