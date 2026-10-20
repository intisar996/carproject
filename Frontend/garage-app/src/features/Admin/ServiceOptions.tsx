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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link, Navigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { deleteOptionAsync, fetchServiceWithOptionsAsync, saveOptionAsync } from "./catalogSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import ConfirmDialog from "../../app/components/ConfirmDialog";
import type { ServiceOption, ServiceOptionRequest } from "../../app/models/Service";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import { paths } from "../../app/utils/paths";
import OptionDialog from "./OptionDialog";

export default function ServiceOptions() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const params = useParams();
  const serviceId = Number(params.serviceId);
  const validId = Number.isInteger(serviceId) && serviceId > 0;

  const { options, currentService, status, error } = useAppSelector((state) => state.catalog);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceOption | null>(null);
  const [deleting, setDeleting] = useState<ServiceOption | null>(null);

  const load = useCallback(() => {
    if (validId) void dispatch(fetchServiceWithOptionsAsync(serviceId));
  }, [dispatch, serviceId, validId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!validId) return <Navigate to={paths.adminServices} replace />;

  const save = async (values: ServiceOptionRequest) => {
    try {
      await dispatch(saveOptionAsync({ serviceId, optionId: editing?.serviceOptionId, values })).unwrap();
      notifySuccess(t(editing ? "options.updated" : "options.created"));
      setDialogOpen(false);
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await dispatch(deleteOptionAsync({ serviceId, optionId: deleting.serviceOptionId })).unwrap();
      notifySuccess(t("options.deleted"));
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    } finally {
      setDeleting(null);
    }
  };

  const showing = currentService?.serviceId === serviceId;

  return (
    <>
      <PageHeader
        title={showing ? t("options.titleFor", { name: currentService?.name }) : t("services.options")}
        subtitle={t("options.subtitle")}
        actions={
          <>
            <Button startIcon={<ArrowBackIcon sx={(theme) => ({ transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" })} />} component={Link} to={paths.adminServices}>
              {t("common.back")}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              {t("options.create")}
            </Button>
          </>
        }
      />

      {status === "loading" && !showing ? (
        <LoadingState />
      ) : error && !showing ? (
        <ErrorState message={error} onRetry={load} />
      ) : options.length === 0 ? (
        <Paper><EmptyState message={t("options.empty")} /></Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{t("fields.type")}</TableCell>
                  <TableCell>{t("fields.size")}</TableCell>
                  <TableCell>{t("fields.brand")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {options.map((option) => (
                  <TableRow key={option.serviceOptionId} hover>
                    <TableCell>{option.serviceOptionId}</TableCell>
                    <TableCell>{option.type}</TableCell>
                    <TableCell>{option.size ?? "—"}</TableCell>
                    <TableCell>{option.brand ?? "—"}</TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title={t("common.edit")}>
                        <IconButton
                          onClick={() => {
                            setEditing(option);
                            setDialogOpen(true);
                          }}
                          aria-label={t("common.edit")}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t("common.delete")}>
                        <IconButton color="error" onClick={() => setDeleting(option)} aria-label={t("common.delete")}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <OptionDialog
        open={dialogOpen}
        option={editing}
        saving={status === "saving"}
        onSubmit={(values) => void save(values)}
        onClose={() => setDialogOpen(false)}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title={t("options.deleteTitle")}
        message={t("options.deleteMessage", { name: deleting?.type })}
        confirmLabel={t("common.delete")}
        color="error"
        loading={status === "saving"}
        onConfirm={() => void remove()}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
