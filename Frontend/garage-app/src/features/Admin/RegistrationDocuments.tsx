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
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import GavelIcon from "@mui/icons-material/Gavel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store/configureStore";
import {
  clearSelectedDocument,
  decideDocumentAsync,
  fetchDocumentAsync,
  fetchDocumentsAsync,
} from "./documentsSlice";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import ErrorState from "../../app/components/ErrorState";
import EmptyState from "../../app/components/EmptyState";
import StatusChip from "../../app/components/StatusChip";
import { RequestStatus } from "../../app/models/enums";
import type { DecisionRequest, RegistrationDocument } from "../../app/models/RegistrationDocument";
import { notifyError, notifySuccess, rejectionMessage } from "../../app/utils/notify";
import DocumentDetailsDialog from "./DocumentDetailsDialog";
import DocumentDecisionDialog from "./DocumentDecisionDialog";

/** Admin: paginated list of garage registration requests (GET /admin/registration-documents). */
export default function RegistrationDocuments() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { page: pageData, selected, status, error } = useAppSelector((state) => state.documents);

  const [page, setPage] = useState(0); // the Backend pages are 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [decisionTarget, setDecisionTarget] = useState<RegistrationDocument | null>(null);

  const load = useCallback(() => {
    void dispatch(fetchDocumentsAsync({ page, size: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  useEffect(() => {
    load();
  }, [load]);

  const openDetails = (id: number) => {
    setDetailsOpen(true);
    void dispatch(fetchDocumentAsync(id))
      .unwrap()
      .catch((e: unknown) => {
        setDetailsOpen(false);
        notifyError(t, rejectionMessage(e));
      });
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    dispatch(clearSelectedDocument());
  };

  const submitDecision = async (values: DecisionRequest) => {
    if (!decisionTarget) return;
    try {
      const response = await dispatch(decideDocumentAsync({ id: decisionTarget.id, values })).unwrap();
      notifySuccess(response.message);
      setDecisionTarget(null);
      load();
    } catch (e) {
      notifyError(t, rejectionMessage(e));
    }
  };

  const rows = pageData?.content ?? [];

  return (
    <>
      <PageHeader
        title={t("menu.registrationDocuments")}
        subtitle={t("documents.subtitle")}
        actions={
          <Tooltip title={t("common.refresh")}>
            <IconButton onClick={load} aria-label={t("common.refresh")}><RefreshIcon /></IconButton>
          </Tooltip>
        }
      />

      {status === "loading" && !pageData ? (
        <LoadingState />
      ) : error && !pageData ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <Paper>
          {error && <ErrorState message={error} onRetry={load} />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>{t("fields.garageName")}</TableCell>
                  <TableCell>{t("fields.owner")}</TableCell>
                  <TableCell>{t("fields.commercialRegisterNumber")}</TableCell>
                  <TableCell>{t("fields.governorate")}</TableCell>
                  <TableCell>{t("fields.status")}</TableCell>
                  <TableCell align="right">{t("common.actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((doc) => (
                  <TableRow key={doc.id} hover sx={{ opacity: status === "loading" ? 0.5 : 1 }}>
                    <TableCell>{doc.id}</TableCell>
                    <TableCell>{doc.garageName}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{doc.ownerName}</Typography>
                      <Typography variant="caption" color="text.secondary">{doc.ownerEmail}</Typography>
                    </TableCell>
                    <TableCell>{doc.commercialRegisterNumber}</TableCell>
                    <TableCell>{doc.governorate} / {doc.state}</TableCell>
                    <TableCell><StatusChip status={doc.status} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Tooltip title={t("common.view")}>
                        <IconButton onClick={() => openDetails(doc.id)} aria-label={t("common.view")}><VisibilityIcon /></IconButton>
                      </Tooltip>
                      {/* An approved request already created its garage; approving again would duplicate it. */}
                      {doc.status !== RequestStatus.APPROVED && (
                        <Tooltip title={t("documents.decide")}>
                          <IconButton color="primary" onClick={() => setDecisionTarget(doc)} aria-label={t("documents.decide")}><GavelIcon /></IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {rows.length === 0 && status !== "loading" && <EmptyState message={t("documents.empty")} />}
          <TablePagination
            component="div"
            count={pageData?.totalElement ?? 0}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t("common.rowsPerPage")}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
          />
        </Paper>
      )}

      <DocumentDetailsDialog
        open={detailsOpen}
        loading={status === "loadingOne"}
        document={selected}
        onClose={closeDetails}
      />
      <DocumentDecisionDialog
        document={decisionTarget}
        saving={status === "saving"}
        onSubmit={(values) => void submitDecision(values)}
        onClose={() => setDecisionTarget(null)}
      />
    </>
  );
}
