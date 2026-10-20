import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { SubscriptionPlan } from "../../app/models/Subscription";
import { toAppError } from "../../app/utils/error";


interface SubscriptionPlanState {
  plans: SubscriptionPlan[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: SubscriptionPlanState = {
  plans: [],
  status: "idle",
  error: null,
};

export const fetchSubscriptionPlansAsync = createAsyncThunk<
  SubscriptionPlan[],
  void,
  { rejectValue: string }
>("subscriptionPlans/fetch", async (_, thunkAPI) => {
  try {
    return await agent.SubscriptionPlans.getActive();
  } catch (error) {
    return thunkAPI.rejectWithValue(
      toAppError(error).message
    );
  }
});

const subscriptionPlanSlice = createSlice({
  name: "subscriptionPlans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlansAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchSubscriptionPlansAsync.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.plans = action.payload;
        }
      )
      .addCase(
        fetchSubscriptionPlansAsync.rejected,
        (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? "Failed to load plans";
        }
      );
  },
});

export default subscriptionPlanSlice.reducer;