/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { ServiceItem } from "../../app/models/Service";
import type { CustomerGarage } from "../../app/models/CustomerGarage";

interface CustomerState {
  services: ServiceItem[];
  garages: CustomerGarage[];
  status: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: CustomerState = {
  services: [],
  garages: [],
  status: "idle",
  error: null,
};

export const fetchCustomerServicesAsync = createAsyncThunk<
  ServiceItem[],
  void,
  { rejectValue: string }
>("customer/fetchServices", async (_, thunkAPI) => {
  try {
    return await agent.Catalog.services();
  } catch (error) {
    return thunkAPI.rejectWithValue("Failed to load services");
  }
});

export const fetchGaragesByServiceAsync = createAsyncThunk<
  CustomerGarage[],
  number,
  { rejectValue: string }
>("customer/fetchGaragesByService", async (serviceId, thunkAPI) => {
  try {
    return await agent.Catalog.garagesByService(serviceId);
  } catch (error) {
    return thunkAPI.rejectWithValue("Failed to load garages");
  }
});

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearGarages: (state) => {
      state.garages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerServicesAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCustomerServicesAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.services = action.payload;
      })
      .addCase(fetchCustomerServicesAsync.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Failed to load services";
      })

      .addCase(fetchGaragesByServiceAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.garages = [];
      })
      .addCase(fetchGaragesByServiceAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.garages = action.payload;
      })
      .addCase(fetchGaragesByServiceAsync.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Failed to load garages";
      });
  },
});

export const { clearGarages } = customerSlice.actions;

export default customerSlice.reducer;