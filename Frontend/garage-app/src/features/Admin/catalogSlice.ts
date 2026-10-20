import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type {
  ServiceItem,
  ServiceOption,
  ServiceOptionRequest,
  ServiceRequest,
} from "../../app/models/Service";
import { toAppError } from "../../app/utils/error";

interface CatalogState {
  services: ServiceItem[];
  options: ServiceOption[];
  currentService: ServiceItem | null;
  status: "idle" | "loading" | "saving";
  error: string | null;
}

const initialState: CatalogState = {
  services: [],
  options: [],
  currentService: null,
  status: "idle",
  error: null,
};

type Rejected = { rejectValue: string };
const reject = (error: unknown) => toAppError(error).message;

export const fetchServicesAsync = createAsyncThunk<ServiceItem[], void, Rejected>(
  "catalog/fetchServices",
  async (_, thunkAPI) => {
    try {
      return await agent.Catalog.services();
    } catch (error) {
      return thunkAPI.rejectWithValue(reject(error));
    }
  },
);

export const saveServiceAsync = createAsyncThunk<
  ServiceItem,
  { serviceId?: number; values: ServiceRequest },
  Rejected
>("catalog/saveService", async ({ serviceId, values }, thunkAPI) => {
  try {
    return serviceId
      ? await agent.Catalog.updateService(serviceId, values)
      : await agent.Catalog.createService(values);
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const deleteServiceAsync = createAsyncThunk<number, number, Rejected>(
  "catalog/deleteService",
  async (serviceId, thunkAPI) => {
    try {
      await agent.Catalog.deleteService(serviceId);
      return serviceId;
    } catch (error) {
      return thunkAPI.rejectWithValue(reject(error));
    }
  },
);

export const fetchServiceWithOptionsAsync = createAsyncThunk<
  { service: ServiceItem; options: ServiceOption[] },
  number,
  Rejected
>("catalog/fetchServiceWithOptions", async (serviceId, thunkAPI) => {
  try {
    const [service, options] = await Promise.all([
      agent.Catalog.service(serviceId),
      agent.Catalog.options(serviceId),
    ]);
    return { service, options };
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const saveOptionAsync = createAsyncThunk<
  ServiceOption,
  { serviceId: number; optionId?: number; values: ServiceOptionRequest },
  Rejected
>("catalog/saveOption", async ({ serviceId, optionId, values }, thunkAPI) => {
  try {
    return optionId
      ? await agent.Catalog.updateOption(serviceId, optionId, values)
      : await agent.Catalog.createOption(serviceId, values);
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const deleteOptionAsync = createAsyncThunk<
  number,
  { serviceId: number; optionId: number },
  Rejected
>("catalog/deleteOption", async ({ serviceId, optionId }, thunkAPI) => {
  try {
    await agent.Catalog.deleteOption(serviceId, optionId);
    return optionId;
  } catch (error) {
    return thunkAPI.rejectWithValue(reject(error));
  }
});

export const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServicesAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchServicesAsync.fulfilled, (state, action) => {
        state.services = action.payload;
        state.status = "idle";
      })
      .addCase(fetchServicesAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to load services";
      })
      .addCase(fetchServiceWithOptionsAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchServiceWithOptionsAsync.fulfilled, (state, action) => {
        state.currentService = action.payload.service;
        state.options = action.payload.options;
        state.status = "idle";
      })
      .addCase(fetchServiceWithOptionsAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to load service";
      })
      .addCase(saveServiceAsync.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.serviceId === action.payload.serviceId);
        if (index >= 0) state.services[index] = action.payload;
        else state.services.push(action.payload);
        state.status = "idle";
      })
      .addCase(deleteServiceAsync.fulfilled, (state, action) => {
        state.services = state.services.filter((s) => s.serviceId !== action.payload);
        state.status = "idle";
      })
      .addCase(saveOptionAsync.fulfilled, (state, action) => {
        const index = state.options.findIndex(
          (o) => o.serviceOptionId === action.payload.serviceOptionId,
        );
        if (index >= 0) state.options[index] = action.payload;
        else state.options.push(action.payload);
        state.status = "idle";
      })
      .addCase(deleteOptionAsync.fulfilled, (state, action) => {
        state.options = state.options.filter((o) => o.serviceOptionId !== action.payload);
        state.status = "idle";
      })
      .addMatcher(
        (action) =>
          [saveServiceAsync, deleteServiceAsync, saveOptionAsync, deleteOptionAsync].some((thunk) =>
            thunk.pending.match(action),
          ),
        (state) => {
          state.status = "saving";
        },
      )
      .addMatcher(
        (action) =>
          [saveServiceAsync, deleteServiceAsync, saveOptionAsync, deleteOptionAsync].some((thunk) =>
            thunk.rejected.match(action),
          ),
        (state) => {
          state.status = "idle";
        },
      );
  },
});
