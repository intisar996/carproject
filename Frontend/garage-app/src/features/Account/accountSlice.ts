import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { isRole } from "../../app/models/enums";
import type { LoginRequest, LoginResponse, User } from "../../app/models/User";
import { clearStoredUser, loadStoredUser, storeUser } from "../../app/utils/authStorage";
import { toAppError } from "../../app/utils/error";
import { decodeToken } from "../../app/utils/jwt";

interface AccountState {
  user: User | null;
  status: "idle" | "signingIn" | "refreshing";
}

const initialState: AccountState = {
  user: loadStoredUser(),
  status: "idle",
};

function toUser(response: LoginResponse): User {
  const claims = decodeToken(response.token);
  const role = claims?.role ?? (isRole(response.role) ? response.role : null);
  if (!role) throw new Error("Unsupported role returned by the server");
  return {
    token: response.token,
    email: response.email,
    fullName: response.fullName,
    role,
    userId: claims?.userId ?? null,
  };
}

export const signInAsync = createAsyncThunk<User, LoginRequest, { rejectValue: string }>(
  "account/signIn",
  async (values, thunkAPI) => {
    try {
      const user = toUser(await agent.Account.login({ ...values, email: values.email.trim() }));
      storeUser(user);
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  },
);

export const fetchCurrentUserAsync = createAsyncThunk<User, void, { rejectValue: string }>(
  "account/fetchCurrentUser",
  async (_, thunkAPI) => {
    try {
      const response = await agent.Account.currentUser();

      const storedUser = loadStoredUser();

      if (!storedUser?.token) {
        throw new Error("No stored authentication token");
      }

      const user: User = {
        token: storedUser.token,
        email: response.email,
        fullName: response.fullName,
        role: isRole(response.role) ? response.role : storedUser.role,
        userId: storedUser.userId,
      };

      storeUser(user);

      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(toAppError(error).message);
    }
  },
);

export const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.status = "idle";
      clearStoredUser();
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      storeUser(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInAsync.pending, (state) => {
        state.status = "signingIn";
      })
      .addCase(signInAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      .addCase(signInAsync.rejected, (state) => {
        state.status = "idle";
      })
      .addCase(fetchCurrentUserAsync.pending, (state) => {
        state.status = "refreshing";
      })
      .addCase(fetchCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      
      .addCase(fetchCurrentUserAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const { signOut, setUser } = accountSlice.actions;
