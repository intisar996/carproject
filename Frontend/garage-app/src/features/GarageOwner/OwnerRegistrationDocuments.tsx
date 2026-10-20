
import { useCallback, useEffect, useState } from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import StatusChip from "../../app/components/StatusChip";

import { fetchDocumentsAsync } from "./RegisterDocumentSlice";

export default function OwnerRegistrationDocuments() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { page: pageData, status, error } = useAppSelector(
    (state) => state.documents
  );

  const user = useAppSelector((state) => state.account.user);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const ownerId = user?.userId;

  const load = useCallback(() => {
    if (!ownerId) return;

    void dispatch(
      fetchDocumentsAsync({
        ownerId,
        page,
        size: rowsPerPage,
      })
    );
  }, [dispatch, ownerId, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title={t("menu.requestGarageRegisterDoc")}
        subtitle={t("documents.subtitle")}
        actions={
          <Tooltip title={t("common.refresh")}>
            <IconButton
              onClick={load}
              aria-label={t("common.refresh")}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {status === "loading" && !pageData ? (
        <LoadingState />
      ) : error && !pageData ? (
        <ErrorState
          message={error}
          onRetry={load}
        />
      ) : (
        <Paper>
          {error && (
            <ErrorState
              message={error}
              onRetry={load}
            />
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>
                    {t("fields.garageName")}
                  </TableCell>
                  <TableCell>
                    {t("fields.commercialRegisterNumber")}
                  </TableCell>
                  <TableCell>
                    {t("fields.governorate")}
                  </TableCell>
                  <TableCell>
                    {t("fields.status")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {pageData?.content?.map((doc) => (
                  <TableRow
                    key={doc.id}
                    hover
                    sx={{
                      opacity: status === "loading" ? 0.5 : 1,
                    }}
                  >
                    <TableCell>{doc.id}</TableCell>

                    <TableCell>
                      {doc.garageName}
                    </TableCell>

                    <TableCell>
                      {doc.commercialRegisterNumber}
                    </TableCell>

                    <TableCell>
                      {doc.governorate} / {doc.state}
                    </TableCell>

                    <TableCell>
                      <StatusChip status={doc.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!pageData?.content ||
            pageData.content.length === 0) &&
            status !== "loading" && (
              <EmptyState message={t("documents.empty")} />
            )}

          <TablePagination
            component="div"
            count={pageData?.totalElement ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t("common.rowsPerPage")}
            onPageChange={(_, newPage) => {
              setPage(newPage);
            }}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
          />
        </Paper>
      )}
    </>
  );
}

