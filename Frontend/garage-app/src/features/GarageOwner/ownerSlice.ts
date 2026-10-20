import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { MessageResponse } from "../../app/models/Common";
import { toAppError } from "../../app/utils/error";

interface OwnerState {
  status: "idle" | "registeringOwner";
}

const initialState: OwnerState = { status: "idle" };

export const registerOwnerAsync = createAsyncThunk<MessageResponse, FormData, { rejectValue: string }>(
  "owner/registerOwner",
  async (formData, thunkAPI) => {
    try {
      return await agent.Registration.registerOwner(formData);
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  },
);

export const ownerSlice = createSlice({
  name: "owner",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerOwnerAsync.pending, (state) => {
        state.status = "registeringOwner";
      })
      .addCase(registerOwnerAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(registerOwnerAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});
