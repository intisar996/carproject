// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import agent from "../../app/api/agent";
// import type { CreateSubscriptionRequest } from "../../app/models/Subscription";
// import { toAppError } from "../../app/errors/ServerError";

// interface SubscriptionState {
//   checkoutUrl: string | null;
//   status: "idle" | "loading" | "succeeded" | "failed";
//   error: string | null;
// }

// const initialState: SubscriptionState = {
//   checkoutUrl: null,
//   status: "idle",
//   error: null,
// };

// export const createCheckoutAsync = createAsyncThunk<
//   string,
//   CreateSubscriptionRequest,
//   { rejectValue: string }
// >(
//   "subscriptions/createCheckout",
//   async (data, thunkAPI) => {
//     try {
//       return await agent.Subscriptions.checkout(data);
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         toAppError(error).message
//       );
//     }
//   }
// );

// const subscriptionSlice = createSlice({
//   name: "subscriptions",
//   initialState,
//   reducers: {
//     clearSubscriptionState: (state) => {
//       state.checkoutUrl = null;
//       state.status = "idle";
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(createCheckoutAsync.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(createCheckoutAsync.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.checkoutUrl = action.payload;
//       })
//       .addCase(createCheckoutAsync.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload ?? "Payment failed";
//       });
//   },
// });

// export const { clearSubscriptionState } =
//   subscriptionSlice.actions;

// export default subscriptionSlice.reducer;