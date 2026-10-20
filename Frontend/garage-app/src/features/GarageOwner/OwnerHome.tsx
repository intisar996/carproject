import { useEffect } from "react";
import { Alert, Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { fetchGaragesAsync } from "./garagesSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import { GarageStatus } from "../../app/models/enums";
import { paths } from "../../app/utils/paths";

export default function OwnerHome() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.account.user);
  const { items, status, error } = useAppSelector((state) => state.garages);
  const ownerId = user?.userId ?? null;

  useEffect(() => {
    if (ownerId !== null) void dispatch(fetchGaragesAsync(ownerId));
  }, [dispatch, ownerId]);

  const active = items.filter((g) => g.status === GarageStatus.ACTIVE).length;
  const inactive = items.length - active;

  return (
    <>
      <PageHeader title={t("ownerHome.welcome", { name: user?.fullName })} subtitle={t("ownerHome.subtitle")} />

      {ownerId === null ? (
        <ErrorState message={t("ownerHome.noUserId")} />
      ) : status === "loading" && items.length === 0 ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void dispatch(fetchGaragesAsync(ownerId))} />
      ) : (
        <>
          {items.length === 0 && <Alert severity="info" sx={{ mb: 3 }}>{t("ownerHome.noGarages")}</Alert>}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: t("ownerHome.totalGarages"), value: items.length },
              { label: t("ownerHome.activeGarages"), value: active },
              { label: t("ownerHome.inactiveGarages"), value: inactive },
            ].map((stat) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="contained" component={Link} to={paths.ownerGarages}>{t("menu.myGarages")}</Button>
            <Button variant="outlined" component={Link} to={paths.ownerRequestGarage}>{t("menu.requestGarage")}</Button>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" component={Link} to={paths.ownerServiceOptions}>Manage Services</Button></Box>
          </Box>
        </>
      )}
    </>
  );
}
