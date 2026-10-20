import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { MessageResponse } from "../../app/models/Common";
import type { Technician, TechnicianRequest } from "../../app/models/Technician";
import { toAppError } from "../../app/utils/error";

interface TechniciansState {
  items: Technician[];
  selected: Technician | null;
  status: "idle" | "loading" | "saving";
  error: string | null;
}

const initialState: TechniciansState = { items: [], selected: null, status: "idle", error: null };

type Rejected = { rejectValue: string };
const reject = (error: unknown) => toAppError(error).message;

export const fetchTechniciansAsync = createAsyncThunk<Technician[], number, Rejected>(
  "technicians/fetch",
  async (garageId, thunkAPI) => {
    try {
      return await agent.Technicians.listByGarage(garageId);
    } catch (error) {
      return thunkAPI.rejectWithValue(reject(error));
    }
  },
);

export const fetchTechnicianAsync = createAsyncThunk<
  Technician,
  { garageId: number; technicianId: number },
  Rejected
>("technicians/fetchOne", async ({ garageId, technicianId }, thunkAPI) => {
  try {
    return await agent.Technicians.get(garageId, technicianId);
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const createTechnicianAsync = createAsyncThunk<
  MessageResponse,
  { garageId: number; values: TechnicianRequest },
  Rejected
>("technicians/create", async ({ garageId, values }, thunkAPI) => {
  try {
    return await agent.Technicians.create(garageId, values);
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const setTechnicianActiveAsync = createAsyncThunk<
  MessageResponse,
  { garageId: number; technicianId: number; active: boolean },
  Rejected
>("technicians/setActive", async ({ garageId, technicianId, active }, thunkAPI) => {
  try {
    return active
      ? await agent.Technicians.activate(garageId, technicianId)
      : await agent.Technicians.deactivate(garageId, technicianId);
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const techniciansSlice = createSlice({
  name: "technicians",
  initialState,
  reducers: {
    clearSelectedTechnician: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTechniciansAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTechniciansAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "idle";
      })
      .addCase(fetchTechniciansAsync.rejected, (state, action) => {
        state.items = [];
        state.status = "idle";
        state.error = action.payload ?? "Failed to load technicians";
      })
      .addCase(fetchTechnicianAsync.fulfilled, (state, action) => {
        state.selected = action.payload;
      })
      .addCase(createTechnicianAsync.pending, (state) => {
        state.status = "saving";
      })
      .addCase(createTechnicianAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(createTechnicianAsync.rejected, (state) => {
        state.status = "idle";
      })
      .addCase(setTechnicianActiveAsync.pending, (state) => {
        state.status = "saving";
      })
      .addCase(setTechnicianActiveAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(setTechnicianActiveAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const { clearSelectedTechnician } = techniciansSlice.actions;
