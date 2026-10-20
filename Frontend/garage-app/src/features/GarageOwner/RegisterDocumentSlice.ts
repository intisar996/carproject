
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import type { MessageResponse, PageResponse } from "../../app/models/Common";
import type {
  DecisionRequest,
  RegistrationDocument,
} from "../../app/models/RegistrationDocument";
import { toAppError } from "../../app/utils/error";

interface DocumentsState {
  page: PageResponse<RegistrationDocument> | null;
  selected: RegistrationDocument | null;
  status: "idle" | "loading" | "loadingOne" | "saving";
  error: string | null;
}

const initialState: DocumentsState = {
  page: null,
  selected: null,
  status: "idle",
  error: null,
};

type Rejected = { rejectValue: string };

export const fetchDocumentsAsync = createAsyncThunk<
  PageResponse<RegistrationDocument>,
  { ownerId: number; page: number; size: number },
  Rejected
>("documents/fetch", async ({ ownerId, page, size }, thunkAPI) => {
  try {
    return await agent.Garages.getRegisterDocumantion(
      ownerId,
      page,
      size
    );
  } catch (error) {
    return thunkAPI.rejectWithValue(toAppError(error).message);
  }
});



export const decideDocumentAsync = createAsyncThunk<
  MessageResponse,
  { id: number; values: DecisionRequest },
  Rejected
>("documents/decide", async ({ id, values }, thunkAPI) => {
  try {
    return await agent.Admin.decide(id, values);
  } catch (error) {
    return thunkAPI.rejectWithValue(toAppError(error).message);
  }
});

export const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearSelectedDocument: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentsAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDocumentsAsync.fulfilled, (state, action) => {
        state.page = action.payload;
        state.status = "idle";
      })
      .addCase(fetchDocumentsAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload ?? "Failed to load documents";
      })

      .addCase(decideDocumentAsync.pending, (state) => {
        state.status = "saving";
      })
      .addCase(decideDocumentAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(decideDocumentAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const { clearSelectedDocument } = documentsSlice.actions;
