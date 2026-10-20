import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { ServiceCustomerRequest } from "../../app/models/ServiceCustomerRequest";
import type { Technician } from "../../app/models/Technician";

import agent from "../../app/api/agent";

interface ServiceRequestsState {
  requests: ServiceCustomerRequest[];
  technicians: Technician[];
  status: "idle" | "loading" | "error";
  techniciansStatus: "idle" | "loading" | "error";
  actionStatus: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: ServiceRequestsState = {
  requests: [],
  technicians: [],
  status: "idle",
  techniciansStatus: "idle",
  actionStatus: "idle",
  error: null,
};

export const fetchOwnerServiceRequestsAsync = createAsyncThunk<
  ServiceCustomerRequest[],
  void,
  { rejectValue: string }
>("serviceRequests/fetchOwnerRequests", async (_, thunkAPI) => {
  try {
    return await agent.ServiceRequests.getOwnerRequests();
  } catch {
    return thunkAPI.rejectWithValue("Failed to load service requests");
  }
});

export const acceptServiceRequestAsync = createAsyncThunk<
  ServiceCustomerRequest,
  number,
  { rejectValue: string }
>("serviceRequests/acceptRequest", async (requestId, thunkAPI) => {
  try {
    return await agent.ServiceRequests.acceptRequest(requestId);
  } catch {
    return thunkAPI.rejectWithValue("Failed to accept service request");
  }
});

export const rejectServiceRequestAsync = createAsyncThunk<
  ServiceCustomerRequest,
  { requestId: number; rejectionReason: string },
  { rejectValue: string }
>(
  "serviceRequests/rejectRequest",
  async ({ requestId, rejectionReason }, thunkAPI) => {
    try {
      return await agent.ServiceRequests.rejectRequest(
        requestId,
        rejectionReason,
      );
    } catch {
      return thunkAPI.rejectWithValue("Failed to reject service request");
    }
  },
);

// Fetch garage technicians
export const fetchTechniciansAsync = createAsyncThunk<
  Technician[],
  number,
  { rejectValue: string }
>("serviceRequests/fetchTechnicians", async (garageId, thunkAPI) => {
  try {
    return await agent.ServiceRequests.getTechnicians(garageId);
  } catch {
    return thunkAPI.rejectWithValue("Failed to load technicians");
  }
});

// Assign technician
export const assignTechnicianAsync = createAsyncThunk<
  number,
  { requestId: number; technicianId: number },
  { rejectValue: string }
>("serviceRequests/assignTechnician", async (data, thunkAPI) => {
  try {
    await agent.ServiceRequests.assignTechnician(
      data.requestId,
      data.technicianId,
    );

    return data.requestId;
  } catch {
    return thunkAPI.rejectWithValue("Failed to assign technician");
  }
});

const serviceRequestsSlice = createSlice({
  name: "serviceRequests",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchOwnerServiceRequestsAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOwnerServiceRequestsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.requests = action.payload;
      })
      .addCase(fetchOwnerServiceRequestsAsync.rejected, (state, action) => {
        state.status = "error";
        state.error =
          action.payload ?? "Failed to load service requests";
      })

      // Accept request
      .addCase(acceptServiceRequestAsync.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(acceptServiceRequestAsync.fulfilled, (state, action) => {
        state.actionStatus = "idle";

        const index = state.requests.findIndex(
          (request) => request.requestId === action.payload.requestId,
        );

        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(acceptServiceRequestAsync.rejected, (state, action) => {
        state.actionStatus = "error";
        state.error =
          action.payload ?? "Failed to accept service request";
      })

      // Reject request
      .addCase(rejectServiceRequestAsync.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(rejectServiceRequestAsync.fulfilled, (state, action) => {
        state.actionStatus = "idle";

        const index = state.requests.findIndex(
          (request) => request.requestId === action.payload.requestId,
        );

        if (index !== -1) {
          state.requests[index] = action.payload;
        }
      })
      .addCase(rejectServiceRequestAsync.rejected, (state, action) => {
        state.actionStatus = "error";
        state.error =
          action.payload ?? "Failed to reject service request";
      })

      // Fetch technicians
      .addCase(fetchTechniciansAsync.pending, (state) => {
        state.techniciansStatus = "loading";
        state.error = null;
      })
      .addCase(fetchTechniciansAsync.fulfilled, (state, action) => {
        state.techniciansStatus = "idle";
        state.technicians = action.payload;
      })
      .addCase(fetchTechniciansAsync.rejected, (state, action) => {
        state.techniciansStatus = "error";
        state.error =
          action.payload ?? "Failed to load technicians";
      })

      // Assign technician
      .addCase(assignTechnicianAsync.pending, (state) => {
        state.actionStatus = "loading";
        state.error = null;
      })
      .addCase(assignTechnicianAsync.fulfilled, (state, action) => {
        state.actionStatus = "idle";

        const request = state.requests.find(
          (item) => item.requestId === action.payload,
        );

        if (request) {
          request.status = "IN_PROGRESS";
        }
      })
      .addCase(assignTechnicianAsync.rejected, (state, action) => {
        state.actionStatus = "error";
        state.error =
          action.payload ?? "Failed to assign technician";
      });
  },
});

export default serviceRequestsSlice.reducer;
