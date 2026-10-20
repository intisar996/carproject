import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { MessageResponse } from "../../app/models/Common";
import type {
  GarageServiceOption,
  GarageServiceOptionRequest,
} from "../../app/models/GarageServiceOption";
import { toAppError } from "../../app/utils/error";

interface GarageServiceOptionsState {
  items: GarageServiceOption[];
  status: "idle" | "loading" | "saving";
  error: string | null;
}

const initialState: GarageServiceOptionsState = {
  items: [],
  status: "idle",
  error: null,
};

type Rejected = { rejectValue: string };

export const fetchGarageServiceOptionsAsync = createAsyncThunk<
  GarageServiceOption[],
  number,
  Rejected
>(
  "garageServiceOptions/fetch",
  async (garageId, thunkAPI) => {
    try {
      return await agent.GarageServiceOptions.list(garageId);
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const addGarageServiceOptionAsync = createAsyncThunk<
  MessageResponse,
  { garageId: number; values: GarageServiceOptionRequest },
  Rejected
>(
  "garageServiceOptions/add",
  async ({ garageId, values }, thunkAPI) => {
    try {
      return await agent.GarageServiceOptions.create(garageId, values);
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const updateGarageServiceOptionAsync = createAsyncThunk<
  MessageResponse,
  {
    garageId: number;
    garageOptionId: number;
    values: GarageServiceOptionRequest;
  },
  Rejected
>(
  "garageServiceOptions/update",
  async ({ garageId, garageOptionId, values }, thunkAPI) => {
    try {
      return await agent.GarageServiceOptions.update(
        garageId,
        garageOptionId,
        values
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const garageServiceOptionsSlice = createSlice({
  name: "garageServiceOptions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGarageServiceOptionsAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchGarageServiceOptionsAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "idle";
      })
      .addCase(fetchGarageServiceOptionsAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error =
          action.payload ?? "Failed to load garage service options";
      })

      .addCase(addGarageServiceOptionAsync.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(addGarageServiceOptionAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(addGarageServiceOptionAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error =
          action.payload ?? "Failed to add garage service option";
      })

      .addCase(updateGarageServiceOptionAsync.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(updateGarageServiceOptionAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(updateGarageServiceOptionAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error =
          action.payload ?? "Failed to update garage service option";
      });
  },
});