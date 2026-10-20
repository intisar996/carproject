import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { OwnerTechnicianAssignment } from "../../app/models/OwnerTechnicianAssignment";
import type { OwnerRepairPhoto } from "../../app/models/OwnerRepairPhoto";
import agent from "../../app/api/agent";

interface OwnerAssignmentsState {
  assignments: OwnerTechnicianAssignment[];
  photos: OwnerRepairPhoto[];
  status: "idle" | "loading" | "error";
  photosStatus: "idle" | "loading" | "error";
  error: string | null;
}

const initialState: OwnerAssignmentsState = {
  assignments: [],
  photos: [],
  status: "idle",
  photosStatus: "idle",
  error: null,
};

export const fetchOwnerAssignmentsAsync = createAsyncThunk<
  OwnerTechnicianAssignment[],
  void,
  { rejectValue: string }
>("ownerAssignments/fetchAssignments", async (_, thunkAPI) => {
  try {
    return await agent.OwnerAssignments.getAssignments();
  } catch {
    return thunkAPI.rejectWithValue("Failed to load technician tasks");
  }
});

export const fetchOwnerRepairPhotosAsync = createAsyncThunk<
  OwnerRepairPhoto[],
  number,
  { rejectValue: string }
>("ownerAssignments/fetchPhotos", async (requestId, thunkAPI) => {
  try {
    return await agent.OwnerAssignments.getRepairPhotos(requestId);
  } catch {
    return thunkAPI.rejectWithValue("Failed to load repair photos");
  }
});

const ownerAssignmentsSlice = createSlice({
  name: "ownerAssignments",
  initialState,
  reducers: {
    clearOwnerPhotos(state) {
      state.photos = [];
      state.photosStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwnerAssignmentsAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchOwnerAssignmentsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.assignments = action.payload;
      })
      .addCase(fetchOwnerAssignmentsAsync.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "Failed to load technician tasks";
      })
      .addCase(fetchOwnerRepairPhotosAsync.pending, (state) => {
        state.photosStatus = "loading";
        state.photos = [];
      })
      .addCase(fetchOwnerRepairPhotosAsync.fulfilled, (state, action) => {
        state.photosStatus = "idle";
        state.photos = action.payload;
      })
      .addCase(fetchOwnerRepairPhotosAsync.rejected, (state, action) => {
        state.photosStatus = "error";
        state.error = action.payload ?? "Failed to load repair photos";
      });
  },
});

export const { clearOwnerPhotos } = ownerAssignmentsSlice.actions;
export default ownerAssignmentsSlice.reducer;