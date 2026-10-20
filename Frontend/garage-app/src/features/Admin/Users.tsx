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
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import { createUserAsync, fetchUsersAsync } from "./usersSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import type { UserRequest } from "../../app/models/User";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import CreateUserDialog from "./CreateUserDialog";

export default function Users() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.users);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(() => {
    void dispatch(fetchUsersAsync());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (values: UserRequest) => {
    try {
      const response = await dispatch(createUserAsync(values)).unwrap();
      notifySuccess(response.message);
      setCreateOpen(false);
      load();
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  };

  return (
    <>
      <PageHeader
        title={t("menu.users")}
        subtitle={t("users.subtitle")}
        actions={
          <>
            <Tooltip title={t("common.refresh")}>
              <IconButton onClick={load} aria-label={t("common.refresh")}><RefreshIcon /></IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              {t("users.create")}
            </Button>
          </>
        }
      />

      {status === "loading" && items.length === 0 ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <Paper><EmptyState message={t("users.empty")} /></Paper>
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
                  <TableCell>{t("fields.role")}</TableCell>
                  <TableCell>{t("fields.status")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.fullName}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.phone}</TableCell>
                    <TableCell>{t(`role.${u.role}`, u.role)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={u.active ? "success" : "default"} label={u.active ? t("status.ACTIVE") : t("status.INACTIVE")} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <CreateUserDialog
        open={createOpen}
        saving={status === "saving"}
        onSubmit={(values) => void create(values)}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
