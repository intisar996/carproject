import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useTranslation } from "react-i18next";
import agent from "../../app/api/agent";
import PageHeader from "../../app/components/PageHeader";
import LoadingState from "../../app/components/LoadingState";
import type { SubscriptionPlan } from "../../app/models/Subscription";
import { toast } from "react-toastify";

interface PlanForm {
  planName: string;
  price: string;
  durationDays: string;
}

const emptyForm: PlanForm = {
  planName: "",
  price: "",
  durationDays: "",
};

export default function AdminSubscriptionPlans() {
  const { t } = useTranslation();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await agent.AdminSubscriptionPlans.getAll();
      setPlans(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    setForm({
      planName: plan.planName,
      price: String(plan.price),
      durationDays: String(plan.durationDays),
    });
    setOpen(true);
  };

  const handleClose = () => {
    if (!saving) {
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  const handleSave = async () => {
    if (
      !form.planName.trim() ||
      !form.price ||
      !form.durationDays ||
      Number(form.price) < 0 ||
      Number(form.durationDays) <= 0
    ) {
      return;
    }

    try {
      setSaving(true);

      const data = {
        planName: form.planName.trim(),
        price: Number(form.price),
        durationDays: Number(form.durationDays),
      };

      if (editingId === null) {
        await agent.AdminSubscriptionPlans.create(data);
      } else {
        await agent.AdminSubscriptionPlans.update(editingId, data);
      }

      handleClose();
      await loadPlans();
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, active: boolean) => {
    await agent.AdminSubscriptionPlans.changeStatus(id, !active);
    await loadPlans();
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return toast("error");
  }

  return (
    <>
      <PageHeader
        title={t("adminSubscriptionPlans.title")}
        subtitle={t("adminSubscriptionPlans.subtitle")}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}>
          {t("adminSubscriptionPlans.addPlan")}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {plans.map((plan) => (
          <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    mb: 2,
                  }}>
                  <Typography variant='h6' sx={{ fontWeight: "bold" }}>
                    {plan.planName}
                  </Typography>

                  <Chip
                    label={
                      plan.active
                        ? t("adminSubscriptionPlans.active")
                        : t("adminSubscriptionPlans.inactive")
                    }
                    color={plan.active ? "success" : "default"}
                    size='small'
                  />
                </Box>

                <Typography variant='h4' sx={{ fontWeight: "bold", mb: 1 }}>
                  {plan.price} OMR
                </Typography>

                <Typography color='text.secondary'>
                  {plan.durationDays} {t("adminSubscriptionPlans.days")}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 3,
                  }}>
                  <Button
                    size='small'
                    onClick={() => handleStatusChange(plan.id, plan.active)}>
                    {plan.active
                      ? t("adminSubscriptionPlans.deactivate")
                      : t("adminSubscriptionPlans.activate")}
                  </Button>

                  <IconButton
                    onClick={() => handleOpenEdit(plan)}
                    color='primary'>
                    <EditIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>
          {editingId === null
            ? t("adminSubscriptionPlans.addPlan")
            : t("adminSubscriptionPlans.editPlan")}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label={t("adminSubscriptionPlans.planName")}
            value={form.planName}
            onChange={(e) =>
              setForm({
                ...form,
                planName: e.target.value,
              })
            }
            margin='normal'
          />

          <TextField
            fullWidth
            label={t("adminSubscriptionPlans.price")}
            type='number'
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
            margin='normal'
          />

          <TextField
            fullWidth
            label={t("adminSubscriptionPlans.durationDays")}
            type='number'
            value={form.durationDays}
            onChange={(e) =>
              setForm({
                ...form,
                durationDays: e.target.value,
              })
            }
            margin='normal'
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            {t("common.cancel")}
          </Button>

          <Button variant='contained' onClick={handleSave} disabled={saving}>
            {t("common.save")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
