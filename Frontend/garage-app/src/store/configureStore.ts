import { configureStore } from "@reduxjs/toolkit";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { accountSlice } from "../features/Account/accountSlice";
import { catalogSlice } from "../features/Admin/catalogSlice";
import { documentsSlice } from "../features/Admin/documentsSlice";
import { usersSlice } from "../features/Admin/usersSlice";
import { garagesSlice } from "../features/GarageOwner/garagesSlice";
import { ownerSlice } from "../features/GarageOwner/ownerSlice";
import { techniciansSlice } from "../features/GarageOwner/techniciansSlice";
import subscriptionPlanReducer from "../features/Subscriptions/subscriptionPlanSlice";
import { garageServiceOptionsSlice } from "../features/GarageOwner/garageServiceOptionsSlice";
import customerReducer from "../features/Customer/customerSlice";
import serviceRequestsReducer from "../features/GarageOwner/serviceRequestsSlice";
import ownerAssignmentsReducer from "../features/GarageOwner/ownerAssignmentsSlice";
export const store = configureStore({
  reducer: {
    account: accountSlice.reducer,
    owner: ownerSlice.reducer,
    garages: garagesSlice.reducer,
    technicians: techniciansSlice.reducer,
    documents: documentsSlice.reducer,
    users: usersSlice.reducer,
    catalog: catalogSlice.reducer,
    subscriptionPlans: subscriptionPlanReducer,
    garageServiceOptions: garageServiceOptionsSlice.reducer,
    customer: customerReducer,
    serviceRequests: serviceRequestsReducer,
    ownerAssignments: ownerAssignmentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
