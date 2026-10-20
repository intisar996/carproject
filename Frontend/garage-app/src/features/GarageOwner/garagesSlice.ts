import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { MessageResponse, PageResponse } from "../../app/models/Common";
import { GarageStatus } from "../../app/models/enums";
import type { Garage } from "../../app/models/Garage";
import { toAppError } from "../../app/utils/error";
import type { RegistrationDocument } from "../../app/models/RegistrationDocument";

interface GaragesState {
  items: Garage[];
  status: "idle" | "loading" | "saving";
  error: string | null;
}

const initialState: GaragesState = {
  items: [],
  status: "idle",
  error: null,
};

type Rejected = {
  rejectValue: string;
};

export const fetchGaragesAsync = createAsyncThunk<
  Garage[],
  number,
  Rejected
>(
  "garages/fetch",
  async (ownerId, thunkAPI) => {
    try {
      return await agent.Garages.listByOwner(ownerId);
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const fetchGaragesRegisterDocumentAsync = createAsyncThunk<
  PageResponse<RegistrationDocument>,
  {
    ownerId: number;
    page: number;
    size: number;
  },
  Rejected
>(
  "garages/fetchRegisterDocuments",
  async ({ ownerId, page, size }, thunkAPI) => {
    try {
      return await agent.Garages.getRegisterDocumantion(
        ownerId,
        page,
        size
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const deactivateGarageAsync = createAsyncThunk<
  {
    id: number;
    response: MessageResponse;
  },
  number,
  Rejected
>(
  "garages/deactivate",
  async (garageId, thunkAPI) => {
    try {
      const response = await agent.Garages.deactivate(garageId);

      return {
        id: garageId,
        response,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const requestGarageAsync = createAsyncThunk<
  MessageResponse,
  FormData,
  Rejected
>(
  "garages/requestNew",
  async (formData, thunkAPI) => {
    try {
      return await agent.Garages.requestNew(formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  }
);

export const garagesSlice = createSlice({
  name: "garages",
  initialState,
  reducers: {
    clearGarages: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGaragesAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchGaragesAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "idle";
        state.error = null;
      })

      .addCase(fetchGaragesAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to load garages";
      })

      .addCase(deactivateGarageAsync.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })

      .addCase(deactivateGarageAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;

        const garage = state.items.find(
          (garage) => garage.id === action.payload.id
        );

        if (garage) {
          garage.status = GarageStatus.INACTIVE;
        }
      })

      .addCase(deactivateGarageAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to deactivate garage";
      })

      .addCase(requestGarageAsync.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })

      .addCase(requestGarageAsync.fulfilled, (state) => {
        state.status = "idle";
        state.error = null;
      })

      .addCase(requestGarageAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to request garage";
      });
  },
});

export const { clearGarages } = garagesSlice.actions;