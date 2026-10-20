import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { MessageResponse } from "../../app/models/Common";
import type { AdminUser, UserRequest } from "../../app/models/User";
import { toAppError } from "../../app/utils/error";

interface UsersState {
  items: AdminUser[];
  status: "idle" | "loading" | "saving";
  error: string | null;
}

const initialState: UsersState = { items: [], status: "idle", error: null };

type Rejected = { rejectValue: string };

export const fetchUsersAsync = createAsyncThunk<AdminUser[], void, Rejected>(
  "users/fetch",
  async (_, thunkAPI) => {
    try {
      return await agent.Admin.users();
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  },
);

export const createUserAsync = createAsyncThunk<MessageResponse, UserRequest, Rejected>(
  "users/create",
  async (values, thunkAPI) => {
    try {
      return await agent.Admin.createUser(values);
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  },
);

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = "idle";
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.items = [];
        state.status = "idle";
        state.error = action.payload ?? "Failed to load users";
      })
      .addCase(createUserAsync.pending, (state) => {
        state.status = "saving";
      })
      .addCase(createUserAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(createUserAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});
