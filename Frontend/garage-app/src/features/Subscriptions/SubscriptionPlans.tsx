
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import {
  useAppDispatch,
  useAppSelector,
} from "../../store/configureStore";
import { fetchSubscriptionPlansAsync } from "./subscriptionPlanSlice";
import agent from "../../app/api/agent";
import { toast } from "react-toastify";
import { toAppError } from "../../app/utils/error";

export default function SubscriptionPlans() {
  const dispatch = useAppDispatch();

  const { plans, status, error } = useAppSelector(
    (state) => state.subscriptionPlans
  );

  const user = useAppSelector((state) => state.account.user);

  const [garages, setGarages] = useState<
    { id: number; name: string }[]
  >([]);

  const [selectedGarageId, setSelectedGarageId] =
    useState<number | "">("");

  const [loadingGarages, setLoadingGarages] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  useEffect(() => {
    dispatch(fetchSubscriptionPlansAsync());
  }, [dispatch]);

  useEffect(() => {
    
      const userId = user?.userId;

  if (userId === null || userId === undefined) return;

    const loadGarages = async () => {
      try {
        setLoadingGarages(true);

        const result =
          await agent.Garages.listActiveByOwner(userId);

        setGarages(
          result.map((garage) => ({
            id: garage.id,
            name: garage.name,
          }))
        );
      } catch (error) {
        console.error("Failed to load garages", error);
      } finally {
        setLoadingGarages(false);
      }
    };

    loadGarages();
  }, [user?.userId]);

 
  const handleSubscribe = async (planId: number) => {
  if (!selectedGarageId) {
    toast.error("Please select a garage");
    return;
  }

  try {
    setLoadingCheckout(true);

    const result = await agent.Subscriptions.checkout({
      planId,
      garageId: selectedGarageId,
    });

    window.location.assign(result);
  } catch (error) {
    console.error("Subscription checkout failed", error);

    toast.error(
      toAppError(error).message
    );
  } finally {
    setLoadingCheckout(false);
  }
};

  if (status === "loading" || loadingGarages) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 5,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === "failed") {
    return (
      <Typography color="error">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        Subscription Plans
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4,
        }}
      >
        Choose a subscription plan for your garage
      </Typography>

      <FormControl
        fullWidth
        sx={{
          mb: 4,
          maxWidth: 500,
        }}
      >
        <InputLabel>Select Garage</InputLabel>

        <Select
          value={selectedGarageId}
          label="Select Garage"
          onChange={(event) =>
            setSelectedGarageId(
              event.target.value as number
            )
          }
        >
          {garages.map((garage) => (
            <MenuItem
              key={garage.id}
              value={garage.id}
            >
              {garage.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {garages.length === 0 && (
        <Typography
          sx={{
            color: "text.secondary",
            mb: 3,
          }}
        >
          You don't have any active garages available for subscription.
        </Typography>
      )}

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={plan.id}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {plan.planName}
                </Typography>

                <Box sx={{ my: 3 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {plan.price} OMR
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    {plan.durationDays} days
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={
                    !selectedGarageId ||
                    loadingCheckout
                  }
                  onClick={() =>
                    handleSubscribe(plan.id)
                  }
                >
                  {loadingCheckout
                    ? "Processing..."
                    : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
