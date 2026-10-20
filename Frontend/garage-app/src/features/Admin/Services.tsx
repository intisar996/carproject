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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { deleteServiceAsync, fetchServicesAsync, saveServiceAsync } from "./catalogSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import type { ServiceItem, ServiceRequest } from "../../app/models/Service";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import ServiceDialog from "./ServiceDialog";

export default function Services() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { services, status, error } = useAppSelector((state) => state.catalog);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [deleting, setDeleting] = useState<ServiceItem | null>(null);

  const load = useCallback(() => {
    void dispatch(fetchServicesAsync());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (service: ServiceItem) => {
    setEditing(service);
    setDialogOpen(true);
  };

  const save = async (values: ServiceRequest) => {
    try {
      await dispatch(saveServiceAsync({ serviceId: editing?.serviceId, values })).unwrap();
      notifySuccess(t(editing ? "services.updated" : "services.created"));
      setDialogOpen(false);
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteServiceAsync(deleting.serviceId)).unwrap();
      notifySuccess(t("services.deleted"));
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <PageHeader
        title={t("menu.services")}
        subtitle={t("services.subtitle")}
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>{t("services.create")}</Button>}
      />

      {status === "loading" && services.length === 0 ? (
        <LoadingState />
      ) : error && services.length === 0 ? (
        <ErrorState message={error} onRetry={load} />
      ) : services.length === 0 ? (
        <Paper>
          <EmptyState message={t("services.empty")} action={<Button variant="contained" onClick={openCreate}>{t("services.create")}</Button>} />
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{t("fields.serviceName")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.serviceId} hover>
                    <TableCell>{service.serviceId}</TableCell>
                    <TableCell>{service.name}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title={t("services.options")}>
                        <IconButton component={Link} to={paths.adminServiceOptions(service.serviceId)} aria-label={t("services.options")}><ListAltIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.edit")}>
                        <IconButton onClick={() => openEdit(service)} aria-label={t("common.edit")}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton color="error" onClick={() => setDeleting(service)} aria-label={t("common.delete")}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <ServiceDialog
        open={dialogOpen}
        service={editing}
        saving={status === "saving"}
        onSubmit={(values) => void save(values)}
        onClose={() => setDialogOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("services.deleteTitle")}
        message={t("services.deleteMessage", { name: deleting?.name })}
        confirmLabel={t("common.delete")}
        color="error"
        loading={status === "saving"}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
