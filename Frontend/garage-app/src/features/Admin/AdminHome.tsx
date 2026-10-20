import { useEffect, useState } from "react";
import { Box, Card, CardActionArea, CardContent, Grid, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import PageHeader from "../../app/components/PageHeader";
import { useAppSelector } from "../../store/configureStore";
import { paths } from "../../app/utils/paths";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  to: string;
}

function StatCard({ icon, label, value, to }: StatCardProps) {
  return (
    <Card>
      <CardActionArea component={Link} to={to}>
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function AdminHome() {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.account.user);
  const [documentsTotal, setDocumentsTotal] = useState<number | null>(null);
  const [servicesTotal, setServicesTotal] = useState<number | null>(null);

  useEffect(() => {
    agent.Admin.documents(0, 1).then((p) => setDocumentsTotal(p.totalElement)).catch(() => setDocumentsTotal(null));
    agent.Catalog.services().then((s) => setServicesTotal(s.length)).catch(() => setServicesTotal(null));
  }, []);

  return (
    <>
      <PageHeader title={t("adminHome.welcome", { name: user?.fullName })} subtitle={t("adminHome.subtitle")} />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<DescriptionIcon fontSize="large" />} label={t("menu.registrationDocuments")} value={documentsTotal === null ? "—" : String(documentsTotal)} to={paths.adminDocuments} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<BuildIcon fontSize="large" />} label={t("menu.services")} value={servicesTotal === null ? "—" : String(servicesTotal)} to={paths.adminServices} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCard icon={<PeopleIcon fontSize="large" />} label={t("menu.users")} value={t("adminHome.manage")} to={paths.adminUsers} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
       <StatCard icon={<DescriptionIcon fontSize="large" />} label={t("menu.subscriptionPlans")} value={t("adminHome.manage")}to={paths.adminSubscriptionPlans} />
     </Grid>
      </Grid>
    </>
  );
}
