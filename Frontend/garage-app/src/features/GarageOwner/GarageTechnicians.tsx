import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
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
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { fetchGaragesAsync } from "./garagesSlice";
import {
  clearSelectedTechnician,
  createTechnicianAsync,
  fetchTechnicianAsync,
  fetchTechniciansAsync,
  setTechnicianActiveAsync,
} from "./techniciansSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import type { Technician, TechnicianRequest } from "../../app/models/Technician";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import AddTechnicianDialog from "./AddTechnicianDialog";
import TechnicianDetailsDialog from "./TechnicianDetailsDialog";

export default function GarageTechnicians() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const params = useParams();
  const garageId = Number(params.garageId);
  const validId = Number.isInteger(garageId) && garageId > 0;

  const ownerId = useAppSelector((state) => state.account.user?.userId ?? null);
  const garages = useAppSelector((state) => state.garages.items);
  const { items, selected, status, error } = useAppSelector((state) => state.technicians);

  const [garagesChecked, setGaragesChecked] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [toggling, setToggling] = useState<Technician | null>(null);

  const garage = garages.find((g) => g.id === garageId);


  useEffect(() => {
    if (ownerId === null) return;
    void dispatch(fetchGaragesAsync(ownerId)).finally(() => setGaragesChecked(true));
  }, [dispatch, ownerId]);

  const load = useCallback(() => {
    if (validId) void dispatch(fetchTechniciansAsync(garageId));
  }, [dispatch, garageId, validId]);

  const belongsToOwner = garagesChecked && Boolean(garage);
  useEffect(() => {
    if (belongsToOwner) load();
  }, [belongsToOwner, load]);

  if (!validId || (garagesChecked && !garage)) return <Navigate to={paths.ownerGarages} replace />;
  if (!garagesChecked) return <LoadingState />;

  const create = async (values: TechnicianRequest) => {
    try {
      const response = await dispatch(createTechnicianAsync({ garageId, values })).unwrap();
      notifySuccess(response.message);
      setAddOpen(false);
      load();
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  };

  const openDetails = (technician: Technician) => {
    setDetailsOpen(true);
    void dispatch(fetchTechnicianAsync({ garageId, technicianId: technician.id }))
      .unwrap()
      .catch((e: unknown) => {
        setDetailsOpen(false);
        notifyError(t, rejectionMessage(e));
      });
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedTechnician());
  };

  const toggle = async () => {
    if (!toggling) return;
    try {
      const response = await dispatch(
        setTechnicianActiveAsync({ garageId, technicianId: toggling.id, active: !toggling.isActive }),
      ).unwrap();
      notifySuccess(response.message);
      load();
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    } finally {
      setToggling(null);
    }
  };

  return (
    <>
      <PageHeader
        title={t("technicians.titleFor", { name: garage?.name })}
        subtitle={t("technicians.subtitle")}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon sx={(theme) => ({ transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" })} />} component={Link} to={paths.ownerGarages}>
              {t("common.back")}
            </Button>
            <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setAddOpen(true)}>
              {t("technicians.add")}
            </Button>
          </>
        }
      />

      {status === "loading" && items.length === 0 ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <Paper><EmptyState message={t("technicians.empty")} /></Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{t("fields.fullName")}</TableCell>
                  <TableCell>{t("fields.email")}</TableCell>
                  <TableCell>{t("fields.phone")}</TableCell>
                  <TableCell>{t("fields.specialization")}</TableCell>
                  <TableCell>{t("fields.salary")}</TableCell>
                  <TableCell>{t("fields.status")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((technician) => (
                  <TableRow key={technician.id} hover>
                    <TableCell>{technician.id}</TableCell>
                    <TableCell>{technician.fullName}</TableCell>
                    <TableCell>{technician.email}</TableCell>
                    <TableCell>{technician.phone}</TableCell>
                    <TableCell>{technician.specialization ?? "—"}</TableCell>
                    <TableCell>{technician.salary ?? "—"}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={technician.isActive ? "success" : "default"}
                        label={technician.isActive ? t("status.ACTIVE") : t("status.INACTIVE")}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title={t("common.view")}>
                        <IconButton onClick={() => openDetails(technician)} aria-label={t("common.view")}><VisibilityIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title={technician.isActive ? t("technicians.deactivate") : t("technicians.activate")}>
                        <IconButton
                          color={technician.isActive ? "error" : "success"}
                          onClick={() => setToggling(technician)}
                          aria-label={technician.isActive ? t("technicians.deactivate") : t("technicians.activate")}
                        >
                          {technician.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <AddTechnicianDialog
        open={addOpen}
        saving={status === "saving"}
        onSubmit={(values) => void create(values)}
        onClose={() => setAddOpen(false)}
      />
      <TechnicianDetailsDialog open={detailsOpen} technician={selected} onClose={closeDetails} />
      <ConfirmDialog
        open={Boolean(toggling)}
        title={toggling?.isActive ? t("technicians.deactivateTitle") : t("technicians.activateTitle")}
        message={t(toggling?.isActive ? "technicians.deactivateMessage" : "technicians.activateMessage", { name: toggling?.fullName })}
        confirmLabel={toggling?.isActive ? t("technicians.deactivate") : t("technicians.activate")}
        color={toggling?.isActive ? "error" : "success"}
        loading={status === "saving"}
        onConfirm={() => void toggle()}
        onClose={() => setToggling(null)}
      />
    </>
  );
}
