import { useCallback, useEffect, useState } from "react";
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import EngineeringIcon from "@mui/icons-material/Engineering";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { deactivateGarageAsync, fetchGaragesAsync } from "./garagesSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import StatusChip from "../../app/components/StatusChip";
import { GarageStatus } from "../../app/models/enums";
import type { Garage } from "../../app/models/Garage";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";

export default function MyGarages() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const ownerId = useAppSelector((state) => state.account.user?.userId ?? null);
  const { items, status, error } = useAppSelector((state) => state.garages);
  const [deactivating, setDeactivating] = useState<Garage | null>(null);

  const load = useCallback(() => {
    if (ownerId !== null) void dispatch(fetchGaragesAsync(ownerId));
  }, [dispatch, ownerId]);

  useEffect(() => {
    load();
  }, [load]);

  const deactivate = async () => {
    if (!deactivating) return;
    try {
      const { response } = await dispatch(deactivateGarageAsync(deactivating.id)).unwrap();
      notifySuccess(response.message);
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    } finally {
      setDeactivating(null);
    }
  };

  const requestButton = (
    <Button variant="contained" startIcon={<AddBusinessIcon />} component={Link} to={paths.ownerRequestGarage}>
      {t("menu.requestGarage")}
    </Button>
  );

  return (
    <>
      <PageHeader
        title={t("menu.myGarages")}
        subtitle={t("garages.subtitle")}
        actions={
          <>
            <Tooltip title={t("common.refresh")}>
              <IconButton onClick={load} aria-label={t("common.refresh")}><RefreshIcon /></IconButton>
            </Tooltip>
            {requestButton}
          </>
        }
      />

      {ownerId === null ? (
        <ErrorState message={t("ownerHome.noUserId")} />
      ) : status === "loading" && items.length === 0 ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <Paper><EmptyState message={t("garages.empty")} action={requestButton} /></Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{t("fields.garageName")}</TableCell>
                  <TableCell>{t("fields.governorate")}</TableCell>
                  <TableCell>{t("fields.state")}</TableCell>
                  <TableCell>{t("fields.phone")}</TableCell>
                  <TableCell>{t("fields.status")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((garage) => (
                  <TableRow key={garage.id} hover>
                    <TableCell>{garage.id}</TableCell>
                    <TableCell>{garage.name}</TableCell>
                    <TableCell>{garage.governorate}</TableCell>
                    <TableCell>{garage.state}</TableCell>
                    <TableCell>{garage.phone ?? "—"}</TableCell>
                    <TableCell><StatusChip status={garage.status} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title={t("garages.technicians")}>
                        <IconButton component={Link} to={paths.ownerTechnicians(garage.id)} aria-label={t("garages.technicians")}><EngineeringIcon /></IconButton>
                      </Tooltip>
                      {garage.status === GarageStatus.ACTIVE && (
                        <Tooltip title={t("garages.deactivate")}>
                          <IconButton color="error" onClick={() => setDeactivating(garage)} aria-label={t("garages.deactivate")}><PowerSettingsNewIcon /></IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <ConfirmDialog
        open={Boolean(deactivating)}
        title={t("garages.deactivateTitle")}
        message={t("garages.deactivateMessage", { name: deactivating?.name })}
        confirmLabel={t("garages.deactivate")}
        color="error"
        loading={status === "saving"}
        onConfirm={() => void deactivate()}
        onClose={() => setDeactivating(null)}
      />
    </>
  );
}
